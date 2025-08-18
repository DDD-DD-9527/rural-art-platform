const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  // 点赞用户
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 被点赞的目标类型
  targetType: {
    type: String,
    enum: ['Post', 'Comment', 'Course'],
    required: true
  },
  // 被点赞的目标ID
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  // 被点赞内容的作者
  targetAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 点赞时间
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 复合索引，确保同一用户不能重复点赞同一内容
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// 索引优化查询
likeSchema.index({ user: 1, createdAt: -1 }); // 查询用户点赞记录
likeSchema.index({ targetAuthor: 1, createdAt: -1 }); // 查询用户收到的点赞
likeSchema.index({ targetType: 1, targetId: 1 }); // 查询特定内容的点赞

// 静态方法：获取用户点赞记录
likeSchema.statics.getUserLikes = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .populate('targetAuthor', 'username profile.nickname profile.avatar')
    .populate({
      path: 'targetId',
      select: 'title content image createdAt stats',
      populate: {
        path: 'author',
        select: 'username profile.nickname profile.avatar'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// 静态方法：获取用户收到的点赞
likeSchema.statics.getReceivedLikes = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ targetAuthor: userId })
    .populate('user', 'username profile.nickname profile.avatar profile.location')
    .populate({
      path: 'targetId',
      select: 'title content image createdAt'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// 静态方法：检查是否已点赞
likeSchema.statics.isLiked = function(userId, targetType, targetId) {
  return this.findOne({ user: userId, targetType, targetId });
};

// 静态方法：获取点赞统计
likeSchema.statics.getLikeStats = async function(userId) {
  const [givenLikes, receivedLikes, todayReceived, weekReceived] = await Promise.all([
    this.countDocuments({ user: userId }),
    this.countDocuments({ targetAuthor: userId }),
    this.countDocuments({
      targetAuthor: userId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }),
    this.countDocuments({
      targetAuthor: userId,
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    })
  ]);
  
  return {
    givenLikes,
    receivedLikes,
    todayReceived,
    weekReceived
  };
};

// 静态方法：获取内容的点赞数
likeSchema.statics.getTargetLikeCount = function(targetType, targetId) {
  return this.countDocuments({ targetType, targetId });
};

// 静态方法：批量获取内容的点赞状态
likeSchema.statics.getBatchLikeStatus = async function(userId, targets) {
  const likes = await this.find({
    user: userId,
    $or: targets.map(target => ({
      targetType: target.type,
      targetId: target.id
    }))
  }).lean();
  
  const likeMap = {};
  likes.forEach(like => {
    const key = `${like.targetType}_${like.targetId}`;
    likeMap[key] = true;
  });
  
  return likeMap;
};

module.exports = mongoose.model('Like', likeSchema);