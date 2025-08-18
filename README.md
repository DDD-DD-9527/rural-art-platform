# 乡村艺术平台 (Rural Art Platform)

一个专为乡村地区设计的艺术学习与创作平台，集成了AI智能助手，帮助用户学习传统艺术技能并进行创作分享。

## 🌟 项目特色

- **传统艺术学习**: 提供丰富的传统艺术课程，如剪纸、国画、书法等
- **AI智能助手**: 集成广州大学智能体平台和Coze智能体服务
- **创作分享**: 用户可以分享自己的艺术作品，与社区互动
- **移动优先**: 响应式设计，完美适配移动设备
- **容器化部署**: 支持Docker一键部署

## 🏗️ 技术架构

### 前端技术栈
- **Vue 3**: 现代化的前端框架
- **Vite**: 快速的构建工具
- **Tailwind CSS**: 实用优先的CSS框架
- **Pinia**: 状态管理

### 后端技术栈
- **Node.js**: 服务端运行环境
- **Express**: Web应用框架
- **MongoDB**: NoSQL数据库
- **Mongoose**: MongoDB对象建模
- **JWT**: 身份认证
- **Winston**: 日志管理

### AI服务集成
- **广州大学智能体平台**: 学习建议和对话服务
- **Coze智能体**: 图片处理和艺术创作辅助

## 📦 项目结构

```
rural-art-platform/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── middleware/     # 中间件
│   │   ├── services/       # 业务服务
│   │   └── utils/          # 工具函数
│   ├── Dockerfile          # 生产环境镜像
│   ├── Dockerfile.dev      # 开发环境镜像
│   └── package.json
├── src/                    # 前端源码
│   ├── components/         # Vue组件
│   ├── views/             # 页面组件
│   ├── stores/            # 状态管理
│   └── styles/            # 样式文件
├── public/                # 静态资源
├── docker-compose.yml     # 生产环境编排
├── docker-compose.dev.yml # 开发环境编排
├── deploy.sh             # 部署脚本
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (可选)

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd rural-art-platform
```

2. **安装前端依赖**
```bash
npm install
# 或使用 pnpm
pnpm install
```

3. **安装后端依赖**
```bash
cd backend
npm install
```

4. **配置环境变量**
```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库连接和API密钥
```

5. **启动MongoDB**
```bash
# 使用Docker启动MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:6.0
```

6. **启动后端服务**
```bash
cd backend
npm run dev
```

7. **启动前端服务**
```bash
# 在项目根目录
npm run dev
```

访问 http://localhost:5173 查看应用

### Docker部署

#### 开发环境

```bash
# 使用部署脚本
./deploy.sh dev up

# 或手动执行
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

#### 生产环境

```bash
# 配置生产环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件

# 部署
./deploy.sh prod up

# 或手动执行
docker-compose up -d
```

## 🔧 配置说明

### 环境变量

后端服务需要配置以下环境变量：

```env
# 基础配置
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/rural-art-platform

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI服务配置
GZHU_AGENT_API_URL=https://api.gzhu.edu.cn/agent
GZHU_AGENT_KEY=your-gzhu-agent-key
COZE_API_URL=https://api.coze.com/v1
COZE_API_KEY=your-coze-api-key
```

### AI服务配置

1. **广州大学智能体平台**
   - 申请API密钥
   - 配置 `GZHU_AGENT_API_URL` 和 `GZHU_AGENT_KEY`

2. **Coze智能体服务**
   - 创建智能体应用
   - 获取各个Bot ID
   - 配置相应的环境变量

## 📚 API文档

### 用户相关

- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

### 课程相关

- `GET /api/courses` - 获取课程列表
- `GET /api/courses/:id` - 获取课程详情
- `POST /api/courses` - 创建课程
- `PUT /api/courses/:id` - 更新课程

### AI服务

- `POST /api/ai/chat` - AI对话
- `POST /api/ai/learning-advice` - 获取学习建议
- `POST /api/ai/image-enhance` - 图片增强
- `POST /api/ai/style-transfer` - 风格转换

## 🛠️ 开发指南

### 代码规范

- 使用ESLint进行代码检查
- 遵循Vue 3 Composition API规范
- 后端使用Express最佳实践

### 提交规范

使用Conventional Commits规范：

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 数据库设计

主要集合：
- `users` - 用户信息
- `courses` - 课程数据
- `posts` - 用户作品
- `comments` - 评论数据
- `enrollments` - 报名记录
- `progress` - 学习进度

## 🔍 监控和日志

### 日志管理

- 使用Winston进行日志记录
- 日志文件存储在 `backend/logs/` 目录
- 支持不同级别的日志输出

### 健康检查

- 后端提供 `/health` 端点
- Docker容器内置健康检查
- 支持服务状态监控

## 🚀 部署脚本使用

```bash
# 查看帮助
./deploy.sh help

# 开发环境
./deploy.sh dev up      # 启动开发环境
./deploy.sh dev logs    # 查看日志
./deploy.sh dev down    # 停止服务

# 生产环境
./deploy.sh prod build  # 构建镜像
./deploy.sh prod up     # 启动服务
./deploy.sh prod status # 检查状态
./deploy.sh prod backup # 备份数据
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目维护者: [Your Name]
- 邮箱: [your.email@example.com]
- 项目地址: [https://github.com/your-username/rural-art-platform]

## 🙏 致谢

感谢以下开源项目和服务：

- Vue.js 团队
- Express.js 社区
- MongoDB 团队
- 广州大学智能体平台
- Coze智能体服务

---

**让艺术在乡村绽放，让传统在数字时代传承！** 🎨✨