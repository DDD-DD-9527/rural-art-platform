const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

// 连接数据库
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-art-platform';
    await mongoose.connect(mongoURI);
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// 创建默认管理员账号
const createDefaultAdmin = async () => {
  try {
    // 检查是否已存在管理员账号
    const existingAdmin = await User.findOne({ userId: 'admin' });
    if (existingAdmin) {
      console.log('管理员账号已存在');
      return;
    }

    // 创建管理员账号
    const adminUser = new User({
      userId: 'admin',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      profile: {
        nickname: '管理员',
        name: '系统管理员',
        bio: '系统默认管理员账号',
        location: '系统'
      },
      status: 'active'
    });

    await adminUser.save();
    console.log('默认管理员账号创建成功');
    console.log('账号: admin');
    console.log('密码: admin123');
    console.log('角色: admin');
    
  } catch (error) {
    console.error('创建管理员账号失败:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await createDefaultAdmin();
  await mongoose.connection.close();
  console.log('脚本执行完成');
  process.exit(0);
};

// 执行脚本
if (require.main === module) {
  main();
}

module.exports = { createDefaultAdmin };