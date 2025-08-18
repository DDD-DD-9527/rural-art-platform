const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // 基本信息
  userId: {
    type: String,
    required: [true, '注册号不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '注册号至少3个字符'],
    maxlength: [20, '注册号不能超过20个字符']
  },
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    trim: true,
    minlength: [2, '用户名至少2个字符'],
    maxlength: [20, '用户名不能超过20个字符']
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符'],
    select: false // 默认不返回密码字段
  },
  
  // 个人资料
  profile: {
    nickname: {
      type: String,
      trim: true,
      maxlength: [30, '昵称不能超过30个字符']
    },
    name: {
      type: String,
      trim: true,
      maxlength: [30, '姓名不能超过30个字符'],
      default: ''
    },
    avatar: {
      type: String,
      default: '/placeholder-user.jpg'
    },
    bio: {
      type: String,
      maxlength: [200, '个人简介不能超过200个字符'],
      default: ''
    },
    location: {
      type: String,
      maxlength: [50, '地址不能超过50个字符'],
      default: ''
    },
    birthDate: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: ''
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  },

  // 用户状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  
  // 用户角色
  role: {
    type: String,
    enum: ['user', 'creator', 'admin'],
    default: 'user'
  },

  // 社交数据
  likedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  
  likedComments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  followedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // 学习统计
  learningStats: {
    totalCourses: {
      type: Number,
      default: 0
    },
    completedCourses: {
      type: Number,
      default: 0
    },
    totalLearningTime: {
      type: Number,
      default: 0 // 分钟
    },
    todayStudyTime: {
      type: Number,
      default: 0 // 今日学习时长（分钟）
    },
    studyDays: {
      type: Number,
      default: 0 // 总学习天数
    },
    weeklyStudyDays: {
      type: Number,
      default: 0 // 本周学习天数
    },
    totalPoints: {
      type: Number,
      default: 0 // 学习积分
    },
    currentStreak: {
      type: Number,
      default: 0 // 连续学习天数
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    weeklyProgress: {
      type: Number,
      default: 0 // 本周学习进度百分比
    },
    lastLearningDate: Date
  },

  // 社交统计
  socialStats: {
    followersCount: {
      type: Number,
      default: 0
    },
    followingCount: {
      type: Number,
      default: 0
    },
    likesReceived: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    }
  },

  // 创作统计（针对创作者）
  creatorStats: {
    worksCount: {
      type: Number,
      default: 0
    },
    coursesCreated: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },

  // 技能进度
  skillProgress: {
    artSkills: {
      title: {
        type: String,
        default: '艺术技能'
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      skills: [{
        name: String,
        level: {
          type: String,
          enum: ['入门', '初级', '中级', '高级', '专家'],
          default: '入门'
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        }
      }]
    },
    digitalSkills: {
      title: {
        type: String,
        default: '数字技能'
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      skills: [{
        name: String,
        level: {
          type: String,
          enum: ['入门', '初级', '中级', '高级', '专家'],
          default: '入门'
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        }
      }]
    }
  },

  // 成就徽章
  achievements: [{
    id: Number,
    title: String,
    description: String,
    icon: String,
    earned: {
      type: Boolean,
      default: false
    },
    earnedDate: Date
  }],

  // 偏好设置
  preferences: {
    language: {
      type: String,
      default: 'zh-CN'
    },
    dialect: {
      type: String,
      default: ''
    },
    learningTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    interests: [{
      type: String
    }],
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      marketing: {
        type: Boolean,
        default: false
      }
    }
  },

  // 时间戳
  lastLoginAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// 索引
userSchema.index({ userId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'profile.location': 1 });

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 更新时间中间件
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 实例方法：验证密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// 实例方法：更新最后登录时间
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// 实例方法：获取公开资料
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    profile: this.profile,
    role: this.role,
    learningStats: this.learningStats,
    socialStats: this.socialStats,
    creatorStats: this.role === 'creator' ? this.creatorStats : undefined,
    createdAt: this.createdAt
  };
};

// 静态方法：根据注册号或用户名查找用户
userSchema.statics.findByIdentifier = function(identifier) {
  const query = {
    $or: [
      { userId: identifier },
      { username: identifier }
    ]
  };
  
  return this.findOne(query).select('+password');
};

// 静态方法：获取用户统计
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        creators: {
          $sum: {
            $cond: [{ $eq: ['$role', 'creator'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || { totalUsers: 0, activeUsers: 0, creators: 0 };
};

module.exports = mongoose.model('User', userSchema);