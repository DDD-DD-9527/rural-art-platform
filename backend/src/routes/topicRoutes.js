const express = require('express');
const { query } = require('express-validator');
const topicController = require('../controllers/topicController');
const validate = require('../middleware/validate');

const router = express.Router();

// 获取话题分类列表
router.get('/categories', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('数量限制必须在1-100之间')
], validate, topicController.getTopicCategories);

// 获取热门话题
router.get('/trending', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('数量限制必须在1-50之间'),
  query('days').optional().isInt({ min: 1, max: 30 }).withMessage('天数必须在1-30之间')
], validate, topicController.getTrendingTopics);

// 根据话题获取帖子统计
router.get('/stats', [
  query('tags').optional().isString().withMessage('标签必须是字符串')
], validate, topicController.getTopicStats);

module.exports = router;
