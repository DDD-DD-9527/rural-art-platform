const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const PointsRecord = require('../models/PointsRecord');
const PointsService = require('../services/PointsService');
const UnlockService = require('../services/UnlockService');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');


// 检查课时解锁状态
const checkLessonUnlock = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        message: '未报名此课程' 
      });
    }

    const lesson = enrollment.course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        message: '课时不存在' 
      });
    }

    // 检查解锁条件
    const unlockResult = await UnlockService.checkLessonUnlock(
      userId, 
      courseId, 
      lessonId
    );

    res.json({
      success: true,
      data: {
        isUnlocked: unlockResult.unlocked,
        unlockConditions: lesson.unlockConditions || [],
        failedConditions: unlockResult.failedConditions || [],
        message: unlockResult.message,
        progress: enrollment.progress,
        lesson: {
          _id: lesson._id,
          title: lesson.title,
          pointsReward: lesson.pointsReward,
          difficultyMultiplier: lesson.difficultyMultiplier
        }
      }
    });
  } catch (error) {
    console.error('checkLessonUnlock error:', error);
    res.status(500).json({ 
      success: false, 
      message: '检查解锁状态失败' 
    });
  }
};

// 完成课时并获得积分
const completeLesson = async (req, res) => {
  try {
    console.log('🚀 completeLesson方法被调用', {
      userId: req.user._id,
      courseId: req.params.courseId,
      lessonId: req.params.lessonId
    });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: errors.array()
      });
    }

    const { courseId, lessonId } = req.params;
    const { timeSpent = 0, score = 0, attempts = 1, completionData = {} } = req.body;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        message: '未报名此课程' 
      });
    }

    const lesson = enrollment.course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ 
        success: false, 
        message: '课时不存在' 
      });
    }

    // 检查是否已解锁
    const unlockResult = await UnlockService.checkLessonUnlock(
      userId, 
      courseId, 
      lessonId
    );

    if (!unlockResult.unlocked) {
      return res.status(403).json({ 
        success: false, 
        message: '课时尚未解锁',
        failedConditions: unlockResult.failedConditions
      });
    }

    // 检查是否已完成
    const isAlreadyCompleted = enrollment.progress.completedLessons.some(
      cl => cl.lessonId.toString() === lessonId
    );
    
    console.log('🔍 课时完成状态检查', {
      lessonId,
      completedLessons: enrollment.progress.completedLessons.map(cl => cl.lessonId.toString()),
      isAlreadyCompleted
    });

    let pointsEarned = 0;
    let bonusDetails = {};

    if (!isAlreadyCompleted) {
      console.log('✨ 课时未完成，开始积分发放流程');
      // 计算积分奖励
      const user = await User.findById(userId);
      const userLevel = Math.floor(user.learningStats.totalPoints / 100) + 1;
      
      const completionInfo = {
        score,
        timeSpent,
        attempts,
        isFirstAttempt: attempts === 1,
        isPerfectScore: score >= 100,
        ...completionData
      };

      pointsEarned = await PointsService.calculateLessonPoints(
        lesson,
        userLevel,
        completionInfo
      );

      // 发放积分

      const pointsData = {
        userId: userId,
        type: 'lesson_complete',
        source: {
          sourceType: 'lesson',
          sourceId: lessonId,
          sourceName: lesson.title
        },
        points: pointsEarned,
        description: `完成课时：${lesson.title}`,
        metadata: {
          lessonId: lessonId,
          courseId: courseId,
          score: score,
          timeSpent: timeSpent,
          attempts: attempts,
          level: userLevel
        }
      };

      console.log('🔥 准备调用PointsService.awardPoints');
      const awardResult = await PointsService.awardPoints(pointsData);


      // 更新学习进度
      const completionRecord = {
        lessonId: lessonId,
        completedAt: new Date(),
        timeSpent: timeSpent,
        performance: {
          attempts: attempts,
          score: score,
          completionTime: timeSpent,
          pointsEarned: pointsEarned,
          bonusDetails: bonusDetails
        }
      };

      enrollment.progress.completedLessons.push(completionRecord);
      enrollment.progress.totalTimeSpent += timeSpent;
      
      // 初始化游戏化统计数据（如果不存在）
      if (!enrollment.progress.gamificationStats) {
        enrollment.progress.gamificationStats = {
          totalPointsEarned: 0, // 这个字段将通过PointsRecord计算得出，不再直接更新
          currentStreak: 0,
          longestStreak: 0,
          averageScore: 0,
          perfectCompletions: 0,
          oneAttemptCompletions: 0
        };
      }

      // 注意：不再直接更新totalPointsEarned，它将通过PointsRecord计算得出
      if (score >= 100) {
        enrollment.progress.gamificationStats.perfectCompletions += 1;
      }
      if (attempts === 1) {
        enrollment.progress.gamificationStats.oneAttemptCompletions += 1;
      }

      // 重新计算平均分
      const completedCount = enrollment.progress.completedLessons.length;
      const totalScore = enrollment.progress.completedLessons.reduce(
        (sum, lesson) => sum + (lesson.performance?.score || 0), 0
      );
      enrollment.progress.gamificationStats.averageScore = totalScore / completedCount;

      await enrollment.save();
    }

    // 检查并解锁下一个课时
    const nextUnlockedLessons = await UnlockService.autoUnlockNextLesson(
      userId, 
      courseId, 
      lessonId
    );

    // 检查课程完成状态
    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = enrollment.progress.completedLessons.length;
    const isCompleted = completedLessons >= totalLessons;

    let courseCompletionReward = 0;
    if (isCompleted && !enrollment.progress.isCompleted) {
      // 课程完成奖励
      courseCompletionReward = 50; // 基础课程完成奖励
      
      const coursePointsData = {
        userId: userId,
        type: 'course_completion',
        source: 'course',
        points: courseCompletionReward,
        description: `完成课程：${enrollment.course.title}`,
        resourceId: courseId,
        resourceType: 'Course',
        metadata: {
          courseId: courseId,
          courseTitle: enrollment.course.title,
          totalLessons: totalLessons,
          totalTimeSpent: enrollment.progress.totalTimeSpent
        }
      };

      await PointsService.awardPoints(coursePointsData);
      enrollment.progress.isCompleted = true;
      enrollment.progress.completedAt = new Date();
      await enrollment.save();
    }

    res.json({
      success: true,
      data: {
        pointsEarned: pointsEarned,
        courseCompletionReward: courseCompletionReward,
        totalPoints: pointsEarned + courseCompletionReward,
        nextUnlockedLessons: nextUnlockedLessons,
        progress: {
          completedLessons: enrollment.progress.completedLessons.length,
          totalLessons: totalLessons,
          percentage: Math.round((completedLessons / totalLessons) * 100),
          isCompleted: isCompleted
        },
        gamificationStats: enrollment.progress.gamificationStats
      }
    });
  } catch (error) {
    console.error('completeLesson error:', error);
    res.status(500).json({ 
      success: false, 
      message: '完成课时失败' 
    });
  }
};

// 获取学习路径
const getLearningPath = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // 如果没有提供courseId，获取用户的第一个课程
    let targetCourseId = courseId;
    if (!courseId) {
      const firstEnrollment = await Enrollment.findOne({
        student: userId
      }).populate('course');
      
      if (!firstEnrollment) {
        return res.status(404).json({ 
          success: false, 
          message: '未报名任何课程' 
        });
      }
      targetCourseId = firstEnrollment.course._id;
    }

    const enrollment = await Enrollment.findOne({
      student: userId,
      course: targetCourseId
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        message: '未报名此课程' 
      });
    }

    const course = enrollment.course;
    const lessons = [];

    for (const lesson of course.lessons) {
      const unlockResult = await UnlockService.checkLessonUnlock(
        userId, 
        targetCourseId, 
        lesson._id
      );

      const isCompleted = enrollment.progress.completedLessons.some(
        cl => cl.lessonId.toString() === lesson._id.toString()
      );

      const completionRecord = enrollment.progress.completedLessons.find(
        cl => cl.lessonId.toString() === lesson._id.toString()
      );

      lessons.push({
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        duration: lesson.duration,
        pointsReward: lesson.pointsReward,
        unlockConditions: lesson.unlockConditions,
        difficultyMultiplier: lesson.difficultyMultiplier,
        status: isCompleted ? 'completed' : (unlockResult.isUnlocked ? 'available' : 'locked'),
        isUnlocked: unlockResult.isUnlocked,
        failedConditions: unlockResult.failedConditions || [],
        performance: completionRecord?.performance || null
      });
    }

    // 按顺序排序
    lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          description: course.description,
          totalLessons: course.lessons.length
        },
        lessons: lessons,
        progress: {
          completedLessons: enrollment.progress.completedLessons.length,
          totalLessons: course.lessons.length,
          percentage: Math.round((enrollment.progress.completedLessons.length / course.lessons.length) * 100),
          totalTimeSpent: enrollment.progress.totalTimeSpent,
          gamificationStats: enrollment.progress.gamificationStats
        }
      }
    });
  } catch (error) {
    console.error('getLearningPath error:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取学习路径失败' 
    });
  }
};

// 获取积分历史
const getPointsHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user._id;
    
    // 检查权限：只能查看自己的积分历史，除非是管理员
    if (userId && userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: '无权限查看其他用户的积分历史' 
      });
    }

    const {
      page = 1,
      limit = 20,
      type = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    let query = { user: targetUserId };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const records = await PointsRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PointsRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('getPointsHistory error:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取积分历史失败' 
    });
  }
};

// 获取积分统计
const getPointsStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user._id;
    
    // 检查权限：只能查看自己的积分统计，除非是管理员
    if (userId && userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: '无权限查看其他用户的积分统计' 
      });
    }
    
    const result = await PointsService.getUserPointsStats(targetUserId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: result.error || '获取积分统计失败' 
      });
    }
  } catch (error) {
    console.error('getPointsStats error:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取积分统计失败' 
    });
  }
};

// 获取用户成就
const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user._id;

    // 获取用户的所有课程报名记录
    const enrollments = await Enrollment.find({
      student: targetUserId
    }).populate('course', 'title category');

    const achievements = [];
    let totalPoints = 0;
    let coursesCompleted = 0;
    let perfectScores = 0;
    let streakDays = 0;

    for (const enrollment of enrollments) {
      if (enrollment.progress.gamificationStats) {
        // 使用新的计算方法获取课程积分
        const coursePoints = await enrollment.calculateCoursePoints();
        totalPoints += coursePoints;
        perfectScores += enrollment.progress.gamificationStats.perfectCompletions || 0;
        
        if (enrollment.progress.isCompleted) {
          coursesCompleted += 1;
        }
      }
    }

    // 基于统计数据生成成就
    if (coursesCompleted >= 1) {
      achievements.push({
        id: 'first_course',
        name: '初学者',
        description: '完成第一门课程',
        icon: '🎓',
        earnedAt: new Date(),
        category: 'learning'
      });
    }

    if (coursesCompleted >= 5) {
      achievements.push({
        id: 'course_master',
        name: '学习达人',
        description: '完成5门课程',
        icon: '🏆',
        earnedAt: new Date(),
        category: 'learning'
      });
    }

    if (perfectScores >= 10) {
      achievements.push({
        id: 'perfectionist',
        name: '完美主义者',
        description: '获得10次满分',
        icon: '⭐',
        earnedAt: new Date(),
        category: 'performance'
      });
    }

    if (totalPoints >= 1000) {
      achievements.push({
        id: 'point_collector',
        name: '积分收集者',
        description: '累计获得1000积分',
        icon: '💎',
        earnedAt: new Date(),
        category: 'points'
      });
    }

    res.json({
      success: true,
      data: {
        achievements,
        stats: {
          totalPoints,
          coursesCompleted,
          perfectScores,
          streakDays
        }
      }
    });
  } catch (error) {
    console.error('getUserAchievements error:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取用户成就失败' 
    });
  }
};

// 获取排行榜
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'points' } = req.params;
    const { limit = 50 } = req.query;

    let sortField = 'learningStats.totalPoints';
    let title = '积分排行榜';

    switch (type) {
      case 'courses':
        sortField = 'learningStats.coursesCompleted';
        title = '课程完成排行榜';
        break;
      case 'time':
        sortField = 'learningStats.totalStudyTime';
        title = '学习时长排行榜';
        break;
      default:
        sortField = 'learningStats.totalPoints';
        title = '积分排行榜';
    }

    const users = await User.find({
      [sortField]: { $gt: 0 }
    })
    .select('username profile.nickname profile.avatar learningStats')
    .sort({ [sortField]: -1 })
    .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: {
        _id: user._id,
        username: user.username,
        nickname: user.profile?.nickname || user.username,
        avatar: user.profile?.avatar
      },
      value: user.learningStats?.[sortField.split('.')[1]] || 0,
      level: Math.floor((user.learningStats?.totalPoints || 0) / 100) + 1
    }));

    res.json({
      success: true,
      data: {
        title,
        type,
        leaderboard
      }
    });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取排行榜失败' 
    });
  }
};

// 撤销积分记录（管理员功能）
const revokePoints = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: errors.array()
      });
    }

    const { recordId } = req.params;
    const { reason } = req.body;

    const record = await PointsRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: '积分记录不存在' 
      });
    }

    if (record.status === 'revoked') {
      return res.status(400).json({ 
        success: false, 
        message: '积分记录已被撤销' 
      });
    }

    await PointsService.revokePoints(recordId, reason, req.user._id);

    res.json({
      success: true,
      message: '积分记录撤销成功'
    });
  } catch (error) {
    console.error('revokePoints error:', error);
    res.status(500).json({ 
      success: false, 
      message: '撤销积分记录失败' 
    });
  }
};

// 批量解锁课时（管理员功能）
const batchUnlockLessons = async (req, res) => {
  try {
    const { courseId, lessonIds } = req.body;
    const userId = req.user._id;

    // 验证输入
    if (!courseId || !lessonIds || !Array.isArray(lessonIds)) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：courseId 和 lessonIds'
      });
    }

    const result = await UnlockService.batchUnlockLessons(userId, courseId, lessonIds);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: `成功解锁 ${result.data.unlockedCount} 个课程`
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('batchUnlockLessons error:', error);
    res.status(500).json({
      success: false,
      message: '批量解锁课程失败'
    });
  }
};

// 获取学习统计
const getLearningStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'week' } = req.query;
    const targetUserId = userId || req.user._id;
    
    // 检查权限：只能查看自己的学习统计，除非是管理员
    if (userId && userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: '无权限查看其他用户的学习统计' 
      });
    }

    // 计算时间范围
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 获取用户的报名记录
    const enrollments = await Enrollment.find({
      student: targetUserId,
      enrolledAt: { $gte: startDate }
    }).populate('course', 'title category');

    // 获取积分记录
    const pointsRecords = await PointsRecord.find({
      user: targetUserId,
      createdAt: { $gte: startDate }
    });

    // 计算统计数据
    const stats = {
      period,
      totalLessonsCompleted: 0,
      totalPointsEarned: pointsRecords.reduce((sum, record) => sum + record.points, 0),
      coursesStarted: enrollments.length,
      coursesCompleted: 0,
      averageScore: 0,
      studyDays: new Set(),
      dailyProgress: []
    };

    let totalScores = 0;
    let scoreCount = 0;

    for (const enrollment of enrollments) {
      if (enrollment.progress.isCompleted) {
        stats.coursesCompleted++;
      }
      
      if (enrollment.progress.gamificationStats) {
        stats.totalLessonsCompleted += enrollment.progress.gamificationStats.lessonsCompleted || 0;
        
        // 计算平均分
        const scores = enrollment.progress.gamificationStats.scores || [];
        if (scores.length > 0) {
          totalScores += scores.reduce((sum, score) => sum + score, 0);
          scoreCount += scores.length;
        }
      }
      
      // 记录学习日期
      if (enrollment.lastAccessedAt && enrollment.lastAccessedAt >= startDate) {
        const dayKey = enrollment.lastAccessedAt.toISOString().split('T')[0];
        stats.studyDays.add(dayKey);
      }
    }

    stats.averageScore = scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0;
    stats.studyDaysCount = stats.studyDays.size;
    
    // 生成每日进度数据
    const days = Math.min(30, Math.ceil((now - startDate) / (24 * 60 * 60 * 1000)));
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayKey = date.toISOString().split('T')[0];
      
      const dayPoints = pointsRecords
        .filter(record => record.createdAt.toISOString().split('T')[0] === dayKey)
        .reduce((sum, record) => sum + record.points, 0);
      
      stats.dailyProgress.push({
        date: dayKey,
        points: dayPoints,
        hasActivity: stats.studyDays.has(dayKey)
      });
    }

    // 清理临时数据
    delete stats.studyDays;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('getLearningStats error:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取学习统计失败' 
    });
  }
};

module.exports = {
  checkLessonUnlock,
  completeLesson,
  getLearningPath,
  getPointsHistory,
  getPointsStats,
  getAchievements: getUserAchievements,
  getLeaderboard,
  revokePoints,
  batchUnlockLessons,
  getLearningStats
};