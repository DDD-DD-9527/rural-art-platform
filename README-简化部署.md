# 乡村艺术学习平台 - 简化部署指南

## 🚀 快速开始

本项目已经过优化，提供了简化的部署方案，移除了复杂的安全验证，确保系统可以正常运行。

### 系统要求

- **服务器**: 阿里云ECS (2核4G，推荐)
- **操作系统**: CentOS 7+ 或 Ubuntu 18+
- **域名**: ai-future-rural-art.top (已配置)
- **Docker**: 自动安装
- **宝塔面板**: 自动安装

### 一键部署

```bash
# 1. SSH连接到服务器
ssh root@your-server-ip

# 2. 执行一键部署
wget -O deploy-quick.sh https://raw.githubusercontent.com/your-repo/rural-art-platform/main/scripts/deploy-quick.sh
chmod +x deploy-quick.sh
./deploy-quick.sh
```

### 本地开发部署

如果您在本地Windows环境下开发，可以使用以下命令：

```bash
# Windows环境
deploy-simple.bat start

# Linux/Mac环境
./deploy-simple.sh start
```

## 📋 部署文件说明

### 核心配置文件

- `docker-compose.simple.yml` - 简化的Docker Compose配置
- `nginx.simple.conf` - 简化的Nginx配置
- `deploy-simple.sh` - Linux/Mac部署脚本
- `deploy-simple.bat` - Windows部署脚本

### 环境配置

- `.env` - 前端环境变量
- `backend/.env` - 后端环境变量

## 🔧 配置修改

### 端口配置

已统一端口配置，避免冲突：

- **MongoDB**: 27017
- **后端API**: 3000
- **前端**: 80
- **Nginx代理**: 8080

### 数据库配置

```bash
# 默认MongoDB配置
MONGODB_URI=mongodb://admin:password123@mongodb:27017/rural-art-platform?authSource=admin
```

### 域名配置

```bash
# 生产环境域名
VITE_PRODUCTION_DOMAIN=https://ai-future-rural-art.top
```

## 🚀 部署命令

### Windows环境

```cmd
# 启动所有服务
deploy-simple.bat start

# 停止所有服务
deploy-simple.bat stop

# 重启所有服务
deploy-simple.bat restart

# 查看服务状态
deploy-simple.bat status

# 查看日志
deploy-simple.bat logs

# 清理资源
deploy-simple.bat cleanup
```

### Linux/Mac环境

```bash
# 启动所有服务
./deploy-simple.sh start

# 停止所有服务
./deploy-simple.sh stop

# 重启所有服务
./deploy-simple.sh restart

# 查看服务状态
./deploy-simple.sh status

# 查看日志
./deploy-simple.sh logs

# 清理资源
./deploy-simple.sh cleanup
```

## 🌐 访问地址

部署完成后，您可以通过以下地址访问系统：

- **前端应用**: http://localhost:80 或 https://ai-future-rural-art.top
- **后端API**: http://localhost:3000/api
- **Nginx代理**: http://localhost:8080
- **健康检查**: http://localhost:3000/api/health

## 🔍 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :80
   ```

2. **Docker服务未启动**
   ```bash
   # 启动Docker服务
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **权限问题**
   ```bash
   # 添加用户到docker组
   sudo usermod -aG docker $USER
   # 重新登录或执行
   newgrp docker
   ```

### 查看日志

```bash
# 查看所有服务日志
docker-compose -f docker-compose.simple.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.simple.yml logs -f backend
docker-compose -f docker-compose.simple.yml logs -f frontend
docker-compose -f docker-compose.simple.yml logs -f mongodb
```

## 📝 注意事项

1. **安全配置**: 当前配置已简化，生产环境建议加强安全配置
2. **数据备份**: 建议定期备份MongoDB数据
3. **SSL证书**: 生产环境建议配置HTTPS证书
4. **监控告警**: 建议配置服务监控和告警

## 🆘 技术支持

如果遇到问题，请：

1. 查看日志文件
2. 检查服务状态
3. 参考详细部署文档
4. 联系技术支持团队

---

**部署成功后，请及时修改默认密码和配置！**