# 使用官方 Node.js 18 LTS 镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖 (sharp 需要)
RUN apk add --no-cache \
    libc6-compat \
    vips-dev

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制应用代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads logs

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 设置文件权限
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["node", "server.js"]