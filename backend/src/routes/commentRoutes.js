const express = require('express');
const { body, query, param } = require('express-validator');
const commentController = require('../controllers/commentController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// 获取评论列表
router.get('/', [
  query('targetType').notEmpty().withMessage('目标类型不能为空')
    .isIn(['Post', 'Course', 'Comment']).withMessage('目标类型无效'),
  query('targetId').notEmpty().withMessage('目标ID不能为空')
    .isMongoId().withMessage('目标ID格式无效'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'likeCount']).withMessage('排序字段无效'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('排序方向必须是asc或desc'),
  query('parentComment').optional().isMongoId().withMessage('父评论ID格式无效')
], validate, commentController.getComments);

// 获取评论树结构
router.get('/tree', [
  query('targetType').notEmpty().withMessage('目标类型不能为空')
    .isIn(['Post', 'Course', 'Comment']).withMessage('目标类型无效'),
  query('targetId').notEmpty().withMessage('目标ID不能为空')
    .isMongoId().withMessage('目标ID格式无效'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('数量限制必须在1-100之间')
], validate, commentController.getCommentTree);



// 获取我的评论
router.get('/my', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('type').optional().isString().withMessage('类型必须是字符串'),
  query('search').optional().isString().withMessage('搜索关键词必须是字符串'),
  query('sort').optional().isIn(['recent', 'oldest', 'likes']).withMessage('排序方式无效')
], validate, commentController.getMyComments);

// 获取用户的评论
router.get('/user/:userId', [
  param('userId').isMongoId().withMessage('用户ID格式无效'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('status').optional().isIn(['published', 'hidden', 'deleted']).withMessage('状态无效')
], validate, commentController.getUserComments);

// 获取评论详情
router.get('/:id', [
  param('id').isMongoId().withMessage('评论ID格式无效')
], validate, commentController.getCommentById);

// 创建评论
router.post('/', authenticate, [
  body('targetType').notEmpty().withMessage('目标类型不能为空')
    .isIn(['Post', 'Course', 'Comment']).withMessage('目标类型无效'),
  body('targetId').notEmpty().withMessage('目标ID不能为空')
    .isMongoId().withMessage('目标ID格式无效'),
  body('content').notEmpty().withMessage('评论内容不能为空')
    .isLength({ min: 1, max: 500 }).withMessage('评论内容长度必须在1-500个字符之间'),
  body('parentComment').optional().isMongoId().withMessage('父评论ID格式无效'),
  body('mentions').optional().isArray().withMessage('提及用户必须是数组')
    .custom((mentions) => {
      if (mentions.length > 10) {
        throw new Error('提及用户数量不能超过10个');
      }
      return true;
    }),
  body('mentions.*').optional().isMongoId().withMessage('提及用户ID格式无效')
], validate, commentController.createComment);

// 更新评论
router.put('/:id', authenticate, [
  param('id').isMongoId().withMessage('评论ID格式无效'),
  body('content').notEmpty().withMessage('评论内容不能为空')
    .isLength({ min: 1, max: 500 }).withMessage('评论内容长度必须在1-500个字符之间'),
  body('mentions').optional().isArray().withMessage('提及用户必须是数组')
    .custom((mentions) => {
      if (mentions.length > 10) {
        throw new Error('提及用户数量不能超过10个');
      }
      return true;
    }),
  body('mentions.*').optional().isMongoId().withMessage('提及用户ID格式无效')
], validate, commentController.updateComment);

// 删除评论
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('评论ID格式无效')
], validate, commentController.deleteComment);

// 点赞/取消点赞评论
router.post('/:id/like', authenticate, [
  param('id').isMongoId().withMessage('评论ID格式无效')
], validate, commentController.toggleLikeComment);

// 举报评论
router.post('/:id/report', authenticate, [
  param('id').isMongoId().withMessage('评论ID格式无效'),
  body('reason').isIn(['spam', 'inappropriate', 'harassment', 'off-topic', 'other']).withMessage('举报原因无效'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('举报描述不能超过500个字符')
], validate, commentController.reportComment);

module.exports = router;
