const mongoose = require('mongoose');
const PointsRecord = require('../models/PointsRecord');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * 积分系统服务类
 * 负责积分计算、奖励发放和积分管理
 */
class PointsService {
  /**
   * 计算课时完成积分
   * @param {Object} lesson - 课时对象
   * @param {Number} userLevel - 用户等级
   * @param {Object} completionInfo - 完成信息
   * @returns {Number} 计算得出的积分
   */
  static async calculateLessonPoints(lesson, userLevel, completionInfo = {}) {
    const {
      score = 0,
      timeSpent = 0,
      attempts = 1,
      isFirstAttempt = false,
      isPerfectScore = false
    } = completionInfo;

    try {
      // 获取积分配置
      const pointsConfig = lesson.pointsReward || {};
      const basePoints = pointsConfig.basePoints || 10;
      const bonusConditions = pointsConfig.bonusConditions || {};
      const levelMultiplier = pointsConfig.levelMultiplier || {};
      
      let totalPoints = basePoints;
      let bonusPoints = 0;
      
      // 计算奖励积分
      if (bonusConditions.perfectScore && bonusConditions.perfectScore.enabled && isPerfectScore) {
        bonusPoints += bonusConditions.perfectScore.points || 0;
      }
      
      if (bonusConditions.oneAttempt && bonusConditions.oneAttempt.enabled && isFirstAttempt) {
        bonusPoints += bonusConditions.oneAttempt.points || 0;
      }
      
      if (bonusConditions.speedBonus && bonusConditions.speedBonus.enabled) {
        const timeLimit = bonusConditions.speedBonus.timeLimit || 3600;
        if (timeSpent > 0 && timeSpent <= timeLimit) {
          bonusPoints += bonusConditions.speedBonus.points || 0;
        }
      }
      
      // 应用难度系数
      const difficultyMultiplier = lesson.difficultyMultiplier || 1.0;
      totalPoints = Math.round((totalPoints + bonusPoints) * difficultyMultiplier);
      
      // 应用等级系数
      if (levelMultiplier.enabled) {
        const levelBonus = levelMultiplier.levelBonus || 0.1;
        const multiplier = levelMultiplier.baseMultiplier + (userLevel - 1) * levelBonus;
        totalPoints = Math.round(totalPoints * multiplier);
      }
      
      return Math.max(totalPoints, 1); // 至少获得1积分
    } catch (error) {
      console.error('计算课时积分失败:', error);
      return 10; // 返回默认积分
    }
  }

  /**
   * 完成课时并奖励积分
   * @param {Object} params - 参数对象
   * @param {String} params.userId - 用户ID
   * @param {String} params.courseId - 课程ID
   * @param {String} params.lessonId - 课时ID
   * @param {Object} params.completionInfo - 完成信息
   * @returns {Object} 积分奖励结果
   */
  static async completeLessonAndAwardPoints(params) {
    const { userId, courseId, lessonId, completionInfo = {} } = params;

    try {
      // 获取用户信息
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 获取课程信息
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('课程不存在');
      }

      // 查找对应的课时
      const lesson = course.lessons.id(lessonId);
      if (!lesson) {
        throw new Error('课时不存在');
      }

      // 计算用户等级
      const userLevel = user.learningStats?.level || 1;
      
      // 计算积分
      const points = await this.calculateLessonPoints(lesson, userLevel, completionInfo);
      
      // 奖励积分
      const awardResult = await this.awardPoints({
        userId,
        points,
        type: 'lesson_completion',
        source: {
          courseId,
          lessonId,
          lessonTitle: lesson.title
        },
        description: `完成课时: ${lesson.title}`
      });
      
      return {
        success: true,
        points,
        record: awardResult,
        lesson: {
          id: lessonId,
          title: lesson.title
        }
      };
    } catch (error) {
      console.error('完成课时并奖励积分失败:', error);
      throw error;
    }
  }



  /**
   * 发放积分奖励
   * @param {Object} params - 参数对象
   * @param {String} params.userId - 用户ID
   * @param {String} params.type - 积分类型
   * @param {String} params.source - 积分来源
   * @param {Number} params.points - 积分数量
   * @param {String} params.description - 积分描述
   * @param {Object} params.metadata - 元数据
   * @param {String} params.resourceId - 关联资源ID
   * @param {String} params.resourceType - 关联资源类型
   * @returns {Object} 发放结果
   */
  static async awardPoints(params) {
    try {
      console.log('🎯 开始发放积分:', params);
      console.log('🎯 DEBUG: awardPoints方法被调用，参数:', JSON.stringify(params, null, 2));
      
      const {
        userId,
        type,
        source,
        points,
        description,
        metadata = {},
        resourceId,
        resourceType,
        expiresAt
      } = params;

      // 验证参数
      if (!userId || !type || !source || !points || !description) {
        throw new Error('缺少必要参数');
      }

      if (points === 0) {
        throw new Error('积分数量不能为0');
      }

      // 检查用户是否存在
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }
      console.log('👤 用户验证成功:', user.username || user._id);

      // 创建积分记录
      console.log('🔍 创建积分记录:', { userId, type, source, points, description });
      const pointsRecord = new PointsRecord({
        user: userId,
        type,
        source,
        points,
        description,
        resourceId,
        resourceType,
        metadata,
        expiresAt,
        status: 'active'
      });

      const savedRecord = await pointsRecord.save();
      console.log('✅ 积分记录保存成功:', savedRecord._id);

      // 更新用户总积分
      const currentPoints = user.learningStats?.totalPoints || 0;
      const newTotalPoints = currentPoints + points;
      
      await User.findByIdAndUpdate(
        userId,
        {
          'learningStats.totalPoints': newTotalPoints,
          'learningStats.lastPointsUpdate': new Date()
        },
        { new: true }
      );

      // 检查是否需要升级
      const levelInfo = this.calculateLevel(newTotalPoints);
      const currentLevel = user.learningStats?.level || 1;
      
      if (levelInfo.level > currentLevel) {
        await User.findByIdAndUpdate(
          userId,
          { 'learningStats.level': levelInfo.level }
        );
        
        // 可以在这里触发升级奖励
        // await this.awardLevelUpBonus(userId, levelInfo.level);
      }

      console.log('✅ 积分发放完成:', {
        recordId: savedRecord._id,
        newTotalPoints,
        levelInfo: levelInfo.level
      });

      return {
        success: true,
        pointsRecord: pointsRecord.toJSON(),
        newTotalPoints,
        levelInfo: {
          currentLevel: levelInfo.level,
          leveledUp: levelInfo.level > currentLevel,
          nextLevelPoints: levelInfo.nextLevelPoints,
          progress: levelInfo.progress
        }
      };
    } catch (error) {
      console.error('❌ 发放积分失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 批量发放积分
   * @param {Array} awards - 积分奖励数组
   * @returns {Object} 批量发放结果
   */
  static async batchAwardPoints(awards) {
    try {
      
      const results = [];
      const userPointsMap = new Map();
      
      // 创建所有积分记录
      for (const award of awards) {
        const pointsRecord = new PointsRecord({
          user: award.userId,
          type: award.type,
          source: award.source,
          points: award.points,
          description: award.description,
          resourceId: award.resourceId,
          resourceType: award.resourceType,
          metadata: award.metadata || {},
          expiresAt: award.expiresAt,
          status: 'active'
        });
        
        await pointsRecord.save();
        results.push(pointsRecord.toJSON());
        
        // 累计用户积分
        const currentPoints = userPointsMap.get(award.userId) || 0;
        userPointsMap.set(award.userId, currentPoints + award.points);
      }
      
      // 批量更新用户积分
      const userUpdates = [];
      for (const [userId, pointsToAdd] of userPointsMap) {
        const user = await User.findById(userId);
        if (user) {
          const newTotalPoints = (user.learningStats?.totalPoints || 0) + pointsToAdd;
          userUpdates.push({
            updateOne: {
              filter: { _id: userId },
              update: {
                'learningStats.totalPoints': newTotalPoints,
                'learningStats.lastPointsUpdate': new Date()
              }
            }
          });
        }
      }
      
      if (userUpdates.length > 0) {
        await User.bulkWrite(userUpdates);
      }
      
      return {
        success: true,
        recordsCreated: results.length,
        usersUpdated: userPointsMap.size,
        results
      };
    } catch (error) {
      console.error('批量发放积分失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 计算用户等级
   * @param {Number} totalPoints - 总积分
   * @returns {Object} 等级信息
   */
  static calculateLevel(totalPoints) {
    // 等级计算公式：每级所需积分 = 100 * level^1.5
    let level = 1;
    let pointsForCurrentLevel = 0;
    let pointsForNextLevel = 100;
    
    while (totalPoints >= pointsForNextLevel) {
      level++;
      pointsForCurrentLevel = pointsForNextLevel;
      pointsForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
    }
    
    const pointsInCurrentLevel = totalPoints - pointsForCurrentLevel;
    const pointsNeededForNextLevel = pointsForNextLevel - pointsForCurrentLevel;
    const progress = Math.floor((pointsInCurrentLevel / pointsNeededForNextLevel) * 100);
    
    return {
      level,
      totalPoints,
      pointsForCurrentLevel,
      pointsForNextLevel,
      pointsInCurrentLevel,
      pointsNeededForNextLevel,
      progress: Math.min(progress, 100)
    };
  }

  /**
   * 获取用户积分统计
   * @param {String} userId - 用户ID
   * @param {String} period - 统计周期
   * @returns {Object} 积分统计
   */
  static async getUserPointsStats(userId, period = '30d') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 获取总积分和等级信息
      const totalPoints = user.learningStats?.totalPoints || 0;
      const levelInfo = this.calculateLevel(totalPoints);

      // 获取积分统计
      const statsResult = await PointsRecord.getPointsStats(userId, period);
      
      // 获取积分历史
      const history = await PointsRecord.getUserPointsHistory(userId, {
        limit: 10,
        status: 'active'
      });

      // 处理统计数据
      const stats = {
        periodStats: statsResult || [],
        totalRecords: statsResult ? statsResult.length : 0
      };

      return {
        success: true,
        data: {
          totalPoints,
          level: levelInfo.level,
          levelProgress: levelInfo.progress,
          nextLevelPoints: levelInfo.pointsForNextLevel,
          pointsForCurrentLevel: levelInfo.pointsForCurrentLevel,
          stats,
          recentHistory: history
        }
      };
    } catch (error) {
      console.error('获取用户积分统计失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 撤销积分记录
   * @param {String} recordId - 积分记录ID
   * @param {String} reason - 撤销原因
   * @returns {Object} 撤销结果
   */
  static async revokePoints(recordId, reason) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const pointsRecord = await PointsRecord.findById(recordId).session(session);
      if (!pointsRecord) {
        throw new Error('积分记录不存在');
      }
      
      if (pointsRecord.status !== 'active') {
        throw new Error('积分记录已被撤销或过期');
      }
      
      // 撤销积分记录
      await pointsRecord.revoke(reason);
      
      // 更新用户总积分
      const user = await User.findById(pointsRecord.user).session(session);
      if (user) {
        const newTotalPoints = (user.learningStats?.totalPoints || 0) - pointsRecord.points;
        await User.findByIdAndUpdate(
          pointsRecord.user,
          {
            'learningStats.totalPoints': Math.max(0, newTotalPoints),
            'learningStats.lastPointsUpdate': new Date()
          },
          { session }
        );
      }
      
      await session.commitTransaction();
      
      return {
        success: true,
        message: '积分记录已撤销'
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('撤销积分记录失败:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * 清理过期积分
   * @returns {Object} 清理结果
   */
  static async cleanupExpiredPoints() {
    try {
      const result = await PointsRecord.cleanupExpiredPoints();
      
      // 重新计算所有受影响用户的总积分
      const expiredRecords = await PointsRecord.find({
        status: 'expired',
        updatedAt: { $gte: new Date(Date.now() - 60000) } // 最近1分钟更新的
      }).distinct('user');
      
      for (const userId of expiredRecords) {
        const totalResult = await PointsRecord.calculateUserTotalPoints(userId);
        const totalPoints = totalResult.length > 0 ? totalResult[0].totalPoints : 0;
        
        await User.findByIdAndUpdate(userId, {
          'learningStats.totalPoints': totalPoints
        });
      }
      
      return {
        success: true,
        expiredCount: result.modifiedCount,
        usersUpdated: expiredRecords.length
      };
    } catch (error) {
      console.error('清理过期积分失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PointsService;