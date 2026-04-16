const express = require('express');
const { body } = require('express-validator');
const {
  checkLessonUnlock,
  completeLesson,
  getLearningPath,
  getPointsHistory,
  getPointsStats,
  getUserAchievements,
  getLeaderboard,
  revokePoints,
  batchUnlockLessons,
  getLearningStats
} = require('../controllers/gamificationController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');



const router = express.Router();





// 课时完成验证规则
const lessonCompletionValidation = [
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('学习时长必须是非负整数'),
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('分数必须在0-100之间'),
  body('attempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('尝试次数必须是正整数'),
  body('completionData')
    .optional()
    .isObject()
    .withMessage('完成数据必须是对象格式')
];

// 积分撤销验证规则
const pointsRevokeValidation = [
  body('reason')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('撤销原因长度必须在1-200个字符之间')
];

// 所有路由都需要认证
router.use(authenticate);

// 课程相关路由
router.get('/courses/:courseId/lessons/:lessonId/unlock', checkLessonUnlock);
router.post('/courses/:courseId/lessons/:lessonId/complete', lessonCompletionValidation, validate, completeLesson);
router.get('/courses/:courseId/path', getLearningPath);
router.post('/courses/:courseId/batch-unlock', batchUnlockLessons);

// 前端组件调用的路由 - 学习路径
router.get('/learning-path/:courseId', getLearningPath);
router.get('/learning-path/', getLearningPath); // 无courseId时获取默认路径

// 积分相关路由
router.get('/points/history', getPointsHistory);
router.get('/stats', getPointsStats);
router.get('/users/:userId/points/history', getPointsHistory); // 管理员查看其他用户积分
router.delete('/points/:recordId', authorize(['admin']), pointsRevokeValidation, validate, revokePoints);

// 积分相关路由
router.get('/points/stats/:userId', authenticate, getPointsStats);
router.get('/points/history/:userId', authenticate, getPointsHistory);

// 成就相关路由
router.get('/achievements', authenticate, getUserAchievements);
router.get('/users/:userId/achievements', authenticate, getUserAchievements); // 查看其他用户成就

// 前端组件调用的路由 - 成就系统
router.get('/achievements/:userId', authenticate, getUserAchievements);

// 前端组件调用的路由 - 学习统计
router.get('/learning-stats/:userId', authenticate, getLearningStats);

// 排行榜相关路由
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/:type', getLeaderboard); // 按类型查看排行榜



module.exports = router;
