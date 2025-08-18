const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// 导入路由
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const socialRoutes = require('./routes/socialRoutes');
const topicRoutes = require('./routes/topicRoutes');

// 创建Express应用
const app = express();

// 信任代理（如果使用反向代理）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = [
      'http://localhost:5173', // Vite开发服务器
      'http://localhost:3000', // 可能的前端端口
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    // 在开发环境中允许所有来源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 生产环境中检查来源
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允许的CORS来源'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// 请求日志
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 开发环境放宽限制
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// 注册路由
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/topics', topicRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API根路径
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: '乡村艺术学习平台 API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      health: '/health'
    }
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `路径 ${req.originalUrl} 不存在`
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('全局错误处理:', error);
  
  // CORS错误
  if (error.message === '不允许的CORS来源') {
    return res.status(403).json({
      success: false,
      message: 'CORS策略阻止了此请求'
    });
  }
  
  // Mongoose验证错误
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors
    });
  }
  
  // MongoDB重复键错误
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field}已存在`
    });
  }
  
  // JWT错误
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '认证令牌已过期'
    });
  }
  
  // 默认服务器错误
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;