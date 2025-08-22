// 后端配置常量文件 - 统一管理所有硬编码值和环境变量

// 服务器配置
const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  TRUST_PROXY: process.env.TRUST_PROXY === 'true' || true
};

// 数据库配置
const DATABASE_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-art-platform',
  CONNECTION_OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
    maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 30000
  }
};

// JWT配置
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  ALGORITHM: process.env.JWT_ALGORITHM || 'HS256'
};

// CORS配置
const CORS_CONFIG = {
  ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS 
    ? process.env.CORS_ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:5173', // Vite开发服务器
        'http://localhost:3000', // 可能的前端端口
        'http://localhost:8080', // 可能的前端端口
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'https://cuddly-spork-seven.vercel.app', // Vercel部署的前端
        'https://ai-future-rural-art.top',
        'http://ai-future-rural-art.top', // 用户自定义域名
        'https://*.vercel.app' // 允许所有Vercel子域名
      ],
  CREDENTIALS: process.env.CORS_CREDENTIALS === 'true' || true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// 速率限制配置
const RATE_LIMIT_CONFIG = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  MAX_REQUESTS: {
    DEVELOPMENT: parseInt(process.env.RATE_LIMIT_DEV_MAX) || 1000,
    PRODUCTION: parseInt(process.env.RATE_LIMIT_PROD_MAX) || 100
  },
  MESSAGE: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  DEFAULT_LIMITER: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' 
      ? parseInt(process.env.RATE_LIMIT_DEV_MAX) || 1000
      : parseInt(process.env.RATE_LIMIT_PROD_MAX) || 100,
    message: {
      success: false,
      message: '请求过于频繁，请稍后再试'
    },
    standardHeaders: true,
    legacyHeaders: false
  }
};

// 文件上传配置
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(process.env.UPLOAD_MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES
    ? process.env.UPLOAD_ALLOWED_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILES: parseInt(process.env.UPLOAD_MAX_FILES) || 5
};

// AI服务配置
const AI_CONFIG = {
  GZHU_AGENT: {
    API_URL: process.env.GZHU_AGENT_API_URL || 'https://api.gzhu.edu.cn/agent',
    API_KEY: process.env.GZHU_AGENT_KEY || '',
    TIMEOUT: parseInt(process.env.GZHU_AGENT_TIMEOUT) || 30000
  },
  COZE: {
    API_URL: process.env.COZE_API_URL || 'https://api.coze.com/v1',
    API_KEY: process.env.COZE_API_KEY || '',
    TIMEOUT: parseInt(process.env.COZE_TIMEOUT) || 30000,
    BOTS: {
      IMAGE_ENHANCE: process.env.COZE_IMAGE_ENHANCE_BOT_ID || '',
      STYLE_TRANSFER: process.env.COZE_STYLE_TRANSFER_BOT_ID || '',
      PATTERN_GENERATE: process.env.COZE_PATTERN_GENERATE_BOT_ID || '',
      SMART_REPAIR: process.env.COZE_SMART_REPAIR_BOT_ID || ''
    }
  }
};

// 积分系统配置
const POINTS_CONFIG = {
  ACTIONS: {
    REGISTER: parseInt(process.env.POINTS_REGISTER) || 100,
    LOGIN_DAILY: parseInt(process.env.POINTS_LOGIN_DAILY) || 10,
    COMPLETE_LESSON: parseInt(process.env.POINTS_COMPLETE_LESSON) || 20,
    COMPLETE_COURSE: parseInt(process.env.POINTS_COMPLETE_COURSE) || 100,
    CREATE_POST: parseInt(process.env.POINTS_CREATE_POST) || 15,
    LIKE_POST: parseInt(process.env.POINTS_LIKE_POST) || 2,
    COMMENT_POST: parseInt(process.env.POINTS_COMMENT_POST) || 5,
    SHARE_POST: parseInt(process.env.POINTS_SHARE_POST) || 8,
    FOLLOW_USER: parseInt(process.env.POINTS_FOLLOW_USER) || 5
  },
  LEVELS: {
    BRONZE: parseInt(process.env.POINTS_LEVEL_BRONZE) || 0,
    SILVER: parseInt(process.env.POINTS_LEVEL_SILVER) || 500,
    GOLD: parseInt(process.env.POINTS_LEVEL_GOLD) || 1500,
    PLATINUM: parseInt(process.env.POINTS_LEVEL_PLATINUM) || 3000,
    DIAMOND: parseInt(process.env.POINTS_LEVEL_DIAMOND) || 6000
  }
};

// 课程配置
const COURSE_CONFIG = {
  DEFAULT_DURATION: parseInt(process.env.COURSE_DEFAULT_DURATION) || 30, // 分钟
  MAX_LESSONS: parseInt(process.env.COURSE_MAX_LESSONS) || 50,
  DIFFICULTY_LEVELS: process.env.COURSE_DIFFICULTY_LEVELS
    ? process.env.COURSE_DIFFICULTY_LEVELS.split(',')
    : ['初级', '中级', '高级'],
  CATEGORIES: process.env.COURSE_CATEGORIES
    ? process.env.COURSE_CATEGORIES.split(',')
    : ['传统工艺', '数字技能', '创意设计', '文化传承', '实用技能'],
  MIN_COMPLETION_RATE: parseFloat(process.env.COURSE_MIN_COMPLETION_RATE) || 0.8
};

// 社交功能配置
const SOCIAL_CONFIG = {
  MAX_POST_LENGTH: parseInt(process.env.SOCIAL_MAX_POST_LENGTH) || 500,
  MAX_COMMENT_LENGTH: parseInt(process.env.SOCIAL_MAX_COMMENT_LENGTH) || 200,
  MAX_IMAGES_PER_POST: parseInt(process.env.SOCIAL_MAX_IMAGES_PER_POST) || 9,
  MAX_FOLLOWS: parseInt(process.env.SOCIAL_MAX_FOLLOWS) || 1000,
  MAX_FOLLOWERS: parseInt(process.env.SOCIAL_MAX_FOLLOWERS) || 10000
};

// 分页配置
const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: parseInt(process.env.PAGINATION_DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: parseInt(process.env.PAGINATION_MAX_PAGE_SIZE) || 100,
  POSTS_PER_PAGE: parseInt(process.env.PAGINATION_POSTS_PER_PAGE) || 20,
  COURSES_PER_PAGE: parseInt(process.env.PAGINATION_COURSES_PER_PAGE) || 12,
  COMMENTS_PER_PAGE: parseInt(process.env.PAGINATION_COMMENTS_PER_PAGE) || 15
};

// 缓存配置
const CACHE_CONFIG = {
  TTL: {
    SHORT: parseInt(process.env.CACHE_TTL_SHORT) || 5 * 60, // 5分钟
    MEDIUM: parseInt(process.env.CACHE_TTL_MEDIUM) || 30 * 60, // 30分钟
    LONG: parseInt(process.env.CACHE_TTL_LONG) || 24 * 60 * 60 // 24小时
  },
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
};

// 日志配置
const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: process.env.LOG_FORMAT || 'combined',
  MAX_SIZE: process.env.LOG_MAX_SIZE || '20m',
  MAX_FILES: parseInt(process.env.LOG_MAX_FILES) || 14,
  DATE_PATTERN: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
};

// 安全配置
const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
  CSRF_SECRET: process.env.CSRF_SECRET || 'your-csrf-secret',
  HELMET_CONFIG: {
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http://localhost:3000", "http://127.0.0.1:3000"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  }
};

// 邮件配置
const EMAIL_CONFIG = {
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@rural-art-platform.com',
  FROM_NAME: process.env.FROM_NAME || '乡艺未来平台'
};

// 健康检查配置
const HEALTH_CONFIG = {
  CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30秒
  TIMEOUT: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000, // 5秒
  RETRIES: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3
};

// 导出所有配置
module.exports = {
  SERVER_CONFIG,
  DATABASE_CONFIG,
  JWT_CONFIG,
  CORS_CONFIG,
  RATE_LIMIT_CONFIG,
  UPLOAD_CONFIG,
  AI_CONFIG,
  POINTS_CONFIG,
  COURSE_CONFIG,
  SOCIAL_CONFIG,
  PAGINATION_CONFIG,
  CACHE_CONFIG,
  LOG_CONFIG,
  SECURITY_CONFIG,
  EMAIL_CONFIG,
  HEALTH_CONFIG
};