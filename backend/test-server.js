const app = require('./src/app');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 服务器配置
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 启动测试服务器（不连接数据库）
const startTestServer = async () => {
  try {
    console.log('启动测试服务器（不连接数据库）...');

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      console.log(`测试服务器启动成功 - 端口: ${PORT}, 环境: ${NODE_ENV}`);
      
      console.log(`\n🚀 测试服务器运行在: http://localhost:${PORT}`);
      console.log(`📝 API文档: http://localhost:${PORT}/api`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
      console.log(`🌍 环境: ${NODE_ENV}`);
      console.log(`⚠️  注意: 此为测试服务器，未连接数据库\n`);
    });

    // 优雅关闭处理
    const gracefulShutdown = async (signal) => {
      console.log(`收到${signal}信号，开始关闭测试服务器...`);
      
      server.close(() => {
        console.log('测试服务器已关闭');
        process.exit(0);
      });
      
      // 强制关闭超时
      setTimeout(() => {
        console.error('强制关闭服务器');
        process.exit(1);
      }, 5000);
    };

    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('测试服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动测试服务器
startTestServer();

module.exports = { startTestServer };