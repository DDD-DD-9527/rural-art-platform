const app = require('./src/app');
const database = require('./src/config/database');
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

// 启动服务器
const startServer = async () => {
  try {
    // 可选数据库连接
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.trim()) {
      console.log('正在连接数据库...');
      await database.connect();
      console.log('数据库连接成功');
    } else {
      console.warn('跳过数据库连接 - MONGODB_URI未配置');
    }

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      console.log(`服务器启动成功 - 端口: ${PORT}, 环境: ${NODE_ENV}`);
      
      console.log(`\n🚀 服务器运行在: http://localhost:${PORT}`);
      console.log(`📝 API文档: http://localhost:${PORT}/api`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
      console.log(`🌍 环境: ${NODE_ENV}\n`);
    });

    // 优雅关闭处理
    const gracefulShutdown = async (signal) => {
      console.log(`收到${signal}信号，开始优雅关闭服务器...`);
      
      server.close(async () => {
        console.log('HTTP服务器已关闭');
        
        try {
          const mongoUri = process.env.MONGODB_URI;
          if (mongoUri && mongoUri.trim()) {
            await database.disconnect();
            console.log('数据库连接已关闭');
          }
          process.exit(0);
        } catch (error) {
          console.error('关闭数据库连接时出错:', error);
          process.exit(1);
        }
      });
      
      // 强制关闭超时
      setTimeout(() => {
        console.error('强制关闭服务器');
        process.exit(1);
      }, 10000);
    };

    // 监听关闭信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 未捕获的异常处理
    process.on('uncaughtException', (error) => {
      console.error('未捕获的异常:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('未处理的Promise拒绝:', {
        reason,
        promise
      });
      gracefulShutdown('unhandledRejection');
    });

    return server;
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
  startServer();
}

module.exports = { startServer };