# 乡村艺术平台 (Rural Art Platform)

一个专为乡村地区设计的全栈艺术学习与创作平台，集成AI智能助手、关卡式学习系统和社交互动功能，帮助用户学习传统艺术技能并进行创作分享。

## 🌟 项目特色

- **🎨 传统艺术学习**: 提供丰富的传统艺术课程，包括剪纸、国画、书法、瑶绣等民间工艺
- **🎮 关卡式学习**: 采用游戏化学习模式，积分奖励、成就解锁、技能树进阶
- **🤖 AI智能助手**: 集成广州大学智能体平台和Coze智能体，提供图像增强、风格转换、智能修复等AI工具
- **👥 社交创作分享**: 用户可以分享作品、关注其他创作者、评论互动
- **📱 移动优先设计**: 响应式UI设计，完美适配移动设备和桌面端
- **☁️ 云原生架构**: 采用MongoDB Atlas云数据库，Cloudflare隧道，Vercel前端部署

## 🏗️ 技术架构

### 前端技术栈
- **Vue 3** + **Composition API**: 现代化响应式前端框架
- **Vite 5**: 极速构建工具和开发服务器
- **Tailwind CSS**: 原子化CSS框架，快速响应式设计
- **Element Plus**: 企业级UI组件库
- **Pinia**: 轻量级状态管理
- **Pinia Persistedstate**: 状态持久化
- **Axios**: HTTP客户端，统一API调用
- **Heroicons**: 高质量SVG图标库
- **Lucide Vue**: 现代化图标组件

### 后端技术栈
- **Node.js 18+**: 高性能JavaScript运行时
- **Express 5**: Web应用框架
- **MongoDB Atlas**: 云端NoSQL数据库
- **Mongoose 8**: MongoDB对象建模和数据验证
- **JWT**: 安全的身份认证和授权
- **bcryptjs**: 密码加密和验证
- **express-validator**: 请求数据验证
- **multer**: 文件上传处理
- **sharp**: 高性能图像处理
- **helmet**: 安全头设置
- **cors**: 跨域资源共享
- **express-rate-limit**: API速率限制

### 部署和基础设施
- **前端部署**: Vercel (主域名 `ai-future-rural-art.top`)
- **后端部署**: Cloudflare隧道 (API域名 `api.ai-future-rural-art.top`)
- **数据库**: MongoDB Atlas 云数据库
- **CDN**: Cloudflare 全球加速
- **域名管理**: Cloudflare DNS
- **SSL证书**: 自动HTTPS加密

## 📦 项目结构

```
rural-art-platform/
├── 📁 backend/                      # Node.js 后端服务
│   ├── 📁 src/
│   │   ├── 📁 controllers/          # 业务逻辑控制器
│   │   │   ├── userController.js    # 用户管理 (注册/登录/资料)
│   │   │   ├── courseController.js  # 课程管理 (CRUD/报名/进度)
│   │   │   ├── postController.js    # 帖子管理 (社交分享)
│   │   │   ├── commentController.js # 评论系统
│   │   │   ├── socialController.js  # 社交功能 (关注/点赞)
│   │   │   ├── gamificationController.js # 游戏化系统
│   │   │   ├── pointsController.js  # 积分系统
│   │   │   ├── adminController.js   # 管理员功能
│   │   │   └── uploadController.js  # 文件上传
│   │   ├── 📁 models/              # Mongoose 数据模型
│   │   │   ├── User.js             # 用户模型 (用户信息/学习统计/技能进度)
│   │   │   ├── Course.js           # 课程模型 (课程内容/关卡设计)
│   │   │   ├── Post.js             # 帖子模型 (作品分享/讨论)
│   │   │   ├── Comment.js          # 评论模型 (多级评论系统)
│   │   │   ├── Enrollment.js       # 报名模型 (学习进度/成绩记录)
│   │   │   ├── PointsRecord.js     # 积分记录 (游戏化奖励系统)
│   │   │   ├── Follow.js           # 关注关系模型
│   │   │   └── Like.js             # 点赞关系模型
│   │   ├── 📁 routes/              # Express 路由定义
│   │   │   ├── userRoutes.js       # 用户相关路由
│   │   │   ├── courseRoutes.js     # 课程相关路由
│   │   │   ├── postRoutes.js       # 帖子相关路由
│   │   │   ├── socialRoutes.js     # 社交功能路由
│   │   │   ├── gamificationRoutes.js # 游戏化系统路由
│   │   │   └── adminRoutes.js      # 管理员路由
│   │   ├── 📁 middleware/          # Express 中间件
│   │   │   ├── auth.js             # JWT认证中间件
│   │   │   └── validate.js         # 数据验证中间件
│   │   ├── 📁 services/            # 业务服务层
│   │   │   ├── aiService.js        # AI服务集成
│   │   │   ├── PointsService.js    # 积分计算服务
│   │   │   ├── UnlockService.js    # 课程解锁服务
│   │   │   └── lessonUnlockService.js # 课时解锁逻辑
│   │   └── 📁 config/              # 配置文件
│   │       ├── database.js         # 数据库连接配置
│   │       └── constants.js        # 常量定义
│   ├── 📄 server.js                # Express 服务器入口
│   ├── 📄 package.json             # 后端依赖配置
│   └── 📄 .env                     # 环境变量配置
├── 📁 src/                         # Vue.js 前端源码
│   ├── 📁 views/                   # 页面组件
│   │   ├── 📁 admin/               # 管理员页面
│   │   │   ├── AdminDashboard.vue  # 管理员仪表盘
│   │   │   └── CourseManagementPage.vue # 课程管理
│   │   ├── 📁 create/              # AI创作工具页面
│   │   │   ├── EnhancePage.vue     # 图像增强
│   │   │   ├── StylePage.vue       # 风格转换
│   │   │   ├── GeneratePage.vue    # 图案生成
│   │   │   └── RepairPage.vue      # 智能修复
│   │   ├── HomePage.vue            # 首页
│   │   ├── CoursePage.vue          # 课程详情页
│   │   ├── CommunityPage.vue       # 社区动态
│   │   ├── ProfilePage.vue         # 个人资料
│   │   ├── LearningPage.vue        # 学习中心
│   │   └── AchievementsPage.vue    # 成就系统
│   ├── 📁 components/              # 可复用组件
│   │   ├── 📁 admin/               # 管理员组件
│   │   │   ├── CourseCreateModal.vue # 课程创建弹窗
│   │   │   └── CourseEditModal.vue   # 课程编辑弹窗
│   │   ├── AIAssistantFloat.vue    # AI助手浮动窗口
│   │   ├── GamifiedLearningPath.vue # 游戏化学习路径
│   │   ├── AchievementSystem.vue   # 成就系统组件
│   │   ├── CourseCard.vue          # 课程卡片
│   │   ├── PostCard.vue            # 帖子卡片
│   │   ├── CommentList.vue         # 评论列表
│   │   └── BottomNavigation.vue    # 底部导航
│   ├── 📁 stores/                  # Pinia 状态管理
│   │   ├── user.js                 # 用户状态管理
│   │   └── social.js               # 社交状态管理
│   ├── 📁 services/                # API 服务层
│   │   ├── api.js                  # 统一API调用管理
│   │   ├── postService.js          # 帖子服务
│   │   └── commentService.js       # 评论服务
│   ├── 📁 config/                  # 前端配置
│   │   └── constants.js            # 常量配置
│   └── 📄 main.js                  # Vue应用入口文件
├── 📁 public/                      # 静态资源
│   ├── 📄 placeholder-*.png/jpg    # 占位符图片
│   └── 📄 *.svg                    # SVG图标
├── 📄 vite.config.js               # Vite 构建配置
├── 📄 package.json                 # 前端依赖配置
├── 📄 tailwind.config.js           # Tailwind CSS 配置
├── 📄 vercel.json                  # Vercel 部署配置
└── 📄 README.md                    # 项目文档
```

## 🚀 快速开始

### 环境要求

- **Node.js 18+**: JavaScript运行时环境
- **MongoDB Atlas**: 云端MongoDB数据库 (无需本地安装)
- **Cloudflared**: Cloudflare隧道客户端 (生产环境)
- **Git**: 版本控制

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
# 创建环境变量文件 (基于项目实际配置)
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rural-art-platform
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
# AI服务配置 (可选)
GZHU_AGENT_API_URL=https://api.gzhu.edu.cn/agent
GZHU_AGENT_KEY=your-gzhu-agent-key
COZE_API_URL=https://api.coze.com/v1
COZE_API_KEY=your-coze-api-key
EOF
```

5. **启动后端服务**
```bash
cd backend
npm run dev
```

6. **启动前端服务**
```bash
# 在项目根目录
npm run dev
```

7. **访问应用**
- 前端开发服务器: http://localhost:5173
- 后端API服务器: http://localhost:3000
- API健康检查: http://localhost:3000/health

### 🌐 生产环境部署

本项目采用现代化云原生部署架构：

#### 当前生产环境架构
- **前端**: Vercel 自动部署 → `https://ai-future-rural-art.top`
- **后端**: Cloudflare 隧道 → `https://api.ai-future-rural-art.top`
- **数据库**: MongoDB Atlas 云数据库
- **CDN**: Cloudflare 全球加速

#### 🚀 快速部署 (推荐)

1. **前端部署到Vercel**
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel --prod

# 配置自定义域名 (在Vercel控制台)
# ai-future-rural-art.top → 项目域名
```

2. **后端通过Cloudflare隧道部署**
```bash
# 启动后端服务
cd backend && npm start

# 启动Cloudflare隧道 (参考CLOUDFLARE_TUNNEL_SETUP.md)
cd F:\cloidflared-install
.\cloudflared-windows-amd64.exe tunnel --config config.yml run rural-art-backend
```

#### 🐳 Docker部署 (备选方案)

```bash
# 开发环境
./deploy.sh dev up

# 生产环境
./deploy.sh prod up
```

## 🔧 配置说明

### 环境变量配置

#### 后端环境变量 (`backend/.env`)
```env
# 基础配置
NODE_ENV=production
PORT=3000

# MongoDB Atlas 云数据库
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rural-art-platform

# JWT认证配置
JWT_SECRET=your-super-secret-jwt-key-with-at-least-32-characters
JWT_EXPIRES_IN=7d

# AI服务配置 (可选)
GZHU_AGENT_API_URL=https://api.gzhu.edu.cn/agent
GZHU_AGENT_KEY=your-gzhu-agent-key
COZE_API_URL=https://api.coze.com/v1
COZE_API_KEY=your-coze-api-key

# 文件上传配置
UPLOAD_MAX_SIZE=10485760  # 10MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000  # 15分钟
RATE_LIMIT_MAX_REQUESTS=100  # 每15分钟最多100个请求
```

#### 前端环境变量 (自动配置)
```env
# 生产环境 - 通过vercel.json自动代理
VITE_API_BASE_URL=https://api.ai-future-rural-art.top

# 开发环境 - 通过vite.config.js代理
VITE_PROXY_TARGET=http://localhost:3000
```

### AI服务配置

1. **广州大学智能体平台**
   - 申请API密钥
   - 配置 `GZHU_AGENT_API_URL` 和 `GZHU_AGENT_KEY`

2. **Coze智能体服务**
   - 创建智能体应用
   - 获取各个Bot ID
   - 配置相应的环境变量

## 🎯 核心功能

### 🎓 关卡式学习系统
- **游戏化课程设计**: 每个课时都有积分奖励、解锁条件和成就系统
- **技能树进阶**: 艺术技能和数字技能双轨发展，可视化进度展示
- **智能解锁机制**: 基于前置课程完成度、积分要求、用户等级的多维度解锁
- **个性化学习路径**: 根据用户兴趣和能力推荐最适合的学习路径

### 🎨 传统艺术教学
- **瑶绣制作课程**: 详细的瑶族刺绣技艺教学，包含政府补贴申请指导
- **剪纸艺术**: 从基础花鸟图案到复杂构图的完整教学体系
- **国画技法**: 传统书画技巧，结合现代教学方法
- **民间工艺**: 涵盖陶艺、木工、纺织等多种传统手工艺

### 🤖 AI创作辅助工具
- **图像增强**: 提升作品质量，优化构图和色彩
- **风格转换**: 将现代作品转换为传统艺术风格
- **图案生成**: AI辅助生成传统图案和装饰元素
- **智能修复**: 修复旧照片、艺术品的损坏部分

### 👥 社交创作社区
- **作品分享**: 用户可以展示自己的艺术创作和学习成果
- **关注系统**: 关注感兴趣的创作者，获取最新作品动态
- **多级评论**: 支持对作品、课程的深度讨论和交流
- **点赞互动**: 表达对作品的喜爱和支持

### 📊 数据驱动管理
- **学习分析**: 详细的学习时长、进度、成绩统计
- **积分系统**: 多样化的积分获取方式和使用场景
- **成就徽章**: 学习里程碑记录和激励机制
- **管理仪表盘**: 实时监控平台运营数据和用户活跃度

## 📚 API接口文档

### 🧑‍💼 用户管理 (`/api/users`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `POST` | `/register` | 用户注册 | ❌ |
| `POST` | `/login` | 用户登录 | ❌ |
| `GET` | `/profile` | 获取当前用户信息 | ✅ |
| `PUT` | `/profile` | 更新用户资料 | ✅ |
| `PUT` | `/password` | 修改密码 | ✅ |
| `GET` | `/profile/:userId` | 获取指定用户信息 | ❌ |
| `PUT` | `/learning-stats` | 更新学习统计 | ✅ |
| `PUT` | `/skill-progress` | 更新技能进度 | ✅ |
| `POST` | `/achievements` | 添加成就 | ✅ |

### 📚 课程管理 (`/api/courses`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `GET` | `/` | 获取课程列表 | ❌ |
| `GET` | `/popular` | 获取热门课程 | ❌ |
| `GET` | `/recommended` | 获取推荐课程 | ❌ |
| `GET` | `/:courseId` | 获取课程详情 | ❌ |
| `POST` | `/` | 创建课程 | ✅ |
| `PUT` | `/:courseId` | 更新课程 | ✅ |
| `DELETE` | `/:courseId` | 删除课程 | ✅ |
| `PATCH` | `/:courseId/publish` | 发布课程 | ✅ |
| `PATCH` | `/:courseId/unpublish` | 取消发布 | ✅ |

### 🎯 学习进度 (`/api/courses`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `POST` | `/:courseId/enroll` | 报名课程 | ✅ |
| `PUT` | `/:courseId/progress` | 更新学习进度 | ✅ |
| `GET` | `/:courseId/progress` | 获取学习进度 | ✅ |
| `GET` | `/enrollments/my` | 我的课程报名 | ✅ |
| `GET` | `/:courseId/enrollments` | 课程学员列表 | ✅ |
| `GET` | `/:courseId/unlockable-lessons` | 可解锁课时 | ✅ |
| `POST` | `/:courseId/lessons/:lessonId/unlock` | 解锁课时 | ✅ |

### 📝 社交分享 (`/api/posts`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `GET` | `/` | 获取帖子列表 | ❌ |
| `GET` | `/:postId` | 获取帖子详情 | ❌ |
| `POST` | `/` | 创建帖子 | ✅ |
| `PUT` | `/:postId` | 更新帖子 | ✅ |
| `DELETE` | `/:postId` | 删除帖子 | ✅ |
| `POST` | `/:postId/like` | 点赞/取消点赞 | ✅ |
| `GET` | `/following` | 关注用户帖子 | ✅ |

### 💬 评论系统 (`/api/comments`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `GET` | `/` | 获取评论列表 | ❌ |
| `POST` | `/` | 创建评论 | ✅ |
| `GET` | `/my` | 我的评论 | ✅ |
| `GET` | `/:commentId` | 获取评论详情 | ❌ |
| `PUT` | `/:commentId` | 更新评论 | ✅ |
| `DELETE` | `/:commentId` | 删除评论 | ✅ |
| `POST` | `/:commentId/like` | 点赞评论 | ✅ |
| `POST` | `/:commentId/reply` | 回复评论 | ✅ |

### 👥 社交功能 (`/api/social`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `POST` | `/follow/:userId` | 关注用户 | ✅ |
| `DELETE` | `/follow/:userId` | 取消关注 | ✅ |
| `GET` | `/follow/status/:userId` | 关注状态 | ✅ |
| `GET` | `/following/:userId` | 关注列表 | ❌ |
| `GET` | `/followers/:userId` | 粉丝列表 | ❌ |
| `GET` | `/likes/received` | 收到的点赞 | ✅ |
| `GET` | `/likes/given` | 我的点赞记录 | ✅ |
| `GET` | `/stats/:userId` | 社交统计 | ❌ |

### 🎮 游戏化系统 (`/api/gamification`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `GET` | `/learning-path/:courseId?` | 获取学习路径 | ✅ |
| `POST` | `/unlock-course` | 解锁课程 | ✅ |
| `POST` | `/complete-lesson-time` | 完成课时学习 | ✅ |
| `GET` | `/points/stats/:userId?` | 积分统计 | ✅ |
| `GET` | `/points/history/:userId?` | 积分历史 | ✅ |
| `GET` | `/leaderboard` | 排行榜 | ❌ |
| `GET` | `/achievements/:userId?` | 成就列表 | ❌ |
| `POST` | `/unlock-achievement` | 解锁成就 | ✅ |
| `GET` | `/level/:userId?` | 用户等级 | ❌ |

### 📤 文件上传 (`/api/upload`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `POST` | `/image` | 上传图片 | ✅ |
| `POST` | `/avatar` | 上传头像 | ✅ |
| `POST` | `/course-material` | 上传课程材料 | ✅ |

### 🤖 AI工具 (`/api/ai-tools`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `POST` | `/enhance-image` | 图像增强 | ✅ |
| `POST` | `/style-transfer` | 风格转换 | ✅ |
| `POST` | `/pattern-generate` | 图案生成 | ✅ |
| `POST` | `/repair` | 智能修复 | ✅ |
| `GET` | `/history` | AI创作历史 | ✅ |

### 🛠️ 管理员功能 (`/api/admin`)

| 方法 | 路径 | 功能 | 认证 |
|------|------|------|------|
| `GET` | `/dashboard/stats` | 仪表盘统计 | ✅ (Admin) |
| `GET` | `/dashboard/overview` | 系统概览 | ✅ (Admin) |
| `GET` | `/users/search` | 搜索用户 | ✅ (Admin) |
| `GET` | `/users/stats` | 用户统计 | ✅ (Admin) |

### 📊 请求/响应格式

#### 统一响应格式
```javascript
{
  "success": true,           // 请求是否成功
  "message": "操作成功",      // 响应消息
  "data": { /* 数据内容 */ }, // 响应数据
  "pagination": {            // 分页信息 (列表接口)
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### 错误响应格式
```javascript
{
  "success": false,
  "message": "错误信息",
  "error": {
    "code": "ERROR_CODE",
    "details": "详细错误信息"
  }
}
```

#### 分页参数
```javascript
{
  "page": 1,              // 页码 (从1开始)
  "limit": 20,            // 每页条数
  "sortBy": "createdAt",  // 排序字段
  "sortOrder": "desc"     // 排序方向: asc/desc
}
```

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

## 🗄️ 数据库设计

### MongoDB 集合结构

#### 👥 users (用户集合)
```javascript
{
  userId: String,           // 唯一注册号
  username: String,         // 用户名
  password: String,         // 加密密码
  profile: {                // 个人资料
    nickname: String,       // 昵称
    avatar: String,         // 头像URL
    bio: String,           // 个人简介
    location: String,       // 地址
    gender: String         // 性别
  },
  role: String,            // 用户角色: user/creator/admin
  learningStats: {         // 学习统计
    totalCourses: Number,   // 总课程数
    completedCourses: Number, // 完成课程数
    totalLearningTime: Number, // 总学习时长
    totalPoints: Number,    // 总积分
    currentStreak: Number   // 连续学习天数
  },
  socialStats: {           // 社交统计
    followersCount: Number, // 粉丝数
    followingCount: Number, // 关注数
    likesReceived: Number   // 收到点赞数
  },
  skillProgress: {         // 技能进度
    artSkills: {           // 艺术技能
      progress: Number,     // 总进度百分比
      skills: [{           // 具体技能列表
        name: String,      // 技能名称
        level: String,     // 技能等级
        progress: Number   // 技能进度
      }]
    },
    digitalSkills: { /* 数字技能，结构同上 */ }
  },
  achievements: [{ /* 成就徽章数组 */ }]
}
```

#### 📚 courses (课程集合)
```javascript
{
  title: String,           // 课程标题
  description: String,     // 课程描述
  thumbnail: String,       // 封面图片
  creator: ObjectId,       // 创作者ID (ref: User)
  category: String,        // 课程分类
  difficulty: String,      // 难度等级: beginner/intermediate/advanced
  tags: [String],         // 标签数组
  lessons: [{             // 课时数组
    title: String,        // 课时标题
    description: String,  // 课时描述
    videoUrl: String,     // 视频URL
    duration: Number,     // 时长(分钟)
    order: Number,        // 排序
    pointsReward: {       // 积分奖励配置
      basePoints: Number, // 基础积分
      bonusConditions: {  // 奖励条件
        firstCompletion: { enabled: Boolean, points: Number },
        perfectScore: { enabled: Boolean, points: Number },
        speedBonus: { enabled: Boolean, points: Number }
      }
    },
    unlockConditions: {   // 解锁条件
      prerequisiteLessons: [ObjectId], // 前置课时
      pointsRequired: Number,          // 所需积分
      levelRequired: Number            // 所需等级
    }
  }],
  stats: {                // 课程统计
    enrolledCount: Number, // 报名人数
    completedCount: Number, // 完成人数
    viewCount: Number,     // 浏览数
    rating: {             // 评分
      average: Number,    // 平均分
      count: Number       // 评分人数
    }
  },
  settings: {             // 课程设置
    isPublished: Boolean, // 是否发布
    isFree: Boolean,     // 是否免费
    price: Number        // 价格
  }
}
```

#### 📝 posts (帖子集合)
```javascript
{
  content: String,         // 帖子内容
  author: ObjectId,        // 作者ID (ref: User)
  images: [{              // 图片数组
    url: String,          // 图片URL
    alt: String,          // 描述文字
    width: Number,        // 宽度
    height: Number        // 高度
  }],
  tags: [String],         // 标签
  type: String,           // 类型: share/question/showcase/tutorial
  relatedCourse: ObjectId, // 相关课程 (ref: Course)
  stats: {                // 互动统计
    viewCount: Number,    // 浏览数
    likeCount: Number,    // 点赞数
    commentCount: Number, // 评论数
    shareCount: Number    // 分享数
  },
  status: String,         // 状态: published/hidden/deleted
  visibility: String      // 可见性: public/followers/private
}
```

#### 💬 comments (评论集合)
```javascript
{
  content: String,         // 评论内容
  author: ObjectId,        // 作者ID (ref: User)
  targetType: String,      // 目标类型: Post/Course/Comment
  targetId: ObjectId,      // 目标ID
  parentComment: ObjectId, // 父评论ID (ref: Comment)
  level: Number,          // 回复层级 (最大3级)
  stats: {                // 统计数据
    likeCount: Number,    // 点赞数
    replyCount: Number    // 回复数
  },
  status: String          // 状态: published/hidden/deleted
}
```

#### 📊 enrollments (报名记录集合)
```javascript
{
  student: ObjectId,       // 学员ID (ref: User)
  course: ObjectId,        // 课程ID (ref: Course)
  status: String,          // 状态: enrolled/in-progress/completed/dropped
  progress: {              // 学习进度
    completedLessons: [{   // 已完成课时
      lessonId: ObjectId,  // 课时ID
      completedAt: Date,   // 完成时间
      timeSpent: Number,   // 学习时长
      performance: {       // 学习表现
        attempts: Number,  // 尝试次数
        score: Number,     // 分数 (0-100)
        pointsEarned: Number // 获得积分
      }
    }],
    percentage: Number,    // 完成百分比
    totalTimeSpent: Number, // 总学习时长
    currentLesson: ObjectId // 当前学习课时
  },
  enrolledAt: Date,        // 报名时间
  completedAt: Date        // 完成时间
}
```

#### 🎯 pointsrecords (积分记录集合)
```javascript
{
  user: ObjectId,          // 用户ID (ref: User)
  type: String,            // 积分类型: lesson_completion/course_completion/streak_bonus
  source: String,          // 积分来源: lesson/course/social/achievement
  points: Number,          // 积分数量 (可为负数)
  resourceId: ObjectId,    // 关联资源ID
  resourceType: String,    // 资源类型: Course/Lesson/Post
  description: String,     // 积分描述
  status: String,          // 状态: active/expired/revoked
  metadata: {              // 元数据
    courseId: ObjectId,    // 课程ID
    lessonId: ObjectId,    // 课时ID
    completionTime: Number, // 完成时间
    accuracy: Number,      // 准确率
    multiplier: Number     // 倍数
  }
}
```

#### 👥 follows (关注关系集合)
```javascript
{
  follower: ObjectId,      // 关注者ID (ref: User)
  following: ObjectId,     // 被关注者ID (ref: User)
  createdAt: Date         // 关注时间
}
```

#### ❤️ likes (点赞关系集合)
```javascript
{
  user: ObjectId,          // 用户ID (ref: User)
  targetType: String,      // 目标类型: Post/Comment
  targetId: ObjectId,      // 目标ID
  createdAt: Date         // 点赞时间
}
```

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

## 🌐 在线访问

- **🎨 在线体验**: [https://ai-future-rural-art.top](https://ai-future-rural-art.top)
- **📖 API文档**: [https://api.ai-future-rural-art.top/api](https://api.ai-future-rural-art.top/api)
- **💊 健康检查**: [https://api.ai-future-rural-art.top/health](https://api.ai-future-rural-art.top/health)

## 📊 项目状态

![前端部署状态](https://img.shields.io/badge/Frontend-Vercel%20Deployed-00C851?logo=vercel)
![后端状态](https://img.shields.io/badge/Backend-Cloudflare%20Tunnel-F38020?logo=cloudflare)
![数据库状态](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)

- **前端**: ✅ Vercel 自动部署
- **后端**: ✅ Cloudflare 隧道运行中  
- **数据库**: ✅ MongoDB Atlas 云数据库
- **域名**: ✅ Cloudflare DNS + SSL

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献
1. **Fork** 本仓库
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启 Pull Request**

### 贡献类型
- 🐛 **Bug 修复**: 发现并修复平台问题
- ✨ **新功能**: 添加有用的新特性
- 📚 **文档改进**: 完善项目文档
- 🎨 **UI/UX 优化**: 改进用户界面和体验
- 🧪 **测试**: 添加或改进测试用例

## 📄 许可证

本项目采用 **MIT许可证** - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢与依赖

### 核心技术框架
- **[Vue.js](https://vuejs.org/)** - 渐进式前端框架
- **[Express.js](https://expressjs.com/)** - 快速、灵活的Node.js Web框架
- **[MongoDB](https://www.mongodb.com/)** - 现代化文档数据库
- **[Mongoose](https://mongoosejs.com/)** - 优雅的MongoDB对象建模

### 前端生态
- **[Vite](https://vitejs.dev/)** - 极速前端构建工具
- **[Tailwind CSS](https://tailwindcss.com/)** - 实用优先的CSS框架
- **[Element Plus](https://element-plus.org/)** - Vue 3组件库
- **[Pinia](https://pinia.vuejs.org/)** - Vue 状态管理

### 部署和基础设施
- **[Vercel](https://vercel.com/)** - 前端部署平台
- **[Cloudflare](https://www.cloudflare.com/)** - 网络安全和性能服务
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - 云数据库服务

### AI服务提供商
- **广州大学智能体平台** - 教育AI服务支持
- **Coze智能体服务** - AI创作工具支持

### 特别感谢
感谢所有为乡村艺术传承和数字化教育贡献力量的开发者、艺术家和教育工作者！

---

<div align="center">

**🎨 让艺术在乡村绽放，让传统在数字时代传承！ ✨**

*Rural Art Platform - Bridging Traditional Arts and Digital Innovation*

</div>