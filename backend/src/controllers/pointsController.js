const PointsSyncService = require('../services/pointsSyncService');
const { validationResult } = require('express-validator');

/**
 * 同步用户积分数据
 */
const syncUserPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const syncResult = await PointsSyncService.syncUserPoints(userId);
    
    res.json({
      success: true,
      message: '积分数据同步完成',
      data: syncResult
    });
  } catch (error) {
    console.error('同步用户积分数据错误:', error);
    res.status(500).json({
      success: false,
      message: '同步积分数据失败',
      error: error.message
    });
  }
};

/**
 * 批量同步所有用户积分（管理员功能）
 */
const syncAllUsersPoints = async (req, res) => {
  try {
    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }

    const { batchSize = 50 } = req.query;
    
    const syncResult = await PointsSyncService.syncAllUsersPoints(parseInt(batchSize));
    
    res.json({
      success: true,
      message: '批量积分同步完成',
      data: syncResult
    });
  } catch (error) {
    console.error('批量同步用户积分错误:', error);
    res.status(500).json({
      success: false,
      message: '批量同步积分失败',
      error: error.message
    });
  }
};

/**
 * 验证课程积分配置
 */
const validateCoursePoints = async (req, res) => {
  try {
    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }

    const { courseId } = req.params;
    
    const validationResult = await PointsSyncService.validateCoursePointsConfig(courseId);
    
    res.json({
      success: true,
      message: '课程积分配置验证完成',
      data: validationResult
    });
  } catch (error) {
    console.error('验证课程积分配置错误:', error);
    res.status(500).json({
      success: false,
      message: '验证课程积分配置失败',
      error: error.message
    });
  }
};

/**
 * 验证所有课程积分配置
 */
const validateAllCoursePoints = async (req, res) => {
  try {
    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }
    
    const validationResult = await PointsSyncService.validateCoursePointsConfig();
    
    res.json({
      success: true,
      message: '所有课程积分配置验证完成',
      data: validationResult
    });
  } catch (error) {
    console.error('验证所有课程积分配置错误:', error);
    res.status(500).json({
      success: false,
      message: '验证课程积分配置失败',
      error: error.message
    });
  }
};

/**
 * 修复课程积分配置
 */
const fixCoursePoints = async (req, res) => {
  try {
    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }

    const { courseId } = req.params;
    const {
      autoFixLessonPoints = true,
      autoFixCompletionBonus = true,
      autoFixDifficultyMultiplier = true
    } = req.body;
    
    const fixResult = await PointsSyncService.fixCoursePointsConfig(courseId, {
      autoFixLessonPoints,
      autoFixCompletionBonus,
      autoFixDifficultyMultiplier
    });
    
    res.json({
      success: true,
      message: fixResult.modified ? '课程积分配置修复完成' : '课程积分配置无需修复',
      data: fixResult
    });
  } catch (error) {
    console.error('修复课程积分配置错误:', error);
    res.status(500).json({
      success: false,
      message: '修复课程积分配置失败',
      error: error.message
    });
  }
};

/**
 * 生成积分数据报告
 */
const generatePointsReport = async (req, res) => {
  try {
    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }
    
    const report = await PointsSyncService.generatePointsReport();
    
    res.json({
      success: true,
      message: '积分数据报告生成完成',
      data: report
    });
  } catch (error) {
    console.error('生成积分数据报告错误:', error);
    res.status(500).json({
      success: false,
      message: '生成积分数据报告失败',
      error: error.message
    });
  }
};

/**
 * 获取用户积分历史
 */
const getUserPointsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 获取用户积分同步结果（包含积分历史）
    const syncResult = await PointsSyncService.syncUserPoints(userId);
    
    const pointsHistory = {
      userId,
      currentPoints: syncResult.syncResult.pointsAfter,
      currentLevel: syncResult.syncResult.levelAfter,
      pointsHistory: syncResult.syncResult.pointsHistory,
      lastSyncAt: syncResult.syncResult.syncedAt,
      inconsistencies: syncResult.syncResult.inconsistencies
    };
    
    res.json({
      success: true,
      message: '获取积分历史成功',
      data: pointsHistory
    });
  } catch (error) {
    console.error('获取用户积分历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取积分历史失败',
      error: error.message
    });
  }
};

/**
 * 获取积分系统状态
 */
const getPointsSystemStatus = async (req, res) => {
  try {
    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }
    
    // 生成系统报告
    const report = await PointsSyncService.generatePointsReport();
    
    // 验证课程配置
    const validation = await PointsSyncService.validateCoursePointsConfig();
    
    const systemStatus = {
      reportGeneratedAt: report.generatedAt,
      userStatistics: report.userStatistics,
      systemHealth: report.systemHealth,
      courseValidation: {
        totalCourses: validation.totalCourses,
        coursesWithIssues: validation.coursesWithIssues,
        coursesWithSuggestions: validation.coursesWithSuggestions,
        healthScore: validation.totalCourses > 0 ? 
          Math.round(((validation.totalCourses - validation.coursesWithIssues) / validation.totalCourses) * 100) : 100
      },
      recommendations: []
    };
    
    // 生成系统建议
    if (validation.coursesWithIssues > 0) {
      systemStatus.recommendations.push({
        type: 'course_config_issues',
        message: `发现 ${validation.coursesWithIssues} 个课程存在积分配置问题，建议进行修复`,
        priority: 'high'
      });
    }
    
    if (report.systemHealth.completionRate < 50) {
      systemStatus.recommendations.push({
        type: 'low_completion_rate',
        message: `课程完成率较低 (${report.systemHealth.completionRate}%)，建议检查课程难度和积分激励`,
        priority: 'medium'
      });
    }
    
    if (report.systemHealth.pointsUtilizationRate < 30) {
      systemStatus.recommendations.push({
        type: 'low_points_utilization',
        message: `积分利用率较低 (${report.systemHealth.pointsUtilizationRate}%)，建议增加积分奖励或降低获取难度`,
        priority: 'medium'
      });
    }
    
    res.json({
      success: true,
      message: '获取积分系统状态成功',
      data: systemStatus
    });
  } catch (error) {
    console.error('获取积分系统状态错误:', error);
    res.status(500).json({
      success: false,
      message: '获取积分系统状态失败',
      error: error.message
    });
  }
};

module.exports = {
  syncUserPoints,
  syncAllUsersPoints,
  validateCoursePoints,
  validateAllCoursePoints,
  fixCoursePoints,
  generatePointsReport,
  getUserPointsHistory,
  getPointsSystemStatus
};