const express = require('express');
const { body, query, param } = require('express-validator');
const postController = require('../controllers/postController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 获取帖子列表
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'likeCount', 'commentCount', 'viewCount']).withMessage('排序字段无效'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('排序方向必须是asc或desc'),
  query('type').optional().isIn(['share', 'question', 'showcase', 'tutorial', 'discussion']).withMessage('帖子类型无效'),
  query('tags').optional().custom((value, { req }) => {
    // 支持字符串或数组格式
    if (typeof value === 'string' || Array.isArray(value)) {
      return true;
    }
    throw new Error('标签必须是字符串或数组');
  }),
  query('location').optional().isString().withMessage('位置必须是字符串'),
  query('author').optional().isMongoId().withMessage('作者ID格式无效'),
  query('search').optional().isString().withMessage('搜索关键词必须是字符串')
], postController.getPosts);

// 获取热门帖子
router.get('/hot/list', optionalAuth, [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('数量限制必须在1-50之间'),
  query('days').optional().isInt({ min: 1, max: 30 }).withMessage('天数必须在1-30之间')
], postController.getHotPosts);

// 获取推荐帖子
router.get('/recommended/list', optionalAuth, [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('数量限制必须在1-50之间')
], postController.getRecommendedPosts);

// 获取用户的帖子
router.get('/user/:userId', [
  param('userId').isMongoId().withMessage('用户ID格式无效'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('status').optional().isIn(['published', 'draft', 'hidden']).withMessage('状态无效')
], postController.getUserPosts);

// 获取帖子详情
router.get('/:id', [
  param('id').isMongoId().withMessage('帖子ID格式无效')
], postController.getPostById);

// 创建帖子
router.post('/', authenticate, [
  body('content').notEmpty().withMessage('帖子内容不能为空')
    .isLength({ max: 2000 }).withMessage('帖子内容不能超过2000个字符'),
  body('type').isIn(['share', 'question', 'showcase', 'tutorial', 'discussion']).withMessage('帖子类型无效'),
  body('images').optional().isArray().withMessage('图片必须是数组')
    .custom((images) => {
      if (images.length > 9) {
        throw new Error('图片数量不能超过9张');
      }
      return true;
    }),
  body('images.*').optional().isURL().withMessage('图片URL格式无效'),
  body('tags').optional().isArray().withMessage('标签必须是数组')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('标签数量不能超过10个');
      }
      return true;
    }),
  body('tags.*').optional().isString().isLength({ min: 1, max: 20 }).withMessage('标签长度必须在1-20个字符之间'),
  body('location.province').optional().isString().withMessage('省份必须是字符串'),
  body('location.city').optional().isString().withMessage('城市必须是字符串'),
  body('location.district').optional().isString().withMessage('区县必须是字符串'),
  body('location.address').optional().isString().withMessage('详细地址必须是字符串'),
  body('location.coordinates').optional().isArray().withMessage('坐标必须是数组')
    .custom((coordinates) => {
      if (coordinates.length !== 2) {
        throw new Error('坐标必须包含经度和纬度');
      }
      if (!coordinates.every(coord => typeof coord === 'number')) {
        throw new Error('坐标必须是数字');
      }
      return true;
    }),
  body('relatedCourse').optional().isMongoId().withMessage('相关课程ID格式无效'),
  body('visibility').optional().isIn(['public', 'private']).withMessage('可见性设置无效'),
  body('allowComments').optional().isBoolean().withMessage('评论设置必须是布尔值')
], postController.createPost);

// 更新帖子
router.put('/:id', authenticate, [
  param('id').isMongoId().withMessage('帖子ID格式无效'),
  body('content').optional().notEmpty().withMessage('帖子内容不能为空')
    .isLength({ max: 2000 }).withMessage('帖子内容不能超过2000个字符'),
  body('type').optional().isIn(['share', 'question', 'showcase', 'tutorial', 'discussion']).withMessage('帖子类型无效'),
  body('images').optional().isArray().withMessage('图片必须是数组')
    .custom((images) => {
      if (images.length > 9) {
        throw new Error('图片数量不能超过9张');
      }
      return true;
    }),
  body('images.*').optional().isURL().withMessage('图片URL格式无效'),
  body('tags').optional().isArray().withMessage('标签必须是数组')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('标签数量不能超过10个');
      }
      return true;
    }),
  body('tags.*').optional().isString().isLength({ min: 1, max: 20 }).withMessage('标签长度必须在1-20个字符之间'),
  body('location.province').optional().isString().withMessage('省份必须是字符串'),
  body('location.city').optional().isString().withMessage('城市必须是字符串'),
  body('location.district').optional().isString().withMessage('区县必须是字符串'),
  body('location.address').optional().isString().withMessage('详细地址必须是字符串'),
  body('location.coordinates').optional().isArray().withMessage('坐标必须是数组')
    .custom((coordinates) => {
      if (coordinates.length !== 2) {
        throw new Error('坐标必须包含经度和纬度');
      }
      if (!coordinates.every(coord => typeof coord === 'number')) {
        throw new Error('坐标必须是数字');
      }
      return true;
    }),
  body('relatedCourse').optional().isMongoId().withMessage('相关课程ID格式无效'),
  body('visibility').optional().isIn(['public', 'private']).withMessage('可见性设置无效'),
  body('allowComments').optional().isBoolean().withMessage('评论设置必须是布尔值')
], postController.updatePost);

// 删除帖子
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('帖子ID格式无效')
], postController.deletePost);

// 点赞/取消点赞帖子
router.post('/:id/like', authenticate, [
  param('id').isMongoId().withMessage('帖子ID格式无效')
], postController.toggleLikePost);

// 举报帖子
router.post('/:id/report', authenticate, [
  param('id').isMongoId().withMessage('帖子ID格式无效'),
  body('reason').isIn(['spam', 'inappropriate', 'harassment', 'copyright', 'misinformation', 'other']).withMessage('举报原因无效'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('举报描述不能超过500个字符')
], postController.reportPost);

// 获取关注用户的帖子
router.get('/following', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'likeCount', 'commentCount', 'viewCount']).withMessage('排序字段无效'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('排序方向无效')
], postController.getFollowingPosts);

module.exports = router;