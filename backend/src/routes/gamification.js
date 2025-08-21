const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');

// 获取学习路径
router.get('/learning-path/:courseId', 
  authenticate,
  [
    param('courseId').isMongoId().withMessage('课程ID格式无效')
  ],
  validate,
  gamificationController.getLearningPath
);

// 获取默认学习路径（无courseId）
router.get('/learning-path', 
  authenticate,
  gamificationController.getLearningPath
);

// 获取用户积分统计
router.get('/points/stats/:userId',
  authenticate,
  [
    param('userId').isMongoId().withMessage('用户ID格式无效'),
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('时间段参数无效')
  ],
  validate,
  gamificationController.getPointsStats
);

// 获取当前用户积分统计
router.get('/points/stats',
  authenticate,
  [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('时间段参数无效')
  ],
  validate,
  gamificationController.getPointsStats
);

// 获取用户积分历史
router.get('/points/history/:userId',
  authenticate,
  [
    param('userId').isMongoId().withMessage('用户ID格式无效'),
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('type').optional().isString().withMessage('积分类型格式无效'),
    query('source').optional().isString().withMessage('积分来源格式无效')
  ],
  validate,
  gamificationController.getPointsHistory
);

// 获取当前用户积分历史
router.get('/points/history',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('type').optional().isString().withMessage('积分类型格式无效'),
    query('source').optional().isString().withMessage('积分来源格式无效')
  ],
  validate,
  gamificationController.getPointsHistory
);

// 获取用户成就
router.get('/achievements/:userId',
  authenticate,
  [
    param('userId').isMongoId().withMessage('用户ID格式无效')
  ],
  validate,
  gamificationController.getAchievements
);

// 获取当前用户成就
router.get('/achievements',
  authenticate,
  gamificationController.getAchievements
);

// 获取学习统计
router.get('/learning-stats/:userId',
  authenticate,
  [
    param('userId').isMongoId().withMessage('用户ID格式无效'),
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('时间段参数无效')
  ],
  validate,
  gamificationController.getLearningStats
);

// 获取当前用户学习统计
router.get('/learning-stats',
  authenticate,
  [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('时间段参数无效')
  ],
  validate,
  gamificationController.getLearningStats
);

// 检查课程解锁状态
router.get('/unlock-status/:courseId',
  authenticate,
  [
    param('courseId').isMongoId().withMessage('课程ID格式无效')
  ],
  validate,
  gamificationController.checkLessonUnlock
);

// 完成课程并获得积分
router.post('/complete-lesson',
  authenticate,
  [
    body('lessonId').isMongoId().withMessage('课程ID格式无效'),
    body('courseId').isMongoId().withMessage('课程ID格式无效'),
    body('completionTime').optional().isInt({ min: 0 }).withMessage('完成时间必须是非负整数'),
    body('accuracy').optional().isFloat({ min: 0, max: 100 }).withMessage('准确率必须在0-100之间'),
    body('attempts').optional().isInt({ min: 1 }).withMessage('尝试次数必须是正整数')
  ],
  validate,
  gamificationController.completeLesson
);

module.exports = router;