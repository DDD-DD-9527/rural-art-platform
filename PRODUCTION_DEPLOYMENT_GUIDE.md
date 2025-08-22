# 乡村艺术平台生产环境部署实施指南

## 概述

本指南详细说明了如何将乡村艺术平台部署到生产环境：
- **前端**：部署到 Vercel 平台
- **后端**：部署到阿里云服务器
- **数据库**：MongoDB Atlas 云数据库

## 部署架构

```
用户 → Vercel前端 → 阿里云后端 → MongoDB Atlas
     (HTTPS)      (API调用)     (数据存储)
```

## 第一部分：前端 Vercel 部署

### 1.1 准备工作

#### 1.1.1 环境变量配置
在项目根目录创建 `.env.production` 文件：

```bash
# 生产环境API地址（替换为你的阿里云服务器地址）
VITE_API_BASE_URL=https://your-domain.com/api

# 如果使用IP地址
# VITE_API_BASE_URL=https://123.456.789.123:3001/api
```

#### 1.1.2 构建测试
在本地测试生产构建：

```bash
# 安装依赖
npm install

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 1.2 Vercel 平台操作详细步骤

#### 1.2.1 账号准备
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 确保你的项目已推送到 GitHub

#### 1.2.2 项目导入
1. 点击 "New Project" 按钮
2. 选择 "Import Git Repository"
3. 找到你的 `rural-art-platform` 仓库
4. 点击 "Import"

#### 1.2.3 项目配置
在导入页面进行以下配置：

**Framework Preset**: 选择 "Vite"

**Root Directory**: 保持默认（项目根目录）

**Build and Output Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### 1.2.4 环境变量配置
在 Vercel 项目设置中：

1. 进入项目 Dashboard
2. 点击 "Settings" 选项卡
3. 选择 "Environment Variables"
4. 添加以下变量：

```
Name: VITE_API_BASE_URL
Value: https://your-aliyun-domain.com/api
Environments: Production, Preview, Development
```

**重要提示**：
- 确保 API 地址使用 HTTPS
- 不要包含尾部斜杠
- 如果后端使用非标准端口，需要在域名后添加端口号

#### 1.2.5 域名配置（可选）
如果你有自定义域名：

1. 在 "Settings" → "Domains" 中
2. 点击 "Add Domain"
3. 输入你的域名（如：`www.yoursite.com`）
4. 按照提示配置 DNS 记录

**DNS 配置示例**：
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 1.2.6 部署触发
1. 点击 "Deploy" 按钮开始部署
2. 等待构建完成（通常 2-5 分钟）
3. 部署成功后会显示预览链接

### 1.3 Vercel 部署验证

#### 1.3.1 访问测试
1. 点击 Vercel 提供的预览链接
2. 检查页面是否正常加载
3. 测试路由跳转功能

#### 1.3.2 API 连接测试
1. 打开浏览器开发者工具
2. 尝试登录或注册功能
3. 检查 Network 面板中的 API 请求
4. 确认请求地址指向正确的后端服务器

## 第二部分：后端阿里云部署

### 2.1 阿里云服务器准备

#### 2.1.1 购买云服务器 ECS
1. 登录 [阿里云控制台](https://ecs.console.aliyun.com)
2. 点击 "创建实例"
3. 选择配置：
   - **地域**：选择离用户最近的地域
   - **实例规格**：推荐 2核4GB 或更高
   - **镜像**：Ubuntu 20.04 LTS
   - **存储**：40GB SSD 云盘
   - **网络**：默认 VPC
   - **安全组**：创建新安全组

#### 2.1.2 安全组配置
在安全组规则中添加：

```
规则方向: 入方向
授权策略: 允许
协议类型: TCP
端口范围: 22 (SSH)
授权对象: 0.0.0.0/0

规则方向: 入方向
授权策略: 允许
协议类型: TCP
端口范围: 80 (HTTP)
授权对象: 0.0.0.0/0

规则方向: 入方向
授权策略: 允许
协议类型: TCP
端口范围: 443 (HTTPS)
授权对象: 0.0.0.0/0

规则方向: 入方向
授权策略: 允许
协议类型: TCP
端口范围: 3001 (应用端口)
授权对象: 0.0.0.0/0
```

#### 2.1.3 域名解析配置
如果你有域名，在阿里云域名控制台配置：

1. 进入 "域名" → "解析设置"
2. 添加 A 记录：

```
记录类型: A
主机记录: @ (或 api)
记录值: 你的服务器公网IP
TTL: 600
```

### 2.2 服务器环境配置

#### 2.2.1 连接服务器
使用 SSH 连接到服务器：

```bash
ssh root@your-server-ip
```

#### 2.2.2 系统更新
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git vim ufw
```

#### 2.2.3 安装 Node.js
```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 2.2.4 安装 PM2
```bash
# 全局安装 PM2
sudo npm install -g pm2

# 设置 PM2 开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

#### 2.2.5 安装 Nginx
```bash
# 安装 Nginx
sudo apt install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

### 2.3 应用部署

#### 2.3.1 代码部署
```bash
# 创建应用目录
sudo mkdir -p /var/www/rural-art-platform
cd /var/www/rural-art-platform

# 克隆代码（替换为你的仓库地址）
sudo git clone https://github.com/yourusername/rural-art-platform.git .

# 进入后端目录
cd backend

# 安装依赖
sudo npm install --production
```

#### 2.3.2 环境变量配置
创建生产环境配置文件：

```bash
# 创建 .env 文件
sudo nano /var/www/rural-art-platform/backend/.env
```

添加以下内容（替换为实际值）：

```bash
# 服务器配置
NODE_ENV=production
PORT=3001

# 数据库配置（MongoDB Atlas）
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rural-art-platform?retryWrites=true&w=majority

# JWT 密钥（生成强密码）
JWT_SECRET=your-super-secure-jwt-secret-key-here

# CORS 配置（包含你的 Vercel 域名）
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com

# 文件上传配置
UPLOAD_PATH=/var/www/rural-art-platform/backend/uploads
MAX_FILE_SIZE=10485760

# 安全配置
SESSION_SECRET=your-session-secret-key
CSRF_SECRET=your-csrf-secret-key
```

**重要安全提示**：
- JWT_SECRET 必须是强密码（建议 64 字符以上）
- 所有密钥都应该是随机生成的
- 不要在代码中硬编码任何密钥

#### 2.3.3 创建上传目录
```bash
# 创建上传目录
sudo mkdir -p /var/www/rural-art-platform/backend/uploads/{avatars,posts,courses,temp}

# 设置权限
sudo chown -R www-data:www-data /var/www/rural-art-platform/backend/uploads
sudo chmod -R 755 /var/www/rural-art-platform/backend/uploads
```

#### 2.3.4 使用 PM2 启动应用
```bash
# 进入后端目录
cd /var/www/rural-art-platform/backend

# 使用 PM2 启动应用
sudo pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
sudo pm2 save

# 检查应用状态
sudo pm2 status
sudo pm2 logs
```

### 2.4 Nginx 配置

#### 2.4.1 创建 Nginx 配置文件
```bash
# 创建站点配置文件
sudo nano /etc/nginx/sites-available/rural-art-platform
```

添加以下配置（替换域名）：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 证书配置（稍后配置）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 静态文件服务
    location /uploads/ {
        alias /var/www/rural-art-platform/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS 头部
        add_header Access-Control-Allow-Origin "https://your-vercel-app.vercel.app" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # 处理预检请求
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://your-vercel-app.vercel.app";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
            add_header Access-Control-Allow-Credentials "true";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
    
    # 默认位置
    location / {
        return 404;
    }
}
```

#### 2.4.2 启用站点配置
```bash
# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/rural-art-platform /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
sudo nginx -t
```

### 2.5 SSL 证书配置

#### 2.5.1 安装 Certbot
```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx
```

#### 2.5.2 获取 SSL 证书
```bash
# 获取证书（替换为你的域名和邮箱）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --no-eff-email
```

#### 2.5.3 设置自动续期
```bash
# 测试自动续期
sudo certbot renew --dry-run

# 添加定时任务
sudo crontab -e

# 添加以下行（每天检查证书续期）
0 12 * * * /usr/bin/certbot renew --quiet
```

#### 2.5.4 重启 Nginx
```bash
# 重启 Nginx
sudo systemctl restart nginx

# 检查状态
sudo systemctl status nginx
```

### 2.6 防火墙配置

```bash
# 启用 UFW 防火墙
sudo ufw enable

# 允许必要端口
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# 检查防火墙状态
sudo ufw status
```

## 第三部分：MongoDB Atlas 配置

### 3.1 创建 MongoDB Atlas 集群

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 注册并登录账号
3. 创建新项目
4. 点击 "Build a Database"
5. 选择 "Shared" (免费版)
6. 选择云提供商和地区（推荐选择离服务器最近的地区）
7. 创建集群

### 3.2 配置数据库访问

#### 3.2.1 创建数据库用户
1. 在 "Database Access" 中点击 "Add New Database User"
2. 选择 "Password" 认证方式
3. 输入用户名和强密码
4. 选择 "Read and write to any database" 权限
5. 点击 "Add User"

#### 3.2.2 配置网络访问
1. 在 "Network Access" 中点击 "Add IP Address"
2. 选择 "Allow Access from Anywhere" (0.0.0.0/0)
3. 或者添加你的服务器 IP 地址
4. 点击 "Confirm"

#### 3.2.3 获取连接字符串
1. 在 "Clusters" 页面点击 "Connect"
2. 选择 "Connect your application"
3. 选择 "Node.js" 和版本
4. 复制连接字符串
5. 替换 `<password>` 和 `<dbname>`

## 第四部分：部署验证和测试

### 4.1 后端服务验证

```bash
# 检查应用状态
sudo pm2 status

# 查看应用日志
sudo pm2 logs rural-art-platform-backend

# 测试 API 端点
curl -X GET https://your-domain.com/api/health

# 测试数据库连接
curl -X GET https://your-domain.com/api/test/db
```

### 4.2 前端访问验证

1. 访问 Vercel 部署的前端地址
2. 测试用户注册功能
3. 测试用户登录功能
4. 检查 API 请求是否正常
5. 测试文件上传功能

### 4.3 CORS 验证

在浏览器开发者工具中检查：
1. Network 面板中的 API 请求状态
2. Console 面板中是否有 CORS 错误
3. Response Headers 中的 CORS 头部

### 4.4 SSL 证书验证

```bash
# 检查 SSL 证书
ssl-cert-check -c /etc/letsencrypt/live/your-domain.com/fullchain.pem

# 在线检查 SSL 配置
# 访问：https://www.ssllabs.com/ssltest/
```

## 第五部分：监控和维护

### 5.1 日志监控

```bash
# PM2 应用日志
sudo pm2 logs --lines 100

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u nginx -f
```

### 5.2 性能监控

```bash
# 系统资源监控
htop

# 磁盘使用情况
df -h

# 内存使用情况
free -h

# PM2 监控
sudo pm2 monit
```

### 5.3 备份策略

#### 5.3.1 代码备份
```bash
# 创建备份脚本
sudo nano /root/backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# 备份应用代码
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/rural-art-platform

# 备份 Nginx 配置
tar -czf $BACKUP_DIR/nginx_$DATE.tar.gz /etc/nginx

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# 设置执行权限
sudo chmod +x /root/backup.sh

# 添加定时任务（每天凌晨 2 点备份）
sudo crontab -e
0 2 * * * /root/backup.sh
```

#### 5.3.2 数据库备份
MongoDB Atlas 自动提供备份功能，可在控制台中配置。

### 5.4 更新部署

```bash
# 更新应用代码
cd /var/www/rural-art-platform
sudo git pull origin main

# 更新后端依赖
cd backend
sudo npm install --production

# 重启应用
sudo pm2 restart rural-art-platform-backend

# 检查状态
sudo pm2 status
```

## 第六部分：故障排除

### 6.1 常见问题

#### 6.1.1 应用无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3001

# 检查环境变量
cat /var/www/rural-art-platform/backend/.env

# 检查应用日志
sudo pm2 logs rural-art-platform-backend --lines 50
```

#### 6.1.2 数据库连接失败
```bash
# 测试数据库连接
node -e "const mongoose = require('mongoose'); mongoose.connect('your-mongodb-uri').then(() => console.log('Connected')).catch(err => console.error(err));"
```

#### 6.1.3 CORS 错误
1. 检查后端 CORS 配置
2. 确认前端域名在允许列表中
3. 检查 Nginx CORS 头部配置

#### 6.1.4 SSL 证书问题
```bash
# 检查证书有效期
sudo certbot certificates

# 手动续期证书
sudo certbot renew

# 重启 Nginx
sudo systemctl restart nginx
```

### 6.2 紧急恢复

```bash
# 恢复应用代码
cd /var/www/rural-art-platform
sudo git reset --hard HEAD~1
sudo pm2 restart rural-art-platform-backend

# 恢复 Nginx 配置
sudo cp /root/backups/nginx_latest.tar.gz /tmp/
cd /tmp && sudo tar -xzf nginx_latest.tar.gz
sudo cp -r etc/nginx/* /etc/nginx/
sudo systemctl restart nginx
```

## 第七部分：安全加固

### 7.1 服务器安全

```bash
# 禁用 root SSH 登录
sudo nano /etc/ssh/sshd_config
# 设置：PermitRootLogin no

# 创建普通用户
sudo adduser deploy
sudo usermod -aG sudo deploy

# 配置 SSH 密钥认证
# 在本地生成密钥对
ssh-keygen -t rsa -b 4096

# 将公钥复制到服务器
ssh-copy-id deploy@your-server-ip
```

### 7.2 应用安全

```bash
# 设置文件权限
sudo chown -R deploy:deploy /var/www/rural-art-platform
sudo chmod -R 755 /var/www/rural-art-platform
sudo chmod 600 /var/www/rural-art-platform/backend/.env

# 定期更新系统
sudo apt update && sudo apt upgrade -y

# 安装安全更新
sudo unattended-upgrades
```

## 总结

完成以上步骤后，你的乡村艺术平台将成功部署到生产环境：

- ✅ 前端部署到 Vercel，支持 HTTPS 和自定义域名
- ✅ 后端部署到阿里云，配置 SSL 证书和反向代理
- ✅ 数据库使用 MongoDB Atlas 云服务
- ✅ 配置完整的监控和备份策略
- ✅ 实施安全加固措施

### 重要提醒

1. **定期备份**：确保代码和数据的安全
2. **监控日志**：及时发现和解决问题
3. **更新维护**：定期更新系统和应用依赖
4. **安全检查**：定期检查安全配置和证书有效期
5. **性能优化**：根据实际使用情况优化服务器配置

如有问题，请参考故障排除部分或联系技术支持。