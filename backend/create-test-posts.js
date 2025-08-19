const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://admin:password123@localhost:27017/rural-art-platform-dev?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Post = require('./src/models/Post');
const User = require('./src/models/User');

async function createTestPosts() {
  try {
    console.log('=== 创建测试帖子 ===');
    
    // 获取其他用户ID
    const users = await User.find({ username: { $ne: 'test' } }, '_id username').lean();
    console.log('其他用户:', users);
    
    if (users.length === 0) {
      console.log('没有其他用户，无法创建测试帖子');
      return;
    }
    
    // 为每个用户创建一个测试帖子
    for (const user of users) {
      const existingPost = await Post.findOne({ author: user._id });
      if (!existingPost) {
        const newPost = new Post({
          author: user._id,
          content: `这是用户 ${user.username} 的测试帖子`,
          type: 'share',
          status: 'published',
          visibility: 'public',
          allowComments: true,
          stats: {
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            shareCount: 0
          },
          tags: ['测试', '分享'],
          publishedAt: new Date()
        });
        
        await newPost.save();
        console.log(`为用户 ${user.username} 创建了帖子:`, newPost._id);
      } else {
        console.log(`用户 ${user.username} 已有帖子:`, existingPost._id);
      }
    }
    
    // 查看所有帖子
    const allPosts = await Post.find({}).populate('author', 'username').lean();
    console.log('\n=== 所有帖子 ===');
    allPosts.forEach(post => {
      console.log(`帖子ID: ${post._id}, 作者: ${post.author.username}, 内容: ${post.content}`);
    });
    
  } catch (error) {
    console.error('创建测试帖子失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestPosts();