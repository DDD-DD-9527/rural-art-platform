#!/bin/bash

# 乡村艺术平台后端部署脚本
# 适用于 Ubuntu/CentOS 云服务器

set -e

echo "🚀 开始部署乡村艺术平台后端..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="rural-art-platform"
APP_DIR="/var/www/$APP_NAME"
NODE_VERSION="18"
PM2_APP_NAME="$APP_NAME-backend"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请使用 sudo 运行此脚本${NC}"
  exit 1
fi

echo -e "${YELLOW}步骤 1: 更新系统包...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}步骤 2: 安装必要软件...${NC}"
apt install -y curl wget git nginx ufw

echo -e "${YELLOW}步骤 3: 安装 Node.js ${NODE_VERSION}...${NC}"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

echo -e "${YELLOW}步骤 4: 安装 PM2...${NC}"
npm install -g pm2

echo -e "${YELLOW}步骤 5: 创建应用目录...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

echo -e "${YELLOW}步骤 6: 克隆代码仓库...${NC}"
echo "请手动上传代码到 $APP_DIR 目录"
echo "或者配置 Git 仓库地址后取消注释下面的命令:"
echo "# git clone <your-repo-url> ."

echo -e "${YELLOW}步骤 7: 安装依赖...${NC}"
if [ -f "package.json" ]; then
    npm install --production
else
    echo -e "${RED}未找到 package.json 文件，请确保代码已正确上传${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤 8: 配置环境变量...${NC}"
if [ ! -f ".env" ]; then
    cp .env.production .env
    echo -e "${YELLOW}请编辑 .env 文件配置生产环境变量:${NC}"
    echo "nano .env"
    echo "按任意键继续..."
    read -n 1
fi

echo -e "${YELLOW}步骤 9: 创建上传目录...${NC}"
mkdir -p uploads
chown -R www-data:www-data uploads
chmod 755 uploads

echo -e "${YELLOW}步骤 10: 配置 PM2...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
EOF

echo -e "${YELLOW}步骤 11: 创建日志目录...${NC}"
mkdir -p logs
chown -R www-data:www-data logs

echo -e "${YELLOW}步骤 12: 启动应用...${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${YELLOW}步骤 13: 配置防火墙...${NC}"
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
ufw --force enable

echo -e "${YELLOW}步骤 14: 配置 Nginx 反向代理...${NC}"
cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 配置 (需要配置证书)
    # ssl_certificate /path/to/certificate.crt;
    # ssl_certificate_key /path/to/private.key;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # 静态文件
    location /uploads/ {
        alias $APP_DIR/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 代理
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo -e "${GREEN}✅ 部署完成!${NC}"
echo -e "${GREEN}应用状态: ${NC}"
pm2 status
echo -e "${GREEN}应用日志: ${NC}"
echo "pm2 logs $PM2_APP_NAME"
echo -e "${GREEN}重启应用: ${NC}"
echo "pm2 restart $PM2_APP_NAME"
echo -e "${YELLOW}注意事项:${NC}"
echo "1. 请配置 .env 文件中的数据库连接和其他环境变量"
echo "2. 请配置 SSL 证书 (推荐使用 Let's Encrypt)"
echo "3. 请修改 Nginx 配置中的域名"
echo "4. 确保 MongoDB Atlas 白名单包含服务器 IP"
echo "5. 测试 API: curl http://localhost:3001/health"