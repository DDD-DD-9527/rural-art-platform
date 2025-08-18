const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // 评论内容
  content: {
    type: String,
    required: [true, '评论内容不能为空'],
    maxlength: [500, '评论内容不能超过500个字符']
  },
  
  // 评论作者
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '评论作者不能为空']
  },
  
  // 评论目标类型和ID
  targetType: {
    type: String,
    required: [true, '评论目标类型不能为空'],
    enum: ['Post', 'Course', 'Comment'] // 可以评论帖子、课程或其他评论
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, '评论目标ID不能为空'],
    refPath: 'targetType'
  },
  
  // 父评论（用于回复）
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  
  // 根评论（用于多级回复的根节点）
  rootComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  
  // 回复层级
  level: {
    type: Number,
    default: 0,
    max: [3, '回复层级不能超过3级'] // 限制回复深度
  },
  
  // 提及的用户
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // 互动统计
  stats: {
    likeCount: {
      type: Number,
      default: 0
    },
    replyCount: {
      type: Number,
      default: 0
    }
  },
  
  // 评论状态
  status: {
    type: String,
    enum: ['published', 'hidden', 'deleted'],
    default: 'published'
  },
  
  // 是否置顶
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // 举报信息
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'off-topic', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 时间戳
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
commentSchema.index({ author: 1 });
commentSchema.index({ targetType: 1, targetId: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ rootComment: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ 'stats.likeCount': -1 });
commentSchema.index({ status: 1 });
commentSchema.index({ isPinned: -1, createdAt: -1 });

// 复合索引
commentSchema.index({ targetType: 1, targetId: 1, status: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, status: 1, createdAt: 1 });

// 全文搜索索引
commentSchema.index({
  content: 'text'
});

// 虚拟字段
commentSchema.virtual('isReply').get(function() {
  return this.parentComment != null;
});

commentSchema.virtual('hasReplies').get(function() {
  return this.stats.replyCount > 0;
});

// 中间件
commentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  
  // 设置根评论
  if (this.parentComment && !this.rootComment) {
    // 如果有父评论但没有根评论，需要查找根评论
    this.constructor.findById(this.parentComment)
      .then(parentComment => {
        if (parentComment) {
          this.rootComment = parentComment.rootComment || parentComment._id;
          this.level = (parentComment.level || 0) + 1;
        }
        next();
      })
      .catch(next);
  } else if (!this.parentComment) {
    // 如果没有父评论，则自己就是根评论
    this.rootComment = this._id;
    this.level = 0;
    next();
  } else {
    next();
  }
});

// 删除评论后更新父评论的回复数
commentSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.parentComment) {
    await this.model.findByIdAndUpdate(
      doc.parentComment,
      { $inc: { 'stats.replyCount': -1 } }
    );
  }
  
  // 更新目标对象的评论数
  if (doc && doc.targetType === 'Post') {
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(
      doc.targetId,
      { $inc: { 'stats.commentCount': -1 } }
    );
  }
});

// 实例方法
commentSchema.methods.incrementLikeCount = function() {
  this.stats.likeCount += 1;
  return this.save();
};

commentSchema.methods.decrementLikeCount = function() {
  if (this.stats.likeCount > 0) {
    this.stats.likeCount -= 1;
  }
  return this.save();
};

commentSchema.methods.incrementReplyCount = function() {
  this.stats.replyCount += 1;
  return this.save();
};

commentSchema.methods.decrementReplyCount = function() {
  if (this.stats.replyCount > 0) {
    this.stats.replyCount -= 1;
  }
  return this.save();
};

// 获取评论的所有回复
commentSchema.methods.getReplies = function(options = {}) {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc' } = options;
  const skip = (page - 1) * limit;
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.constructor.find({
    parentComment: this._id,
    status: 'published'
  })
  .populate('author', 'username profile.nickname profile.avatar')
  .populate('mentions', 'username profile.nickname')
  .sort(sort)
  .skip(skip)
  .limit(limit);
};

// 静态方法
commentSchema.statics.getCommentsByTarget = function(targetType, targetId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    level = 0 // 0表示只获取顶级评论
  } = options;
  
  const skip = (page - 1) * limit;
  
  let query = {
    targetType,
    targetId,
    status: 'published'
  };
  
  if (level === 0) {
    query.parentComment = { $exists: false };
  } else {
    query.level = { $lte: level };
  }
  
  const sort = {};
  sort.isPinned = -1; // 置顶评论优先
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('author', 'username profile.nickname profile.avatar')
    .populate('mentions', 'username profile.nickname')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

commentSchema.statics.getCommentTree = function(targetType, targetId, options = {}) {
  const { limit = 50 } = options;
  
  return this.find({
    targetType,
    targetId,
    status: 'published'
  })
  .populate('author', 'username profile.nickname profile.avatar')
  .populate('mentions', 'username profile.nickname')
  .sort({ isPinned: -1, createdAt: 1 })
  .limit(limit)
  .then(comments => {
    // 构建评论树结构
    const commentMap = new Map();
    const rootComments = [];
    
    // 先创建所有评论的映射
    comments.forEach(comment => {
      commentMap.set(comment._id.toString(), {
        ...comment.toObject(),
        replies: []
      });
    });
    
    // 构建树结构
    comments.forEach(comment => {
      const commentObj = commentMap.get(comment._id.toString());
      
      if (comment.parentComment) {
        const parent = commentMap.get(comment.parentComment.toString());
        if (parent) {
          parent.replies.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });
    
    return rootComments;
  });
};

module.exports = mongoose.model('Comment', commentSchema);