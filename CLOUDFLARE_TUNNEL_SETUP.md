# Cloudflare隧道持久化配置指南

## 📋 概述

本指南将帮助您从临时Cloudflare隧道（trycloudflare.com）迁移到持久化的Cloudflare隧道，提供更稳定和可控的访问方式。

## ✅ 您的当前优势

- **数据库**: 已使用MongoDB Atlas（云数据库，无需本地MongoDB）
- **域名DNS**: 已通过Cloudflare配置（完美兼容隧道设置）
- **前端部署**: 已通过Vercel挂载到主域名
- **架构优势**: 统一的Cloudflare生态系统，性能和安全性更佳

## 🔄 当前状态

### 临时隧道配置（当前使用）
- **隧道URL**: `https://api.ai-future-rural-art.top`
- **类型**: 临时隧道（每次重启会变化）
- **配置文件**: 
  - `vercel.json`: 第12行
  - `.env.production`: 第3行
  - `vite.config.js`: 第23行

### 目标：持久化隧道
- **类型**: 命名隧道（固定URL）
- **优势**: 稳定的URL、更好的安全性、可管理性

## 🚀 设置持久化隧道

### 快速开始示例

基于您的域名 `ai-future-rural-art.top`，以下是完整的设置流程：

```bash
# 1. 登录Cloudflare
cloudflared-windows-amd64.exe login

# 2. 创建隧道
cloudflared-windows-amd64.exe tunnel create rural-art-backend

# 3. 配置DNS（二选一）
# 方式一：命令行自动创建
cloudflared-windows-amd64.exe tunnel route dns rural-art-backend api.ai-future-rural-art.top

# 方式二：Web 界面手动创建
# 访问 https://dash.cloudflare.com，在 DNS Records 中添加：
# Type: CNAME, Name: api, Target: <tunnel-id>.cfargotunnel.com

# 4. 启动隧道（需要先创建config.yml文件）
cloudflared-windows-amd64.exel --config config.yml run rural-art-backend
```

### 步骤1：登录Cloudflare账户

1. 打开终端，运行登录命令：
```bash
.\cloudflared.exe login
```

2. 浏览器会自动打开Cloudflare登录页面
3. 选择要使用的域名（如果有多个域名）
4. 授权cloudflared访问您的账户

### 步骤2：创建隧道

```bash
# 创建一个命名隧道
.\cloudflared.exe tunnel create rural-art-backend
```

这将创建一个名为 `rural-art-backend` 的隧道，并生成一个隧道ID。

记录隧道信息 ：

- 隧道名称： rural-art-backend
- 隧道 ID： ab5ca915-30a8-469a-970b-3a7558127d3e
- 隧道域名： ab5ca915-30a8-469a-970b-3a7558127d3e.cfargotunnel.com

### 步骤3：配置隧道

创建配置文件 `config.yml`：

```yaml
# config.yml
tunnel: rural-art-backend
credentials-file: C:\Users\Administrator\.cloudflared\ab5ca915-30a8-469a-970b-3a7558127d3e.json

ingress:
  # 将所有流量路由到本地后端服务器
  - hostname: api.ai-future-rural-art.top  # 您的API子域名
    service: http://localhost:3000
  # 捕获所有其他请求
  - service: http_status:404
```

**说明：**
- `C:\Users\Administrator` - 这里的 `Administrator` 是您当前 Windows 系统的用户名
- `ab5ca915-30a8-469a-970b-3a7558127d3e.json` - 这是您刚才创建隧道时生成的凭证文件名（隧道ID）
- 如果您的系统用户名不是 `Administrator`，请替换为您实际的用户名

**注意**: 
- 将 `[您的用户名]` 和 `[隧道ID]` 替换为实际值
- 使用您的实际API子域名 `api.ai-future-rural-art.top`
- 由于您的前端已经通过Vercel挂载到主域名，API使用 `api.` 子域名

### 步骤4：配置DNS记录

由于您的域名已在 Cloudflare DNS 托管，有两种方式配置 DNS 记录：

#### 方式一：命令行自动创建（推荐）
```bash
# 自动创建DNS记录（使用您的实际域名）
cloudflared-windows-amd64.exe tunnel route dns rural-art-backend api.ai-future-rural-art.top
```

#### 方式二：Web 界面手动创建
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择您的域名 `ai-future-rural-art.top`
3. 进入 **DNS** > **Records** 页面
4. 点击 **Add record** 添加新记录：
   - **Type**: CNAME
   - **Name**: api
   - **Target**: `[隧道ID].cfargotunnel.com`（从隧道创建输出中获取）
   - **Proxy status**: Proxied（橙色云朵图标）
5. 点击 **Save** 保存

**重要提示**：
✅ **您的域名已在Cloudflare DNS托管 - 这是最佳配置！**
- 可使用命令行或 Web 界面创建 DNS 记录
- 与您现有的前端Vercel配置完全兼容
- 享受Cloudflare的全球CDN加速和DDoS防护
- 统一的SSL证书管理

如果DNS不在Cloudflare（不适用于您），需要手动添加CNAME记录：
```
api.ai-future-rural-art.top CNAME [隧道ID].cfargotunnel.com
```

### 步骤5：启动隧道

```bash
# 使用配置文件启动隧道
cloudflared-windows-amd64.exe tunnel --config config.yml run
```

## 🔧 自动化启动

### 方法1：创建批处理文件

创建 `start-tunnel.bat`：
```batch
@echo off
cd /d "f:\5_item\rural-art-platform"
echo Starting Cloudflare Tunnel...
.\cloudflared.exe tunnel --config config.yml run rural-art-backend
pause
```

### 方法2：Windows服务（推荐）

```bash
# 安装为Windows服务
.\cloudflared.exe service install --config config.yml
```

启动服务：
```bash
# 启动服务
net start cloudflared

# 停止服务
net stop cloudflared

# 卸载服务
.\cloudflared.exe service uninstall
```

## 📝 更新项目配置

### 域名架构说明
- **前端**: `ai-future-rural-art.top` (已通过Vercel部署)
- **后端API**: `api.ai-future-rural-art.top` (通过Cloudflare隧道)
- **优势**: 统一域名管理，避免跨域问题

### 1. 更新 vercel.json

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.ai-future-rural-art.top/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. 更新 .env.production

```env
# API基础URL - 指向持久化隧道的API子域名
VITE_API_BASE_URL=https://api.ai-future-rural-art.top
```

### 3. 更新 vite.config.js

```javascript
export default defineConfig({
  // ... 其他配置
  server: {
    proxy: {
      '/api': {
        target: 'https://api.ai-future-rural-art.top',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
```

### 4. 域名配置检查清单

- [ ] 确认您的域名 `ai-future-rural-art.top` 已添加到Cloudflare
- [ ] 前端域名 `ai-future-rural-art.top` 已在Vercel配置
- [ ] API子域名 `api.ai-future-rural-art.top` 将通过Cloudflare隧道配置
- [ ] SSL证书会自动通过Cloudflare处理

## 🛠️ 管理命令

### 查看隧道状态
```bash
# 列出所有隧道
.\cloudflared.exe tunnel list

# 查看隧道信息
.\cloudflared.exe tunnel info rural-art-backend
```

### 更新隧道配置
```bash
# 修改config.yml后重启隧道
.\cloudflared.exe tunnel --config config.yml run rural-art-backend
```

### 删除隧道
```bash
# 删除DNS记录
.\cloudflared.exe tunnel route dns --overwrite-dns rural-art-backend your-subdomain.your-domain.com

# 删除隧道
.\cloudflared.exe tunnel delete rural-art-backend
```

## 🔒 安全配置

### 1. 访问控制

在config.yml中添加访问策略：
```yaml
tunnel: rural-art-backend
credentials-file: C:\Users\[用户名]\.cloudflared\[隧道ID].json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3000
    originRequest:
      # 添加安全头
      httpHostHeader: localhost:3000
  - service: http_status:404
```

### 2. Cloudflare Access（可选）

如果需要额外的访问控制，可以在Cloudflare控制台配置Access策略。

## 📊 监控和日志

### 查看隧道日志
```bash
# 查看实时日志
.\cloudflared.exe tunnel --config config.yml --loglevel debug run rural-art-backend
```

### 日志文件位置
- Windows服务日志：事件查看器 → Windows日志 → 应用程序
- 配置文件：`%USERPROFILE%\.cloudflared\`

## 🚨 故障排除

### 常见问题

1. **隧道无法启动**
   - 检查端口3000是否被占用
   - 确认后端服务正在运行
   - 验证config.yml语法

2. **DNS解析失败**
   ✅ **您使用Cloudflare DNS，通常几分钟内生效**
   - 等待DNS传播（通常1-5分钟，最多1小时）
   - 使用 `nslookup api.ai-future-rural-art.top` 检查

3. **连接被拒绝**
   - 确认本地服务运行在正确端口
   - 检查防火墙设置
   ✅ **数据库连接无需检查（您使用MongoDB Atlas）**

### 测试连接
```bash
# 测试隧道连接
curl https://api.ai-future-rural-art.top/health

# 测试本地服务
curl http://localhost:3000/health

# 验证前端到后端的连接
# 前端: https://ai-future-rural-art.top
# 后端: https://api.ai-future-rural-art.top
```

## 📋 部署检查清单

- [ ] Cloudflare账户已登录
- [ ] 隧道已创建并命名
- [ ] config.yml配置正确
- [ ] DNS记录已设置
- [ ] 隧道服务正在运行
- [ ] 项目配置文件已更新
- [ ] 前端重新构建和部署
- [ ] 端到端测试通过

## 🔄 迁移步骤总结

1. **准备阶段**：登录Cloudflare，创建隧道
2. **配置阶段**：设置config.yml，配置DNS
3. **测试阶段**：启动隧道，测试连接
4. **更新阶段**：修改项目配置文件
5. **部署阶段**：重新部署前端应用
6. **验证阶段**：完整功能测试

---

**注意事项**：
- 确保域名已添加到Cloudflare
- 保存好隧道凭证文件
- 建议先在测试环境验证配置
- 迁移过程中可能有短暂的服务中断

**支持文档**：
- [Cloudflare Tunnel官方文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [配置参考](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/configuration/)