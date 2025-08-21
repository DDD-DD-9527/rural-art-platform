const { validationResult } = require('express-validator');

/**
 * 验证中间件 - 处理express-validator的验证结果
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      errors: errorMessages
    });
  }
  
  next();
};

module.exports = validate;