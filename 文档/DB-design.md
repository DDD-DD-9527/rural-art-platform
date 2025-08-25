# 乡村艺术平台数据库设计文档

## 概述

本文档详细描述了乡村艺术平台的数据库设计，包括所有数据模型的结构、关系和索引设计。系统采用 MongoDB 作为主要数据库，使用 Mongoose ODM 进行数据建模。

## 数据模型概览

系统包含以下8个核心数据模型：

1. **User** - 用户模型
2. **Post** - 帖子模型
3. **Comment** - 评论模型
4. **Like** - 点赞模型
5. **Follow** - 关注模型
6. **Course** - 课程模型
7. **Enrollment** - 课程注册模型
8. **PointsRecord** - 积分记录模型

## 详细模型设计

### 1. User 模型 (用户)

**文件位置**: `backend/src/models/User.js`

#### 核心字段

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| username | String | 是 | 用户名 | 3-20字符，字母数字下划线中文 |
| email | String | 是 | 邮箱 | 唯一，邮箱格式验证 |
| password | String | 是 | 密码 | 6-128字符 |
| role | String | 否 | 角色 | user/admin/moderator，默认user |
| status | String | 否 | 状态 | active/inactive/banned，默认active |

#### 个人资料 (profile)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| nickname | String | 昵称 (2-20字符) |
| avatar | String | 头像URL |
| bio | String | 个人简介 (最多200字符) |
| location | String | 地理位置 |
| website | String | 个人网站 |
| birthDate | Date | 出生日期 |
| gender | String | 性别 (male/female/other) |
| phone | String | 手机号 |

#### 统计信息 (stats)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| postsCount | Number | 发帖数量 |
| followersCount | Number | 粉丝数量 |
| followingCount | Number | 关注数量 |
| likesReceived | Number | 收到点赞数 |
| points | Number | 积分 |
| level | Number | 等级 |

#### 设置 (settings)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| privacy | Object | 隐私设置 |
| notifications | Object | 通知设置 |
| theme | String | 主题偏好 |
| language | String | 语言偏好 |

#### 索引设计

- `{ username: 1 }` - 唯一索引
- `{ email: 1 }` - 唯一索引
- `{ "stats.points": -1 }` - 积分排序
- `{ "stats.level": -1 }` - 等级排序
- `{ "profile.location": 1 }` - 地理位置查询
- `{ createdAt: -1 }` - 注册时间排序
- `{ status: 1 }` - 状态筛选

### 2. Post 模型 (帖子)

**文件位置**: `backend/src/models/Post.js`

#### 核心字段

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| title | String | 是 | 标题 | 1-100字符 |
| content | String | 是 | 内容 | 1-5000字符 |
| author | ObjectId | 是 | 作者 | 引用User模型 |
| type | String | 否 | 类型 | article/image/video，默认article |
| status | String | 否 | 状态 | draft/published/archived，默认draft |

#### 媒体内容 (media)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| images | Array | 图片URL数组 (最多9张) |
| videos | Array | 视频信息数组 |
| thumbnail | String | 缩略图URL |

#### 分类和标签

| 字段名 | 类型 | 描述 |
|--------|------|------|
| category | String | 分类 (传统工艺/民俗文化等) |
| tags | Array | 标签数组 (最多10个) |
| location | Object | 地理位置信息 |

#### 统计信息 (stats)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| viewCount | Number | 浏览次数 |
| likeCount | Number | 点赞数 |
| commentCount | Number | 评论数 |
| shareCount | Number | 分享数 |

#### 索引设计

- `{ author: 1, createdAt: -1 }` - 作者时间复合索引
- `{ status: 1, createdAt: -1 }` - 状态时间复合索引
- `{ category: 1, status: 1 }` - 分类状态复合索引
- `{ tags: 1 }` - 标签索引
- `{ "stats.likeCount": -1 }` - 热度排序
- `{ "stats.viewCount": -1 }` - 浏览量排序
- `{ title: "text", content: "text", tags: "text" }` - 全文搜索

### 3. Comment 模型 (评论)

**文件位置**: `backend/src/models/Comment.js`

#### 核心字段

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| content | String | 是 | 评论内容 | 最多500字符 |
| author | ObjectId | 是 | 评论作者 | 引用User模型 |
| targetType | String | 是 | 目标类型 | Post/Course/Comment |
| targetId | ObjectId | 是 | 目标ID | 动态引用 |

#### 回复结构

| 字段名 | 类型 | 描述 |
|--------|------|------|
| parentComment | ObjectId | 父评论ID |
| rootComment | ObjectId | 根评论ID |
| level | Number | 回复层级 (最多3级) |
| mentions | Array | 提及的用户 |

#### 统计和状态

| 字段名 | 类型 | 描述 |
|--------|------|------|
| stats.likeCount | Number | 点赞数 |
| stats.replyCount | Number | 回复数 |
| status | String | 状态 (published/hidden/deleted) |
| isPinned | Boolean | 是否置顶 |

#### 索引设计

- `{ targetType: 1, targetId: 1, status: 1, createdAt: -1 }` - 目标内容评论查询
- `{ parentComment: 1, status: 1, createdAt: 1 }` - 回复查询
- `{ author: 1 }` - 作者索引
- `{ rootComment: 1 }` - 根评论索引
- `{ content: "text" }` - 内容搜索

### 4. Like 模型 (点赞)

**文件位置**: `backend/src/models/Like.js`

#### 核心字段

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| user | ObjectId | 是 | 点赞用户 |
| targetType | String | 是 | 目标类型 (Post/Comment/Course) |
| targetId | ObjectId | 是 | 目标ID |
| targetAuthor | ObjectId | 是 | 被点赞内容的作者 |

#### 索引设计

- `{ user: 1, targetType: 1, targetId: 1 }` - 唯一索引，防重复点赞
- `{ user: 1, createdAt: -1 }` - 用户点赞记录
- `{ targetAuthor: 1, createdAt: -1 }` - 收到点赞记录
- `{ targetType: 1, targetId: 1 }` - 特定内容点赞查询

### 5. Follow 模型 (关注)

**文件位置**: `backend/src/models/Follow.js`

#### 核心字段

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| follower | ObjectId | 是 | 关注者 |
| following | ObjectId | 是 | 被关注者 |
| status | String | 否 | 状态 (active/blocked) |

#### 索引设计

- `{ follower: 1, following: 1 }` - 唯一索引，防重复关注
- `{ follower: 1, createdAt: -1 }` - 关注列表
- `{ following: 1, createdAt: -1 }` - 粉丝列表
- `{ status: 1 }` - 状态筛选

### 6. Course 模型 (课程)

**文件位置**: `backend/src/models/Course.js`

#### 核心字段

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| title | String | 是 | 课程标题 | 1-100字符 |
| description | String | 是 | 课程描述 | 1-1000字符 |
| instructor | ObjectId | 是 | 讲师 | 引用User模型 |
| category | String | 是 | 课程分类 | 预定义分类 |
| level | String | 是 | 难度等级 | beginner/intermediate/advanced |
| status | String | 否 | 状态 | draft/published/archived |

#### 课程内容

| 字段名 | 类型 | 描述 |
|--------|------|------|
| content.overview | String | 课程概述 |
| content.objectives | Array | 学习目标 |
| content.requirements | Array | 前置要求 |
| content.syllabus | Array | 课程大纲 |

#### 媒体和定价

| 字段名 | 类型 | 描述 |
|--------|------|------|
| thumbnail | String | 课程缩略图 |
| images | Array | 课程图片 |
| videos | Array | 课程视频 |
| pricing.type | String | 定价类型 (free/paid) |
| pricing.amount | Number | 价格 |
| pricing.currency | String | 货币 |

#### 统计信息

| 字段名 | 类型 | 描述 |
|--------|------|------|
| stats.enrollmentCount | Number | 注册人数 |
| stats.completionCount | Number | 完成人数 |
| stats.averageRating | Number | 平均评分 |
| stats.reviewCount | Number | 评价数量 |

#### 索引设计

- `{ instructor: 1, createdAt: -1 }` - 讲师课程
- `{ category: 1, status: 1 }` - 分类筛选
- `{ level: 1, status: 1 }` - 难度筛选
- `{ "stats.averageRating": -1 }` - 评分排序
- `{ "stats.enrollmentCount": -1 }` - 热门排序
- `{ title: "text", description: "text" }` - 全文搜索

### 7. Enrollment 模型 (课程注册)

**文件位置**: `backend/src/models/Enrollment.js`

#### 核心字段

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| student | ObjectId | 是 | 学生 |
| course | ObjectId | 是 | 课程 |
| status | String | 否 | 状态 (enrolled/completed/dropped) |

#### 学习进度

| 字段名 | 类型 | 描述 |
|--------|------|------|
| progress.completedLessons | Array | 已完成课时 |
| progress.currentLesson | Number | 当前课时 |
| progress.completionPercentage | Number | 完成百分比 |
| progress.totalTimeSpent | Number | 总学习时间 |
| progress.lastAccessedAt | Date | 最后访问时间 |

#### 评价信息

| 字段名 | 类型 | 描述 |
|--------|------|------|
| rating.score | Number | 评分 (1-5) |
| rating.review | String | 评价内容 |
| rating.ratedAt | Date | 评价时间 |

#### 索引设计

- `{ student: 1, course: 1 }` - 唯一索引
- `{ student: 1, status: 1 }` - 学生课程状态
- `{ course: 1, status: 1 }` - 课程注册状态
- `{ "rating.score": 1 }` - 评分索引

### 8. PointsRecord 模型 (积分记录)

**文件位置**: `backend/src/models/PointsRecord.js`

#### 核心字段

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| user | ObjectId | 是 | 用户 |
| type | String | 是 | 积分类型 |
| amount | Number | 是 | 积分数量 |
| description | String | 是 | 描述 |

#### 积分类型

- `post_published` - 发布帖子
- `post_liked` - 帖子被点赞
- `comment_posted` - 发表评论
- `course_completed` - 完成课程
- `daily_login` - 每日登录
- `profile_completed` - 完善资料
- `first_follow` - 首次关注
- `achievement_unlocked` - 解锁成就
- `manual_adjustment` - 手动调整

#### 关联信息

| 字段名 | 类型 | 描述 |
|--------|------|------|
| relatedType | String | 关联类型 |
| relatedId | ObjectId | 关联ID |
| metadata | Object | 额外元数据 |

#### 索引设计

- `{ user: 1, createdAt: -1 }` - 用户积分记录
- `{ type: 1, createdAt: -1 }` - 积分类型统计
- `{ relatedType: 1, relatedId: 1 }` - 关联查询

## 数据关系图

```
User (用户)
├── Posts (1:N) - 发布的帖子
├── Comments (1:N) - 发表的评论
├── Likes (1:N) - 点赞记录
├── Follows (1:N) - 关注关系
├── Courses (1:N) - 创建的课程
├── Enrollments (1:N) - 课程注册
└── PointsRecords (1:N) - 积分记录

Post (帖子)
├── Comments (1:N) - 帖子评论
├── Likes (1:N) - 帖子点赞
└── Author (N:1) - 作者

Comment (评论)
├── Replies (1:N) - 回复评论
├── Likes (1:N) - 评论点赞
├── Author (N:1) - 评论作者
└── Target (N:1) - 评论目标

Course (课程)
├── Enrollments (1:N) - 课程注册
├── Comments (1:N) - 课程评论
├── Likes (1:N) - 课程点赞
└── Instructor (N:1) - 讲师
```

## 性能优化策略

### 1. 索引优化

- **复合索引**: 针对常用查询组合创建复合索引
- **稀疏索引**: 对可选字段使用稀疏索引
- **TTL索引**: 对临时数据设置过期时间
- **文本索引**: 支持全文搜索功能

### 2. 查询优化

- **分页查询**: 使用 skip/limit 进行分页
- **字段选择**: 使用 select 只返回需要的字段
- **聚合管道**: 复杂统计使用聚合框架
- **缓存策略**: 热点数据使用 Redis 缓存

### 3. 数据一致性

- **原子操作**: 使用 MongoDB 原子操作保证一致性
- **事务支持**: 关键操作使用事务
- **乐观锁**: 使用版本号防止并发冲突
- **数据验证**: 严格的数据验证规则

## 扩展性考虑

### 1. 水平扩展

- **分片策略**: 基于用户ID或地理位置分片
- **读写分离**: 主从复制支持读写分离
- **负载均衡**: 多实例负载均衡

### 2. 数据归档

- **历史数据**: 定期归档历史数据
- **冷热分离**: 热数据和冷数据分离存储
- **备份策略**: 定期备份和恢复测试

### 3. 监控告警

- **性能监控**: 查询性能和资源使用监控
- **错误告警**: 异常情况及时告警
- **容量规划**: 基于增长趋势进行容量规划

## 安全性设计

### 1. 数据安全

- **敏感信息加密**: 密码等敏感信息加密存储
- **访问控制**: 基于角色的访问控制
- **数据脱敏**: 日志和调试中的数据脱敏

### 2. 输入验证

- **参数验证**: 严格的输入参数验证
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输出内容转义

### 3. 审计日志

- **操作记录**: 关键操作的审计日志
- **访问日志**: 数据访问日志记录
- **异常监控**: 异常访问模式监控

---

**文档版本**: 1.0  
**最后更新**: 2024年1月  
**维护者**: 开发团队  
**审核者**: 架构师