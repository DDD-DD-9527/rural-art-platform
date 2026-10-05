# 乡艺未来 (Rural Art Platform)

乡村艺术学习与创作平台。前端使用 Vue 3、Vite、Pinia；后端使用 Node.js、Express、MongoDB，并提供课程、社区、积分、文件上传和 AI 接口。

## 项目结构

```text
.
├── src/                 Vue 前端：页面、组件、状态和 API 客户端
├── public/              前端静态资源
├── backend/
│   ├── server.js        后端启动入口
│   ├── src/
│   │   ├── app.js       Express 中间件、路由和健康检查
│   │   ├── routes/      API 路由
│   │   ├── controllers/ 请求处理
│   │   ├── models/      MongoDB 数据模型
│   │   ├── services/    业务服务与 AI 集成
│   │   └── config/      后端配置
│   ├── scripts/         辅助脚本
│   ├── test/            后端测试脚本
│   ├── Dockerfile       Zeabur 后端服务镜像
│   └── .env.example     后端环境变量示例
├── 文档/                产品与功能设计资料
├── Dockerfile           Zeabur 前端服务镜像 (Vite 构建 + Nginx)
├── docker/              前端容器启动配置
├── vite.config.js       本地开发代理与构建配置
└── package.json         前端依赖与命令
```

前后端各有一份 `package.json` 和 `package-lock.json`，分别安装依赖。`backend/uploads/` 是运行时上传目录，不属于源码。

## 本地开发

需要 Node.js 20+ 和 MongoDB 连接。先在仓库根目录执行 `npm ci`，再在 `backend/` 执行 `npm ci`。将 `backend/.env.example` 复制为 `backend/.env`，填写 `MONGODB_URI`、`JWT_SECRET` 等配置。

分别启动：

```bash
# 仓库根目录
npm run dev

# 另一个终端，在 backend/ 目录
npm run dev
```

前端默认 `http://localhost:5173`，后端默认 `http://localhost:3000`，健康检查为 `http://localhost:3000/health`。Vite 会把本地 `/api` 请求转发到后端；如果后端使用其他端口，在前端环境中设置 `VITE_BACKEND_PORT`。

## Zeabur 部署

在同一个 Zeabur 项目中从此 Git 仓库创建两个服务。两者使用不同的服务根目录：

| 服务 | 根目录 | 构建方式 | 端口 |
| --- | --- | --- | --- |
| 前端 | `/` | 根目录 `Dockerfile` | `80` |
| 后端 | `/backend` | `backend/Dockerfile` | `3000`（或平台注入的 `PORT`） |

先配置并部署后端，确认 `https://<后端域名>/health` 返回成功，再配置前端。

### 后端环境变量

| 变量 | 用途 |
| --- | --- |
| `NODE_ENV=production` | 启用生产环境行为 |
| `MONGODB_URI` | MongoDB 连接串，必须指向可持久化的数据库 |
| `JWT_SECRET` | 登录令牌签名密钥，使用随机长字符串 |
| `BASE_URL` | 后端的公开 HTTPS 根地址，用于生成上传文件 URL；末尾不加 `/` |
| `CORS_ALLOWED_ORIGINS` | 前端公开源地址，多个用逗号分隔；仅在浏览器跨域直连后端时需要 |
| `COZE_API_KEY` 等 | 按实际启用的 AI 功能填写，见 `backend/.env.example` |

`PORT` 通常由平台注入；后端会监听该端口。后端将文件写入 `backend/uploads/`（容器内为 `/app/uploads`）。如果需要保留用户上传文件，必须在 Zeabur 为后端挂载持久卷到 `/app/uploads`；仅有 MongoDB 持久化并不能保存这些文件。`/health` 只检查 HTTP 服务存活，不检查数据库连接。

### 前端连接后端

推荐在前端服务的**运行时环境变量**中设置 `API_BASE_URL=https://<后端域名>/api`，并在后端设置 `CORS_ALLOWED_ORIGINS=https://<前端域名>`。前端容器启动时会生成 `runtime-config.js`，所以修改后重启前端服务即可生效，无需重新构建。

也可以使用同源代理：前端服务设置 `API_UPSTREAM` 为后端服务可访问的 HTTP 根地址，不设置 `API_BASE_URL`。浏览器请求 `/api/...`，由前端 Nginx 保留 `/api` 前缀转发到后端。此时仍需设置后端 `BASE_URL` 为公开地址，以便上传文件 URL 可访问。`API_UPSTREAM` 必须使用 Zeabur 实际提供的服务地址，不要填写占位符。

Zeabur 上不要依赖仓库中的本地 `.env`；密钥只在服务环境变量中配置。修改前端代码需重新构建前端服务，修改后端代码需重新部署后端服务。

## 验证

```bash
# 仓库根目录
npm ci
npm run build

# backend/ 目录
npm ci
node -e "require('./src/app')"
```

后端当前 `npm test` 仍是占位命令。启动服务后再检查 `/health`；仓库中的 `backend/test/` 是独立脚本，部分依赖真实数据库与测试数据，运行前请检查脚本目标。
