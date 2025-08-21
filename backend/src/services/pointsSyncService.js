const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { POINTS_CONFIG } = require('../config/constants');

/**
 * 积分数据同步服务
 * 负责处理积分数据的一致性、同步和修复
 */
class PointsSyncService {
  /**
   * 同步用户积分数据
   * @param {string} userId - 用户ID
   * @returns {Object} 同步结果
   */
  static async syncUserPoints(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 获取用户所有报名记录
      const enrollments = await Enrollment.find({ student: userId })
        .populate('course', 'title');

      let calculatedPoints = 0;
      let calculatedLevel = 1;
      const pointsHistory = [];
      const inconsistencies = [];

      // 计算用户应有的总积分
      for (const enrollment of enrollments) {
        const enrollmentPoints = enrollment.progress?.gamificationStats?.totalPointsEarned || 0;
        calculatedPoints += enrollmentPoints;
        
        if (enrollmentPoints > 0) {
          pointsHistory.push({
            courseId: enrollment.course._id,
            courseTitle: enrollment.course.title,
            points: enrollmentPoints,
            earnedAt: enrollment.progress?.lastStudiedAt || enrollment.enrolledAt
          });
        }
      }

      // 计算用户应有的等级
      calculatedLevel = this.calculateUserLevel(calculatedPoints);

      // 检查数据一致性
      const currentPoints = user.profile?.points || 0;
      const currentLevel = user.profile?.level || 1;

      if (currentPoints !== calculatedPoints) {
        inconsistencies.push({
          type: 'points_mismatch',
          current: currentPoints,
          calculated: calculatedPoints,
          difference: calculatedPoints - currentPoints
        });
      }

      if (currentLevel !== calculatedLevel) {
        inconsistencies.push({
          type: 'level_mismatch',
          current: currentLevel,
          calculated: calculatedLevel,
          difference: calculatedLevel - currentLevel
        });
      }

      // 更新用户积分和等级
      if (inconsistencies.length > 0) {
        await User.findByIdAndUpdate(userId, {
          'profile.points': calculatedPoints,
          'profile.level': calculatedLevel,
          'profile.lastPointsSync': new Date()
        });
      }

      return {
        userId,
        syncResult: {
          pointsBefore: currentPoints,
          pointsAfter: calculatedPoints,
          levelBefore: currentLevel,
          levelAfter: calculatedLevel,
          inconsistencies,
          pointsHistory,
          syncedAt: new Date()
        }
      };
    } catch (error) {
      console.error('同步用户积分数据错误:', error);
      throw error;
    }
  }

  /**
   * 批量同步所有用户积分
   * @param {number} batchSize - 批处理大小
   * @returns {Object} 批量同步结果
   */
  static async syncAllUsersPoints(batchSize = 50) {
    try {
      const totalUsers = await User.countDocuments();
      const batches = Math.ceil(totalUsers / batchSize);
      const results = {
        totalUsers,
        processedUsers: 0,
        syncedUsers: 0,
        errors: [],
        summary: {
          totalPointsAdjusted: 0,
          totalLevelAdjusted: 0,
          inconsistenciesFound: 0
        }
      };

      for (let batch = 0; batch < batches; batch++) {
        const skip = batch * batchSize;
        const users = await User.find({}, '_id')
          .skip(skip)
          .limit(batchSize)
          .lean();

        for (const user of users) {
          try {
            const syncResult = await this.syncUserPoints(user._id);
            results.processedUsers++;
            
            if (syncResult.syncResult.inconsistencies.length > 0) {
              results.syncedUsers++;
              results.summary.inconsistenciesFound += syncResult.syncResult.inconsistencies.length;
              
              // 统计调整的积分和等级
              const pointsInconsistency = syncResult.syncResult.inconsistencies
                .find(inc => inc.type === 'points_mismatch');
              const levelInconsistency = syncResult.syncResult.inconsistencies
                .find(inc => inc.type === 'level_mismatch');
              
              if (pointsInconsistency) {
                results.summary.totalPointsAdjusted += Math.abs(pointsInconsistency.difference);
              }
              
              if (levelInconsistency) {
                results.summary.totalLevelAdjusted += Math.abs(levelInconsistency.difference);
              }
            }
          } catch (error) {
            results.errors.push({
              userId: user._id,
              error: error.message
            });
          }
        }

        // 添加延迟以避免数据库压力
        if (batch < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return results;
    } catch (error) {
      console.error('批量同步用户积分错误:', error);
      throw error;
    }
  }

  /**
   * 验证课程积分配置
   * @param {string} courseId - 课程ID（可选）
   * @returns {Object} 验证结果
   */
  static async validateCoursePointsConfig(courseId = null) {
    try {
      const query = courseId ? { _id: courseId } : {};
      const courses = await Course.find(query);
      const validationResults = [];

      for (const course of courses) {
        const courseValidation = {
          courseId: course._id,
          courseTitle: course.title,
          issues: [],
          suggestions: []
        };

        // 检查课程是否有课时
        if (!course.lessons || course.lessons.length === 0) {
          courseValidation.issues.push('课程没有课时内容');
        } else {
          // 检查每个课时的积分配置
          course.lessons.forEach((lesson, index) => {
            const lessonPoints = lesson.pointsReward || 0;
            const lessonDifficulty = lesson.difficultyMultiplier || 1;
            
            if (lessonPoints === 0) {
              courseValidation.issues.push(`课时 ${index + 1} "${lesson.title}" 没有设置积分奖励`);
            }
            
            if (lessonDifficulty < 0.5 || lessonDifficulty > 3) {
              courseValidation.issues.push(`课时 ${index + 1} "${lesson.title}" 难度系数异常: ${lessonDifficulty}`);
            }
            
            // 根据课程难度建议积分范围
            const suggestedPoints = this.getSuggestedPointsByDifficulty(course.difficulty, lessonDifficulty);
            if (lessonPoints < suggestedPoints.min || lessonPoints > suggestedPoints.max) {
              courseValidation.suggestions.push(
                `课时 ${index + 1} "${lesson.title}" 建议积分范围: ${suggestedPoints.min}-${suggestedPoints.max}，当前: ${lessonPoints}`
              );
            }
          });
        }

        // 检查课程完成奖励
        const completionBonus = course.settings?.completionBonus || 0;
        const suggestedBonus = this.getSuggestedCompletionBonus(course.difficulty, course.lessons?.length || 0);
        
        if (completionBonus === 0) {
          courseValidation.issues.push('课程没有设置完成奖励积分');
        } else if (completionBonus < suggestedBonus.min || completionBonus > suggestedBonus.max) {
          courseValidation.suggestions.push(
            `建议完成奖励积分范围: ${suggestedBonus.min}-${suggestedBonus.max}，当前: ${completionBonus}`
          );
        }

        validationResults.push(courseValidation);
      }

      return {
        totalCourses: courses.length,
        coursesWithIssues: validationResults.filter(r => r.issues.length > 0).length,
        coursesWithSuggestions: validationResults.filter(r => r.suggestions.length > 0).length,
        validationResults
      };
    } catch (error) {
      console.error('验证课程积分配置错误:', error);
      throw error;
    }
  }

  /**
   * 修复课程积分配置
   * @param {string} courseId - 课程ID
   * @param {Object} options - 修复选项
   * @returns {Object} 修复结果
   */
  static async fixCoursePointsConfig(courseId, options = {}) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('课程不存在');
      }

      const {
        autoFixLessonPoints = true,
        autoFixCompletionBonus = true,
        autoFixDifficultyMultiplier = true
      } = options;

      const changes = [];
      let modified = false;

      // 修复课时积分
      if (autoFixLessonPoints && course.lessons) {
        course.lessons.forEach((lesson, index) => {
          const currentPoints = lesson.pointsReward || 0;
          const currentDifficulty = lesson.difficultyMultiplier || 1;
          
          if (currentPoints === 0) {
            const suggestedPoints = this.getSuggestedPointsByDifficulty(course.difficulty, currentDifficulty);
            lesson.pointsReward = suggestedPoints.default;
            changes.push(`课时 ${index + 1} 积分奖励: 0 → ${suggestedPoints.default}`);
            modified = true;
          }
          
          if (autoFixDifficultyMultiplier && (currentDifficulty < 0.5 || currentDifficulty > 3)) {
            lesson.difficultyMultiplier = 1;
            changes.push(`课时 ${index + 1} 难度系数: ${currentDifficulty} → 1`);
            modified = true;
          }
        });
      }

      // 修复完成奖励
      if (autoFixCompletionBonus) {
        const currentBonus = course.settings?.completionBonus || 0;
        if (currentBonus === 0) {
          const suggestedBonus = this.getSuggestedCompletionBonus(course.difficulty, course.lessons?.length || 0);
          if (!course.settings) course.settings = {};
          course.settings.completionBonus = suggestedBonus.default;
          changes.push(`完成奖励积分: 0 → ${suggestedBonus.default}`);
          modified = true;
        }
      }

      // 保存修改
      if (modified) {
        await course.save();
      }

      return {
        courseId,
        courseTitle: course.title,
        modified,
        changes,
        fixedAt: new Date()
      };
    } catch (error) {
      console.error('修复课程积分配置错误:', error);
      throw error;
    }
  }

  /**
   * 根据用户积分计算等级
   * @param {number} points - 积分数量
   * @returns {number} 用户等级
   */
  static calculateUserLevel(points) {
    const levelThresholds = POINTS_CONFIG.LEVEL_THRESHOLDS;
    
    for (let level = levelThresholds.length; level >= 1; level--) {
      if (points >= levelThresholds[level - 1]) {
        return level;
      }
    }
    
    return 1;
  }

  /**
   * 根据难度获取建议积分范围
   * @param {string} courseDifficulty - 课程难度
   * @param {number} lessonDifficulty - 课时难度系数
   * @returns {Object} 建议积分范围
   */
  static getSuggestedPointsByDifficulty(courseDifficulty, lessonDifficulty = 1) {
    const basePoints = {
      'beginner': { min: 5, max: 15, default: 10 },
      'intermediate': { min: 10, max: 25, default: 15 },
      'advanced': { min: 15, max: 35, default: 20 }
    };
    
    const base = basePoints[courseDifficulty] || basePoints['intermediate'];
    
    return {
      min: Math.round(base.min * lessonDifficulty),
      max: Math.round(base.max * lessonDifficulty),
      default: Math.round(base.default * lessonDifficulty)
    };
  }

  /**
   * 获取建议的完成奖励积分
   * @param {string} difficulty - 课程难度
   * @param {number} lessonCount - 课时数量
   * @returns {Object} 建议完成奖励范围
   */
  static getSuggestedCompletionBonus(difficulty, lessonCount) {
    const baseBonus = {
      'beginner': { multiplier: 0.5, min: 20, max: 50 },
      'intermediate': { multiplier: 0.8, min: 30, max: 80 },
      'advanced': { multiplier: 1.2, min: 50, max: 120 }
    };
    
    const base = baseBonus[difficulty] || baseBonus['intermediate'];
    const calculatedBonus = Math.round(lessonCount * base.multiplier * 10);
    
    return {
      min: base.min,
      max: base.max,
      default: Math.max(base.min, Math.min(base.max, calculatedBonus))
    };
  }

  /**
   * 生成积分数据报告
   * @returns {Object} 积分数据报告
   */
  static async generatePointsReport() {
    try {
      // 用户积分统计
      const userStats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalPoints: { $sum: '$profile.points' },
            averagePoints: { $avg: '$profile.points' },
            maxPoints: { $max: '$profile.points' },
            minPoints: { $min: '$profile.points' }
          }
        }
      ]);

      // 等级分布
      const levelDistribution = await User.aggregate([
        {
          $group: {
            _id: '$profile.level',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // 课程积分统计
      const courseStats = await Course.aggregate([
        {
          $project: {
            title: 1,
            difficulty: 1,
            lessonCount: { $size: { $ifNull: ['$lessons', []] } },
            totalLessonPoints: {
              $sum: {
                $map: {
                  input: { $ifNull: ['$lessons', []] },
                  as: 'lesson',
                  in: { $ifNull: ['$$lesson.pointsReward', 0] }
                }
              }
            },
            completionBonus: { $ifNull: ['$settings.completionBonus', 0] }
          }
        },
        {
          $group: {
            _id: '$difficulty',
            courseCount: { $sum: 1 },
            averageLessonPoints: { $avg: '$totalLessonPoints' },
            averageCompletionBonus: { $avg: '$completionBonus' },
            totalPossiblePoints: { $sum: { $add: ['$totalLessonPoints', '$completionBonus'] } }
          }
        }
      ]);

      // 学习进度积分统计
      const enrollmentStats = await Enrollment.aggregate([
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            completedEnrollments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            totalPointsEarned: { $sum: '$progress.gamificationStats.totalPointsEarned' },
            averagePointsPerEnrollment: { $avg: '$progress.gamificationStats.totalPointsEarned' }
          }
        }
      ]);

      return {
        generatedAt: new Date(),
        userStatistics: userStats[0] || {},
        levelDistribution: levelDistribution.reduce((acc, item) => {
          acc[`level_${item._id || 1}`] = item.count;
          return acc;
        }, {}),
        courseStatistics: courseStats,
        enrollmentStatistics: enrollmentStats[0] || {},
        systemHealth: {
          averagePointsPerUser: userStats[0]?.averagePoints || 0,
          completionRate: enrollmentStats[0] ? 
            Math.round((enrollmentStats[0].completedEnrollments / enrollmentStats[0].totalEnrollments) * 100) : 0,
          pointsUtilizationRate: userStats[0] && courseStats.length > 0 ? 
            Math.round((userStats[0].totalPoints / courseStats.reduce((sum, stat) => sum + stat.totalPossiblePoints, 0)) * 100) : 0
        }
      };
    } catch (error) {
      console.error('生成积分数据报告错误:', error);
      throw error;
    }
  }
}

module.exports = PointsSyncService;