const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const LessonUnlockService = require('../services/lessonUnlockService');
const CourseDependencyService = require('../services/courseDependencyService');
const { PAGINATION_CONFIG } = require('../config/constants');
const { validationResult } = require('express-validator');

// 获取课程列表
const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
      category = '',
      difficulty = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isPublished,
      status
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    let query = {};
    
    // 处理状态筛选
    if (status) {
      if (status === 'published') {
        query['settings.isPublished'] = true;
        query['settings.isArchived'] = false;
      } else if (status === 'draft') {
        query['settings.isPublished'] = false;
        query['settings.isArchived'] = false;
      } else if (status === 'archived') {
        query['settings.isArchived'] = true;
      }
    } else if (isPublished !== undefined) {
      // 兼容原有的isPublished参数
      if (isPublished === 'true' || isPublished === true) {
        query['settings.isPublished'] = true;
        query['settings.isArchived'] = false;
      } else if (isPublished === 'false' || isPublished === false) {
        query['settings.isPublished'] = false;
        query['settings.isArchived'] = false;
      }
    }
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // 构建排序条件
    const sort = {};
    if (search) {
      sort.score = { $meta: 'textScore' };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // 查询课程
    const courses = await Course.find(query)
      .populate('creator', 'username profile.nickname profile.avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-lessons.steps -lessons.materials'); // 列表页不返回详细内容

    // 获取总数
    const total = await Course.countDocuments(query);

    // 对课程数据进行字段映射以匹配前端需求
    const mappedCourses = courses.map(course => ({
      id: course._id,
      _id: course._id, // 保持兼容性
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      level: course.difficulty, // 前端使用level字段
      tags: course.tags,
      thumbnail: course.thumbnail,
      image: course.thumbnail, // 前端使用image字段
      estimatedDuration: course.estimatedDuration,
      duration: course.estimatedDuration, // 前端使用duration字段
      settings: course.settings,
      stats: course.stats,
      students: course.stats?.enrolledCount || 0, // 前端使用students字段
      rating: course.stats?.rating?.average || 0, // 前端使用rating字段
      creator: {
        id: course.creator._id,
        _id: course.creator._id,
        username: course.creator.username,
        nickname: course.creator.profile?.nickname,
        avatar: course.creator.profile?.avatar
      },
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      progress: 0 // 列表页默认进度为0，详情页会获取实际进度
    }));

    res.json({
      success: true,
      data: {
        courses: mappedCourses,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
};

// 获取课程详情
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    
    const course = await Course.findById(courseId)
      .populate('creator', 'username profile.nickname profile.avatar profile.bio');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 如果课程未发布，只有创作者和管理员可以查看
    if (!course.settings.isPublished) {
      if (!req.user || 
          (req.user.id.toString() !== course.creator._id.toString() && 
           req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: '课程暂未发布'
        });
      }
    }

    // 增加浏览量
    await course.incrementViewCount();

    // 构建返回数据，进行字段映射以匹配前端需求
    let courseData = {
      id: course._id,
      _id: course._id, // 保持兼容性
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      level: course.difficulty, // 前端使用level字段
      tags: course.tags,
      thumbnail: course.thumbnail,
      image: course.thumbnail, // 前端使用image字段
      estimatedDuration: course.estimatedDuration,
      duration: course.estimatedDuration, // 前端使用duration字段
      learningObjectives: course.learningObjectives,
      requirements: course.requirements,
      settings: course.settings,
      stats: course.stats,
      students: course.stats?.enrolledCount || 0, // 前端使用students字段
      rating: course.stats?.rating?.average || 0, // 前端使用rating字段
      creator: {
        id: course.creator._id,
        _id: course.creator._id,
        username: course.creator.username,
        nickname: course.creator.profile?.nickname,
        avatar: course.creator.profile?.avatar,
        bio: course.creator.profile?.bio
      },
      lessons: course.lessons.map(lesson => ({
        id: lesson._id,
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        lessonType: lesson.lessonType,
        type: lesson.lessonType, // 前端使用type字段
        difficulty: lesson.difficulty,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl,
        materials: lesson.materials,
        pointsReward: lesson.pointsReward,
        unlockConditions: lesson.unlockConditions,
        xp: lesson.pointsReward?.basePoints || 10, // 前端使用xp字段
        status: 'locked' // 默认状态，后续会更新
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      progress: 0 // 默认进度，后续会更新
    };

    // 如果用户已登录，获取学习进度和课时解锁状态
    if (userId) {
      try {
        // 获取用户报名信息
        const enrollment = await Enrollment.findOne({
          user: userId,
          course: courseId
        });

        if (enrollment) {
          // 计算学习进度
          const totalLessons = course.lessons.length;
          const completedLessons = enrollment.progress?.completedLessons?.length || 0;
          courseData.progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          // 获取可解锁的课时列表
          const unlockableData = await LessonUnlockService.getUserUnlockableLessons(userId, courseId);
          
          // 更新课时状态
          courseData.lessons = courseData.lessons.map(lesson => {
            const lessonId = lesson.id.toString();
            const isCompleted = enrollment.progress?.completedLessons?.some(
              cl => cl.lesson.toString() === lessonId
            );
            const isUnlockable = unlockableData.unlockableLessons.some(
              ul => ul.lessonId.toString() === lessonId
            );
            const isCurrentLesson = enrollment.progress?.currentLesson?.toString() === lessonId;

            let status = 'locked';
            if (isCompleted) {
              status = 'completed';
            } else if (isCurrentLesson || isUnlockable) {
              status = 'current';
            }

            return {
              ...lesson,
              status
            };
          });
        }
      } catch (progressError) {
        console.error('获取学习进度失败:', progressError);
        // 进度获取失败不影响课程基本信息返回
      }
    }

    res.json({
      success: true,
      data: courseData
    });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程详情失败'
    });
  }
};

// 创建课程
const createCourse = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('课程创建验证失败:', {
        errors: errors.array(),
        requestBody: req.body
      });
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const courseData = {
      ...req.body,
      creator: req.user._id
    };

    const course = new Course(courseData);
    await course.save();

    // 填充创作者信息
    await course.populate('creator', 'username profile.nickname profile.avatar');

    res.status(201).json({
      success: true,
      message: '课程创建成功',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('创建课程错误:', error);
    res.status(500).json({
      success: false,
      message: '创建课程失败'
    });
  }
};

// 更新课程
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，只能修改自己的课程'
      });
    }

    // 更新课程
    Object.assign(course, req.body);
    course.updatedAt = new Date();
    await course.save();

    // 填充创作者信息
    await course.populate('creator', 'username profile.nickname profile.avatar');

    res.json({
      success: true,
      message: '课程更新成功',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('更新课程错误:', error);
    res.status(500).json({
      success: false,
      message: '更新课程失败'
    });
  }
};

// 删除课程
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，只能删除自己的课程'
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.json({
      success: true,
      message: '课程删除成功'
    });
  } catch (error) {
    console.error('删除课程错误:', error);
    res.status(500).json({
      success: false,
      message: '删除课程失败'
    });
  }
};

// 发布课程
const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，只能发布自己的课程'
      });
    }

    // 检查课程是否完整
    if (!course.lessons || course.lessons.length === 0) {
      return res.status(400).json({
        success: false,
        message: '课程必须包含至少一个课时才能发布'
      });
    }

    course.publish();
    await course.save();

    res.json({
      success: true,
      message: '课程发布成功',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('发布课程错误:', error);
    res.status(500).json({
      success: false,
      message: '发布课程失败'
    });
  }
};

// 取消发布课程
const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，只能操作自己的课程'
      });
    }

    course.unpublish();
    await course.save();

    res.json({
      success: true,
      message: '课程已取消发布',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('取消发布课程错误:', error);
    res.status(500).json({
      success: false,
      message: '取消发布课程失败'
    });
  }
};

// 获取热门课程
const getPopularCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const courses = await Course.getPopularCourses(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('获取热门课程错误:', error);
    res.status(500).json({
      success: false,
      message: '获取热门课程失败'
    });
  }
};

// 获取推荐课程
const getRecommendedCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user?._id;
    
    // 简单的推荐逻辑：基于用户学习历史和热门课程
    let courses;
    
    if (userId) {
      // 已登录用户：基于学习历史推荐
      courses = await Course.find({
        'settings.isPublished': true
      })
      .populate('creator', 'username profile.nickname profile.avatar')
      .sort({ 'stats.rating.average': -1, 'stats.enrolledCount': -1 })
      .limit(parseInt(limit))
      .select('-lessons.steps -lessons.materials');
    } else {
      // 未登录用户：推荐热门课程
      courses = await Course.getPopularCourses(parseInt(limit));
    }
    
    res.json({
      success: true,
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('获取推荐课程错误:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐课程失败'
    });
  }
};

// 报名课程
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查课程是否已发布
    if (!course.settings.isPublished) {
      return res.status(400).json({
        success: false,
        message: '课程暂未发布，无法报名'
      });
    }

    // 检查是否已经报名
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: '您已经报名了这门课程'
      });
    }

    // 创建报名记录
    const enrollment = new Enrollment({
      student: userId,
      course: courseId,
      status: 'enrolled'
    });

    await enrollment.save();

    // 自动解锁第一个课时（如果存在且满足条件）
    if (course.lessons && course.lessons.length > 0) {
      const firstLesson = course.lessons.sort((a, b) => a.order - b.order)[0];
      try {
        await LessonUnlockService.checkAndUnlockLesson(userId, courseId, firstLesson._id.toString());
      } catch (error) {
        console.warn('自动解锁第一课时失败:', error.message);
      }
    }

    // 更新课程报名统计
    await Course.findByIdAndUpdate(courseId, {
      $inc: { 'stats.enrolledCount': 1 }
    });

    // 填充课程信息
    await enrollment.populate('course', 'title thumbnail category difficulty');

    res.status(201).json({
      success: true,
      message: '报名成功',
      data: {
        enrollment
      }
    });
  } catch (error) {
    console.error('课程报名错误:', error);
    res.status(500).json({
      success: false,
      message: '课程报名失败'
    });
  }
};

// 更新学习进度
const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { 
      lessonId, 
      timeSpent = 0, 
      score, 
      completionTime, 
      attempts = 1 
    } = req.body;
    const userId = req.user.id;

    // 验证输入
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: '课时ID不能为空'
      });
    }

    // 查找报名记录
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '您尚未报名此课程'
      });
    }

    // 验证课时是否属于该课程
    const course = await Course.findById(courseId);
    const lesson = course.lessons.find(l => l._id.toString() === lessonId);
    
    if (!lesson) {
      return res.status(400).json({
        success: false,
        message: '课时不存在'
      });
    }

    // 检查课时是否已解锁
    const isUnlocked = enrollment.progress.unlockedLessons.some(
      ul => ul.lessonId.toString() === lessonId
    );

    if (!isUnlocked) {
      return res.status(403).json({
        success: false,
        message: '课时尚未解锁'
      });
    }

    // 构建学习表现数据
    const performance = {
      attempts,
      score,
      completionTime,
      pointsEarned: 0
    };

    // 计算并奖励积分
    let pointsReward = null;
    try {
      pointsReward = await LessonUnlockService.calculateLessonPoints(
        userId, lesson, performance, enrollment
      );
      performance.pointsEarned = pointsReward.totalPoints;
    } catch (error) {
      console.warn('计算积分奖励失败:', error.message);
    }

    // 更新学习进度（包含关卡式学习数据）
    const existingProgress = enrollment.progress.completedLessons.find(
      cl => cl.lessonId.toString() === lessonId
    );

    if (existingProgress) {
      // 更新现有进度
      existingProgress.timeSpent += timeSpent;
      existingProgress.performance = {
        ...existingProgress.performance,
        attempts: Math.max(existingProgress.performance.attempts || 1, attempts),
        score: score !== undefined ? score : existingProgress.performance.score,
        completionTime: completionTime !== undefined ? completionTime : existingProgress.performance.completionTime,
        pointsEarned: (existingProgress.performance.pointsEarned || 0) + performance.pointsEarned
      };
    } else {
      // 添加新的完成记录
      enrollment.progress.completedLessons.push({
        lessonId,
        completedAt: new Date(),
        timeSpent,
        performance
      });
    }

    // 更新总体统计
    enrollment.progress.totalTimeSpent += timeSpent;
    enrollment.progress.lastAccessedAt = new Date();
    enrollment.progress.currentLesson = lessonId;

    // 更新关卡式学习统计
    if (pointsReward) {
      enrollment.progress.gamificationStats.totalPointsEarned += pointsReward.totalPoints;
      
      if (pointsReward.bonusDetails.perfectScore) {
        enrollment.progress.gamificationStats.perfectCompletions += 1;
      }
      
      if (pointsReward.bonusDetails.oneAttempt) {
        enrollment.progress.gamificationStats.oneAttemptCompletions += 1;
      }
    }

    // 重新计算课程进度
    await enrollment.calculateProgress();
    await enrollment.save();

    // 检查并解锁下一个课时
    const nextLessons = course.lessons
      .filter(l => l.order > lesson.order)
      .sort((a, b) => a.order - b.order);
    
    const unlockedLessons = [];
    for (const nextLesson of nextLessons) {
      try {
        const unlockResult = await LessonUnlockService.checkAndUnlockLesson(
          userId, courseId, nextLesson._id.toString()
        );
        
        if (unlockResult.success && !unlockResult.alreadyUnlocked) {
          unlockedLessons.push({
            lessonId: nextLesson._id,
            title: nextLesson.title,
            unlockMethod: unlockResult.unlockMethod
          });
        }
      } catch (error) {
        console.warn(`解锁课时 ${nextLesson.title} 失败:`, error.message);
      }
    }

    // 如果课程完成，自动颁发证书
    if (enrollment.status === 'completed') {
      await enrollment.issueCertificate();
      
      // 更新课程完成统计
      await Course.findByIdAndUpdate(courseId, {
        $inc: { 'stats.completedCount': 1 }
      });
    }

    res.json({
      success: true,
      message: '学习进度更新成功',
      data: {
        progress: enrollment.progress,
        status: enrollment.status,
        certificate: enrollment.certificate,
        pointsReward,
        unlockedLessons
      }
    });
  } catch (error) {
    console.error('更新学习进度错误:', error);
    res.status(500).json({
      success: false,
      message: '更新学习进度失败'
    });
  }
};

// 获取学习进度
const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // 查找报名记录
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    }).populate('course', 'title lessons');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '您尚未报名此课程'
      });
    }

    res.json({
      success: true,
      data: {
        enrollment: {
          status: enrollment.status,
          progress: enrollment.progress,
          notes: enrollment.notes,
          review: enrollment.review,
          certificate: enrollment.certificate,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt
        }
      }
    });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({
      success: false,
      message: '获取学习进度失败'
    });
  }
};

// 获取用户的课程报名列表
const getUserEnrollments = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
      sortBy = 'enrolledAt',
      sortOrder = 'desc'
    } = req.query;
    const userId = req.user.id;

    const enrollments = await Enrollment.getUserEnrollments(userId, {
      status,
      page,
      limit,
      sortBy,
      sortOrder
    });

    const total = await Enrollment.countDocuments({
      student: userId,
      ...(status && { status })
    });

    // 对报名数据进行字段映射以匹配前端需求
    const mappedEnrollments = enrollments.map(enrollment => {
      const course = enrollment.course;
      return {
        id: enrollment._id,
        _id: enrollment._id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        course: {
          id: course._id,
          _id: course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          level: course.difficulty, // 前端使用level字段
          tags: course.tags,
          thumbnail: course.thumbnail,
          image: course.thumbnail, // 前端使用image字段
          estimatedDuration: course.estimatedDuration,
          duration: course.estimatedDuration, // 前端使用duration字段
          settings: course.settings,
          stats: course.stats,
          students: course.stats?.enrolledCount || 0, // 前端使用students字段
          rating: course.stats?.rating?.average || 0, // 前端使用rating字段
          creator: course.creator ? {
            id: course.creator._id,
            _id: course.creator._id,
            username: course.creator.username,
            nickname: course.creator.profile?.nickname,
            avatar: course.creator.profile?.avatar
          } : null,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      };
    });

    res.json({
      success: true,
      data: {
        enrollments: mappedEnrollments,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取用户课程报名列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程报名列表失败'
    });
  }
};

// 获取课程的报名学员列表（仅课程创作者和管理员可访问）
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      status,
      page = 1,
      limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
      sortBy = 'enrolledAt',
      sortOrder = 'desc'
    } = req.query;

    // 检查权限
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== course.creator.toString()) {
      return res.status(403).json({
        success: false,
        message: '无权访问此信息'
      });
    }

    const enrollments = await Enrollment.getCourseEnrollments(courseId, {
      status,
      page,
      limit,
      sortBy,
      sortOrder
    });

    const total = await Enrollment.countDocuments({
      course: courseId,
      ...(status && { status })
    });

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取课程报名学员列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取报名学员列表失败'
    });
  }
};

// 获取可解锁的课时列表
const getUnlockableLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const unlockableLessons = await LessonUnlockService.getUnlockableLessons(userId, courseId);

    res.json({
      success: true,
      data: {
        unlockableLessons
      }
    });
  } catch (error) {
    console.error('获取可解锁课时错误:', error);
    res.status(500).json({
      success: false,
      message: '获取可解锁课时失败'
    });
  }
};

// 手动解锁课时
const unlockLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    const unlockResult = await LessonUnlockService.checkAndUnlockLesson(
      userId, courseId, lessonId
    );

    if (!unlockResult.success) {
      return res.status(400).json({
        success: false,
        message: unlockResult.message,
        requirements: unlockResult.requirements
      });
    }

    res.json({
      success: true,
      message: unlockResult.message,
      data: {
        unlockMethod: unlockResult.unlockMethod,
        alreadyUnlocked: unlockResult.alreadyUnlocked
      }
    });
  } catch (error) {
    console.error('解锁课时错误:', error);
    res.status(500).json({
      success: false,
      message: '解锁课时失败'
    });
  }
};

// 获取课程学习统计
const getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    }).populate('course', 'title lessons');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '您尚未报名此课程'
      });
    }

    const course = enrollment.course;
    const totalLessons = course.lessons.length;
    const completedLessons = enrollment.progress.completedLessons.length;
    const unlockedLessons = enrollment.progress.unlockedLessons.length;
    
    // 计算平均分数
    const scores = enrollment.progress.completedLessons
      .map(cl => cl.performance?.score)
      .filter(score => score !== undefined);
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;

    res.json({
      success: true,
      data: {
        courseTitle: course.title,
        totalLessons,
        completedLessons,
        unlockedLessons,
        progressPercentage: enrollment.progress.percentage,
        totalTimeSpent: enrollment.progress.totalTimeSpent,
        averageScore: Math.round(averageScore * 100) / 100,
        gamificationStats: enrollment.progress.gamificationStats,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt
      }
    });
  } catch (error) {
    console.error('获取课程统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程统计失败'
    });
  }
};

// 检查课程解锁条件
const checkCourseUnlock = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const unlockCheck = await CourseDependencyService.checkCourseUnlockConditions(userId, courseId);

    res.json({
      success: true,
      data: unlockCheck
    });
  } catch (error) {
    console.error('检查课程解锁条件错误:', error);
    res.status(500).json({
      success: false,
      message: '检查课程解锁条件失败',
      error: error.message
    });
  }
};

// 获取推荐学习路径
const getRecommendedPath = async (req, res) => {
  try {
    const userId = req.user._id;
    const { category } = req.query;

    const learningPath = await CourseDependencyService.getRecommendedLearningPath(userId, category);

    res.json({
      success: true,
      data: {
        userId,
        category: category || 'all',
        learningPath,
        totalRecommendations: learningPath.length,
        unlockableCourses: learningPath.filter(item => item.canUnlock).length
      }
    });
  } catch (error) {
    console.error('获取推荐学习路径错误:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐学习路径失败',
      error: error.message
    });
  }
};

// 获取用户技能树
const getUserSkillTree = async (req, res) => {
  try {
    const userId = req.user._id;

    const skillTree = await CourseDependencyService.getUserSkillTree(userId);

    res.json({
      success: true,
      data: skillTree
    });
  } catch (error) {
    console.error('获取用户技能树错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户技能树失败',
      error: error.message
    });
  }
};

// 获取课程分析数据（管理员功能）
const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }

    const analytics = await CourseDependencyService.getCourseAnalytics(courseId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('获取课程分析数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程分析数据失败',
      error: error.message
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getPopularCourses,
  getRecommendedCourses,
  enrollCourse,
  updateProgress,
  getProgress,
  getUserEnrollments,
  getCourseEnrollments,
  getUnlockableLessons,
  unlockLesson,
  getCourseStats,
  checkCourseUnlock,
  getRecommendedPath,
  getUserSkillTree,
  getCourseAnalytics
};