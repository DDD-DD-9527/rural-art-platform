// MongoDB初始化脚本
// 创建应用数据库和用户

db = db.getSiblingDB('rural-art-platform');

// 创建应用用户
db.createUser({
  user: 'app_user',
  pwd: 'app_password123',
  roles: [
    {
      role: 'readWrite',
      db: 'rural-art-platform'
    }
  ]
});

// 创建基础集合和索引
db.createCollection('users');
db.createCollection('courses');
db.createCollection('posts');
db.createCollection('comments');
db.createCollection('enrollments');
db.createCollection('progress');
db.createCollection('achievements');
db.createCollection('notifications');

// 用户集合索引
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

// 课程集合索引
db.courses.createIndex({ title: 'text', description: 'text', tags: 'text' });
db.courses.createIndex({ creator: 1 });
db.courses.createIndex({ category: 1 });
db.courses.createIndex({ difficulty: 1 });
db.courses.createIndex({ isPublished: 1 });
db.courses.createIndex({ createdAt: -1 });
db.courses.createIndex({ 'stats.enrollments': -1 });
db.courses.createIndex({ 'stats.rating': -1 });
db.courses.createIndex({ 'stats.views': -1 });

// 帖子集合索引
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ 'stats.likes': -1 });
db.posts.createIndex({ 'stats.comments': -1 });
db.posts.createIndex({ tags: 1 });

// 评论集合索引
db.comments.createIndex({ post: 1 });
db.comments.createIndex({ course: 1 });
db.comments.createIndex({ author: 1 });
db.comments.createIndex({ createdAt: -1 });

// 报名记录索引
db.enrollments.createIndex({ user: 1, course: 1 }, { unique: true });
db.enrollments.createIndex({ user: 1 });
db.enrollments.createIndex({ course: 1 });
db.enrollments.createIndex({ enrolledAt: -1 });

// 学习进度索引
db.progress.createIndex({ user: 1, course: 1 }, { unique: true });
db.progress.createIndex({ user: 1 });
db.progress.createIndex({ course: 1 });
db.progress.createIndex({ lastAccessedAt: -1 });

// 成就索引
db.achievements.createIndex({ user: 1 });
db.achievements.createIndex({ type: 1 });
db.achievements.createIndex({ earnedAt: -1 });

// 通知索引
db.notifications.createIndex({ recipient: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });

print('数据库初始化完成！');
print('- 创建了应用用户: app_user');
print('- 创建了基础集合和索引');
print('- 数据库已准备就绪');