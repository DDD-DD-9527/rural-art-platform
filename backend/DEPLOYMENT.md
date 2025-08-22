# 乡村艺术平台后端部署指南

## 📋 部署概览

本指南提供了将后端部署到云服务器的详细步骤，支持多种部署方式：
- 传统部署 (PM2)
- Docker 容器化部署
- 手动部署

## 🏗️ 架构说明

```
用户域名 (ai-future-rural-art.top)
    ↓ (Cloudflare DNS)
Vercel 前端
    ↓ (HTTPS API 请求)
云服务器后端 (Node.js + PM2/Docker)
    ↓ (MongoDB 连接)
MongoDB Atlas 数据库
```

## 🔧 服务器要求

### 最低配置
- **CPU**: 1核
- **内存**: 1GB RAM
- **存储**: 20GB SSD
- **带宽**: 1Mbps
- **系统**: Ubuntu 20.04+ / CentOS 7+

### 推荐配置
- **CPU**: 2核
- **内存**: 2GB RAM
- **存储**: 40GB SSD
- **带宽**: 5Mbps

## 🚀 快速部署 (推荐)

### 方法一：使用部署脚本

1. **上传代码到服务器**
```bash
# 在服务器上创建目录
sudo mkdir -p /var/www/rural-art-platform
cd /var/www/rural-art-platform

# 上传后端代码 (使用 scp 或 git)
scp -r ./backend/* root@your-server-ip:/var/www/rural-art-platform/
```

2. **运行部署脚本**
```bash
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

3. **配置环境变量**
```bash
nano .env
# 根据 .env.production 模板配置
```

### 方法二：Docker 部署

1. **安装 Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **部署应用**
```bash
# 上传代码
git clone <your-repo> /var/www/rural-art-platform
cd /var/www/rural-art-platform/backend

# 配置环境变量
cp .env.production .env
nano .env

# 启动服务
docker-compose up -d
```

## 📝 手动部署步骤

### 1. 准备服务器环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y curl wget git nginx ufw

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

### 2. 部署应用代码

```bash
# 创建应用目录
sudo mkdir -p /var/www/rural-art-platform
cd /var/www/rural-art-platform

# 上传代码 (方式1: Git)
git clone <your-repo-url> .

# 或者 (方式2: 直接上传)
# scp -r ./backend/* root@server-ip:/var/www/rural-art-platform/

# 安装依赖
npm install --production

# 创建必要目录
mkdir -p uploads logs
sudo chown -R www-data:www-data uploads
```

### 3. 配置环境变量

```bash
# 复制生产环境配置
cp .env.production .env

# 编辑配置文件
nano .env
```

**重要配置项：**
```env
# 数据库连接 (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rural-art-platform

# JWT 密钥 (必须修改)
JWT_SECRET=your-super-secure-production-secret

# CORS 域名
CORS_ALLOWED_ORIGINS=https://ai-future-rural-art.top,https://cuddly-spork-seven.vercel.app

# 服务器配置
PORT=3001
NODE_ENV=production
```

### 4. 启动应用

```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

### 5. 配置 Nginx 反向代理

```bash
# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/rural-art-platform
```

**Nginx 配置内容：**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # 静态文件
    location /uploads/ {
        alias /var/www/rural-art-platform/uploads/;
        expires 1y;
    }
    
    # API 代理
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/rural-art-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. 配置 SSL 证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. 配置防火墙

```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

## 🔧 配置检查清单

### MongoDB Atlas 配置
- [ ] 数据库连接字符串正确
- [ ] 服务器 IP 已添加到白名单
- [ ] 数据库用户权限正确

### 前端配置 (Vercel)
- [ ] `VITE_API_BASE_URL` 指向云服务器地址
- [ ] 域名 DNS 配置正确
- [ ] CORS 配置包含前端域名

### 服务器配置
- [ ] Node.js 和 PM2 安装成功
- [ ] 应用正常启动 (pm2 status)
- [ ] Nginx 配置正确
- [ ] SSL 证书配置成功
- [ ] 防火墙规则正确

## 🧪 测试部署

```bash
# 检查应用状态
pm2 status
pm2 logs rural-art-platform-backend

# 测试 API
curl http://localhost:3001/health
curl https://your-domain.com/health

# 检查 Nginx
sudo nginx -t
sudo systemctl status nginx
```

## 🔄 更新部署

```bash
# 拉取最新代码
cd /var/www/rural-art-platform
git pull origin main

# 安装新依赖
npm install --production

# 重启应用
pm2 restart rural-art-platform-backend
```

## 📊 监控和维护

### 日志查看
```bash
# PM2 日志
pm2 logs rural-art-platform-backend

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 性能监控
```bash
# PM2 监控
pm2 monit

# 系统资源
htop
df -h
```

## 🚨 故障排除

### 常见问题

1. **应用无法启动**
   - 检查环境变量配置
   - 查看 PM2 日志
   - 确认端口未被占用

2. **数据库连接失败**
   - 检查 MongoDB Atlas 连接字符串
   - 确认服务器 IP 在白名单中
   - 检查网络连接

3. **CORS 错误**
   - 确认前端域名在 CORS 配置中
   - 检查环境变量是否正确加载

4. **SSL 证书问题**
   - 检查域名 DNS 解析
   - 重新申请证书
   - 检查 Nginx 配置

### 紧急恢复
```bash
# 重启所有服务
pm2 restart all
sudo systemctl restart nginx

# 检查系统资源
free -h
df -h
```

## 📞 支持

如遇到部署问题，请检查：
1. 服务器日志
2. 应用日志
3. 网络连接
4. 配置文件

部署完成后，您的后端将在 `https://your-domain.com` 提供 API 服务。