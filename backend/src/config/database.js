const mongoose = require('mongoose');
const { DATABASE_CONFIG } = require('./constants');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = DATABASE_CONFIG.MONGODB_URI;
      
      // MongoDB连接选项
      const options = DATABASE_CONFIG.CONNECTION_OPTIONS;

      this.connection = await mongoose.connect(mongoUri, options);
      
      console.log('MongoDB连接成功', {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        database: this.connection.connection.name
      });

      // 监听连接事件
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB连接错误:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB连接断开');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB重新连接成功');
      });

      return this.connection;
    } catch (error) {
      console.error('MongoDB连接失败:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('MongoDB连接已关闭');
    } catch (error) {
      console.error('关闭MongoDB连接时出错:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new Database();