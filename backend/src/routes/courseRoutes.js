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
  getRecommendedCourses,
  enrollCourse,
  updateProgress,
  getProgress,
  getUserEnrollments,
  getCourseEnrollments,
  getUnlockableLessons,
  unlockLesson,
  getCourseStats,
  checkCourseUnlock,
  getRecommendedPath,
  getUserSkillTree,
  getCourseAnalytics
} = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

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
    .withMessage('每个标签长度不能超过20个字符'),
  // 添加videos字段验证
  body('videos')
    .optional()
    .isArray()
    .withMessage('视频文件必须是数组格式'),
  body('videos.*.url')
    .optional()
    .isURL()
    .withMessage('视频URL格式无效'),
  body('videos.*.originalName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('视频文件名长度必须在1-255个字符之间'),
  body('videos.*.size')
    .optional()
    .isInt({ min: 1 })
    .withMessage('视频文件大小必须是正整数'),
  // 添加materials字段验证
  body('materials')
    .optional()
    .isArray()
    .withMessage('课程材料必须是数组格式'),
  body('materials.*.url')
    .optional()
    .isURL()
    .withMessage('材料URL格式无效'),
  body('materials.*.originalName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('材料文件名长度必须在1-255个字符之间'),
  body('materials.*.size')
    .optional()
    .isInt({ min: 1 })
    .withMessage('材料文件大小必须是正整数'),
  body('lessons')
    .optional()
    .isArray()
    .withMessage('课时必须是数组格式'),
  body('lessons.*.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('课时标题长度必须在1-100个字符之间'),
  body('lessons.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('课时描述长度不能超过500个字符'),
  body('lessons.*.videoUrl')
    .optional()
    .isURL()
    .withMessage('视频URL格式无效'),
  body('lessons.*.duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('课时时长必须是正整数'),
  body('lessons.*.order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('课时顺序必须是正整数'),
  body('learningObjectives')
    .optional()
    .isArray()
    .withMessage('学习目标必须是数组格式'),
  body('learningObjectives.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('每个学习目标长度不能超过200个字符'),
  body('settings.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('课程价格必须是非负数'),
  body('requirements.prerequisites')
    .optional()
    .isArray()
    .withMessage('前置要求必须是数组格式'),
  body('requirements.materials')
    .optional()
    .isArray()
    .withMessage('所需材料必须是数组格式'),
  body('requirements.materials.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('材料名称长度必须在1-50个字符之间'),
  body('requirements.materials.*.description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('材料描述长度不能超过200个字符'),
  body('requirements.materials.*.estimatedCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('材料预估费用必须是非负数'),
  body('requirements.tools')
    .optional()
    .isArray()
    .withMessage('所需工具必须是数组格式'),
  body('requirements.tools.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('工具名称长度必须在1-50个字符之间'),
  body('requirements.tools.*.description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('工具描述长度不能超过200个字符'),
  body('lessons.*.materials')
    .optional()
    .isArray()
    .withMessage('课时材料必须是数组格式'),
  body('lessons.*.materials.*.url')
    .optional()
    .isURL()
    .withMessage('材料URL格式无效')
];

// 公开路由
router.get('/', getCourses); // 获取课程列表
router.get('/popular', getPopularCourses); // 获取热门课程
router.get('/recommended', getRecommendedCourses); // 获取推荐课程
router.get('/:courseId', getCourseById); // 获取课程详情

// 需要认证的路由
router.use(authenticate);

// 创作者和管理员可以创建课程
router.post('/', courseValidation, validate, createCourse);

// 课程管理路由（需要是课程创作者或管理员）
router.put('/:courseId', courseValidation, validate, updateCourse);
router.delete('/:courseId', deleteCourse);
router.patch('/:courseId/publish', publishCourse);
router.patch('/:courseId/unpublish', unpublishCourse);

// 课程报名和学习进度相关路由
router.post('/:courseId/enroll', enrollCourse); // 报名课程
router.put('/:courseId/progress', updateProgress); // 更新学习进度
router.get('/:courseId/progress', getProgress); // 获取学习进度
router.get('/enrollments/my', getUserEnrollments); // 获取我的课程报名列表
router.get('/:courseId/enrollments', getCourseEnrollments); // 获取课程报名学员列表（需要权限）

// 关卡式学习相关路由
router.get('/:courseId/unlockable-lessons', getUnlockableLessons); // 获取可解锁的课时列表
router.post('/:courseId/lessons/:lessonId/unlock', unlockLesson); // 手动解锁课时
router.get('/:courseId/stats', getCourseStats); // 获取课程学习统计

// 检查课程解锁条件
router.get('/:courseId/unlock-check', authenticate, checkCourseUnlock);

// 获取推荐学习路径
router.get('/recommended-path', authenticate, getRecommendedPath);

// 获取用户技能树
router.get('/skill-tree', authenticate, getUserSkillTree);

// 获取课程分析数据（管理员）
router.get('/:courseId/analytics', authenticate, getCourseAnalytics);

module.exports = router;
