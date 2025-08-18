const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // 基本信息
  content: {
    type: String,
    required: [true, '帖子内容不能为空'],
    maxlength: [2000, '帖子内容不能超过2000个字符']
  },
  
  // 作者信息
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '作者不能为空']
  },
  
  // 图片附件
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    width: Number,
    height: Number
  }],
  
  // 标签
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, '标签不能超过20个字符']
  }],
  
  // 位置信息
  location: {
    name: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  // 帖子类型
  type: {
    type: String,
    enum: ['share', 'question', 'showcase', 'tutorial', 'discussion'],
    default: 'share'
  },
  
  // 相关课程（如果是学习分享）
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  
  // 互动统计
  stats: {
    viewCount: {
      type: Number,
      default: 0
    },
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    }
  },
  
  // 帖子状态
  status: {
    type: String,
    enum: ['draft', 'published', 'hidden', 'deleted'],
    default: 'published'
  },
  
  // 可见性设置
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  
  // 是否置顶
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // 是否允许评论
  allowComments: {
    type: Boolean,
    default: true
  },
  
  // 举报信息
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'copyright', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 时间戳
  publishedAt: {
    type: Date,
    default: Date.now
  },
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
postSchema.index({ author: 1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ 'stats.likeCount': -1 });
postSchema.index({ 'stats.commentCount': -1 });
postSchema.index({ status: 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ type: 1 });
postSchema.index({ isPinned: -1, publishedAt: -1 });

// 全文搜索索引
postSchema.index({
  content: 'text',
  tags: 'text'
});

// 地理位置索引
postSchema.index({ 'location.coordinates': '2dsphere' });

// 虚拟字段
postSchema.virtual('isPopular').get(function() {
  return this.stats.likeCount > 10 || this.stats.commentCount > 5;
});

postSchema.virtual('engagementRate').get(function() {
  if (this.stats.viewCount === 0) return 0;
  return (this.stats.likeCount + this.stats.commentCount) / this.stats.viewCount;
});

// 中间件
postSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// 实例方法
postSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  return this.save();
};

postSchema.methods.incrementLikeCount = function() {
  this.stats.likeCount += 1;
  return this.save();
};

postSchema.methods.decrementLikeCount = function() {
  if (this.stats.likeCount > 0) {
    this.stats.likeCount -= 1;
  }
  return this.save();
};

postSchema.methods.incrementCommentCount = function() {
  this.stats.commentCount += 1;
  return this.save();
};

postSchema.methods.decrementCommentCount = function() {
  if (this.stats.commentCount > 0) {
    this.stats.commentCount -= 1;
  }
  return this.save();
};

postSchema.methods.incrementShareCount = function() {
  this.stats.shareCount += 1;
  return this.save();
};

// 静态方法
postSchema.statics.getPopularPosts = function(limit = 10) {
  return this.find({
    status: 'published',
    visibility: 'public'
  })
  .populate('author', 'username profile.nickname profile.avatar')
  .populate('relatedCourse', 'title thumbnail')
  .sort({ 'stats.likeCount': -1, 'stats.commentCount': -1 })
  .limit(limit);
};

postSchema.statics.getRecentPosts = function(limit = 20) {
  return this.find({
    status: 'published',
    visibility: 'public'
  })
  .populate('author', 'username profile.nickname profile.avatar')
  .populate('relatedCourse', 'title thumbnail')
  .sort({ isPinned: -1, publishedAt: -1 })
  .limit(limit);
};

postSchema.statics.getPostsByTag = function(tag, limit = 20) {
  return this.find({
    status: 'published',
    visibility: 'public',
    tags: tag
  })
  .populate('author', 'username profile.nickname profile.avatar')
  .populate('relatedCourse', 'title thumbnail')
  .sort({ publishedAt: -1 })
  .limit(limit);
};

postSchema.statics.searchPosts = function(query, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
    type = '',
    tags = []
  } = options;

  const skip = (page - 1) * limit;
  
  let searchQuery = {
    status: 'published',
    visibility: 'public'
  };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (type) {
    searchQuery.type = type;
  }
  
  if (tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }

  const sort = {};
  if (query) {
    sort.score = { $meta: 'textScore' };
  } else {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  return this.find(searchQuery)
    .populate('author', 'username profile.nickname profile.avatar')
    .populate('relatedCourse', 'title thumbnail')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

module.exports = mongoose.model('Post', postSchema);