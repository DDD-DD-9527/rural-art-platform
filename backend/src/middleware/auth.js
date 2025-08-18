const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，请提供有效的认证令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在，请重新登录'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '账户已被禁用，请联系管理员'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期，请重新登录'
      });
    }

    console.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 可选认证中间件（用户可能已登录也可能未登录）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.status === 'active') {
      req.user = user;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不返回错误，只是设置user为null
    req.user = null;
    next();
  }
};

// 角色授权中间件
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足，无法访问此资源'
      });
    }

    next();
  };
};

// 资源所有者验证中间件
const checkOwnership = (resourceModel, resourceIdParam = 'id', ownerField = 'creator') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '请先登录'
        });
      }

      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: '资源不存在'
        });
      }

      // 管理员可以访问所有资源
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // 检查是否为资源所有者
      const ownerId = resource[ownerField];
      if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: '权限不足，只能操作自己的资源'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('所有权验证错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  };
};

// 生成JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 验证token（不通过中间件）
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership,
  generateToken,
  verifyToken
};