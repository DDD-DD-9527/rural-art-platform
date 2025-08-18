const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  getUserById,
  searchUsers,
  getUserStats,
  updateLearningStats,
  updateSkillProgress,
  addAchievement
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// 用户注册验证规则
const registerValidation = [
  body('userId')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('注册号长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('注册号只能包含字母、数字和下划线'),
  body('username')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('用户名长度必须在2-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个字母和一个数字')
];

// 用户登录验证规则
const loginValidation = [
  body('identifier')
    .notEmpty()
    .withMessage('请输入注册号、用户名或邮箱'),
  body('password')
    .notEmpty()
    .withMessage('请输入密码')
];

// 更新资料验证规则
const updateProfileValidation = [
  body('profile.nickname')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('昵称不能超过30个字符'),
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('个人简介不能超过200个字符'),
  body('profile.location')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('地址不能超过50个字符'),
  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other', ''])
    .withMessage('性别值无效'),
  body('preferences.language')
    .optional()
    .isIn(['zh-CN', 'en-US'])
    .withMessage('语言设置无效'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('主题设置无效')
];

// 修改密码验证规则
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('请输入当前密码'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码至少6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('新密码必须包含至少一个字母和一个数字'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('确认密码与新密码不匹配');
      }
      return true;
    })
];

// 公开路由
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile/:userId', getUserById);

// 需要认证的路由
router.use(authenticate);

// 用户个人操作
router.get('/profile', getCurrentUser);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/password', changePasswordValidation, changePassword);

// 用户数据更新
router.put('/learning-stats', updateLearningStats);
router.put('/skill-progress', updateSkillProgress);
router.post('/achievements', addAchievement);

// 管理员路由
router.get('/search', authorize('admin'), searchUsers);
router.get('/stats', authorize('admin'), getUserStats);

module.exports = router;