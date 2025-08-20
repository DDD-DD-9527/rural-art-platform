const mongoose = require('mongoose');

// 积分记录模式
const pointsRecordSchema = new mongoose.Schema({
  // 用户ID
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 积分类型
  type: {
    type: String,
    required: true,
    enum: [
      'lesson_completion',    // 课程完成
      'course_completion',    // 整个课程完成
      'streak_bonus',         // 连续学习奖励
      'perfect_score',        // 满分奖励
      'speed_bonus',          // 快速完成奖励
      'first_attempt',        // 首次尝试奖励
      'social_interaction',   // 社交互动
      'achievement_unlock',   // 成就解锁
      'daily_login',          // 每日登录
      'referral_bonus',       // 推荐奖励
      'manual_adjustment',    // 手动调整
      'system_reward'         // 系统奖励
    ],
    index: true
  },
  
  // 积分来源
  source: {
    type: String,
    required: true,
    enum: [
      'lesson',      // 课程学习
      'course',      // 课程相关
      'social',      // 社交活动
      'achievement', // 成就系统
      'system',      // 系统活动
      'admin'        // 管理员操作
    ],
    index: true
  },
  
  // 积分数量（可以为负数，用于扣除积分）
  points: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value !== 0;
      },
      message: '积分必须是非零整数'
    }
  },
  
  // 关联的资源ID（课程ID、帖子ID等）
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  
  // 关联的资源类型
  resourceType: {
    type: String,
    enum: ['Course', 'Lesson', 'Post', 'Comment', 'Achievement', 'User'],
    index: true
  },
  
  // 积分描述
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  // 积分有效期（可选）
  expiresAt: {
    type: Date,
    index: true
  },
  
  // 积分状态
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active',
    index: true
  },
  
  // 元数据（存储额外信息）
  metadata: {
    // 课程相关信息
    courseId: mongoose.Schema.Types.ObjectId,
    lessonId: mongoose.Schema.Types.ObjectId,
    lessonTitle: String,
    
    // 学习表现数据
    completionTime: Number,  // 完成时间（秒）
    accuracy: Number,        // 准确率（0-100）
    attempts: Number,        // 尝试次数
    
    // 奖励倍数信息
    basePoints: Number,      // 基础积分
    multiplier: Number,      // 倍数
    bonusPoints: Number,     // 奖励积分
    
    // 其他信息
    level: Number,           // 用户等级
    streak: Number,          // 连续天数
    reason: String           // 具体原因
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 复合索引
pointsRecordSchema.index({ user: 1, createdAt: -1 }); // 用户积分历史查询
pointsRecordSchema.index({ user: 1, type: 1 });       // 按类型查询用户积分
pointsRecordSchema.index({ user: 1, source: 1 });     // 按来源查询用户积分
pointsRecordSchema.index({ resourceId: 1, resourceType: 1 }); // 资源相关积分查询
pointsRecordSchema.index({ createdAt: -1 });          // 时间排序
pointsRecordSchema.index({ expiresAt: 1 }, { sparse: true }); // 过期时间查询

// 虚拟属性：是否已过期
pointsRecordSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// 虚拟属性：剩余有效天数
pointsRecordSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// 静态方法：获取用户积分历史
pointsRecordSchema.statics.getUserPointsHistory = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    source,
    startDate,
    endDate,
    status = 'active'
  } = options;
  
  const query = { user: userId, status };
  
  if (type) query.type = type;
  if (source) query.source = source;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'username profile.nickname profile.avatar')
    .populate('resourceId');
};

// 静态方法：计算用户总积分
pointsRecordSchema.statics.calculateUserTotalPoints = function(userId) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: 'active',
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      }
    },
    {
      $group: {
        _id: null,
        totalPoints: { $sum: '$points' },
        recordCount: { $sum: 1 }
      }
    }
  ]);
};

// 静态方法：获取积分统计
pointsRecordSchema.statics.getPointsStats = function(userId, period = '30d') {
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }
  
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: 'active',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          source: '$source'
        },
        totalPoints: { $sum: '$points' },
        count: { $sum: 1 },
        avgPoints: { $avg: '$points' }
      }
    },
    {
      $sort: { totalPoints: -1 }
    }
  ]);
};

// 静态方法：清理过期积分
pointsRecordSchema.statics.cleanupExpiredPoints = function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: 'active'
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// 实例方法：撤销积分记录
pointsRecordSchema.methods.revoke = function(reason) {
  this.status = 'revoked';
  if (reason) {
    this.metadata = this.metadata || {};
    this.metadata.revokeReason = reason;
  }
  return this.save();
};

// 中间件：保存前验证
pointsRecordSchema.pre('save', function(next) {
  // 如果设置了过期时间，确保它在未来
  if (this.expiresAt && this.expiresAt <= new Date()) {
    this.status = 'expired';
  }
  
  // 确保资源ID和类型的一致性
  if (this.resourceId && !this.resourceType) {
    return next(new Error('设置resourceId时必须指定resourceType'));
  }
  
  next();
});

// 中间件：更新用户总积分
pointsRecordSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const result = await this.constructor.calculateUserTotalPoints(doc.user);
    const totalPoints = result.length > 0 ? result[0].totalPoints : 0;
    
    await User.findByIdAndUpdate(doc.user, {
      'learningStats.totalPoints': totalPoints
    });
  } catch (error) {
    console.error('更新用户总积分失败:', error);
  }
});

module.exports = mongoose.model('PointsRecord', pointsRecordSchema);