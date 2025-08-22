# Vercel 平台部署操作详细指南

## 概述

本指南详细说明在 Vercel 平台上部署乡村艺术平台前端的每一个操作步骤，包含平台界面操作、配置设置和常见问题解决方案。

## 第一部分：账号准备和项目准备

### 1.1 Vercel 账号注册

#### 步骤 1：访问 Vercel 官网
1. 打开浏览器，访问 [https://vercel.com](https://vercel.com)
2. 点击右上角的 "Sign Up" 按钮

#### 步骤 2：选择注册方式
**推荐使用 GitHub 账号注册**（便于后续项目导入）：
1. 点击 "Continue with GitHub" 按钮
2. 如果未登录 GitHub，会跳转到 GitHub 登录页面
3. 输入 GitHub 用户名和密码
4. 点击 "Sign in" 登录

#### 步骤 3：授权 Vercel 访问
1. GitHub 会显示授权页面
2. 检查权限列表（通常包括读取仓库、写入部署状态等）
3. 点击 "Authorize Vercel" 按钮

#### 步骤 4：完成注册
1. 返回 Vercel 平台
2. 可能需要填写一些基本信息（团队名称、使用目的等）
3. 点击 "Continue" 完成注册

### 1.2 GitHub 仓库准备

#### 步骤 1：确保代码已推送到 GitHub
```bash
# 在本地项目目录执行
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

#### 步骤 2：检查仓库结构
确保你的 GitHub 仓库包含以下文件：
```
rural-art-platform/
├── package.json          # 包含构建脚本
├── vite.config.js        # Vite 配置文件
├── index.html            # 入口 HTML 文件
├── src/                  # 源代码目录
├── public/               # 静态资源目录
└── vercel.json           # Vercel 配置文件（可选）
```

#### 步骤 3：验证 package.json 脚本
确保 `package.json` 包含正确的构建脚本：
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 第二部分：项目导入和基础配置

### 2.1 导入 GitHub 项目

#### 步骤 1：进入项目创建页面
1. 登录 Vercel 后，进入 Dashboard
2. 点击 "New Project" 按钮（通常在右上角）
3. 或者点击 "Add New..." → "Project"

#### 步骤 2：选择 Git 提供商
1. 在 "Import Git Repository" 部分
2. 确认已连接 GitHub（显示 GitHub 图标和 "Connected" 状态）
3. 如果未连接，点击 "Connect" 按钮进行连接

#### 步骤 3：选择仓库
1. 在仓库列表中找到 `rural-art-platform`
2. 如果看不到仓库，可以：
   - 使用搜索框搜索仓库名称
   - 点击 "Adjust GitHub App Permissions" 调整权限
   - 确认仓库是公开的或已授权访问
3. 找到仓库后，点击 "Import" 按钮

### 2.2 项目配置设置

#### 步骤 1：基本项目信息
在项目配置页面设置：

**Project Name**（项目名称）：
- 默认会使用仓库名称 `rural-art-platform`
- 可以修改为更友好的名称，如 `rural-art-platform-prod`
- 这个名称会影响默认的 Vercel 域名

**Framework Preset**（框架预设）：
- Vercel 通常会自动检测为 "Vite"
- 如果未自动检测，手动选择 "Vite"
- 确保选择正确，这会影响构建配置

#### 步骤 2：Root Directory（根目录）
- 保持默认设置（空白或 `./`）
- 因为前端代码在项目根目录
- 如果前端代码在子目录，需要指定路径（如 `frontend/`）

#### 步骤 3：Build and Output Settings（构建和输出设置）

**Build Command**（构建命令）：
```bash
npm run build
```
- 这是默认值，通常不需要修改
- 如果使用 yarn，可以改为 `yarn build`
- 如果使用 pnpm，可以改为 `pnpm build`

**Output Directory**（输出目录）：
```bash
dist
```
- Vite 默认输出到 `dist` 目录
- 确保与 `vite.config.js` 中的配置一致

**Install Command**（安装命令）：
```bash
npm install
```
- 默认值，用于安装依赖
- 根据你的包管理器选择：`npm install`、`yarn` 或 `pnpm install`

#### 步骤 4：高级设置（可选）
点击 "Show Advanced Settings" 展开高级选项：

**Node.js Version**：
- 选择 "18.x"（推荐）
- 确保与本地开发环境版本一致

**Environment Variables**（环境变量）：
- 暂时跳过，稍后单独配置

## 第三部分：环境变量配置

### 3.1 添加生产环境变量

#### 步骤 1：进入环境变量设置
在项目配置页面：
1. 找到 "Environment Variables" 部分
2. 点击 "Add" 按钮添加新变量

#### 步骤 2：配置 API 基础 URL
添加第一个环境变量：

**Name**（变量名）：
```
VITE_API_BASE_URL
```

**Value**（变量值）：
```
https://your-domain.com/api
```
**重要说明**：
- 替换 `your-domain.com` 为你的实际后端域名
- 如果使用 IP 地址：`https://123.456.789.123:3001/api`
- 确保使用 HTTPS 协议
- 不要在末尾添加斜杠

**Environments**（环境）：
- 勾选 "Production"（生产环境）
- 勾选 "Preview"（预览环境）
- 可选勾选 "Development"（开发环境）

#### 步骤 3：添加其他环境变量（如需要）
根据项目需要，可能还需要添加：

**VITE_APP_NAME**：
```
Name: VITE_APP_NAME
Value: 乡村艺术平台
Environments: Production, Preview
```

**VITE_APP_VERSION**：
```
Name: VITE_APP_VERSION
Value: 1.0.0
Environments: Production, Preview
```

### 3.2 环境变量验证

#### 步骤 1：检查变量列表
确保所有必要的环境变量都已添加：
- ✅ `VITE_API_BASE_URL`
- ✅ 其他项目特定变量

#### 步骤 2：验证变量值
- 检查 API URL 格式是否正确
- 确认域名或 IP 地址可访问
- 验证协议（HTTP/HTTPS）匹配

## 第四部分：部署执行

### 4.1 开始部署

#### 步骤 1：确认配置
在项目配置页面底部：
1. 检查所有设置是否正确
2. 确认环境变量已配置
3. 验证构建命令和输出目录

#### 步骤 2：启动部署
1. 点击 "Deploy" 按钮
2. Vercel 开始构建过程
3. 可以看到实时构建日志

#### 步骤 3：监控构建过程
构建过程包括以下阶段：

**1. Cloning repository**（克隆仓库）
- 从 GitHub 下载代码
- 通常需要 10-30 秒

**2. Installing dependencies**（安装依赖）
- 执行 `npm install`
- 根据依赖数量，需要 1-5 分钟

**3. Building application**（构建应用）
- 执行 `npm run build`
- 编译和打包代码
- 通常需要 1-3 分钟

**4. Uploading build outputs**（上传构建结果）
- 将构建结果上传到 Vercel CDN
- 通常需要 30 秒到 2 分钟

**5. Deploying to production**（部署到生产环境）
- 激活新版本
- 通常需要 10-30 秒

### 4.2 部署结果检查

#### 步骤 1：查看部署状态
部署完成后会显示：
- ✅ "Deployment completed" 成功消息
- 🔗 预览链接（如：`https://rural-art-platform-xxx.vercel.app`）
- 📊 构建统计信息

#### 步骤 2：访问部署的应用
1. 点击预览链接
2. 检查页面是否正常加载
3. 测试主要功能：
   - 页面导航
   - 用户注册/登录
   - API 请求

#### 步骤 3：检查构建日志
如果部署失败：
1. 点击 "View Function Logs" 查看详细日志
2. 查找错误信息
3. 根据错误信息调整配置

## 第五部分：域名配置

### 5.1 自定义域名设置

#### 步骤 1：进入域名设置
1. 在项目 Dashboard 中
2. 点击 "Settings" 选项卡
3. 选择左侧菜单中的 "Domains"

#### 步骤 2：添加域名
1. 点击 "Add" 按钮
2. 输入你的域名（如：`www.yoursite.com`）
3. 点击 "Add" 确认

#### 步骤 3：配置 DNS 记录
Vercel 会显示需要配置的 DNS 记录：

**CNAME 记录**（推荐）：
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**A 记录**（备选）：
```
Type: A
Name: www
Value: 76.76.19.61
TTL: 3600
```

#### 步骤 4：在域名提供商配置 DNS
以阿里云为例：
1. 登录阿里云控制台
2. 进入 "域名" → "解析设置"
3. 点击 "添加记录"
4. 填入上述 DNS 记录信息
5. 点击 "确认" 保存

#### 步骤 5：验证域名配置
1. 返回 Vercel 域名设置页面
2. 等待 DNS 传播（通常 5-30 分钟）
3. 域名状态变为 "Valid" 表示配置成功
4. 访问自定义域名测试

### 5.2 SSL 证书配置

Vercel 自动为所有域名提供 SSL 证书：
- 自动申请 Let's Encrypt 证书
- 自动续期
- 强制 HTTPS 重定向

检查 SSL 状态：
1. 在域名列表中查看 SSL 状态
2. 应该显示 "Valid" 或绿色锁图标
3. 访问 `https://your-domain.com` 测试

## 第六部分：高级配置

### 6.1 Vercel 配置文件

#### 创建 vercel.json
在项目根目录创建 `vercel.json` 文件：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Requested-With, Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

#### 配置说明
- **rewrites**：处理 SPA 路由，所有请求重定向到 index.html
- **headers**：设置 CORS 头部（如果需要）
- **buildCommand** 和 **outputDirectory**：覆盖默认构建设置

### 6.2 分支部署配置

#### 步骤 1：配置预览部署
1. 在 "Settings" → "Git" 中
2. 配置 "Production Branch"：`main`
3. 启用 "Automatic deployments from Git"

#### 步骤 2：预览分支设置
- 每个 Pull Request 自动创建预览部署
- 可以在 PR 中直接预览更改
- 预览 URL 格式：`https://rural-art-platform-git-branch-username.vercel.app`

### 6.3 性能优化配置

#### 步骤 1：启用压缩
Vercel 默认启用 Gzip 压缩，无需额外配置。

#### 步骤 2：配置缓存
在 `vercel.json` 中添加缓存头：

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 步骤 3：优化构建
在 `vite.config.js` 中添加优化配置：

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

## 第七部分：监控和维护

### 7.1 部署监控

#### 查看部署历史
1. 在项目 Dashboard 中
2. 点击 "Deployments" 选项卡
3. 查看所有部署记录：
   - 部署时间
   - 部署状态（成功/失败）
   - 构建时长
   - 部署触发原因（Git push、手动部署等）

#### 查看实时日志
1. 点击具体的部署记录
2. 查看 "Build Logs" 构建日志
3. 查看 "Function Logs" 运行时日志

### 7.2 性能分析

#### Vercel Analytics
1. 在 "Analytics" 选项卡中查看：
   - 页面访问量
   - 加载性能
   - 用户地理分布
   - 设备类型统计

#### Web Vitals
查看核心性能指标：
- **LCP**（Largest Contentful Paint）：最大内容绘制
- **FID**（First Input Delay）：首次输入延迟
- **CLS**（Cumulative Layout Shift）：累积布局偏移

### 7.3 自动部署配置

#### Git 集成
Vercel 自动监听 GitHub 仓库变化：
- 推送到 `main` 分支触发生产部署
- 推送到其他分支触发预览部署
- Pull Request 自动创建预览环境

#### 部署钩子
可以配置部署前后的钩子：

```json
{
  "github": {
    "silent": true
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

## 第八部分：故障排除

### 8.1 常见构建错误

#### 错误 1：依赖安装失败
**错误信息**：
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案**：
1. 检查 `package.json` 中的依赖版本
2. 删除 `package-lock.json`
3. 重新推送代码触发部署

#### 错误 2：构建命令失败
**错误信息**：
```
Error: Build failed with exit code 1
```

**解决方案**：
1. 检查构建日志中的具体错误
2. 在本地运行 `npm run build` 测试
3. 修复代码错误后重新部署

#### 错误 3：环境变量未生效
**症状**：API 请求失败，控制台显示 404 错误

**解决方案**：
1. 检查环境变量名称是否正确（必须以 `VITE_` 开头）
2. 确认环境变量值格式正确
3. 重新部署应用

### 8.2 运行时问题

#### 问题 1：页面 404 错误
**症状**：直接访问路由地址显示 404

**解决方案**：
在 `vercel.json` 中添加重写规则：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 问题 2：API 跨域错误
**症状**：控制台显示 CORS 错误

**解决方案**：
1. 确认后端 CORS 配置包含 Vercel 域名
2. 检查 API 请求 URL 是否正确
3. 验证后端服务是否正常运行

#### 问题 3：静态资源加载失败
**症状**：图片、CSS 或 JS 文件 404

**解决方案**：
1. 检查资源路径是否正确
2. 确认资源文件在 `public` 目录中
3. 验证构建输出是否包含所有资源

### 8.3 性能问题

#### 问题 1：首屏加载慢
**解决方案**：
1. 启用代码分割
2. 优化图片大小和格式
3. 使用 CDN 加速静态资源

#### 问题 2：构建时间过长
**解决方案**：
1. 优化依赖项
2. 使用构建缓存
3. 减少不必要的构建步骤

## 第九部分：最佳实践

### 9.1 部署前检查清单

- [ ] 代码已推送到 GitHub
- [ ] 本地构建测试通过
- [ ] 环境变量配置正确
- [ ] API 端点可访问
- [ ] 静态资源路径正确
- [ ] 路由配置完整

### 9.2 安全最佳实践

1. **环境变量安全**：
   - 不要在代码中硬编码敏感信息
   - 使用 Vercel 环境变量功能
   - 定期轮换 API 密钥

2. **域名安全**：
   - 启用 HTTPS（Vercel 默认启用）
   - 配置安全头部
   - 使用强密码保护账号

3. **访问控制**：
   - 限制 GitHub 仓库访问权限
   - 定期审查团队成员权限
   - 启用双因素认证

### 9.3 性能优化建议

1. **代码优化**：
   - 使用动态导入进行代码分割
   - 优化图片和静态资源
   - 移除未使用的依赖

2. **缓存策略**：
   - 配置适当的缓存头部
   - 使用版本化的静态资源
   - 启用 Service Worker（如适用）

3. **监控和分析**：
   - 定期检查 Web Vitals 指标
   - 监控错误率和性能趋势
   - 根据用户反馈优化体验

## 总结

通过以上详细步骤，你可以成功将乡村艺术平台前端部署到 Vercel 平台。关键要点：

1. **准备工作**：确保 GitHub 仓库和构建配置正确
2. **环境配置**：正确设置 API 基础 URL 等环境变量
3. **域名设置**：配置自定义域名和 SSL 证书
4. **监控维护**：定期检查部署状态和性能指标
5. **故障排除**：熟悉常见问题的解决方案

如遇到问题，请参考故障排除部分或查看 Vercel 官方文档。