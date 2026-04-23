const User = require('../models/User');

const buildUserQuery = ({ search, role, status }) => {
  const query = {};

  if (search) {
    query.$or = [
      { userId: { $regex: search, $options: 'i' } },
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

  return query;
};

exports.listUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const query = buildUserQuery({ search, role, status });

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort(sort).skip(skip).limit(limitNum),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('管理员获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('管理员获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败'
    });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user && req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: '不能修改自己的状态'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('管理员更新用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户状态失败'
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (req.user && req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: '不能修改自己的角色'
      });
    }

    const target = await User.findById(id).select('-password');
    if (!target) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (target.role === 'admin' && role !== 'admin') {
      const otherAdmins = await User.countDocuments({
        role: 'admin',
        _id: { $ne: target._id }
      });
      if (otherAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: '不能移除最后一个管理员'
        });
      }
    }

    target.role = role;
    await target.save();

    res.json({
      success: true,
      data: { user: target }
    });
  } catch (error) {
    console.error('管理员更新用户角色错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户角色失败'
    });
  }
};

