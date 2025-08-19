const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://admin:password123@localhost:27017/rural-art-platform-dev?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Follow = require('./src/models/Follow');
const User = require('./src/models/User');

async function checkFollowData() {
  try {
    console.log('=== 检查关注数据 ===');
    
    // 查看所有用户
    const users = await User.find({}, '_id username').lean();
    console.log('所有用户:', users);
    
    // 查看所有关注记录
    const follows = await Follow.find({}).populate('follower', 'username').populate('following', 'username').lean();
    console.log('所有关注记录:', follows);
    
    // 检查特定用户的关注记录
    const testUserId = '68a3ba95164ca7fa2cd78c5b';
    console.log(`\n=== 检查用户 ${testUserId} 的关注记录 ===`);
    
    const userFollows = await Follow.find({ follower: testUserId }).populate('following', 'username').lean();
    console.log('该用户关注的人:', userFollows);
    
    const userFollowers = await Follow.find({ following: testUserId }).populate('follower', 'username').lean();
    console.log('关注该用户的人:', userFollowers);
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkFollowData();