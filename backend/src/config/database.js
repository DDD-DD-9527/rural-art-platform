const mongoose = require('mongoose');
const winston = require('winston');

// 配置日志
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-art-platform';
      
      // MongoDB连接选项
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.connection = await mongoose.connect(mongoUri, options);
      
      logger.info('MongoDB连接成功', {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        database: this.connection.connection.name
      });

      // 监听连接事件
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB连接错误:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB连接断开');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB重新连接成功');
      });

      return this.connection;
    } catch (error) {
      logger.error('MongoDB连接失败:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB连接已关闭');
    } catch (error) {
      logger.error('关闭MongoDB连接时出错:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new Database();