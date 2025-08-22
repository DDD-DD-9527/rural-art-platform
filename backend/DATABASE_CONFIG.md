# 数据库配置文档

## 📊 数据库概览

本项目使用 **MongoDB Atlas** 云数据库服务，提供高可用性和自动备份功能。

## 🔗 数据库连接信息

### MongoDB Atlas 集群信息
- **集群名称**: Cluster0
- **数据库名称**: rural-art-platform
- **集群标识**: cluster0.e1owxn1.mongodb.net
- **应用名称**: Cluster0

### 连接字符串
```
mongodb+srv://rural-art-cluster:akw9N0hQmpu0fquY@cluster0.e1owxn1.mongodb.net/rural-art-platform?retryWrites=true&w=majority&appName=Cluster0
```

### 连接参数说明
- **用户名**: rural-art-cluster
- **密码**: akw9N0hQmpu0fquY
- **主机**: cluster0.e1owxn1.mongodb.net
- **数据库**: rural-art-platform
- **重试写入**: true
- **写入关注**: majority
- **应用名称**: Cluster0

## ⚙️ 连接配置选项

### 连接池配置
```javascript
const CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,                    // 最大连接池大小
  serverSelectionTimeoutMS: 5000,     // 服务器选择超时
  socketTimeoutMS: 45000,             // Socket超时
  connectTimeoutMS: 10000,            // 连接超时
  maxIdleTimeMS: 30000               // 最大空闲时间
};
```

### 环境变量配置
```env
# 数据库配置
MONGODB_URI=mongodb+srv://rural-art-cluster:akw9N0hQmpu0fquY@cluster0.e1owxn1.mongodb.net/rural-art-platform?retryWrites=true&w=majority&appName=Cluster0
```

## 🗄️ 数据库结构

### 主要集合 (Collections)
1. **users** - 用户信息
2. **courses** - 课程数据
3. **posts** - 帖子内容
4. **comments** - 评论数据
5. **enrollments** - 报名记录
6. **progress** - 学习进度
7. **achievements** - 成就记录
8. **notifications** - 通知消息
9. **pointsrecords** - 积分记录
10. **follows** - 关注关系

### 索引配置
- 用户集合: username(唯一), createdAt, role, isActive
- 课程集合: 全文搜索, creator, category, difficulty, isPublished
- 帖子集合: author, createdAt, stats.likes, tags
- 其他集合均有相应的查询优化索引

## 🔐 安全配置

### 数据库用户权限
- **用户名**: rural-art-cluster
- **权限**: readWrite (读写权限)
- **数据库**: rural-art-platform

### 网络访问控制
- 已配置 IP 白名单
- 支持从任何 IP 访问 (0.0.0.0/0)
- 建议生产环境限制特定 IP 访问

## 🚀 部署环境配置

### 开发环境
```env
NODE_ENV=development
MONGODB_URI=mongodb+srv://rural-art-cluster:akw9N0hQmpu0fquY@cluster0.e1owxn1.mongodb.net/rural-art-platform?retryWrites=true&w=majority&appName=Cluster0
```

### 生产环境
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://rural-art-cluster:akw9N0hQmpu0fquY@cluster0.e1owxn1.mongodb.net/rural-art-platform?retryWrites=true&w=majority&appName=Cluster0
```

## 📈 监控和维护

### MongoDB Atlas 控制台
- **登录地址**: https://cloud.mongodb.com/
- **项目**: rural-art-platform
- **集群**: Cluster0

### 监控指标
- 连接数使用情况
- 数据库大小和增长趋势
- 查询性能指标
- 索引使用效率

### 备份策略
- **自动备份**: 已启用
- **备份保留**: 7天
- **快照频率**: 每6小时

## 🔧 故障排除

### 常见连接问题
1. **网络访问被拒绝**
   - 检查 IP 白名单配置
   - 确认服务器出口 IP

2. **认证失败**
   - 验证用户名和密码
   - 检查数据库用户权限

3. **连接超时**
   - 检查网络连接
   - 调整超时参数

### 测试连接
```bash
# 使用 MongoDB Compass 测试连接
# 连接字符串: mongodb+srv://rural-art-cluster:akw9N0hQmpu0fquY@cluster0.e1owxn1.mongodb.net/rural-art-platform

# 使用 Node.js 测试连接
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb+srv://rural-art-cluster:akw9N0hQmpu0fquY@cluster0.e1owxn1.mongodb.net/rural-art-platform').then(() => console.log('连接成功')).catch(err => console.error('连接失败:', err));"
```

## 📞 技术支持

### MongoDB Atlas 支持
- **文档**: https://docs.atlas.mongodb.com/
- **社区论坛**: https://community.mongodb.com/
- **技术支持**: 通过 Atlas 控制台提交工单

### 项目相关
- **数据库配置文件**: `backend/src/config/database.js`
- **环境变量文件**: `backend/.env`
- **常量配置**: `backend/src/config/constants.js`

---

**最后更新**: 2024年8月22日  
**文档版本**: 1.0  
**维护人员**: 项目开发团队