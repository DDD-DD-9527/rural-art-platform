const mongoose = require('mongoose');
const { COURSE_CATEGORIES, COURSE_DIFFICULTIES } = require('../config/courseMeta');

const courseSchema = new mongoose.Schema({
  // 基本信息
  title: {
    type: String,
    required: [true, '课程标题不能为空'],
    trim: true,
    maxlength: [100, '课程标题不能超过100个字符']
  },
  description: {
    type: String,
    required: [true, '课程描述不能为空'],
    maxlength: [1000, '课程描述不能超过1000个字符']
  },
  thumbnail: {
    type: String,
    required: [true, '课程封面不能为空']
  },
  
  // 创作者信息
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '创作者不能为空']
  },
  
  // 课程分类
  category: {
    type: String,
    required: [true, '课程分类不能为空'],
    enum: COURSE_CATEGORIES.map(c => c.value)
  },
  
  // 难度等级
  difficulty: {
    type: String,
    required: [true, '难度等级不能为空'],
    enum: COURSE_DIFFICULTIES.map(d => d.value)
  },
  
  // 课程标签
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '标签不能超过20个字符']
  }],
  
  // 课程视频文件
  videos: [{
    originalName: String,
    filename: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 课程材料文件
  materials: [{
    originalName: String,
    filename: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 课程内容
  lessons: [{
    title: {
      type: String,
      required: [true, '课时标题不能为空'],
      trim: true,
      maxlength: [100, '课时标题不能超过100个字符']
    },
    description: {
      type: String,
      maxlength: [500, '课时描述不能超过500个字符']
    },
    videoUrl: String,
    duration: {
      type: Number, // 分钟
      min: [1, '课时时长至少1分钟']
    },
    materials: [{
      name: String,
      description: String,
      optional: {
        type: Boolean,
        default: false
      }
    }],
    steps: [{
      stepNumber: Number,
      title: String,
      description: String,
      images: [String],
      tips: String
    }],
    order: {
      type: Number,
      required: true
    },
    isPreview: {
      type: Boolean,
      default: false
    },
    
    // 关卡式学习扩展字段
    pointsReward: {
      // 基础积分奖励
      basePoints: {
        type: Number,
        default: 10,
        min: [0, '基础积分不能为负数']
      },
      
      // 奖励条件配置
      bonusConditions: {
        // 首次完成奖励
        firstCompletion: {
          enabled: { type: Boolean, default: true },
          points: { type: Number, default: 5 }
        },
        
        // 满分奖励
        perfectScore: {
          enabled: { type: Boolean, default: true },
          points: { type: Number, default: 10 },
          threshold: { type: Number, default: 100 } // 满分阈值
        },
        
        // 快速完成奖励
        speedBonus: {
          enabled: { type: Boolean, default: true },
          points: { type: Number, default: 8 },
          timeLimit: { type: Number, default: 300 } // 时间限制（秒）
        },
        
        // 一次通过奖励
        oneAttempt: {
          enabled: { type: Boolean, default: true },
          points: { type: Number, default: 15 }
        }
      },
      
      // 等级倍数（根据用户等级调整积分）
      levelMultiplier: {
        enabled: { type: Boolean, default: false },
        baseMultiplier: { type: Number, default: 1.0 },
        levelBonus: { type: Number, default: 0.1 } // 每级增加10%
      }
    },
    
    // 解锁条件
    unlockConditions: {
      // 前置课程要求
      prerequisiteLessons: [{
        lessonId: mongoose.Schema.Types.ObjectId,
        required: { type: Boolean, default: true }
      }],
      
      // 积分要求
      pointsRequired: {
        type: Number,
        default: 0,
        min: [0, '所需积分不能为负数']
      },
      
      // 等级要求
      levelRequired: {
        type: Number,
        default: 1,
        min: [1, '所需等级至少为1']
      },
      
      // 技能要求
      skillsRequired: [{
        skillType: String,
        skillName: String,
        minProgress: { type: Number, default: 0 }
      }]
    },
    
    // 课程难度系数（影响积分计算）
    difficultyMultiplier: {
      type: Number,
      default: 1.0,
      min: [0.1, '难度系数至少为0.1'],
      max: [5.0, '难度系数最大为5.0']
    }
  }],
  
  // 课程统计
  stats: {
    enrolledCount: {
      type: Number,
      default: 0
    },
    completedCount: {
      type: Number,
      default: 0
    },
    viewCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  
  // 课程设置
  settings: {
    isPublished: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isFree: {
      type: Boolean,
      default: true
    },
    price: {
      type: Number,
      default: 0,
      min: [0, '价格不能为负数']
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    allowDownload: {
      type: Boolean,
      default: false
    }
  },
  
  // 课程要求
  requirements: {
    prerequisites: [String], // 前置课程或技能
    materials: [{
      name: String,
      description: String,
      estimatedCost: Number,
      optional: {
        type: Boolean,
        default: false
      }
    }],
    tools: [{
      name: String,
      description: String,
      optional: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // 学习目标
  learningObjectives: [{
    type: String,
    maxlength: [200, '学习目标不能超过200个字符']
  }],
  
  // 时间信息
  estimatedDuration: {
    type: Number, // 总时长（分钟）
    min: [1, '课程时长至少1分钟']
  },
  
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
courseSchema.index({ creator: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ 'settings.isPublished': 1 });
courseSchema.index({ 'settings.isArchived': 1 });
courseSchema.index({ 'stats.rating.average': -1 });
courseSchema.index({ 'stats.enrolledCount': -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ publishedAt: -1 });
courseSchema.index({ tags: 1 });

// 文本搜索索引
courseSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// 虚拟字段：课程总时长
courseSchema.virtual('totalDuration').get(function() {
  return this.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
});

// 虚拟字段：课程完成率
courseSchema.virtual('completionRate').get(function() {
  if (this.stats.enrolledCount === 0) return 0;
  return (this.stats.completedCount / this.stats.enrolledCount * 100).toFixed(1);
});

// 更新时间中间件
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // 计算总时长
  if (this.lessons && this.lessons.length > 0) {
    this.estimatedDuration = this.lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
  }
  
  next();
});

// 发布课程
courseSchema.methods.publish = function() {
  this.settings.isPublished = true;
  this.settings.isArchived = false; // 发布时清除归档状态
  this.publishedAt = new Date();
  return this.save();
};

// 取消发布
courseSchema.methods.unpublish = function() {
  this.settings.isPublished = false;
  this.publishedAt = undefined;
  // 注意：取消发布不会自动归档，需要单独操作
  return this.save();
};

// 增加浏览量
courseSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  return this.save();
};

// 增加点赞数
courseSchema.methods.incrementLikeCount = function() {
  this.stats.likeCount += 1;
  return this.save();
};

// 减少点赞数
courseSchema.methods.decrementLikeCount = function() {
  this.stats.likeCount = Math.max(0, this.stats.likeCount - 1);
  return this.save();
};

// 更新评分
courseSchema.methods.updateRating = function(newRating, isNewRating = true) {
  if (isNewRating) {
    const totalRating = this.stats.rating.average * this.stats.rating.count + newRating;
    this.stats.rating.count += 1;
    this.stats.rating.average = totalRating / this.stats.rating.count;
  } else {
    // 更新现有评分的逻辑可以在这里实现
  }
  return this.save();
};

// 静态方法：获取热门课程
courseSchema.statics.getPopularCourses = function(limit = 10) {
  return this.find({ 'settings.isPublished': true })
    .sort({ 'stats.enrolledCount': -1, 'stats.rating.average': -1 })
    .limit(limit)
    .populate('creator', 'username profile.nickname profile.avatar');
};

// 静态方法：按分类获取课程
courseSchema.statics.getCoursesByCategory = function(category, limit = 20) {
  return this.find({ 
    category: category,
    'settings.isPublished': true 
  })
    .sort({ 'stats.rating.average': -1, createdAt: -1 })
    .limit(limit)
    .populate('creator', 'username profile.nickname profile.avatar');
};

// 静态方法：搜索课程
courseSchema.statics.searchCourses = function(query, options = {}) {
  const {
    category,
    difficulty,
    isFree,
    minRating = 0,
    sortBy = 'relevance',
    limit = 20,
    skip = 0
  } = options;
  
  let searchQuery = {
    'settings.isPublished': true,
    'stats.rating.average': { $gte: minRating }
  };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (category) {
    searchQuery.category = category;
  }
  
  if (difficulty) {
    searchQuery.difficulty = difficulty;
  }
  
  if (typeof isFree === 'boolean') {
    searchQuery['settings.isFree'] = isFree;
  }
  
  let sortOptions = {};
  switch (sortBy) {
    case 'rating':
      sortOptions = { 'stats.rating.average': -1, 'stats.rating.count': -1 };
      break;
    case 'popular':
      sortOptions = { 'stats.enrolledCount': -1 };
      break;
    case 'newest':
      sortOptions = { publishedAt: -1 };
      break;
    case 'relevance':
    default:
      if (query) {
        sortOptions = { score: { $meta: 'textScore' } };
      } else {
        sortOptions = { 'stats.rating.average': -1, publishedAt: -1 };
      }
      break;
  }
  
  return this.find(searchQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('creator', 'username profile.nickname profile.avatar');
};

module.exports = mongoose.model('Course', courseSchema);
