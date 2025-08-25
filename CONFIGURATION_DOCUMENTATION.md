# 乡村艺术平台配置文档

## 概述
本文档记录了乡村艺术平台的完整配置信息，包括前端、后端、代理设置和部署配置。

## 🎯 成功对接配置总结

### 关键问题解决
- **问题**: 注册API返回404错误
- **根本原因**: Vercel环境变量 `VITE_API_BASE_URL` 配置不正确
- **解决方案**: 将Vercel环境变量从 `https://kl9dmjgx-3000.asse.devtunnels.ms` 更新为 `https://kl9dmjgx-3000.asse.devtunnels.ms/api`

## 📋 配置详情

### 1. 前端配置 (Vue + Vite)

#### 端口配置
- **开发服务器端口**: 5173
- **配置文件**: `.env`
```env
VITE_DEV_SERVER_PORT=5173
```

#### API配置
- **本地开发API基础URL**: `/api` (通过代理转发)
- **生产环境API基础URL**: `/api` (通过Vercel重写规则转发)
- **配置文件**: `.env`
```env
VITE_API_BASE_URL=/api
```

#### 代理配置 (开发环境)
- **代理目标**: `http://localhost:3001`
- **代理路径**: `/api/*` → `http://localhost:3001/api/*`
- **配置文件**: `vite.config.js`
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    secure: false
  }
}
```

#### 允许的主机
- `localhost`
- `127.0.0.1`
- `kl9dmjgx-3000.asse.devtunnels.ms`

### 2. 后端配置 (Node.js + Express)

#### 端口配置
- **服务器端口**: 3000
- **配置文件**: `backend/src/config/constants.js`
```javascript
PORT: parseInt(process.env.PORT) || 3000
```

#### CORS配置
允许的源地址:
- `http://localhost:5173` (Vite开发服务器)
- `http://localhost:5713`
- `http://localhost:3000`
- `http://localhost:8080`
- `https://cuddly-spork-seven.vercel.app`
- `https://ai-future-rural-art.top`
- `https://*.vercel.app`

#### API路由
- **基础路径**: `/api`
- **用户注册**: `POST /api/users/register`
- **用户登录**: `POST /api/users/login`
- **健康检查**: `GET /health`

### 3. DevTunnels配置

#### 隧道信息
- **隧道URL**: `https://kl9dmjgx-3000.asse.devtunnels.ms`
- **本地端口**: 3000
- **访问权限**: Public
- **协议**: HTTPS

#### 端点映射
- `https://kl9dmjgx-3000.asse.devtunnels.ms/health` → `localhost:3000/health`
- `https://kl9dmjgx-3000.asse.devtunnels.ms/api/*` → `localhost:3000/api/*`

### 4. Vercel部署配置

#### 构建配置
- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **配置文件**: `vercel.json`

#### 重写规则
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://kl9dmjgx-3000.asse.devtunnels.ms/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 环境变量 (Vercel)
- **VITE_API_BASE_URL**: `https://kl9dmjgx-3000.asse.devtunnels.ms/api` ⚠️ **关键配置**

#### 部署域名
- **主域名**: `https://ai-future-rural-art.top`
- **Vercel域名**: `https://rural-art-platform-*.vercel.app`

## 🔄 请求流程

### 开发环境
```
浏览器 → localhost:5173 → Vite代理 → localhost:3000/api
```

### 生产环境
```
浏览器 → ai-future-rural-art.top → Vercel → DevTunnels → localhost:3000/api
```

## 🚀 启动命令

### 前端开发服务器
```bash
cd cuddly-spork
npm run dev
# 访问: http://localhost:5173
```

### 后端服务器
```bash
cd cuddly-spork/backend
npm start
# 监听: http://localhost:3000
```

### DevTunnels (VS Code)
```bash
# 在VS Code中启动DevTunnels
# 端口: 3000
# 访问权限: Public
# URL: https://kl9dmjgx-3000.asse.devtunnels.ms
```

## 📝 重要注意事项

1. **Vercel环境变量**: 必须包含完整的API路径 `/api`
2. **DevTunnels权限**: 必须设置为Public才能被Vercel访问
3. **CORS配置**: 后端必须允许Vercel域名的跨域请求
4. **API路径**: 前端统一使用 `/api` 前缀，通过代理或重写规则转发

## 🔧 故障排除

### 常见问题
1. **404错误**: 检查Vercel环境变量是否包含 `/api` 路径
2. **CORS错误**: 检查后端CORS配置是否包含前端域名
3. **DevTunnels无法访问**: 确认访问权限设置为Public
4. **代理失败**: 检查本地后端服务是否在3000端口运行

### 验证命令
```bash
# 测试DevTunnels健康检查
curl https://kl9dmjgx-3000.asse.devtunnels.ms/health

# 测试生产环境API
curl -X POST https://ai-future-rural-art.top/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","username":"test","password":"test123"}'
```

---

**文档更新时间**: 2025年8月24日  
**配置状态**: ✅ 正常运行  
**最后验证**: API注册功能正常，返回201状态码