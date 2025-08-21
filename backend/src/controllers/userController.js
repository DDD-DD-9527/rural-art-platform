const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { PAGINATION_CONFIG } = require('../config/constants');

// 用户注册
const register = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { userId, username, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findByIdentifier(userId);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '注册号已存在'
      });
    }

    // 创建新用户
    const userData = {
      userId,
      username,
      password
    };

    const user = new User(userData);
    await user.save();

    // 生成JWT token
    const token = generateToken(user._id);

    // 返回用户信息（不包含密码）
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('用户注册错误:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = '该信息已存在';
      if (field === 'userId') message = '注册号已存在';
      else if (field === 'username') message = '用户名已存在';
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { identifier, password } = req.body; // identifier可以是注册号、邮箱或用户名

    // 查找用户
    const user = await User.findByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名/邮箱或密码错误'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '账户已被禁用，请联系管理员'
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名/邮箱或密码错误'
      });
    }

    // 更新最后登录时间
    await user.updateLastLogin();

    // 生成JWT token
    const token = generateToken(user._id);

    // 返回用户信息
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('用户登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

// 更新用户资料
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const updateData = req.body;

    // 不允许直接更新的字段
    const restrictedFields = ['password', 'role', 'status', 'createdAt', 'updatedAt'];
    restrictedFields.forEach(field => {
      delete updateData[field];
    });

    // 更新用户信息
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '资料更新成功',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '更新资料失败'
    });
  }
};

// 修改密码
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // 获取用户（包含密码）
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证当前密码
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败'
    });
  }
};

// 获取用户公开资料
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('获取用户资料错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户资料失败'
    });
  }
};

// 获取用户列表（管理员功能）
const getUserList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { 'profile.nickname': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }

    // 构建排序条件
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 查询用户
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // 获取总数
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
};

// 获取用户统计信息
const getUserStats = async (req, res) => {
  try {
    const stats = await User.getUserStats();
    
    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败'
    });
  }
};

// 根据ID获取用户信息
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

// 搜索用户
const searchUsers = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const searchQuery = {
      $or: [
        { username: { $regex: keyword, $options: 'i' } },
        { 'profile.nickname': { $regex: keyword, $options: 'i' } }
      ],
      status: 'active'
    };

    const users = await User.find(searchQuery)
      .select('username profile createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: users.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({
      success: false,
      message: '搜索用户失败'
    });
  }
};

// 更新学习统计
const updateLearningStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { learningStats: updateData } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '学习统计更新成功',
      data: {
        learningStats: user.learningStats
      }
    });
  } catch (error) {
    console.error('更新学习统计错误:', error);
    res.status(500).json({
      success: false,
      message: '更新学习统计失败'
    });
  }
};

// 更新技能进度
const updateSkillProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skillType, skillName, progress } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 更新技能进度
    if (user.skillProgress[skillType]) {
      const skill = user.skillProgress[skillType].skills.find(s => s.name === skillName);
      if (skill) {
        skill.progress = progress;
      } else {
        user.skillProgress[skillType].skills.push({
          name: skillName,
          progress: progress
        });
      }
      
      // 重新计算整体进度
      const totalProgress = user.skillProgress[skillType].skills.reduce((sum, skill) => sum + skill.progress, 0);
      user.skillProgress[skillType].progress = Math.round(totalProgress / user.skillProgress[skillType].skills.length);
    }

    await user.save();

    res.json({
      success: true,
      message: '技能进度更新成功',
      data: {
        skillProgress: user.skillProgress
      }
    });
  } catch (error) {
    console.error('更新技能进度错误:', error);
    res.status(500).json({
      success: false,
      message: '更新技能进度失败'
    });
  }
};

// 添加成就徽章
const addAchievement = async (req, res) => {
  try {
    const userId = req.user._id;
    const achievementData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查是否已存在该成就
    const existingAchievement = user.achievements.find(a => a.id === achievementData.id);
    if (existingAchievement) {
      existingAchievement.earned = true;
      existingAchievement.earnedDate = new Date();
    } else {
      user.achievements.push({
        ...achievementData,
        earned: true,
        earnedDate: new Date()
      });
    }

    await user.save();

    res.json({
      success: true,
      message: '成就徽章添加成功',
      data: {
        achievements: user.achievements
      }
    });
  } catch (error) {
    console.error('添加成就徽章错误:', error);
    res.status(500).json({
      success: false,
      message: '添加成就徽章失败'
    });
  }
};

module.exports = {
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
};