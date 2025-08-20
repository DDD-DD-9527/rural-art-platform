const axios = require('axios');
const jwt = require('jsonwebtoken');

// 服务器配置
const SERVER_URL = 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// 使用现有的测试用户数据
const TEST_USER_DATA = {
  _id: '507f1f77bcf86cd799439011', // 模拟的ObjectId
  userId: 'test_user_live_001',
  username: 'testuserlive001',
  role: 'user'
};

// 使用现有的测试课程数据
const TEST_COURSE_DATA = {
  _id: '507f1f77bcf86cd799439012', // 模拟的ObjectId
  lessons: [
    {
      _id: '507f1f77bcf86cd799439013', // 模拟的ObjectId
      title: '第一课：基础知识'
    }
  ]
};

// 生成JWT令牌
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 测试实时服务器API
const testLiveServerAPI = async () => {
  console.log('\n🚀 开始测试实时服务器游戏化API...');
  
  try {
    const token = generateToken(TEST_USER_DATA);
    
    console.log('\n📋 测试数据准备完成');
    console.log(`用户ID: ${TEST_USER_DATA._id}`);
    console.log(`课程ID: ${TEST_COURSE_DATA._id}`);
    console.log(`第一课ID: ${TEST_COURSE_DATA.lessons[0]._id}`);
    
    // 设置axios默认配置
    const api = axios.create({
      baseURL: SERVER_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    // 测试1: 检查服务器连接
    console.log('\n🧪 测试1: 检查服务器连接');
    try {
      const healthResponse = await api.get('/health');
      console.log('状态码:', healthResponse.status);
      console.log('✅ 服务器连接正常');
    } catch (error) {
      console.log('❌ 服务器连接失败:', error.message);
      return;
    }
    
    // 测试2: 完成第一课（这里应该能看到服务器端的调试日志）
    console.log('\n🧪 测试2: 完成第一课（查看服务器调试日志）');
    console.log('⚠️  注意：这个请求可能会失败，因为使用的是模拟数据，但重点是观察服务器端的调试日志');
    
    try {
      const completeResponse = await api.post(
        `/api/gamification/courses/${TEST_COURSE_DATA._id}/lessons/${TEST_COURSE_DATA.lessons[0]._id}/complete`,
        {
          timeSpent: 1800, // 30分钟
          score: 95,
          attempts: 1,
          completionData: {
            exercisesCompleted: 5,
            correctAnswers: 4
          }
        }
      );
      
      console.log('状态码:', completeResponse.status);
      if (completeResponse.status === 200) {
        console.log('✅ 第一课完成成功');
        console.log('获得积分:', completeResponse.data.data.pointsEarned);
        console.log('进度百分比:', completeResponse.data.data.progress.percentage + '%');
        console.log('解锁的下一课时数量:', completeResponse.data.data.nextUnlockedLessons?.length || 0);
      } else {
        console.log('❌ 第一课完成失败:', completeResponse.data);
      }
    } catch (error) {
      console.log('❌ 完成第一课请求失败:', error.response?.data || error.message);
      console.log('💡 这是预期的，因为使用的是模拟数据，但应该能在服务器日志中看到调试信息');
    }
    
    // 测试3: 获取积分统计
    console.log('\n🧪 测试3: 获取积分统计');
    try {
      const statsResponse = await api.get('/api/gamification/stats');
      console.log('状态码:', statsResponse.status);
      if (statsResponse.status === 200) {
        console.log('✅ 积分统计获取成功');
        console.log('总积分:', statsResponse.data.data.totalPoints);
        console.log('当前等级:', statsResponse.data.data.currentLevel);
        console.log('等级进度:', statsResponse.data.data.levelProgress + '%');
      } else {
        console.log('❌ 积分统计获取失败:', statsResponse.data);
      }
    } catch (error) {
      console.log('❌ 获取积分统计请求失败:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 实时服务器API测试完成!');
    console.log('\n📝 请检查服务器终端的日志输出，应该能看到以下调试信息：');
    console.log('   - 🚀 completeLesson方法被调用');
    console.log('   - 🔍 课时完成状态检查');
    console.log('   - ✨ 课时未完成，开始积分发放流程');
    console.log('   - 🎯 准备发放积分');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
};

// 运行测试
const runTests = async () => {
  try {
    await testLiveServerAPI();
  } catch (error) {
    console.error('❌ 测试运行失败:', error.message);
  } finally {
    console.log('\n✅ 测试完成');
    process.exit(0);
  }
};

if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testLiveServerAPI
};