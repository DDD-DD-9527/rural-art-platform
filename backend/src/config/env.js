const isProduction = process.env.NODE_ENV === 'production';

const isPlaceholderSecret = (value) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized.length < 32 || /replace|change|your-|secret-key/.test(normalized);
};

const validateEnvironment = () => {
  if (!isProduction) return;

  const required = ['MONGODB_URI', 'JWT_SECRET', 'BASE_URL', 'CORS_ALLOWED_ORIGINS'];
  const missing = required.filter((key) => !String(process.env[key] || '').trim());

  if (missing.length > 0) {
    throw new Error(`生产环境缺少必填环境变量: ${missing.join(', ')}`);
  }

  if (isPlaceholderSecret(process.env.JWT_SECRET)) {
    throw new Error('JWT_SECRET 必须是至少 32 个字符的随机字符串，不能使用示例值');
  }

  let baseUrl;
  try {
    baseUrl = new URL(process.env.BASE_URL);
  } catch {
    throw new Error('BASE_URL 必须是完整的 http(s) URL');
  }

  if (!['http:', 'https:'].includes(baseUrl.protocol)) {
    throw new Error('BASE_URL 必须使用 http 或 https');
  }
  if (baseUrl.pathname !== '/' || baseUrl.search || baseUrl.hash) {
    throw new Error('BASE_URL 只能包含协议、域名和可选端口，不能包含路径或查询参数');
  }

  const origins = process.env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  for (const origin of origins) {
    if (origin === '*') {
      throw new Error('生产环境的 CORS_ALLOWED_ORIGINS 不能使用 *');
    }
    try {
      const parsed = new URL(origin);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid protocol');
      if (parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('origin must not contain a path');
    } catch {
      throw new Error(`CORS_ALLOWED_ORIGINS 包含无效地址: ${origin}`);
    }
  }
};

module.exports = { validateEnvironment };
