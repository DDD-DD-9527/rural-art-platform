# 快速部署指南

## 概述

这是一个简化的部署指南，帮助你快速将乡村艺术平台部署到生产环境。

## 部署架构

- **前端**：Vercel（自动部署）
- **后端**：阿里云服务器
- **数据库**：MongoDB Atlas

## 第一步：准备云服务器

### 1.1 购买阿里云ECS服务器

1. 登录 [阿里云控制台](https://ecs.console.aliyun.com)
2. 创建实例：
   - **配置**：2核4GB，Ubuntu 20.04
   - **安全组**：开放端口 22, 80, 443, 3001
   - **获取公网IP**：记录下来

### 1.2 连接服务器

```bash
# 使用SSH连接（替换为你的服务器IP）
ssh root@your-server-ip
```

## 第二步：服务器环境配置

### 2.1 一键安装脚本

在服务器上运行以下命令：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo apt install -y nginx

# 启动服务
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.2 部署应用代码

```bash
# 创建应用目录
sudo mkdir -p /var/www/rural-art-platform
cd /var/www/rural-art-platform

# 克隆代码（替换为你的仓库地址）
sudo git clone https://github.com/yourusername/rural-art-platform.git .

# 安装后端依赖
cd backend
sudo npm install --production
```

### 2.3 配置环境变量

创建 `.env` 文件：

```bash
sudo nano /var/www/rural-art-platform/backend/.env
```

添加以下内容（**替换为实际值**）：

```bash
NODE_ENV=production
PORT=3001

# MongoDB Atlas连接字符串
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rural-art-platform

# JWT密钥（生成强密码）
JWT_SECRET=your-super-secure-jwt-secret-key-here

# CORS配置（稍后添加Vercel域名）
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app
```

### 2.4 启动应用

```bash
# 使用PM2启动
cd /var/www/rural-art-platform/backend
sudo pm2 start server.js --name rural-art-backend
sudo pm2 save
sudo pm2 startup

# 检查状态
sudo pm2 status
```

## 第三步：配置Nginx反向代理

### 3.1 创建Nginx配置

```bash
sudo nano /etc/nginx/sites-available/rural-art-platform
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS头部
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
    }
    
    # 静态文件
    location /uploads/ {
        alias /var/www/rural-art-platform/backend/uploads/;
        add_header Access-Control-Allow-Origin "*";
    }
}
```

### 3.2 启用配置

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/rural-art-platform /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

## 第四步：MongoDB Atlas配置

### 4.1 创建数据库

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 注册账号并创建免费集群
3. 创建数据库用户
4. 设置网络访问（允许所有IP：0.0.0.0/0）
5. 获取连接字符串

### 4.2 更新环境变量

```bash
# 编辑.env文件，更新MONGODB_URI
sudo nano /var/www/rural-art-platform/backend/.env

# 重启应用
sudo pm2 restart rural-art-backend
```

## 第五步：Vercel前端部署

### 5.1 准备前端代码

在本地项目根目录创建 `.env.production`：

```bash
# 替换为你的服务器地址
VITE_API_BASE_URL=http://your-server-ip/api
```

推送代码到GitHub：

```bash
git add .
git commit -m "配置生产环境"
git push origin main
```

### 5.2 Vercel部署

1. 访问 [vercel.com](https://vercel.com)
2. 用GitHub账号登录
3. 点击 "New Project"
4. 导入你的 `rural-art-platform` 仓库
5. 配置：
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 添加环境变量：
   - Name: `VITE_API_BASE_URL`
   - Value: `http://your-server-ip/api`
7. 点击 "Deploy"

### 5.3 更新CORS配置

部署完成后，获取Vercel域名（如：`https://rural-art-platform-xxx.vercel.app`）

更新服务器CORS配置：

```bash
# 编辑环境变量
sudo nano /var/www/rural-art-platform/backend/.env

# 更新CORS_ALLOWED_ORIGINS，添加Vercel域名
CORS_ALLOWED_ORIGINS=https://rural-art-platform-xxx.vercel.app,http://localhost:5173

# 重启应用
sudo pm2 restart rural-art-backend
```

## 第六步：测试部署

### 6.1 后端测试

```bash
# 测试API健康检查
curl http://your-server-ip/api/health

# 检查应用日志
sudo pm2 logs rural-art-backend
```

### 6.2 前端测试

1. 访问Vercel提供的URL
2. 测试用户注册功能
3. 检查浏览器控制台是否有错误
4. 验证API请求是否正常

## 常见问题解决

### 问题1：API请求失败

**解决方案**：
```bash
# 检查防火墙
sudo ufw allow 3001

# 检查应用状态
sudo pm2 status

# 查看错误日志
sudo pm2 logs rural-art-backend --lines 50
```

### 问题2：CORS错误

**解决方案**：
1. 确认CORS_ALLOWED_ORIGINS包含Vercel域名
2. 检查Nginx CORS配置
3. 重启应用和Nginx

### 问题3：数据库连接失败

**解决方案**：
1. 检查MongoDB Atlas网络访问设置
2. 验证连接字符串格式
3. 确认用户名密码正确

## 快速命令参考

```bash
# 查看应用状态
sudo pm2 status

# 重启应用
sudo pm2 restart rural-art-backend

# 查看日志
sudo pm2 logs rural-art-backend

# 重启Nginx
sudo systemctl restart nginx

# 检查端口占用
sudo netstat -tlnp | grep :3001

# 更新代码
cd /var/www/rural-art-platform
sudo git pull origin main
cd backend
sudo npm install --production
sudo pm2 restart rural-art-backend
```

## 总结

完成以上步骤后，你的应用就成功部署了：

- ✅ 后端运行在阿里云服务器
- ✅ 前端部署在Vercel
- ✅ 数据库使用MongoDB Atlas
- ✅ API和前端可以正常通信

**重要提醒**：
1. 定期备份数据
2. 监控服务器资源使用情况
3. 及时更新安全补丁
4. 配置域名和SSL证书（可选）

如有问题，可以查看详细的 `PRODUCTION_DEPLOYMENT_GUIDE.md` 文档。