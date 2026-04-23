const express = require('express');
const router = express.Router();
const { getDashboardStats, getSystemOverview } = require('../controllers/adminController');
const { listUsers, getUserById, updateUserStatus, updateUserRole } = require('../controllers/adminUserController');
const { listPosts, updatePostStatus, setPostPinned, deletePost } = require('../controllers/adminPostController');
const { authenticate, authorize } = require('../middleware/auth');
const { query, param, body } = require('express-validator');
const validate = require('../middleware/validate');

// 所有管理员路由都需要先认证，然后检查管理员权限
router.use(authenticate);
router.use(authorize('admin'));

// 获取管理员仪表盘统计数据
router.get('/dashboard/stats', getDashboardStats);

// 获取系统概览统计
router.get('/dashboard/overview', getSystemOverview);

router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim(),
    query('role').optional().isIn(['user', 'creator', 'admin', '']).withMessage('角色无效'),
    query('status').optional().isIn(['active', 'inactive', 'banned', '']).withMessage('状态无效'),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'userId', 'username', 'role', 'status']).withMessage('排序字段无效'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('排序方向无效')
  ],
  validate,
  listUsers
);

router.get(
  '/users/:id',
  [param('id').isMongoId().withMessage('用户ID无效')],
  validate,
  getUserById
);

router.patch(
  '/users/:id/status',
  [
    param('id').isMongoId().withMessage('用户ID无效'),
    body('status').isIn(['active', 'inactive', 'banned']).withMessage('状态无效')
  ],
  validate,
  updateUserStatus
);

router.patch(
  '/users/:id/role',
  [
    param('id').isMongoId().withMessage('用户ID无效'),
    body('role').isIn(['user', 'creator', 'admin']).withMessage('角色无效')
  ],
  validate,
  updateUserRole
);

router.get(
  '/posts',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().trim(),
    query('status').optional().isIn(['draft', 'published', 'hidden', 'deleted', '']).withMessage('状态无效'),
    query('visibility').optional().isIn(['public', 'followers', 'private', '']).withMessage('可见性无效'),
    query('type').optional().isIn(['share', 'question', 'showcase', 'tutorial', 'discussion', '']).withMessage('类型无效'),
    query('authorId').optional().isMongoId().withMessage('作者ID无效'),
    query('reportedOnly').optional().isIn(['true', 'false']).withMessage('reportedOnly无效'),
    query('pinned').optional().isIn(['true', 'false', '']).withMessage('pinned无效'),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'publishedAt', 'isPinned']).withMessage('排序字段无效'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('排序方向无效')
  ],
  validate,
  listPosts
);

router.patch(
  '/posts/:id/status',
  [
    param('id').isMongoId().withMessage('帖子ID无效'),
    body('status').isIn(['draft', 'published', 'hidden', 'deleted']).withMessage('状态无效')
  ],
  validate,
  updatePostStatus
);

router.patch(
  '/posts/:id/pin',
  [param('id').isMongoId().withMessage('帖子ID无效'), body('isPinned').isBoolean().withMessage('isPinned无效')],
  validate,
  setPostPinned
);

router.delete(
  '/posts/:id',
  [param('id').isMongoId().withMessage('帖子ID无效')],
  validate,
  deletePost
);

module.exports = router;
