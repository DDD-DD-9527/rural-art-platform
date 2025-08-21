const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const PointsRecord = require('../models/PointsRecord');
const { POINTS_CONFIG, COURSE_CONFIG } = require('../config/constants');

/**
 * 关卡解锁服务
 * 负责处理课程关卡的解锁逻辑、积分奖励和依赖关系管理
 */
class LessonUnlockService {
  /**
   * 检查并解锁课时
   * @param {string} userId - 用户ID
   * @param {string} courseId - 课程ID
   * @param {string} lessonId - 课时ID
   * @returns {Object} 解锁结果
   */
  static async checkAndUnlockLesson(userId, courseId, lessonId) {
    try {
      const course = await Course.findById(courseId);
      const enrollment = await Enrollment.findOne({ student: userId, course: courseId });
      const user = await User.findById(userId);
      
      if (!course || !enrollment || !user) {
        throw new Error('课程、报名记录或用户不存在');
      }

      const lesson = course.lessons.find(l => l._id.toString() === lessonId);
      if (!lesson) {
        throw new Error('课时不存在');
      }

      // 检查是否已经解锁
      const isAlreadyUnlocked = enrollment.progress.unlockedLessons.some(
        ul => ul.lessonId.toString() === lessonId
      );

      if (isAlreadyUnlocked) {
        return {
          success: true,
          alreadyUnlocked: true,
          message: '课时已解锁'
        };
      }

      // 检查解锁条件
      const unlockResult = await this.checkUnlockConditions(
        user, enrollment, lesson, course
      );

      if (!unlockResult.canUnlock) {
        return {
          success: false,
          message: unlockResult.reason,
          requirements: unlockResult.requirements
        };
      }

      // 执行解锁
      await this.unlockLesson(enrollment, lessonId, unlockResult.unlockMethod);

      return {
        success: true,
        message: '课时解锁成功',
        unlockMethod: unlockResult.unlockMethod
      };
    } catch (error) {
      console.error('检查课时解锁错误:', error);
      throw error;
    }
  }

  /**
   * 检查解锁条件
   * @param {Object} user - 用户对象
   * @param {Object} enrollment - 报名记录
   * @param {Object} lesson - 课时对象
   * @param {Object} course - 课程对象
   * @returns {Object} 检查结果
   */
  static async checkUnlockConditions(user, enrollment, lesson, course) {
    const conditions = lesson.unlockConditions;
    const requirements = [];

    // 检查前置课时
    if (conditions.prerequisiteLessons && conditions.prerequisiteLessons.length > 0) {
      for (const prereq of conditions.prerequisiteLessons) {
        const isCompleted = enrollment.progress.completedLessons.some(
          cl => cl.lessonId.toString() === prereq.lessonId.toString()
        );
        
        if (prereq.required && !isCompleted) {
          const prereqLesson = course.lessons.find(
            l => l._id.toString() === prereq.lessonId.toString()
          );
          requirements.push({
            type: 'prerequisite',
            message: `需要先完成课时：${prereqLesson?.title || '未知课时'}`
          });
        }
      }
    }

    // 检查积分要求
    if (conditions.pointsRequired > 0) {
      const userPoints = user.profile?.points || 0;
      if (userPoints < conditions.pointsRequired) {
        requirements.push({
          type: 'points',
          message: `需要积分：${conditions.pointsRequired}，当前积分：${userPoints}`
        });
      }
    }

    // 检查等级要求
    if (conditions.levelRequired > 1) {
      const userLevel = user.profile?.level || 1;
      if (userLevel < conditions.levelRequired) {
        requirements.push({
          type: 'level',
          message: `需要等级：${conditions.levelRequired}，当前等级：${userLevel}`
        });
      }
    }

    // 检查技能要求
    if (conditions.skillsRequired && conditions.skillsRequired.length > 0) {
      for (const skill of conditions.skillsRequired) {
        const userSkill = user.profile?.skills?.find(
          s => s.skillType === skill.skillType && s.skillName === skill.skillName
        );
        
        if (!userSkill || userSkill.progress < skill.minProgress) {
          requirements.push({
            type: 'skill',
            message: `需要技能：${skill.skillName}（进度${skill.minProgress}%）`
          });
        }
      }
    }

    if (requirements.length > 0) {
      return {
        canUnlock: false,
        reason: '不满足解锁条件',
        requirements
      };
    }

    return {
      canUnlock: true,
      unlockMethod: 'prerequisite'
    };
  }

  /**
   * 执行课时解锁
   * @param {Object} enrollment - 报名记录
   * @param {string} lessonId - 课时ID
   * @param {string} unlockMethod - 解锁方式
   */
  static async unlockLesson(enrollment, lessonId, unlockMethod = 'auto') {
    enrollment.progress.unlockedLessons.push({
      lessonId,
      unlockedAt: new Date(),
      unlockMethod
    });

    await enrollment.save();
  }

  /**
   * 计算并奖励课时完成积分
   * @param {string} userId - 用户ID
   * @param {Object} lesson - 课时对象
   * @param {Object} performance - 学习表现
   * @param {Object} enrollment - 报名记录
   * @returns {Object} 积分奖励详情
   */
  static async calculateLessonPoints(userId, lesson, performance, enrollment) {
    try {
      const pointsReward = lesson.pointsReward;
      let totalPoints = pointsReward.basePoints || POINTS_CONFIG.LESSON_COMPLETION;
      const bonusDetails = {
        firstCompletion: false,
        perfectScore: false,
        speedBonus: false,
        oneAttempt: false
      };

      // 首次完成奖励
      if (pointsReward.bonusConditions.firstCompletion.enabled) {
        const isFirstCompletion = !enrollment.progress.completedLessons.some(
          cl => cl.lessonId.toString() === lesson._id.toString()
        );
        
        if (isFirstCompletion) {
          totalPoints += pointsReward.bonusConditions.firstCompletion.points;
          bonusDetails.firstCompletion = true;
        }
      }

      // 满分奖励
      if (pointsReward.bonusConditions.perfectScore.enabled && performance.score) {
        const threshold = pointsReward.bonusConditions.perfectScore.threshold || COURSE_CONFIG.PERFECT_SCORE_THRESHOLD;
        if (performance.score >= threshold) {
          totalPoints += pointsReward.bonusConditions.perfectScore.points;
          bonusDetails.perfectScore = true;
        }
      }

      // 速度奖励
      if (pointsReward.bonusConditions.speedBonus.enabled && performance.completionTime) {
        const timeLimit = pointsReward.bonusConditions.speedBonus.timeLimit;
        if (performance.completionTime <= timeLimit) {
          totalPoints += pointsReward.bonusConditions.speedBonus.points;
          bonusDetails.speedBonus = true;
        }
      }

      // 一次通过奖励
      if (pointsReward.bonusConditions.oneAttempt.enabled && performance.attempts === 1) {
        totalPoints += pointsReward.bonusConditions.oneAttempt.points;
        bonusDetails.oneAttempt = true;
      }

      // 等级倍数
      if (pointsReward.levelMultiplier.enabled) {
        const user = await User.findById(userId);
        const userLevel = user.profile?.level || 1;
        const multiplier = pointsReward.levelMultiplier.baseMultiplier + 
          (userLevel - 1) * pointsReward.levelMultiplier.levelBonus;
        totalPoints = Math.floor(totalPoints * multiplier);
      }

      // 难度倍数
      if (lesson.difficultyMultiplier && lesson.difficultyMultiplier !== 1.0) {
        totalPoints = Math.floor(totalPoints * lesson.difficultyMultiplier);
      }

      // 记录积分
      if (totalPoints > 0) {
        await this.awardPoints(userId, totalPoints, 'lesson_completion', {
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          bonusDetails
        });
      }

      return {
        totalPoints,
        basePoints: pointsReward.basePoints || POINTS_CONFIG.LESSON_COMPLETION,
        bonusDetails,
        breakdown: this.getPointsBreakdown(pointsReward, bonusDetails, totalPoints)
      };
    } catch (error) {
      console.error('计算课时积分错误:', error);
      throw error;
    }
  }

  /**
   * 奖励积分
   * @param {string} userId - 用户ID
   * @param {number} points - 积分数量
   * @param {string} type - 积分类型
   * @param {Object} metadata - 元数据
   */
  static async awardPoints(userId, points, type, metadata = {}) {
    // 创建积分记录
    const pointsRecord = new PointsRecord({
      user: userId,
      points,
      type,
      description: this.getPointsDescription(type, metadata),
      metadata
    });
    
    await pointsRecord.save();

    // 更新用户积分
    await User.findByIdAndUpdate(userId, {
      $inc: { 'profile.points': points }
    });

    // 检查并更新用户等级
    await this.checkAndUpdateUserLevel(userId);
  }

  /**
   * 检查并更新用户等级
   * @param {string} userId - 用户ID
   */
  static async checkAndUpdateUserLevel(userId) {
    const user = await User.findById(userId);
    const currentPoints = user.profile?.points || 0;
    const currentLevel = user.profile?.level || 1;
    
    const newLevel = Math.floor(currentPoints / POINTS_CONFIG.POINTS_PER_LEVEL) + 1;
    
    if (newLevel > currentLevel) {
      await User.findByIdAndUpdate(userId, {
        'profile.level': newLevel
      });
      
      // 记录升级积分奖励
      const levelUpBonus = (newLevel - currentLevel) * POINTS_CONFIG.LEVEL_UP_BONUS;
      if (levelUpBonus > 0) {
        await this.awardPoints(userId, levelUpBonus, 'level_up', {
          oldLevel: currentLevel,
          newLevel
        });
      }
    }
  }

  /**
   * 获取积分说明
   * @param {string} type - 积分类型
   * @param {Object} metadata - 元数据
   * @returns {string} 积分说明
   */
  static getPointsDescription(type, metadata) {
    switch (type) {
      case 'lesson_completion':
        return `完成课时：${metadata.lessonTitle}`;
      case 'level_up':
        return `等级提升：${metadata.oldLevel} → ${metadata.newLevel}`;
      default:
        return '获得积分';
    }
  }

  /**
   * 获取积分明细
   * @param {Object} pointsReward - 积分奖励配置
   * @param {Object} bonusDetails - 奖励详情
   * @param {number} totalPoints - 总积分
   * @returns {Array} 积分明细
   */
  static getPointsBreakdown(pointsReward, bonusDetails, totalPoints) {
    const breakdown = [];
    
    breakdown.push({
      type: 'base',
      description: '基础完成奖励',
      points: pointsReward.basePoints || POINTS_CONFIG.LESSON_COMPLETION
    });

    if (bonusDetails.firstCompletion) {
      breakdown.push({
        type: 'first_completion',
        description: '首次完成奖励',
        points: pointsReward.bonusConditions.firstCompletion.points
      });
    }

    if (bonusDetails.perfectScore) {
      breakdown.push({
        type: 'perfect_score',
        description: '满分奖励',
        points: pointsReward.bonusConditions.perfectScore.points
      });
    }

    if (bonusDetails.speedBonus) {
      breakdown.push({
        type: 'speed_bonus',
        description: '速度奖励',
        points: pointsReward.bonusConditions.speedBonus.points
      });
    }

    if (bonusDetails.oneAttempt) {
      breakdown.push({
        type: 'one_attempt',
        description: '一次通过奖励',
        points: pointsReward.bonusConditions.oneAttempt.points
      });
    }

    return breakdown;
  }

  /**
   * 获取用户可解锁的课时列表
   * @param {string} userId - 用户ID
   * @param {string} courseId - 课程ID
   * @returns {Array} 可解锁的课时列表
   */
  static async getUnlockableLessons(userId, courseId) {
    try {
      const course = await Course.findById(courseId);
      const enrollment = await Enrollment.findOne({ student: userId, course: courseId });
      const user = await User.findById(userId);
      
      if (!course || !enrollment || !user) {
        return [];
      }

      const unlockableLessons = [];
      
      for (const lesson of course.lessons) {
        const isUnlocked = enrollment.progress.unlockedLessons.some(
          ul => ul.lessonId.toString() === lesson._id.toString()
        );
        
        if (!isUnlocked) {
          const unlockResult = await this.checkUnlockConditions(
            user, enrollment, lesson, course
          );
          
          if (unlockResult.canUnlock) {
            unlockableLessons.push({
              lessonId: lesson._id,
              title: lesson.title,
              unlockMethod: unlockResult.unlockMethod
            });
          }
        }
      }
      
      return unlockableLessons;
    } catch (error) {
      console.error('获取可解锁课时错误:', error);
      return [];
    }
  }
}

module.exports = LessonUnlockService;