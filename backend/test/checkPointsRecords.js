const mongoose = require('mongoose');
const PointsRecord = require('../src/models/PointsRecord');
const User = require('../src/models/User');

async function checkPointsRecords() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-art-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功');
    
    // 检查PointsRecord集合
    try {
      const totalRecords = await PointsRecord.estimatedDocumentCount();
      console.log(`📊 PointsRecord总记录数: ${totalRecords}`);
      
      if (totalRecords > 0) {
        const recentRecords = await PointsRecord.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
        
        console.log('\n🔍 最近5条积分记录:');
        recentRecords.forEach((record, index) => {
          console.log(`${index + 1}. 用户ID: ${record.user}, 积分: ${record.points}, 类型: ${record.type}, 时间: ${record.createdAt}`);
        });
      } else {
        console.log('⚠️ 没有找到任何积分记录');
      }
    } catch (error) {
      console.log('⚠️ 无法查询PointsRecord:', error.message);
    }
    
    // 检查用户积分
    try {
      const users = await User.find({ 'learningStats.totalPoints': { $gt: 0 } })
        .select('username email learningStats.totalPoints')
        .limit(5)
        .lean();
      
      console.log('\n👥 有积分的用户:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. 用户: ${user.username}, 总积分: ${user.learningStats?.totalPoints || 0}`);
      });
    } catch (error) {
      console.log('⚠️ 无法查询用户积分:', error.message);
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ 数据库连接已关闭');
  }
}

checkPointsRecords();