const express = require('express');
const router = express.Router();
const {
  syncUserPoints,
  syncAllUsersPoints,
  validateCoursePoints,
  validateAllCoursePoints,
  fixCoursePoints,
  generatePointsReport,
  getUserPointsHistory,
  getPointsSystemStatus
} = require('../controllers/pointsController');
const { authenticate } = require('../middleware/auth');

// 用户积分相关路由

// 同步当前用户积分数据
router.post('/sync', authenticate, syncUserPoints);

// 获取用户积分历史
router.get('/history', authenticate, getUserPointsHistory);

// 管理员积分管理路由

// 批量同步所有用户积分（管理员）
router.post('/sync-all', authenticate, syncAllUsersPoints);

// 验证指定课程积分配置（管理员）
router.get('/validate/course/:courseId', authenticate, validateCoursePoints);

// 验证所有课程积分配置（管理员）
router.get('/validate/courses', authenticate, validateAllCoursePoints);

// 修复指定课程积分配置（管理员）
router.post('/fix/course/:courseId', authenticate, fixCoursePoints);

// 生成积分数据报告（管理员）
router.get('/report', authenticate, generatePointsReport);

// 获取积分系统状态（管理员）
router.get('/system-status', authenticate, getPointsSystemStatus);

module.exports = router;