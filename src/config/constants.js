// 前端配置常量文件 - 统一管理所有硬编码值

// API配置
export const API_CONFIG = {
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// 默认资源路径
export const DEFAULT_ASSETS = {
  AVATAR:
    import.meta.env.VITE_DEFAULT_AVATAR ||
    "/placeholder.svg?height=40&width=40",
  PLACEHOLDER_IMAGE:
    import.meta.env.VITE_PLACEHOLDER_IMAGE || "/placeholder.jpg",
  LOGO: import.meta.env.VITE_LOGO_PATH || "/placeholder-logo.svg",
};

// 地理位置配置
export const LOCATION_CONFIG = {
  DEFAULT_COMMUNITY: import.meta.env.VITE_DEFAULT_COMMUNITY || "本地社区",
  DEFAULT_REGION: import.meta.env.VITE_DEFAULT_REGION || "广东·清远",
  LOCATION_API_ENABLED: import.meta.env.VITE_LOCATION_API_ENABLED === "true",
};

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
  POSTS_PER_PAGE: parseInt(import.meta.env.VITE_POSTS_PER_PAGE) || 20,
  COURSES_PER_PAGE: parseInt(import.meta.env.VITE_COURSES_PER_PAGE) || 12,
};

// UI配置
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 3000,
  MODAL_Z_INDEX: 1000,
};

// 课程配置
export const COURSE_CONFIG = {
  DEFAULT_XP: 10,
  DEFAULT_DURATION: 30, // 分钟
  DIFFICULTY_LEVELS: ["初级", "中级", "高级"],
  CATEGORIES: ["瑶绣制作", "传统工艺", "绘画艺术", "数字技能", "电商运营"],
};

// 积分系统配置
export const POINTS_CONFIG = {
  LESSON_COMPLETION_BASE: 10,
  COURSE_COMPLETION_BONUS: 50,
  PERFECT_SCORE_BONUS: 20,
  FIRST_ATTEMPT_BONUS: 15,
  DAILY_LOGIN_POINTS: 5,
  LEVEL_MULTIPLIER: 0.1,
};

// 社交功能配置
export const SOCIAL_CONFIG = {
  MAX_POST_LENGTH: 500,
  MAX_COMMENT_LENGTH: 200,
  MAX_IMAGES_PER_POST: 9,
  TRENDING_DAYS: 7,
};

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE:
    parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
};

// 主题配置
export const THEME_CONFIG = {
  PRIMARY_COLOR: "#10b981", // emerald-500
  SECONDARY_COLOR: "#3b82f6", // blue-500
  SUCCESS_COLOR: "#22c55e", // green-500
  WARNING_COLOR: "#f59e0b", // amber-500
  ERROR_COLOR: "#ef4444", // red-500
  BORDER_RADIUS: {
    SM: "0.375rem", // 6px
    MD: "0.5rem", // 8px
    LG: "0.75rem", // 12px
    XL: "1rem", // 16px
    "2XL": "1.5rem", // 24px
  },
};

// 缓存配置
export const CACHE_CONFIG = {
  USER_DATA_TTL: 30 * 60 * 1000, // 30分钟
  COURSE_DATA_TTL: 10 * 60 * 1000, // 10分钟
  POSTS_DATA_TTL: 5 * 60 * 1000, // 5分钟
  STATIC_DATA_TTL: 60 * 60 * 1000, // 1小时
};

// 错误消息配置
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "网络连接失败，请检查网络设置",
  SERVER_ERROR: "服务器错误，请稍后重试",
  UNAUTHORIZED: "登录已过期，请重新登录",
  FORBIDDEN: "权限不足，无法访问",
  NOT_FOUND: "请求的资源不存在",
  VALIDATION_ERROR: "输入数据格式错误",
  UPLOAD_ERROR: "文件上传失败",
  POINTS_ERROR: "积分操作失败",
  COURSE_ERROR: "课程操作失败",
};

// 成功消息配置
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "登录成功",
  REGISTER_SUCCESS: "注册成功",
  PROFILE_UPDATED: "个人资料更新成功",
  COURSE_ENROLLED: "课程报名成功",
  LESSON_COMPLETED: "课时完成，获得积分奖励",
  POST_CREATED: "动态发布成功",
  COMMENT_ADDED: "评论添加成功",
  FOLLOW_SUCCESS: "关注成功",
  UNFOLLOW_SUCCESS: "取消关注成功",
  LIKE_SUCCESS: "点赞成功",
  UNLIKE_SUCCESS: "取消点赞成功",
};

// 开发环境配置
export const DEV_CONFIG = {
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK === "true",
  ENABLE_DEBUG_LOGS: import.meta.env.VITE_DEBUG === "true",
  SHOW_PERFORMANCE_METRICS: import.meta.env.VITE_SHOW_METRICS === "true",
};

// 导出所有配置的合并对象
export const CONFIG = {
  API: API_CONFIG,
  ASSETS: DEFAULT_ASSETS,
  LOCATION: LOCATION_CONFIG,
  PAGINATION: PAGINATION_CONFIG,
  UI: UI_CONFIG,
  COURSE: COURSE_CONFIG,
  POINTS: POINTS_CONFIG,
  SOCIAL: SOCIAL_CONFIG,
  UPLOAD: UPLOAD_CONFIG,
  THEME: THEME_CONFIG,
  CACHE: CACHE_CONFIG,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  DEV: DEV_CONFIG,
};

export default CONFIG;
