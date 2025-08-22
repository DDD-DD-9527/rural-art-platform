# 快速部署指南

## 概述

这是一个简化的部署指南，帮助你快速将乡村艺术平台部署到生产环境。

**特别说明**：本指南已适配宝塔面板环境，Nginx配置通过宝塔面板图形界面完成。

## 部署架构

- **前端**：Vercel（自动部署）
- **后端**：阿里云服务器（Alibaba Cloud Linux 3 + 宝塔面板）
- **数据库**：MongoDB Atlas
- **Web服务器**：Nginx（通过宝塔面板管理）

## 系统要求

- **操作系统**：Alibaba Cloud Linux 3
- **包管理器**：yum
- **防火墙**：firewalld
- **服务管理**：systemctl

## 第一步：准备云服务器

### 1.1 购买阿里云ECS服务器

1. 登录 [阿里云控制台](https://ecs.console.aliyun.com)
2. 创建实例：
   - **配置**：2核4GB， Alibaba Cloud Linux 3 
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
# 更新系统（Alibaba Cloud Linux 3）
sudo yum update -y
- 已完成
# 验证系统版本
cat /etc/os-release

- [root@iZwz95dn36t5ch0garyo7zZ ~]# cat /etc/os-release
NAME="Alibaba Cloud Linux"
VERSION="3 (OpenAnolis Edition)"
ID="alinux"
ID_LIKE="rhel fedora centos anolis"
VERSION_ID="3"
VARIANT="OpenAnolis Edition"
VARIANT_ID="openanolis"
ALINUX_MINOR_ID="2104"
ALINUX_UPDATE_ID="12"
PLATFORM_ID="platform:al8"
PRETTY_NAME="Alibaba Cloud Linux 3.2104 U12 (OpenAnolis Edition)"
ANSI_COLOR="0;31"
HOME_URL="https://www.aliyun.com/"
[root@iZwz95dn36t5ch0garyo7zZ ~]# ^C
[root@iZwz95dn36t5ch0garyo7zZ ~]# 


# 安装Node.js 24.5

# 验证Node.js安装
node --version
npm --version

[root@iZwz95dn36t5ch0garyo7zZ ~]# node --version
v24.5.0

[root@iZwz95dn36t5ch0garyo7zZ ~]# npm -v
npm warn Unknown global config "--init.module". This will stop working in the next major version of npm.
11.5.1


# 安装PM2
sudo npm install -g pm2

# 验证PM2安装
pm2 --version

[root@iZwz95dn36t5ch0garyo7zZ ~]# pm2  --version

                        -------------

__/\\\\\\\\\\\\\____/\\\\____________/\\\\____/\\\\\\\\\_____
 _\/\\\/////////\\\_\/\\\\\\________/\\\\\\__/\\\///////\\\___
  _\/\\\_______\/\\\_\/\\\//\\\____/\\\//\\\_\///______\//\\\__
   _\/\\\\\\\\\\\\\/__\/\\\\///\\\/\\\/_\/\\\___________/\\\/___
    _\/\\\/////////____\/\\\__\///\\\/___\/\\\________/\\\//_____
     _\/\\\_____________\/\\\____\///_____\/\\\_____/\\\//________
      _\/\\\_____________\/\\\_____________\/\\\___/\\\/___________
       _\/\\\_____________\/\\\_____________\/\\\__/\\\\\\\\\\\\\\\_
        _\///______________\///______________\///__\///////////////__


                          Runtime Edition

        PM2 is a Production Process Manager for Node.js applications
                     with a built-in Load Balancer.

                Start and Daemonize any application:
                $ pm2 start app.js

                Load Balance 4 instances of api.js:
                $ pm2 start api.js -i 4

                Monitor in production:
                $ pm2 monitor

                Make pm2 auto-boot at server restart:
                $ pm2 startup

                To go further checkout:
                http://pm2.io/


                        -------------

[PM2] Spawning PM2 daemon with pm2_home=/root/.pm2
[PM2] PM2 Successfully daemonized
6.0.8
[root@iZwz95dn36t5ch0garyo7zZ ~]# 

# 安装Nginx
sudo yum install -y nginx

# 验证Nginx安装
nginx -v

[root@iZwz95dn36t5ch0garyo7zZ ~]# nginx -v
nginx version: nginx/1.26.1
[root@iZwz95dn36t5ch0garyo7zZ ~]# ^C

nginx是用了linux宝塔里面的插件，所以需要在宝塔里面开启nginx ,使用方向代理就可以了


# 启动服务
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证服务状态
sudo systemctl status nginx
```

### 2.2 部署应用代码


- 直接通过下载包下载了对应分支的代码
- [root@iZwz95dn36t5ch0garyo7zZ ~]# cd /www/wwwroot/default/cuddly-spork-vercel-deploy/ 
[root@iZwz95dn36t5ch0garyo7zZ cuddly-spork-vercel-deploy]# cd backend/
[root@iZwz95dn36t5ch0garyo7zZ backend]# 
# 安装后端依赖
cd backend
sudo npm install --production

# 验证依赖安装
ls -la node_modules/ | head -5
npm list --depth=0
```

[root@iZwz95dn36t5ch0garyo7zZ backend]# sudo npm install --production
npm warn config production Use `--omit=dev` instead.
npm warn Unknown global config "--init.module". This will stop working in the next major version of npm.


added 23 packages, removed 20 packages, and audited 165 packages in 11s

41 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
[root@iZwz95dn36t5ch0garyo7zZ backend]# 
[root@iZwz95dn36t5ch0garyo7zZ backend]# ls -la node_modules/ | head -5
total 644
drwxr-xr-x 136 www  www  12288 Aug 22 20:23 .
drwxr-xr-x   7 www  www   4096 Aug 22 19:35 ..
drwxr-xr-x   2 www  www   4096 Aug 22 19:35 accepts
drwxr-xr-x   4 www  www   4096 Aug 22 19:35 append-field
[root@iZwz95dn36t5ch0garyo7zZ backend]# npm list --depth=0

### 2.3 配置环境变量

创建 `.env` 文件：

```bash
# 创建.env文件
sudo nano /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/.env

# 验证.env文件创建（创建后执行）
ls -la /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/.env
cat /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/.env
```

添加以下内容（**⚠️ 重要：必须替换为实际值，特别是JWT_SECRET必须生成唯一的强密码**）：

```bash
NODE_ENV=production
PORT=3001

# MongoDB Atlas连接字符串
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rural-art-platform

# JWT密钥（生成强密码，至少32位随机字符串）
# 可以使用以下命令生成：openssl rand -base64 32
JWT_SECRET=AbCdEf123456789aBcDeF987654321XyZ1234567890AbCdEf

# CORS配置（添加Vercel域名和实际域名）
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://rural-art-platform-f3b6855u7-sidewalks-projects.vercel.app,https://ai-future-rural-art.top
```




### 2.4 启动应用

#### 2.4.1 配置 PM2 环境变量（重要）

如果遇到 `pm2: command not found` 错误，需要配置环境变量：

```bash
# 方法一：创建软链接（推荐）
sudo ln -sf /www/server/nodejs/v24.5.0/bin/pm2 /usr/local/bin/pm2
sudo ln -sf /www/server/nodejs/v24.5.0/bin/node /usr/local/bin/node
sudo ln -sf /www/server/nodejs/v24.5.0/bin/npm /usr/local/bin/npm

# 验证 PM2 是否可用
pm2 --version

# 方法二：直接使用完整路径（如果方法一不行）
# 使用完整路径启动：/www/server/nodejs/v24.5.0/bin/pm2
```

#### 2.4.2 启动应用

```bash
# 使用PM2启动（注意：路径已更新为实际部署路径）
cd /www/wwwroot/default/cuddly-spork-vercel-deploy/backend

# 验证server.js文件存在
ls -la server.js

# 启动应用
pm2 start server.js --name rural-art-backend

# 如果上面命令失败，使用完整路径
# /www/server/nodejs/v24.5.0/bin/pm2 start server.js --name rural-art-backend

# 验证应用启动
pm2 status
pm2 logs rural-art-backend --lines 10

# 保存PM2配置
pm2 save
pm2 startup

# 验证端口监听
sudo netstat -tlnp | grep :3001

# 测试API健康检查
curl http://localhost:3001/health
```

## 第三步：配置Nginx反向代理（宝塔面板）

### 3.1 通过宝塔面板配置反向代理

由于您使用的是宝塔面板，请按以下步骤配置：

#### 方法一：创建新站点（推荐）

1. **登录宝塔面板**
   - 访问：`http://your-server-ip:8888`
   - 使用宝塔账号密码登录

2. **创建站点**
   - 点击「网站」→「添加站点」
   - 域名：填入您的域名（如：`ai-future-rural-art.top`）
   - 根目录：`/www/wwwroot/default/cuddly-spork-vercel-deploy`
   - PHP版本：选择「纯静态」
   - 点击「提交」

3. **配置反向代理**
   - 在站点列表中找到刚创建的站点
   - 点击「设置」→「反向代理」
   - 点击「添加反向代理」
   - 配置如下：
     ```
     代理名称：rural-art-api
     目标URL：http://127.0.0.1:3001
     发送域名：$host
     代理目录：/api
     ```
   - 点击「提交」

4. **配置静态文件访问**
   - 在同一站点设置中，点击「配置文件」
   - 在 `server` 块中添加以下配置：
   ```nginx
   # 静态文件访问
   location /uploads/ {
       alias /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/uploads/;
       add_header Access-Control-Allow-Origin "*";
   }
   ```
   - 点击「保存」

#### 方法二：修改默认站点

如果您想使用默认站点，可以：

1. **进入默认站点设置**
   - 点击「网站」→找到默认站点→「设置」

2. **添加反向代理**
   - 点击「反向代理」→「添加反向代理」
   - 配置同上

### 3.2 验证配置

```bash
# 检查Nginx状态
sudo systemctl status nginx

# 验证端口监听
sudo netstat -tlnp | grep :80

# 测试API代理（替换为您的域名或IP）
curl -I http://your-domain.com/api/health
# 或使用IP测试
curl -I http://your-server-ip/api/health

# 测试静态文件访问
curl -I http://your-domain.com/uploads/
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
sudo nano /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/.env

# 验证.env文件更新
cat /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/.env | grep MONGODB_URI

# 重启应用
sudo pm2 restart rural-art-backend

# 验证应用重启和数据库连接
sudo pm2 status
sudo pm2 logs rural-art-backend --lines 20

# 测试数据库连接
curl http://localhost:3001/api/health
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

### 5.3 获取Vercel域名

部署完成后，在Vercel控制台获取项目域名：

**方法1：在Vercel Dashboard中查看**
1. 登录 [vercel.com](https://vercel.com)
2. 点击你的项目名称进入项目页面
3. 在项目概览页面顶部，可以看到 **Visit** 按钮旁边的域名
4. 或者在页面中找到 **Domains** 卡片，显示所有域名
5. 复制主域名（通常是 `https://项目名-随机字符.vercel.app` 格式）

**方法2：在部署日志中查看**
1. 部署完成后，Vercel会显示 "✅ Preview: https://your-app-xxx.vercel.app"
2. 直接复制这个URL

**方法3：通过项目设置查看**
1. 在项目页面点击 "Settings" 标签
2. 选择 "Domains" 选项
3. 查看所有可用域名

### 5.4 更新CORS配置

获取到Vercel域名后（如：`https://rural-art-platform-xxx.vercel.app`）

更新服务器CORS配置：

```bash
# 编辑环境变量
sudo nano /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/.env

# 更新CORS_ALLOWED_ORIGINS，添加Vercel域名
# CORS_ALLOWED_ORIGINS=https://rural-art-platform-xxx.vercel.app,http://localhost:5173

# 验证CORS配置更新
cat /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/.env | grep CORS_ALLOWED_ORIGINS

# 重启应用
sudo pm2 restart rural-art-backend

# 验证应用重启
sudo pm2 status
sudo pm2 logs rural-art-backend --lines 10

# 测试CORS配置
curl -H "Origin: https://rural-art-platform-xxx.vercel.app" -I http://localhost:3001/api/health
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
# 检查防火墙（Alibaba Cloud Linux 3使用firewalld）
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports

# 检查应用状态
sudo pm2 status

# 查看错误日志
sudo pm2 logs rural-art-backend --lines 50

# 检查端口占用
sudo netstat -tlnp | grep :3001

# 检查进程
ps aux | grep node

# 测试本地API
curl http://localhost:3001/api/health
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
pm2 status
# 如果pm2命令不可用：/www/server/nodejs/v24.5.0/bin/pm2 status

# 重启应用
pm2 restart rural-art-backend
# 如果pm2命令不可用：/www/server/nodejs/v24.5.0/bin/pm2 restart rural-art-backend

# 查看日志
pm2 logs rural-art-backend
# 如果pm2命令不可用：/www/server/nodejs/v24.5.0/bin/pm2 logs rural-art-backend

# 重启Nginx（通过宝塔面板或命令行）
# 宝塔面板：软件商店 -> Nginx -> 重启
# 命令行：sudo systemctl restart nginx

# 检查端口占用
sudo netstat -tlnp | grep :3001

# 更新代码
cd /www/wwwroot/default/cuddly-spork-vercel-deploy
sudo git pull origin main
cd backend
sudo npm install --production
pm2 restart rural-art-backend
# 如果pm2命令不可用：/www/server/nodejs/v24.5.0/bin/pm2 restart rural-art-backend

# 验证更新
git log --oneline -5
pm2 logs rural-art-backend --lines 10
# 如果pm2命令不可用：/www/server/nodejs/v24.5.0/bin/pm2 logs rural-art-backend --lines 10
```

## 故障排除

### PM2 环境变量问题

**问题**：`pm2: command not found` 或 `sudo: pm2: command not found`

**解决方案**：
```bash
# 1. 创建软链接（推荐方法）
sudo ln -sf /www/server/nodejs/v22.18.0/bin/pm2 /usr/local/bin/pm2
sudo ln -sf /www/server/nodejs/v22.18.0/bin/node /usr/local/bin/node
sudo ln -sf /www/server/nodejs/v22.18.0/bin/npm /usr/local/bin/npm

# 2. 验证配置
pm2 --version
node --version
npm --version

# 3. 如果软链接不工作，直接使用完整路径
/www/server/nodejs/v22.18.0/bin/pm2 start server.js --name rural-art-backend
```

### PM2 脚本重复启动问题

**问题**：`Script already launched, add -f option to force re-execution`

**解决方案**：
```bash
# 方法一：重启已存在的应用（推荐）
pm2 restart rural-art-backend
# 如果pm2命令不可用：
/www/server/nodejs/v22.18.0/bin/pm2 restart rural-art-backend

# 方法二：删除后重新启动
pm2 delete rural-art-backend
pm2 start server.js --name rural-art-backend

# 方法三：强制重新执行
pm2 start server.js --name rural-art-backend -f

# 查看当前运行的应用
pm2 list
```

### 其他常见问题

**问题**：端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep :3000
# 杀死占用进程
sudo kill -9 <PID>
```

**问题**：MongoDB 连接失败
```bash
# 检查环境变量
cat /www/wwwroot/default/cuddly-spork-vercel-deploy/backend/.env
# 测试连接
node -e "console.log(process.env.MONGODB_URI)"
```

**问题**：Nginx 配置错误
- 通过宝塔面板检查站点配置
- 查看 Nginx 错误日志：`tail -f /www/wwwlogs/nginx_error.log`

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