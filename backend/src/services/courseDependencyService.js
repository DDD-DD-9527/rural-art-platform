const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { COURSE_CONFIG } = require('../config/constants');

/**
 * 课程依赖关系管理服务
 * 负责处理课程之间的前置条件、解锁逻辑和学习路径规划
 */
class CourseDependencyService {
  /**
   * 检查课程解锁条件
   * @param {string} userId - 用户ID
   * @param {string} courseId - 课程ID
   * @returns {Object} 检查结果
   */
  static async checkCourseUnlockConditions(userId, courseId) {
    try {
      const course = await Course.findById(courseId);
      const user = await User.findById(userId);
      
      if (!course || !user) {
        throw new Error('课程或用户不存在');
      }

      const requirements = [];
      const prerequisites = course.requirements?.prerequisites || [];

      // 检查前置课程
      for (const prereqTitle of prerequisites) {
        const prereqCourse = await Course.findOne({ title: prereqTitle });
        if (prereqCourse) {
          const enrollment = await Enrollment.findOne({
            student: userId,
            course: prereqCourse._id,
            status: 'completed'
          });
          
          if (!enrollment) {
            requirements.push({
              type: 'prerequisite_course',
              message: `需要先完成课程：${prereqTitle}`,
              courseId: prereqCourse._id,
              courseTitle: prereqTitle
            });
          }
        }
      }

      // 检查用户等级要求（基于课程难度）
      const requiredLevel = this.getRequiredLevelByDifficulty(course.difficulty);
      const userLevel = user.profile?.level || 1;
      
      if (userLevel < requiredLevel) {
        requirements.push({
          type: 'level_requirement',
          message: `需要等级：${requiredLevel}，当前等级：${userLevel}`,
          requiredLevel,
          currentLevel: userLevel
        });
      }

      // 检查积分要求（基于课程难度）
      const requiredPoints = this.getRequiredPointsByDifficulty(course.difficulty);
      const userPoints = user.profile?.points || 0;
      
      if (userPoints < requiredPoints) {
        requirements.push({
          type: 'points_requirement',
          message: `需要积分：${requiredPoints}，当前积分：${userPoints}`,
          requiredPoints,
          currentPoints: userPoints
        });
      }

      return {
        canUnlock: requirements.length === 0,
        requirements,
        course: {
          id: course._id,
          title: course.title,
          difficulty: course.difficulty
        }
      };
    } catch (error) {
      console.error('检查课程解锁条件错误:', error);
      throw error;
    }
  }

  /**
   * 根据难度获取所需等级
   * @param {string} difficulty - 课程难度
   * @returns {number} 所需等级
   */
  static getRequiredLevelByDifficulty(difficulty) {
    const levelMap = {
      'beginner': 1,
      'intermediate': 3,
      'advanced': 5
    };
    return levelMap[difficulty] || 1;
  }

  /**
   * 根据难度获取所需积分
   * @param {string} difficulty - 课程难度
   * @returns {number} 所需积分
   */
  static getRequiredPointsByDifficulty(difficulty) {
    const pointsMap = {
      'beginner': 0,
      'intermediate': 200,
      'advanced': 500
    };
    return pointsMap[difficulty] || 0;
  }

  /**
   * 获取用户的学习路径推荐
   * @param {string} userId - 用户ID
   * @param {string} category - 课程分类（可选）
   * @returns {Array} 推荐的学习路径
   */
  static async getRecommendedLearningPath(userId, category = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 构建查询条件
      const query = {
        'settings.isPublished': true,
        'settings.isArchived': false
      };
      
      if (category) {
        query.category = category;
      }

      // 获取所有可用课程
      const allCourses = await Course.find(query)
        .sort({ difficulty: 1, 'stats.rating.average': -1 })
        .lean();

      // 获取用户已完成的课程
      const completedEnrollments = await Enrollment.find({
        student: userId,
        status: 'completed'
      }).populate('course', 'title');
      
      const completedCourseIds = completedEnrollments.map(e => e.course._id.toString());
      const completedCourseTitles = completedEnrollments.map(e => e.course.title);

      // 获取用户当前进行中的课程
      const inProgressEnrollments = await Enrollment.find({
        student: userId,
        status: { $in: ['enrolled', 'in-progress'] }
      }).populate('course', 'title');
      
      const inProgressCourseIds = inProgressEnrollments.map(e => e.course._id.toString());

      const learningPath = [];
      
      for (const course of allCourses) {
        const courseId = course._id.toString();
        
        // 跳过已完成或正在进行的课程
        if (completedCourseIds.includes(courseId) || inProgressCourseIds.includes(courseId)) {
          continue;
        }

        // 检查解锁条件
        const unlockCheck = await this.checkCourseUnlockConditions(userId, courseId);
        
        const pathItem = {
          course: {
            id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            category: course.category,
            difficulty: course.difficulty,
            estimatedDuration: course.estimatedDuration,
            rating: course.stats?.rating?.average || 0,
            enrolledCount: course.stats?.enrolledCount || 0
          },
          canUnlock: unlockCheck.canUnlock,
          requirements: unlockCheck.requirements,
          recommendationReason: this.getRecommendationReason(
            course, user, completedCourseTitles, unlockCheck.canUnlock
          )
        };
        
        learningPath.push(pathItem);
      }

      // 按推荐优先级排序
      learningPath.sort((a, b) => {
        // 可解锁的课程优先
        if (a.canUnlock && !b.canUnlock) return -1;
        if (!a.canUnlock && b.canUnlock) return 1;
        
        // 按难度排序（简单到困难）
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
        const aDiff = difficultyOrder[a.course.difficulty] || 2;
        const bDiff = difficultyOrder[b.course.difficulty] || 2;
        
        if (aDiff !== bDiff) return aDiff - bDiff;
        
        // 按评分排序（高到低）
        return b.course.rating - a.course.rating;
      });

      return learningPath;
    } catch (error) {
      console.error('获取学习路径推荐错误:', error);
      throw error;
    }
  }

  /**
   * 获取推荐理由
   * @param {Object} course - 课程对象
   * @param {Object} user - 用户对象
   * @param {Array} completedCourseTitles - 已完成课程标题列表
   * @param {boolean} canUnlock - 是否可解锁
   * @returns {string} 推荐理由
   */
  static getRecommendationReason(course, user, completedCourseTitles, canUnlock) {
    const userLevel = user.profile?.level || 1;
    const reasons = [];

    if (!canUnlock) {
      reasons.push('需要满足前置条件');
    } else {
      if (course.difficulty === 'beginner' && userLevel <= 2) {
        reasons.push('适合初学者');
      } else if (course.difficulty === 'intermediate' && userLevel >= 3 && userLevel <= 5) {
        reasons.push('适合您当前水平');
      } else if (course.difficulty === 'advanced' && userLevel >= 5) {
        reasons.push('挑战进阶技能');
      }

      if (course.stats?.rating?.average >= 4.5) {
        reasons.push('高评分课程');
      }

      if (course.stats?.enrolledCount >= 100) {
        reasons.push('热门课程');
      }

      // 检查是否是相关技能的进阶课程
      const prerequisites = course.requirements?.prerequisites || [];
      const hasCompletedPrereq = prerequisites.some(prereq => 
        completedCourseTitles.includes(prereq)
      );
      
      if (hasCompletedPrereq) {
        reasons.push('基于您已完成的课程');
      }
    }

    return reasons.length > 0 ? reasons.join('，') : '推荐学习';
  }

  /**
   * 获取课程学习统计分析
   * @param {string} courseId - 课程ID
   * @returns {Object} 统计分析结果
   */
  static async getCourseAnalytics(courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new Error('课程不存在');
      }

      // 获取所有报名记录
      const enrollments = await Enrollment.find({ course: courseId })
        .populate('student', 'profile.level profile.points');

      const analytics = {
        courseInfo: {
          title: course.title,
          difficulty: course.difficulty,
          totalLessons: course.lessons?.length || 0
        },
        enrollmentStats: {
          total: enrollments.length,
          completed: enrollments.filter(e => e.status === 'completed').length,
          inProgress: enrollments.filter(e => e.status === 'in-progress').length,
          dropped: enrollments.filter(e => e.status === 'dropped').length
        },
        completionRate: 0,
        averageProgress: 0,
        averageTimeSpent: 0,
        levelDistribution: {},
        pointsDistribution: {},
        gamificationStats: {
          totalPointsAwarded: 0,
          averageScore: 0,
          perfectCompletions: 0,
          oneAttemptCompletions: 0
        }
      };

      if (enrollments.length > 0) {
        // 计算完成率
        analytics.completionRate = Math.round(
          (analytics.enrollmentStats.completed / analytics.enrollmentStats.total) * 100
        );

        // 计算平均进度
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress?.percentage || 0), 0);
        analytics.averageProgress = Math.round(totalProgress / enrollments.length);

        // 计算平均学习时长
        const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.progress?.totalTimeSpent || 0), 0);
        analytics.averageTimeSpent = Math.round(totalTimeSpent / enrollments.length);

        // 统计用户等级分布
        enrollments.forEach(enrollment => {
          const level = enrollment.student?.profile?.level || 1;
          analytics.levelDistribution[level] = (analytics.levelDistribution[level] || 0) + 1;
        });

        // 统计积分分布
        enrollments.forEach(enrollment => {
          const points = enrollment.student?.profile?.points || 0;
          const pointsRange = this.getPointsRange(points);
          analytics.pointsDistribution[pointsRange] = (analytics.pointsDistribution[pointsRange] || 0) + 1;
        });

        // 统计关卡式学习数据
        const gamificationData = enrollments
          .map(e => e.progress?.gamificationStats)
          .filter(stats => stats);

        if (gamificationData.length > 0) {
          analytics.gamificationStats.totalPointsAwarded = gamificationData
            .reduce((sum, stats) => sum + (stats.totalPointsEarned || 0), 0);
          
          analytics.gamificationStats.averageScore = Math.round(
            gamificationData.reduce((sum, stats) => sum + (stats.averageScore || 0), 0) / gamificationData.length
          );
          
          analytics.gamificationStats.perfectCompletions = gamificationData
            .reduce((sum, stats) => sum + (stats.perfectCompletions || 0), 0);
          
          analytics.gamificationStats.oneAttemptCompletions = gamificationData
            .reduce((sum, stats) => sum + (stats.oneAttemptCompletions || 0), 0);
        }
      }

      return analytics;
    } catch (error) {
      console.error('获取课程分析数据错误:', error);
      throw error;
    }
  }

  /**
   * 获取积分范围标签
   * @param {number} points - 积分数量
   * @returns {string} 积分范围标签
   */
  static getPointsRange(points) {
    if (points < 100) return '0-99';
    if (points < 300) return '100-299';
    if (points < 500) return '300-499';
    if (points < 1000) return '500-999';
    return '1000+';
  }

  /**
   * 获取用户技能树
   * @param {string} userId - 用户ID
   * @returns {Object} 技能树数据
   */
  static async getUserSkillTree(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 获取用户完成的课程
      const completedEnrollments = await Enrollment.find({
        student: userId,
        status: 'completed'
      }).populate('course', 'title category difficulty lessons');

      // 按分类组织技能树
      const skillTree = {};
      
      for (const enrollment of completedEnrollments) {
        const course = enrollment.course;
        const category = course.category;
        
        if (!skillTree[category]) {
          skillTree[category] = {
            categoryName: this.getCategoryDisplayName(category),
            totalCourses: 0,
            completedCourses: 0,
            totalLessons: 0,
            completedLessons: 0,
            skillLevel: 'beginner',
            courses: []
          };
        }
        
        skillTree[category].completedCourses += 1;
        skillTree[category].totalLessons += course.lessons?.length || 0;
        skillTree[category].completedLessons += enrollment.progress?.completedLessons?.length || 0;
        
        skillTree[category].courses.push({
          id: course._id,
          title: course.title,
          difficulty: course.difficulty,
          completedAt: enrollment.completedAt,
          totalLessons: course.lessons?.length || 0,
          completedLessons: enrollment.progress?.completedLessons?.length || 0,
          averageScore: enrollment.progress?.gamificationStats?.averageScore || 0,
          totalPoints: enrollment.progress?.gamificationStats?.totalPointsEarned || 0
        });
      }

      // 计算每个分类的技能等级
      Object.keys(skillTree).forEach(category => {
        const categoryData = skillTree[category];
        categoryData.skillLevel = this.calculateSkillLevel(
          categoryData.completedCourses,
          categoryData.courses
        );
      });

      return {
        userId,
        userLevel: user.profile?.level || 1,
        totalPoints: user.profile?.points || 0,
        skillTree,
        summary: {
          totalCategories: Object.keys(skillTree).length,
          totalCompletedCourses: Object.values(skillTree)
            .reduce((sum, cat) => sum + cat.completedCourses, 0),
          totalCompletedLessons: Object.values(skillTree)
            .reduce((sum, cat) => sum + cat.completedLessons, 0)
        }
      };
    } catch (error) {
      console.error('获取用户技能树错误:', error);
      throw error;
    }
  }

  /**
   * 获取分类显示名称
   * @param {string} category - 分类代码
   * @returns {string} 显示名称
   */
  static getCategoryDisplayName(category) {
    const categoryMap = {
      'traditional-crafts': '传统工艺',
      'painting': '绘画艺术',
      'sculpture': '雕塑艺术',
      'textile': '纺织艺术',
      'pottery': '陶艺',
      'woodwork': '木工艺',
      'paper-art': '纸艺',
      'folk-art': '民间艺术',
      'calligraphy': '书法',
      'other': '其他'
    };
    return categoryMap[category] || category;
  }

  /**
   * 计算技能等级
   * @param {number} completedCourses - 完成课程数
   * @param {Array} courses - 课程列表
   * @returns {string} 技能等级
   */
  static calculateSkillLevel(completedCourses, courses) {
    if (completedCourses === 0) return 'beginner';
    
    const hasAdvanced = courses.some(c => c.difficulty === 'advanced');
    const hasIntermediate = courses.some(c => c.difficulty === 'intermediate');
    
    if (hasAdvanced && completedCourses >= 3) return 'expert';
    if (hasIntermediate && completedCourses >= 2) return 'intermediate';
    return 'beginner';
  }
}

module.exports = CourseDependencyService;