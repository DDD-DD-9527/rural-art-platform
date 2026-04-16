// UI工具函数 - 统一管理样式相关的配置和函数
import { UI_CONFIG, THEME_CONFIG } from "@/config/constants";

/**
 * 获取主题颜色
 * @param {string} colorName - 颜色名称
 * @returns {string} 颜色值
 */
export const getThemeColor = (colorName) => {
  return (
    THEME_CONFIG[colorName.toUpperCase() + "_COLOR"] ||
    THEME_CONFIG.PRIMARY_COLOR
  );
};

/**
 * 获取边框圆角值
 * @param {string} size - 尺寸 (sm, md, lg, xl, 2xl)
 * @returns {string} 圆角值
 */
export const getBorderRadius = (size = "md") => {
  return (
    THEME_CONFIG.BORDER_RADIUS[size.toUpperCase()] ||
    THEME_CONFIG.BORDER_RADIUS.MD
  );
};

/**
 * 获取动画持续时间
 * @param {string} type - 动画类型 (default, debounce, toast)
 * @returns {number} 持续时间（毫秒）
 */
export const getAnimationDuration = (type = "default") => {
  switch (type) {
    case "debounce":
      return UI_CONFIG.DEBOUNCE_DELAY;
    case "toast":
      return UI_CONFIG.TOAST_DURATION;
    default:
      return UI_CONFIG.ANIMATION_DURATION;
  }
};

/**
 * 获取Z-index值
 * @param {string} layer - 层级名称
 * @returns {number} Z-index值
 */
export const getZIndex = (layer = "modal") => {
  const baseZIndex = UI_CONFIG.MODAL_Z_INDEX;
  const zIndexMap = {
    dropdown: baseZIndex - 100,
    modal: baseZIndex,
    toast: baseZIndex + 100,
    tooltip: baseZIndex + 200,
  };
  return zIndexMap[layer] || baseZIndex;
};

/**
 * 生成渐变背景类名
 * @param {string} from - 起始颜色
 * @param {string} to - 结束颜色
 * @param {string} direction - 方向 (r, l, t, b, tr, tl, br, bl)
 * @returns {string} Tailwind CSS类名
 */
export const getGradientClass = (from, to, direction = "r") => {
  const directionMap = {
    r: "to-r",
    l: "to-l",
    t: "to-t",
    b: "to-b",
    tr: "to-tr",
    tl: "to-tl",
    br: "to-br",
    bl: "to-bl",
  };
  return `bg-gradient-${directionMap[direction]} from-${from} to-${to}`;
};

/**
 * 获取状态颜色类名
 * @param {string} status - 状态 (success, warning, error, info)
 * @returns {object} 包含文本和背景颜色的对象
 */
export const getStatusColors = (status) => {
  const colorMap = {
    success: {
      text: "text-emerald-700",
      bg: "bg-emerald-100",
      border: "border-emerald-300",
    },
    warning: {
      text: "text-amber-700",
      bg: "bg-amber-100",
      border: "border-amber-300",
    },
    error: {
      text: "text-red-700",
      bg: "bg-red-100",
      border: "border-red-300",
    },
    info: {
      text: "text-blue-700",
      bg: "bg-blue-100",
      border: "border-blue-300",
    },
    default: {
      text: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-300",
    },
  };
  return colorMap[status] || colorMap.default;
};

/**
 * 获取课程难度对应的颜色
 * @param {string} difficulty - 难度等级
 * @returns {object} 颜色配置
 */
export const getDifficultyColors = (difficulty) => {
  const colorMap = {
    初级: {
      text: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-300",
    },
    中级: {
      text: "text-yellow-700",
      bg: "bg-yellow-100",
      border: "border-yellow-300",
    },
    高级: {
      text: "text-red-700",
      bg: "bg-red-100",
      border: "border-red-300",
    },
    beginner: {
      text: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-300",
    },
    intermediate: {
      text: "text-yellow-700",
      bg: "bg-yellow-100",
      border: "border-yellow-300",
    },
    advanced: {
      text: "text-red-700",
      bg: "bg-red-100",
      border: "border-red-300",
    },
  };
  return colorMap[difficulty] || colorMap.beginner;
};

/**
 * 获取会员等级对应的颜色和图标
 * @param {string} level - 会员等级
 * @returns {object} 会员等级配置
 */
export const getMembershipConfig = (level) => {
  const configMap = {
    普通会员: {
      color: "text-slate-600",
      bg: "bg-slate-100",
      gradient: "from-slate-400 to-slate-600",
      icon: "UserIcon",
    },
    黄金会员: {
      color: "text-amber-600",
      bg: "bg-amber-100",
      gradient: "from-amber-400 to-amber-600",
      icon: "CrownIcon",
    },
    钻石会员: {
      color: "text-purple-600",
      bg: "bg-purple-100",
      gradient: "from-purple-400 to-purple-600",
      icon: "SparklesIcon",
    },
  };
  return configMap[level] || configMap["普通会员"];
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, delay = UI_CONFIG.DEBOUNCE_DELAY) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, delay = UI_CONFIG.ANIMATION_DURATION) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
};

/**
 * 生成随机ID
 * @param {number} length - ID长度
 * @returns {string} 随机ID
 */
export const generateId = (length = 8) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

/**
 * 检查是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export const isMobile = () => {
  return window.innerWidth < 768;
};

/**
 * 获取设备类型
 * @returns {string} 设备类型 (mobile, tablet, desktop)
 */
export const getDeviceType = () => {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

export default {
  getThemeColor,
  getBorderRadius,
  getAnimationDuration,
  getZIndex,
  getGradientClass,
  getStatusColors,
  getDifficultyColors,
  getMembershipConfig,
  formatFileSize,
  debounce,
  throttle,
  generateId,
  isMobile,
  getDeviceType,
};
