const express = require('express');
const { body } = require('express-validator');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getPopularCourses,
  getRecommendedCourses
} = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// 课程验证规则
const courseValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('课程标题长度必须在1-100个字符之间'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('课程描述长度必须在1-1000个字符之间'),
  body('thumbnail')
    .notEmpty()
    .withMessage('课程封面不能为空'),
  body('category')
    .isIn([
      'traditional-crafts',
      'painting',
      'sculpture',
      'textile',
      'pottery',
      'woodwork',
      'paper-art',
      'folk-art',
      'calligraphy',
      'other'
    ])
    .withMessage('课程分类无效'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('难度等级无效'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('标签必须是数组格式'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('标签长度不能超过20个字符'),
  body('lessons')
    .optional()
    .isArray()
    .withMessage('课时必须是数组格式'),
  body('lessons.*.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('课时标题长度必须在1-100个字符之间'),
  body('lessons.*.duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('课时时长必须是正整数'),
  body('learningObjectives')
    .optional()
    .isArray()
    .withMessage('学习目标必须是数组格式'),
  body('learningObjectives.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('学习目标长度不能超过200个字符'),
  body('settings.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('价格不能为负数')
];

// 公开路由
router.get('/', getCourses); // 获取课程列表
router.get('/popular', getPopularCourses); // 获取热门课程
router.get('/recommended', getRecommendedCourses); // 获取推荐课程
router.get('/:courseId', getCourseById); // 获取课程详情

// 需要认证的路由
router.use(authenticate);

// 创作者和管理员可以创建课程
router.post('/', courseValidation, createCourse);

// 课程管理路由（需要是课程创作者或管理员）
router.put('/:courseId', courseValidation, updateCourse);
router.delete('/:courseId', deleteCourse);
router.patch('/:courseId/publish', publishCourse);
router.patch('/:courseId/unpublish', unpublishCourse);

module.exports = router;