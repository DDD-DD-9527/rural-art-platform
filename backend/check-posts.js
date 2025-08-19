const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://admin:password123@localhost:27017/rural-art-platform-dev?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Post = require('./src/models/Post');
const User = require('./src/models/User');

async function checkPostsData() {
  try {
    console.log('=== 检查帖子数据 ===');
    
    // 查看所有用户
    const users = await User.find({}, '_id username').lean();
    console.log('所有用户:', users);
    
    // 查看所有帖子
    const posts = await Post.find({}).populate('author', 'username').lean();
    console.log('所有帖子:', posts.map(p => ({
      _id: p._id,
      title: p.title,
      author: p.author,
      createdAt: p.createdAt
    })));
    
    // 检查特定用户的帖子
    const testUserId = '68a3ba95164ca7fa2cd78c5b';
    console.log(`\n=== 检查用户 ${testUserId} 的帖子 ===`);
    
    const userPosts = await Post.find({ author: testUserId }).populate('author', 'username').lean();
    console.log('该用户的帖子:', userPosts.map(p => ({
      _id: p._id,
      title: p.title,
      author: p.author
    })));
    
    // 检查其他用户的帖子
    console.log('\n=== 检查其他用户的帖子 ===');
    const otherPosts = await Post.find({ author: { $ne: testUserId } }).populate('author', 'username').lean();
    console.log('其他用户的帖子:', otherPosts.map(p => ({
      _id: p._id,
      title: p.title,
      author: p.author
    })));
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkPostsData();