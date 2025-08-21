# 乡村艺术平台 - 宝塔面板部署指南

## 概述

本指南专门针对使用宝塔面板的用户，提供了完整的部署解决方案。支持两种代码获取方式：

1. **Git拉取**：直接从代码仓库拉取最新代码（推荐）
2. **压缩包上传**：手动上传项目压缩包到服务器

## 前置要求

### 服务器环境
- 阿里云ECS或其他云服务器
- CentOS 7+、Ubuntu 18+、或Windows Server
- 至少2GB内存，20GB硬盘空间

### 软件要求
- 宝塔面板（已安装）
- Docker 和 Docker Compose
- Node.js 18+ 和 npm
- Git（仅Git拉取方式需要）

## 快速开始

### 方式一：一键部署（推荐）

1. **下载部署脚本**
   ```bash
   # Linux环境
   wget https://raw.githubusercontent.com/your-repo/rural-art-platform/main/deploy-baota.sh
   chmod +x deploy-baota.sh
   
   # Windows环境
   curl -O https://raw.githubusercontent.com/your-repo/rural-art-platform/main/deploy-baota.bat
   ```

2. **运行部署脚本**
   ```bash
   # Linux环境
   ./deploy-baota.sh
   
   # Windows环境
   .\deploy-baota.bat
   ```

3. **按提示操作**
   - 选择代码获取方式（Git拉取或压缩包上传）
   - 输入必要的配置信息
   - 等待自动部署完成

### 方式二：手动部署

如果自动部署遇到问题，可以按照以下步骤手动部署：

## 详细部署步骤

### 1. 环境准备

#### 1.1 安装宝塔面板

如果还未安装宝塔面板，请先安装：

```bash
# CentOS/RHEL
wget -O install.sh http://download.bt.cn/install/install_6.0.sh && sh install.sh

# Ubuntu/Debian
wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

#### 1.2 安装必要软件

在宝塔面板中安装以下软件：

1. **Docker**
   - 进入宝塔面板 → 软件商店
   - 搜索并安装 "Docker管理器"
   - 启动Docker服务

2. **Node.js**
   - 进入宝塔面板 → 软件商店
   - 搜索并安装 "Node.js版本管理器"
   - 安装Node.js 18+版本

3. **Git**（可选）
   ```bash
   # CentOS/RHEL
   yum install -y git
   
   # Ubuntu/Debian
   apt-get update && apt-get install -y git
   ```

### 2. 项目部署

#### 2.1 创建网站

1. 登录宝塔面板
2. 进入 "网站" → "添加站点"
3. 域名填写：`ai-future-rural-art.top`
4. 根目录：`/www/wwwroot/ai-future-rural-art.top`
5. 创建数据库：选择MySQL（可选，我们使用MongoDB）

#### 2.2 获取项目代码

**方式A：Git拉取**

```bash
# 进入网站根目录
cd /www/wwwroot/ai-future-rural-art.top

# 克隆项目代码
git clone -b develop https://github.com/your-repo/rural-art-platform.git .

# 或者克隆到临时目录再移动
git clone -b develop https://github.com/your-repo/rural-art-platform.git temp
mv temp/* .
rmdir temp
```

**方式B：压缩包上传**

1. 将项目代码打包为 `.zip` 文件
2. 在宝塔面板中进入 "文件" → 导航到 `/www/wwwroot/ai-future-rural-art.top/`
3. 上传压缩包并解压
4. 确保所有文件都在根目录下

#### 2.3 配置环境变量

创建前端环境配置文件 `.env`：

```env
# 前端配置
VITE_DEV_SERVER_PORT=5713
VITE_API_BASE_URL=http://localhost:3000/api
VITE_PRODUCTION_DOMAIN=https://ai-future-rural-art.top
```

创建后端环境配置文件 `backend/.env`：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
MONGODB_URI=mongodb://admin:password123@mongodb:27017/rural-art-platform?authSource=admin

# JWT配置
JWT_SECRET=your-production-jwt-secret-key-change-this
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760

# AI服务配置（可选）
# OPENAI_API_KEY=your-openai-api-key
# OPENAI_BASE_URL=https://api.openai.com/v1
```

#### 2.4 安装依赖

```bash
# 进入项目目录
cd /www/wwwroot/ai-future-rural-art.top

# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

#### 2.5 构建项目

```bash
# 构建前端项目
npm run build
```

#### 2.6 启动Docker服务

```bash
# 停止现有服务（如果有）
docker-compose -f docker-compose.simple.yml down

# 构建并启动服务
docker-compose -f docker-compose.simple.yml up -d --build
```

### 3. 配置Nginx

#### 3.1 在宝塔面板中配置

1. 进入 "网站" → 找到你的站点 → "设置"
2. 点击 "配置文件"
3. 替换为以下配置：

```nginx
server {
    listen 80;
    server_name ai-future-rural-art.top;
    
    # 重定向到HTTPS（如果配置了SSL）
    # return 301 https://$server_name$request_uri;
    
    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # 静态文件
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### 3.2 重启Nginx

在宝塔面板中重启Nginx服务。

### 4. 配置防火墙

#### 4.1 宝塔面板防火墙

1. 进入 "安全" → "防火墙"
2. 添加以下端口规则：
   - 端口：80，协议：TCP，说明：HTTP
   - 端口：443，协议：TCP，说明：HTTPS
   - 端口：3000，协议：TCP，说明：API（可选）

#### 4.2 系统防火墙

```bash
# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Ubuntu/Debian (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
```

### 5. SSL证书配置（推荐）

#### 5.1 申请SSL证书

1. 在宝塔面板中进入 "网站" → 找到你的站点 → "设置"
2. 点击 "SSL"
3. 选择 "Let's Encrypt" 免费证书
4. 点击 "申请"

#### 5.2 强制HTTPS

证书申请成功后，开启 "强制HTTPS" 选项。

## 验证部署

### 检查服务状态

```bash
# 检查Docker容器状态
docker-compose -f docker-compose.simple.yml ps

# 检查服务日志
docker-compose -f docker-compose.simple.yml logs -f
```

### 访问测试

- **前端应用**：http://ai-future-rural-art.top
- **后端API**：http://ai-future-rural-art.top/api/health
- **API文档**：http://ai-future-rural-art.top/api/docs（如果配置了）

## 常用管理命令

### 服务管理

```bash
# 查看服务状态
docker-compose -f docker-compose.simple.yml ps

# 启动服务
docker-compose -f docker-compose.simple.yml up -d

# 停止服务
docker-compose -f docker-compose.simple.yml down

# 重启服务
docker-compose -f docker-compose.simple.yml restart

# 重新构建并启动
docker-compose -f docker-compose.simple.yml up -d --build

# 查看日志
docker-compose -f docker-compose.simple.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.simple.yml logs -f backend
docker-compose -f docker-compose.simple.yml logs -f frontend
docker-compose -f docker-compose.simple.yml logs -f mongodb
```

### 代码更新

```bash
# Git方式更新
cd /www/wwwroot/ai-future-rural-art.top
git pull origin develop
npm install
cd backend && npm install && cd ..
npm run build
docker-compose -f docker-compose.simple.yml up -d --build

# 压缩包方式更新
# 1. 上传新的压缩包到宝塔面板
# 2. 备份现有文件
# 3. 解压新文件
# 4. 重新构建和启动服务
```

## 故障排除

### 常见问题

#### 1. Docker服务启动失败

**问题**：Docker容器无法启动

**解决方案**：
```bash
# 检查Docker状态
sudo systemctl status docker

# 启动Docker服务
sudo systemctl start docker

# 设置开机自启
sudo systemctl enable docker

# 检查Docker版本
docker --version
docker-compose --version
```

#### 2. 端口被占用

**问题**：80或3000端口被占用

**解决方案**：
```bash
# 检查端口占用
netstat -tlnp | grep :80
netstat -tlnp | grep :3000

# 停止占用端口的进程
sudo kill -9 <PID>

# 或者修改配置使用其他端口
```

#### 3. 权限问题

**问题**：文件权限不足

**解决方案**：
```bash
# 修改项目目录权限
sudo chown -R www:www /www/wwwroot/ai-future-rural-art.top/
sudo chmod -R 755 /www/wwwroot/ai-future-rural-art.top/

# 修改Docker socket权限
sudo usermod -aG docker $USER
# 重新登录生效
```

#### 4. 数据库连接失败

**问题**：无法连接MongoDB

**解决方案**：
```bash
# 检查MongoDB容器状态
docker logs rural-art-mongodb

# 重启MongoDB容器
docker-compose -f docker-compose.simple.yml restart mongodb

# 检查数据库连接
docker exec -it rural-art-mongodb mongosh
```

#### 5. 前端构建失败

**问题**：npm run build 失败

**解决方案**：
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本
node --version
npm --version
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose -f docker-compose.simple.yml logs

# 查看特定服务日志
docker-compose -f docker-compose.simple.yml logs backend
docker-compose -f docker-compose.simple.yml logs frontend
docker-compose -f docker-compose.simple.yml logs mongodb
docker-compose -f docker-compose.simple.yml logs nginx

# 实时查看日志
docker-compose -f docker-compose.simple.yml logs -f

# 查看最近的日志
docker-compose -f docker-compose.simple.yml logs --tail=100
```

## 性能优化

### 1. 服务器优化

```bash
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化内核参数
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65535" >> /etc/sysctl.conf
sysctl -p
```

### 2. Docker优化

```bash
# 清理未使用的镜像和容器
docker system prune -f

# 限制日志大小
# 在docker-compose.yml中添加：
# logging:
#   driver: "json-file"
#   options:
#     max-size: "10m"
#     max-file: "3"
```

### 3. 数据库优化

```bash
# 进入MongoDB容器
docker exec -it rural-art-mongodb mongosh

# 创建索引（在MongoDB shell中执行）
use rural-art-platform
db.users.createIndex({"email": 1})
db.posts.createIndex({"createdAt": -1})
db.courses.createIndex({"category": 1})
```

## 监控和维护

### 1. 系统监控

在宝塔面板中可以查看：
- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络流量

### 2. 服务监控

```bash
# 创建监控脚本
cat > /root/monitor.sh << 'EOF'
#!/bin/bash
echo "=== $(date) ==="
echo "Docker容器状态:"
docker-compose -f /www/wwwroot/ai-future-rural-art.top/docker-compose.simple.yml ps
echo "\n系统资源:"
free -h
df -h
echo "\n网络连接:"
netstat -tlnp | grep -E ':(80|443|3000)'
echo "\n==================\n"
EOF

chmod +x /root/monitor.sh

# 设置定时任务（每5分钟检查一次）
echo "*/5 * * * * /root/monitor.sh >> /var/log/rural-art-monitor.log" | crontab -
```

### 3. 备份策略

```bash
# 创建备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/www/backup/rural-art-platform"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份项目文件
tar -czf $BACKUP_DIR/project_$DATE.tar.gz -C /www/wwwroot ai-future-rural-art.top

# 备份数据库
docker exec rural-art-mongodb mongodump --out /tmp/backup_$DATE
docker cp rural-art-mongodb:/tmp/backup_$DATE $BACKUP_DIR/
docker exec rural-art-mongodb rm -rf /tmp/backup_$DATE

# 清理7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "backup_*" -mtime +7 -exec rm -rf {} \;

echo "备份完成: $DATE"
EOF

chmod +x /root/backup.sh

# 设置每日备份（凌晨2点）
echo "0 2 * * * /root/backup.sh >> /var/log/rural-art-backup.log" | crontab -
```

## 安全建议

### 1. 基础安全

- 修改默认的JWT密钥和数据库密码
- 启用HTTPS和强制重定向
- 定期更新系统和软件包
- 配置防火墙规则

### 2. 宝塔面板安全

- 修改宝塔面板默认端口
- 启用面板SSL
- 设置复杂的面板密码
- 启用二次验证

### 3. 应用安全

- 定期更新依赖包
- 配置CORS策略
- 实施API限流
- 监控异常访问

## 技术支持

如果在部署过程中遇到问题，可以通过以下方式获取帮助：

1. **查看日志**：首先查看详细的错误日志
2. **检查文档**：参考本文档的故障排除部分
3. **社区支持**：在项目GitHub页面提交Issue
4. **技术支持**：联系项目维护团队

---

**注意**：本文档会持续更新，请定期查看最新版本。