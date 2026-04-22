const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 根据环境加载对应的环境变量文件
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
require('dotenv').config({ path: path.join(__dirname, '..', envFile) });

// 导入路由
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const socialRoutes = require('./routes/socialRoutes');
const topicRoutes = require('./routes/topicRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const gamificationRoutes = require('./routes/gamification');
const pointsRoutes = require('./routes/pointsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const metaRoutes = require('./routes/metaRoutes');

// 创建Express应用
const app = express();

// 导入配置
const { CORS_CONFIG, RATE_LIMIT_CONFIG, SECURITY_CONFIG, SERVER_CONFIG } = require('./config/constants');

// 信任代理（如果使用反向代理）
app.set('trust proxy', SERVER_CONFIG.TRUST_PROXY ? 1 : 0);

// 安全中间件
app.use(helmet(SECURITY_CONFIG.HELMET_CONFIG));

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的域名列表
    const allowedOrigins = CORS_CONFIG.ALLOWED_ORIGINS;
    
    // 在开发环境中允许所有来源
    if (process.env.NODE_ENV === 'development' || SERVER_CONFIG.NODE_ENV === 'development') {
      console.log('开发环境，允许来源:', origin);
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
app.use(express.json({ limit: SERVER_CONFIG.REQUEST_SIZE_LIMIT || '2mb' }));
app.use(express.urlencoded({ extended: true, limit: SERVER_CONFIG.REQUEST_SIZE_LIMIT || '2mb' }));

// 静态文件服务
app.use('/uploads', (req, res, next) => {
  // 设置 CORS 头部以避免 ORB 阻止
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // 根据文件扩展名设置正确的 Content-Type
  const ext = path.extname(req.path).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    res.type('image/jpeg');
  } else if (ext === '.png') {
    res.type('image/png');
  } else if (ext === '.gif') {
    res.type('image/gif');
  } else if (ext === '.webp') {
    res.type('image/webp');
  } else if (ext === '.mp4') {
    res.type('video/mp4');
  } else if (ext === '.pdf') {
    res.type('application/pdf');
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads')));

// 速率限制
const limiter = rateLimit(RATE_LIMIT_CONFIG.DEFAULT_LIMITER);

app.use(limiter);

// 路由配置
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/ai', aiRoutes);

// 兼容没有 /api 前缀的反向代理/路由配置（例如平台路由把 /api 前缀剥离）
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/social', socialRoutes);
app.use('/topics', topicRoutes);
app.use('/upload', uploadRoutes);
app.use('/meta', metaRoutes);
app.use('/admin', adminRoutes);
app.use('/gamification', gamificationRoutes);
app.use('/points', pointsRoutes);
app.use('/ai', aiRoutes);

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
