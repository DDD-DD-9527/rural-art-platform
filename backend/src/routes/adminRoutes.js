const express = require('express');
const router = express.Router();
const { getDashboardStats, getSystemOverview } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// 所有管理员路由都需要先认证，然后检查管理员权限
router.use(authenticate);
router.use(authorize('admin'));

// 获取管理员仪表盘统计数据
router.get('/dashboard/stats', getDashboardStats);

// 获取系统概览统计
router.get('/dashboard/overview', getSystemOverview);

module.exports = router;