
#### 优势
- 环境完全隔离
- 可以模拟生产环境
- 便于团队协作
- 支持多版本并行

#### 实施步骤

1. **创建开发Docker配置**
创建 `backend/docker-compose.dev.yml`：
```yaml
version: '3.8'
services:
  backend-dev:
    build: .
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - MONGODB_URI=mongodb://mongo-dev:27017/rural-art-platform-dev
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
    depends_on:
      - mongo-dev
    command: npm run dev

  mongo-dev:
    image: mongo:latest
    ports:
      - "27018:27017"
    volumes:
      - mongo-dev-data:/data/db

volumes:
  mongo-dev-data:
```

2. **启动开发环境**
```bash
cd backend
docker-compose -f docker-compose.dev.yml up -d
```

### 方案三：Git分支 + DevTunnels切换

#### 优势
- 利用现有DevTunnels基础设施
- 可以快速切换版本
- 便于远程测试

#### 实施步骤

1. **创建开发分支**
```bash
git checkout -b feature/backend-v2
```

2. **设置新的DevTunnels端口**
- 在VS Code中创建新的DevTunnels：端口3001
- 获取新的隧道URL（如：`https://xyz-3001.asse.devtunnels.ms`）

3. **配置测试环境**
创建 `.env.test`：
```env
VITE_API_BASE_URL=https://xyz-3001.asse.devtunnels.ms/api
```

4. **前端测试配置**
```bash
# 测试新版本
cp .env.test .env.local
npm run build
vercel --prod

# 回滚到稳定版本
cp .env .env.local
npm run build
vercel --prod
```

## 🔄 完整开发流程

### 阶段1：本地开发
```bash
# 1. 创建开发分支
git checkout -b feature/new-feature

# 2. 启动开发版本后端（端口3001）
cd backend
npm run dev:new

# 3. 前端连接开发版本进行测试
# 修改前端代码使用 /api-dev 路径测试新功能
```

### 阶段2：集成测试
```bash
# 1. 创建测试DevTunnels（端口3001）
# 2. 部署测试版本到Vercel
# 3. 进行完整的端到端测试
```

### 阶段3：生产部署
```bash
# 1. 测试通过后合并到主分支
git checkout main
git merge feature/new-feature

# 2. 停止旧版本，启动新版本
# 3. 更新DevTunnels指向
# 4. 重新部署Vercel
```

## 📋 当前环境状态

### 生产环境（保持不变）
- **后端端口**: 3000
- **DevTunnels**: `https://kl9dmjgx-3000.asse.devtunnels.ms`
- **前端域名**: `https://ai-future-rural-art.top`
- **状态**: 🟢 正常运行

### 开发环境（新建）
- **后端端口**: 3001
- **本地访问**: `http://localhost:3001`
- **前端测试**: `http://localhost:5173/api-dev/*`
- **状态**: 🔄 开发中

## 🛠️ 实用工具脚本

### 快速切换脚本
创建 `scripts/switch-backend.sh`：
```bash
#!/bin/bash

case $1 in
  "prod")
    echo "切换到生产环境"
    cp .env.production .env
    ;;
  "dev")
    echo "切换到开发环境"
    cp .env.development .env
    ;;
  "test")
    echo "切换到测试环境"
    cp .env.test .env
    ;;
  *)
    echo "用法: ./switch-backend.sh [prod|dev|test]"
    ;;
esac
```

### 健康检查脚本
创建 `scripts/health-check.js`：
```javascript
const axios = require('axios');

const endpoints = [
  'http://localhost:3000/health',  // 生产版本
  'http://localhost:3001/health',  // 开发版本
];

endpoints.forEach(async (url) => {
  try {
    const response = await axios.get(url);
    console.log(`✅ ${url}: ${response.status}`);
  } catch (error) {
    console.log(`❌ ${url}: ${error.message}`);
  }
});
```

## 🚨 注意事项

1. **数据库隔离**: 开发环境使用独立的数据库，避免影响生产数据
2. **端口冲突**: 确保新端口未被占用
3. **环境变量**: 使用不同的环境变量文件管理配置
4. **版本控制**: 及时提交代码，避免丢失开发进度
5. **测试覆盖**: 确保新功能有充分的测试覆盖

## 📈 推荐实施顺序

1. **立即实施**: 方案一（端口隔离）- 最简单快速
2. **中期优化**: 方案二（Docker）- 更专业的开发环境
3. **长期规划**: 建立完整的CI/CD流程

---

**建议**: 从方案一开始，它最简单且能立即解决您的需求。随着项目发展，可以逐步采用更复杂的方案。