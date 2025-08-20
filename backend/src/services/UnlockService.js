const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const PointsService = require('./PointsService');

/**
 * 解锁服务类
 * 负责课程解锁逻辑和条件验证
 */
class UnlockService {
  /**
   * 检查课程解锁条件
   * @param {String} userId - 用户ID
   * @param {String} courseId - 课程ID
   * @param {String} lessonId - 课程ID
   * @returns {Object} 解锁检查结果
   */
  static async checkLessonUnlock(userId, courseId, lessonId) {
    try {
      // 获取用户信息
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          unlocked: false,
          error: '用户不存在'
        };
      }

      // 获取课程信息
      const course = await Course.findById(courseId);
      if (!course) {
        return {
          success: false,
          unlocked: false,
          error: '课程不存在'
        };
      }

      // 查找对应的课程
      const lesson = course.lessons.id(lessonId);
      if (!lesson) {
        return {
          success: false,
          unlocked: false,
          error: '课程不存在'
        };
      }

      // 获取用户的课程报名信息
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId
      });

      if (!enrollment) {
        return {
          success: false,
          unlocked: false,
          error: '用户未报名此课程'
        };
      }

      // 检查是否已经解锁
      const alreadyUnlocked = enrollment.progress.unlockedLessons.some(
        unlock => unlock.lessonId.toString() === lessonId
      );

      if (alreadyUnlocked) {
        return {
          success: true,
          unlocked: true,
          alreadyUnlocked: true,
          message: '课程已解锁'
        };
      }

      // 获取解锁条件
      const unlockConditions = lesson.unlockConditions || {};
      
      // 检查解锁条件
      const checkResult = await this.evaluateUnlockConditions(
        user, 
        enrollment, 
        unlockConditions, 
        course
      );
      
      return {
        success: true,
        unlocked: checkResult.canUnlock,
        conditions: checkResult.conditions,
        message: checkResult.message,
        requirements: checkResult.requirements
      };
    } catch (error) {
      console.error('检查课时解锁失败:', error);
      return {
        success: false,
        unlocked: false,
        error: error.message
      };
    }
  }
  
  /**
   * 评估解锁条件
   * @param {Object} user - 用户对象
   * @param {Object} enrollment - 报名记录
   * @param {Object} unlockConditions - 解锁条件
   * @param {Object} course - 课程对象
   * @returns {Object} 评估结果
   */
  static async evaluateUnlockConditions(user, enrollment, unlockConditions, course) {
    // 如果没有解锁条件，默认可以解锁
    if (!unlockConditions || Object.keys(unlockConditions).length === 0) {
      return {
        canUnlock: true,
        conditions: {},
        requirements: {},
        message: '无解锁条件，默认解锁'
      };
    }
    
    const conditions = {
      prerequisiteLessons: true,
      pointsRequired: true,
      levelRequired: true,
      timeDelay: true
    };
    
    const requirements = {
      prerequisiteLessons: [],
      pointsRequired: 0,
      levelRequired: 0,
      timeDelay: null
    };
    
    let canUnlock = true;
    let message = '课时已满足解锁条件';
    
    // 检查前置课时
    if (unlockConditions.prerequisiteLessons && unlockConditions.prerequisiteLessons.length > 0) {
      requirements.prerequisiteLessons = unlockConditions.prerequisiteLessons;
      const prerequisiteCheck = await this.checkPrerequisiteLessons(
        enrollment, 
        unlockConditions.prerequisiteLessons
      );
      conditions.prerequisiteLessons = prerequisiteCheck.passed;
      if (!prerequisiteCheck.passed) {
        canUnlock = false;
        const missingLessons = prerequisiteCheck.details
          .filter(detail => !detail.passed)
          .map(detail => detail.lessonId);
        message = `需要完成前置课时: ${missingLessons.join(', ')}`;
      }
    }
    
    // 检查积分要求
    if (unlockConditions.pointsRequired && unlockConditions.pointsRequired > 0) {
      requirements.pointsRequired = unlockConditions.pointsRequired;
      const userPoints = user.learningStats?.totalPoints || 0;
      conditions.pointsRequired = userPoints >= unlockConditions.pointsRequired;
      if (!conditions.pointsRequired) {
        canUnlock = false;
        message = `需要积分: ${unlockConditions.pointsRequired}，当前积分: ${userPoints}`;
      }
    }
    
    // 检查等级要求
    if (unlockConditions.levelRequired && unlockConditions.levelRequired > 0) {
      requirements.levelRequired = unlockConditions.levelRequired;
      const userLevel = user.learningStats?.level || 1;
      conditions.levelRequired = userLevel >= unlockConditions.levelRequired;
      if (!conditions.levelRequired) {
        canUnlock = false;
        message = `需要等级: ${unlockConditions.levelRequired}，当前等级: ${userLevel}`;
      }
    }
    
    // 检查时间延迟
    if (unlockConditions.timeDelay && unlockConditions.timeDelay > 0) {
      requirements.timeDelay = unlockConditions.timeDelay;
      const enrollmentTime = enrollment.enrolledAt;
      const requiredTime = new Date(enrollmentTime.getTime() + unlockConditions.timeDelay * 1000);
      const now = new Date();
      conditions.timeDelay = now >= requiredTime;
      if (!conditions.timeDelay) {
        canUnlock = false;
        const remainingTime = Math.ceil((requiredTime - now) / 1000);
        message = `需要等待 ${remainingTime} 秒后解锁`;
      }
    }
    
    return {
      canUnlock,
      conditions,
      requirements,
      message
    };
  }

  /**
   * 解锁课程
   * @param {String} userId - 用户ID
   * @param {String} courseId - 课程ID
   * @param {String} lessonId - 课程ID
   * @param {String} unlockMethod - 解锁方式
   * @returns {Object} 解锁结果
   */
  static async unlockLesson(userId, courseId, lessonId, unlockMethod = 'auto') {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      // 检查解锁条件
      const unlockCheck = await this.checkLessonUnlock(userId, courseId, lessonId);
      
      if (!unlockCheck.success) {
        throw new Error(unlockCheck.error);
      }
      
      if (unlockCheck.alreadyUnlocked) {
        return {
          success: true,
          alreadyUnlocked: true,
          message: '课程已解锁'
        };
      }
      
      // 如果是自动解锁，检查是否满足条件
      if (unlockMethod === 'auto' && !unlockCheck.unlocked) {
        return {
          success: false,
          error: '解锁条件未满足',
          failedConditions: unlockCheck.failedConditions
        };
      }
      
      // 获取报名信息
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId
      }).session(session);
      
      if (!enrollment) {
        throw new Error('用户未报名此课程');
      }
      
      // 添加解锁记录
      enrollment.progress.unlockedLessons.push({
        lessonId: lessonId,
        unlockedAt: new Date(),
        unlockMethod: unlockMethod
      });
      
      await enrollment.save({ session });
      
      // 如果是手动解锁，记录管理员操作日志
      if (unlockMethod === 'manual') {
        // 这里可以添加管理员操作日志
        console.log(`管理员手动解锁课程: 用户${userId}, 课程${courseId}, 课程${lessonId}`);
      }
      
      await session.commitTransaction();
      
      return {
        success: true,
        unlocked: true,
        unlockMethod,
        message: '课程解锁成功'
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('解锁课程失败:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * 批量检查并解锁课程
   * @param {String} userId - 用户ID
   * @param {String} courseId - 课程ID
   * @returns {Object} 批量解锁结果
   */
  static async batchUnlockLessons(userId, courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('课程不存在');
      }
      
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId
      });
      
      if (!enrollment) {
        throw new Error('用户未报名此课程');
      }
      
      const results = [];
      let newUnlocks = 0;
      
      // 按顺序检查每个课程
      const sortedLessons = course.lessons.sort((a, b) => a.order - b.order);
      
      for (const lesson of sortedLessons) {
        const unlockCheck = await this.checkLessonUnlock(userId, courseId, lesson._id.toString());
        
        if (unlockCheck.success && unlockCheck.unlocked && !unlockCheck.alreadyUnlocked) {
          const unlockResult = await this.unlockLesson(userId, courseId, lesson._id.toString(), 'auto');
          
          if (unlockResult.success && !unlockResult.alreadyUnlocked) {
            newUnlocks++;
          }
          
          results.push({
            lessonId: lesson._id.toString(),
            lessonTitle: lesson.title,
            unlocked: unlockResult.success,
            newUnlock: unlockResult.success && !unlockResult.alreadyUnlocked
          });
        } else {
          results.push({
            lessonId: lesson._id.toString(),
            lessonTitle: lesson.title,
            unlocked: unlockCheck.alreadyUnlocked || false,
            newUnlock: false,
            failedConditions: unlockCheck.failedConditions || []
          });
        }
      }
      
      return {
        success: true,
        totalLessons: sortedLessons.length,
        newUnlocks,
        results
      };
    } catch (error) {
      console.error('批量解锁课程失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取用户的课程解锁状态
   * @param {String} userId - 用户ID
   * @param {String} courseId - 课程ID
   * @returns {Object} 解锁状态
   */
  static async getUserLessonUnlockStatus(userId, courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('课程不存在');
      }
      
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: courseId
      });
      
      if (!enrollment) {
        throw new Error('用户未报名此课程');
      }
      
      const unlockedLessonIds = enrollment.progress.unlockedLessons.map(
        unlock => unlock.lessonId.toString()
      );
      
      const completedLessonIds = enrollment.progress.completedLessons.map(
        completed => completed.lessonId.toString()
      );
      
      const lessonStatus = [];
      
      for (const lesson of course.lessons) {
        const lessonId = lesson._id.toString();
        const isUnlocked = unlockedLessonIds.includes(lessonId);
        const isCompleted = completedLessonIds.includes(lessonId);
        
        let status = 'locked';
        if (isCompleted) {
          status = 'completed';
        } else if (isUnlocked) {
          status = 'unlocked';
        }
        
        // 如果未解锁，检查解锁条件
        let unlockInfo = null;
        if (!isUnlocked) {
          const unlockCheck = await this.checkLessonUnlock(userId, courseId, lessonId);
          unlockInfo = {
            canUnlock: unlockCheck.unlocked,
            conditions: unlockCheck.conditions,
            failedConditions: unlockCheck.failedConditions
          };
        }
        
        lessonStatus.push({
          lessonId,
          title: lesson.title,
          order: lesson.order,
          status,
          isUnlocked,
          isCompleted,
          unlockInfo
        });
      }
      
      // 统计信息
      const totalLessons = course.lessons.length;
      const unlockedCount = unlockedLessonIds.length;
      const completedCount = completedLessonIds.length;
      
      return {
        success: true,
        courseId,
        totalLessons,
        unlockedCount,
        completedCount,
        progressPercentage: Math.round((completedCount / totalLessons) * 100),
        lessons: lessonStatus
      };
    } catch (error) {
      console.error('获取课程解锁状态失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 检查前置课程条件
   * @param {Object} enrollment - 报名信息
   * @param {Array} prerequisiteLessons - 前置课程列表
   * @returns {Object} 检查结果
   */
  static async checkPrerequisiteLessons(enrollment, prerequisiteLessons) {
    const completedLessonIds = enrollment.progress.completedLessons.map(
      completed => completed.lessonId.toString()
    );
    
    const results = [];
    let allPassed = true;
    
    for (const prerequisite of prerequisiteLessons) {
      const lessonId = prerequisite.lessonId.toString();
      const isRequired = prerequisite.required !== false;
      const isCompleted = completedLessonIds.includes(lessonId);
      
      results.push({
        lessonId,
        required: isRequired,
        completed: isCompleted,
        passed: !isRequired || isCompleted
      });
      
      if (isRequired && !isCompleted) {
        allPassed = false;
      }
    }
    
    return {
      passed: allPassed,
      details: results
    };
  }

  /**
   * 检查技能要求
   * @param {Object} userSkillProgress - 用户技能进度
   * @param {Array} skillsRequired - 技能要求列表
   * @returns {Object} 检查结果
   */
  static checkSkillRequirements(userSkillProgress, skillsRequired) {
    const results = [];
    let allPassed = true;
    
    for (const skillReq of skillsRequired) {
      const { skillType, skillName, minProgress = 0 } = skillReq;
      
      const skillTypeProgress = userSkillProgress[skillType];
      let currentProgress = 0;
      
      if (skillTypeProgress && skillTypeProgress.skills) {
        const skill = skillTypeProgress.skills.find(s => s.name === skillName);
        currentProgress = skill ? skill.progress : 0;
      }
      
      const passed = currentProgress >= minProgress;
      
      results.push({
        skillType,
        skillName,
        required: minProgress,
        current: currentProgress,
        passed
      });
      
      if (!passed) {
        allPassed = false;
      }
    }
    
    return {
      passed: allPassed,
      details: results
    };
  }

  /**
   * 自动解锁下一个课程（在完成课程后调用）
   * @param {String} userId - 用户ID
   * @param {String} courseId - 课程ID
   * @param {String} completedLessonId - 已完成的课程ID
   * @returns {Object} 自动解锁结果
   */
  static async autoUnlockNextLesson(userId, courseId, completedLessonId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        return { success: false, error: '课程不存在' };
      }
      
      // 找到当前完成的课程
      const completedLesson = course.lessons.id(completedLessonId);
      if (!completedLesson) {
        return { success: false, error: '已完成的课程不存在' };
      }
      
      // 找到下一个课程（按order排序）
      const nextLesson = course.lessons
        .filter(lesson => lesson.order > completedLesson.order)
        .sort((a, b) => a.order - b.order)[0];
      
      if (!nextLesson) {
        return {
          success: true,
          message: '已完成所有课程',
          noMoreLessons: true
        };
      }
      
      // 尝试解锁下一个课程
      const unlockResult = await this.unlockLesson(
        userId,
        courseId,
        nextLesson._id.toString(),
        'auto'
      );
      
      return {
        success: true,
        nextLesson: {
          id: nextLesson._id.toString(),
          title: nextLesson.title,
          order: nextLesson.order
        },
        unlockResult
      };
    } catch (error) {
      console.error('自动解锁下一课程失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = UnlockService;