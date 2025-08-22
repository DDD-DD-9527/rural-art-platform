# 前端配置冲突分析报告

## 配置概览

### 当前配置状态
- **本地开发**: 使用 Vite 代理 `/api` -> `http://localhost:3000`
- **生产环境**: 使用 Vercel 重写 `/api/*` -> `http://119.23.46.172:3001/$1`
- **API 基础URL**: 统一使用相对路径 `/api`

## 发现的配置冲突

### 🔴 严重冲突

#### 1. 端口不匹配问题
- **vite.config.js**: 代理目标为 `http://localhost:3000`
- **实际后端服务**: 运行在 `3001` 端口
- **影响**: 本地开发时 API 调用会失败

#### 2. 生产环境 API 访问问题
- **vercel.json**: 重写到 `http://119.23.46.172:3001`
- **问题**: API 子域名 `https://api.ai-future-rural-art.top` 返回 521 错误
- **临时方案**: 使用 IP 直接访问，但可能存在 CORS 和安全问题

### 🟡 潜在冲突

#### 3. 环境变量缺失
- **vite.config.js** 中使用了 `VITE_PROXY_TARGET` 环境变量
- **.env** 文件中未定义此变量
- **影响**: 依赖默认值，可能导致配置不明确

#### 4. HTTPS/HTTP 混合问题
- **生产前端**: HTTPS (Vercel)
- **后端 API**: HTTP (IP 直接访问)
- **风险**: 可能触发浏览器安全策略限制

## 推荐解决方案

### 立即修复

1. **修复本地开发代理端口**
```javascript
// vite.config.js 中的 proxy 配置
proxy: {
  '/api': {
    target: 'http://localhost:3001', // 修改为正确端口
    changeOrigin: true,
    secure: false
  }
}
```

2. **添加缺失的环境变量**
```env
# .env 文件中添加
VITE_PROXY_TARGET=http://localhost:3001
```

### 长期优化

3. **修复 API 子域名**
   - 检查宝塔面板 SSL 证书配置
   - 验证 Cloudflare 代理设置
   - 确保防火墙规则正确

4. **统一 HTTPS 访问**
```json
// vercel.json 修改为使用 HTTPS API
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "https://api.ai-future-rural-art.top/$1"
  }
]
```

## 部署前检查清单

- [ ] 确认后端服务运行在正确端口 (3001)
- [ ] 验证 API 子域名可正常访问
- [ ] 测试本地开发环境 API 调用
- [ ] 确认生产环境 CORS 配置
- [ ] 检查 HTTPS 证书有效性

## 配置文件状态

### ✅ 配置正确的文件
- `src/config/constants.js` - API 配置使用相对路径
- `.env` - 基础环境变量配置完整

### ⚠️ 需要修复的文件
- `vite.config.js` - 代理端口需要修正
- `vercel.json` - 临时使用 IP，需要修复为域名

## 下一步行动

1. **立即**: 修复 vite.config.js 中的代理端口
2. **部署前**: 确保 API 子域名正常工作
3. **部署后**: 测试完整的前后端连接
4. **监控**: 观察生产环境 API 调用状态

---
*报告生成时间: 2025-08-22*
*状态: 发现配置冲突，需要修复后再部署*