const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  // 学员信息
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '学员不能为空']
  },
  
  // 课程信息
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, '课程不能为空']
  },
  
  // 报名状态
  status: {
    type: String,
    enum: ['enrolled', 'in-progress', 'completed', 'dropped'],
    default: 'enrolled'
  },
  
  // 学习进度
  progress: {
    // 已完成的课时
    completedLessons: [{
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      timeSpent: {
        type: Number, // 学习时长（分钟）
        default: 0
      },
      
      // 关卡式学习扩展字段
      performance: {
        // 完成尝试次数
        attempts: {
          type: Number,
          default: 1,
          min: [1, '尝试次数至少为1']
        },
        
        // 学习表现分数（0-100）
        score: {
          type: Number,
          min: [0, '分数不能低于0'],
          max: [100, '分数不能超过100']
        },
        
        // 完成时长（秒）
        completionTime: {
          type: Number,
          min: [0, '完成时长不能为负数']
        },
        
        // 获得的积分
        pointsEarned: {
          type: Number,
          default: 0,
          min: [0, '获得积分不能为负数']
        },
        
        // 奖励详情
        bonusDetails: {
          firstCompletion: { type: Boolean, default: false },
          perfectScore: { type: Boolean, default: false },
          speedBonus: { type: Boolean, default: false },
          oneAttempt: { type: Boolean, default: false }
        }
      }
    }],
    
    // 课程解锁状态
    unlockedLessons: [{
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      unlockedAt: {
        type: Date,
        default: Date.now
      },
      // 解锁方式
      unlockMethod: {
        type: String,
        enum: ['auto', 'points', 'level', 'prerequisite', 'manual'],
        default: 'auto'
      }
    }],
    
    // 总体进度百分比
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    // 总学习时长（分钟）
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    
    // 最后学习时间
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    
    // 当前学习的课时
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId
    },
    
    // 关卡式学习统计
    gamificationStats: {
      // 总获得积分
      totalPointsEarned: {
        type: Number,
        default: 0,
        min: [0, '总积分不能为负数']
      },
      
      // 连续学习天数
      currentStreak: {
        type: Number,
        default: 0,
        min: [0, '连续天数不能为负数']
      },
      
      // 最长连续学习天数
      longestStreak: {
        type: Number,
        default: 0,
        min: [0, '最长连续天数不能为负数']
      },
      
      // 平均分数
      averageScore: {
        type: Number,
        default: 0,
        min: [0, '平均分数不能为负数'],
        max: [100, '平均分数不能超过100']
      },
      
      // 完美完成次数
      perfectCompletions: {
        type: Number,
        default: 0,
        min: [0, '完美完成次数不能为负数']
      },
      
      // 一次通过次数
      oneAttemptCompletions: {
        type: Number,
        default: 0,
        min: [0, '一次通过次数不能为负数']
      }
    }
  },
  
  // 学习笔记
  notes: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    content: {
      type: String,
      maxlength: [1000, '笔记内容不能超过1000个字符']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 课程评价
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, '评价内容不能超过500个字符']
    },
    createdAt: Date
  },
  
  // 证书信息
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateId: String
  },
  
  // 报名时间
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  
  // 完成时间
  completedAt: Date,
  
  // 退课时间
  droppedAt: Date
}, {
  timestamps: true
});

// 索引
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true }); // 防止重复报名
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });
enrollmentSchema.index({ 'progress.percentage': -1 });

// 虚拟字段：是否已完成
enrollmentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// 虚拟字段：完成课时数
enrollmentSchema.virtual('completedLessonsCount').get(function() {
  return this.progress.completedLessons.length;
});

// 更新学习进度
enrollmentSchema.methods.updateProgress = function(lessonId, timeSpent = 0) {
  // 检查课时是否已完成
  const existingLesson = this.progress.completedLessons.find(
    lesson => lesson.lessonId.toString() === lessonId.toString()
  );
  
  if (!existingLesson) {
    // 添加新完成的课时
    this.progress.completedLessons.push({
      lessonId,
      timeSpent,
      completedAt: new Date()
    });
  } else {
    // 更新已完成课时的学习时长
    existingLesson.timeSpent += timeSpent;
  }
  
  // 更新总学习时长
  this.progress.totalTimeSpent += timeSpent;
  
  // 更新最后访问时间
  this.progress.lastAccessedAt = new Date();
  
  // 更新当前学习课时
  this.progress.currentLesson = lessonId;
  
  return this.save();
};

// 计算进度百分比
enrollmentSchema.methods.calculateProgress = async function() {
  await this.populate('course');
  
  if (!this.course || !this.course.lessons || this.course.lessons.length === 0) {
    this.progress.percentage = 0;
    return this.save();
  }
  
  const totalLessons = this.course.lessons.length;
  const completedLessons = this.progress.completedLessons.length;
  
  this.progress.percentage = Math.round((completedLessons / totalLessons) * 100);
  
  // 如果完成了所有课时，更新状态为已完成
  if (this.progress.percentage === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// 添加课程评价
enrollmentSchema.methods.addReview = function(rating, comment) {
  this.review = {
    rating,
    comment,
    createdAt: new Date()
  };
  
  return this.save();
};

// 颁发证书
enrollmentSchema.methods.issueCertificate = function() {
  if (this.status === 'completed' && !this.certificate.issued) {
    this.certificate = {
      issued: true,
      issuedAt: new Date(),
      certificateId: `CERT-${this.course}-${this.student}-${Date.now()}`
    };
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// 静态方法：获取用户的课程报名
enrollmentSchema.statics.getUserEnrollments = function(userId, options = {}) {
  const {
    status,
    page = 1,
    limit = 20,
    sortBy = 'enrolledAt',
    sortOrder = 'desc'
  } = options;
  
  const query = { student: userId };
  
  if (status) {
    query.status = status;
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('course', 'title thumbnail category difficulty stats.rating creator')
    .populate('course.creator', 'username profile.nickname profile.avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
};

// 静态方法：获取课程的报名学员
enrollmentSchema.statics.getCourseEnrollments = function(courseId, options = {}) {
  const {
    status,
    page = 1,
    limit = 20,
    sortBy = 'enrolledAt',
    sortOrder = 'desc'
  } = options;
  
  const query = { course: courseId };
  
  if (status) {
    query.status = status;
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('student', 'username profile.nickname profile.avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);