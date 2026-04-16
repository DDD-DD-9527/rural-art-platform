const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const socialController = require('../controllers/socialController');
const { authenticate: auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// 验证规则
const followValidation = [
  param('userId')
    .isMongoId()
    .withMessage('用户ID格式不正确')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('每页数量必须是1-50之间的整数'),
  query('search')
    .optional()
    .isLength({ max: 50 })
    .withMessage('搜索关键词长度不能超过50个字符')
];

// 关注相关路由
router.delete('/follow/:userId', auth, followValidation, validate, socialController.unfollowUser);
router.get('/follow/status/:userId', auth, followValidation, validate, socialController.checkFollowStatus);
router.post('/follow/:userId', auth, followValidation, validate, socialController.followUser);

// 获取关注列表
router.get('/following/:userId', auth, [
  param('userId').isMongoId().withMessage('用户ID格式不正确'),
  ...paginationValidation
], validate, socialController.getFollowingList);

// 获取粉丝列表
router.get('/followers/:userId', auth, [
  param('userId').isMongoId().withMessage('用户ID格式不正确'),
  ...paginationValidation
], validate, socialController.getFollowersList);

// 获取收到的点赞
router.get('/likes/received', auth, paginationValidation, validate, socialController.getReceivedLikes);

// 获取点赞统计
router.get('/likes/stats', auth, socialController.getLikeStats);

// 获取用户点赞记录
router.get('/likes/given', auth, paginationValidation, validate, socialController.getUserLikes);

// 获取推荐用户
router.get('/recommended', auth, paginationValidation, validate, socialController.getRecommendedUsers);

// 获取社交统计
router.get('/stats/:userId', auth, followValidation, validate, socialController.getSocialStats);

// 获取互相关注的用户
router.get('/mutual-follows', auth, paginationValidation, validate, socialController.getMutualFollows);

// 获取关注统计
router.get('/follow-stats/:userId', auth, followValidation, validate, socialController.getFollowStats);

module.exports = router;
