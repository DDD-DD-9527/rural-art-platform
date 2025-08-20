const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const { generateToken } = require('../src/middleware/auth');

// 服务器配置
const SERVER_URL = 'http://localhost:3001';

// 连接数据库
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cuddly-spork-test';
    await mongoose.connect(mongoUri);
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 创建或获取测试用户
const getOrCreateTestUser = async () => {
  try {
    // 先尝试查找现有用户
    let user = await User.findOne({ userId: 'test_real_user_001' });
    
    if (!user) {
      console.log('📝 创建新的测试用户...');
      user = new User({
        userId: 'test_real_user_001',
        username: 'testrealuser001',
        password: 'password123',
        profile: {
          nickname: '真实测试用户',
          name: '真实测试用户'
        },
        learningStats: {
          totalPoints: 0,
          coursesCompleted: 0,
          totalStudyTime: 0
        },
        role: 'user',
        status: 'active'
      });
      
      await user.save();
      console.log('✅ 测试用户创建成功');
    } else {
      console.log('✅ 找到现有测试用户');
    }
    
    return user;
  } catch (error) {
    console.error('❌ 获取/创建测试用户失败:', error.message);
    throw error;
  }
};

// 创建或获取测试课程
const getOrCreateTestCourse = async () => {
  try {
    // 先尝试查找现有课程
    let course = await Course.findOne({ title: '真实测试课程 - 关卡式学习' });
    
    if (!course) {
      console.log('📝 创建新的测试课程...');
      course = new Course({
        title: '真实测试课程 - 关卡式学习',
        description: '用于测试关卡式学习功能的真实课程',
        category: 'test',
        difficulty: 'beginner',
        instructor: new mongoose.Types.ObjectId(),
        lessons: [
          {
            title: '第一课：基础知识',
            description: '学习基础知识',
            content: '这是第一课的内容',
            duration: 30,
            order: 1,
            lessonType: 'video',
            difficulty: 'easy',
            pointsReward: {
              basePoints: 15,
              bonusConditions: [
                {
                  condition: 'perfect_score',
                  multiplier: 1.5,
                  description: '满分奖励'
                }
              ],
              levelMultiplier: 1.0
            },
            unlockConditions: [],
            isLocked: false
          },
          {
            title: '第二课：进阶内容',
            description: '学习进阶内容',
            content: '这是第二课的内容',
            duration: 45,
            order: 2,
            lessonType: 'practice',
            difficulty: 'medium',
            pointsReward: {
              basePoints: 20,
              bonusConditions: [],
              levelMultiplier: 1.0
            },
            unlockConditions: [
              {
                type: 'lesson_complete',
                condition: 'complete'
              }
            ],
            isLocked: true
          }
        ],
        status: 'published',
        settings: {
          allowComments: true,
          requiresApproval: false,
          isPublic: true
        }
      });
      
      await course.save();
      console.log('✅ 测试课程创建成功');
    } else {
      console.log('✅ 找到现有测试课程');
    }
    
    return course;
  } catch (error) {
    console.error('❌ 获取/创建测试课程失败:', error.message);
    throw error;
  }
};

// 创建或获取测试报名记录
const getOrCreateTestEnrollment = async (user, course) => {
  try {
    // 先尝试查找现有报名记录
    let enrollment = await Enrollment.findOne({ 
      student: user._id, 
      course: course._id 
    });
    
    if (!enrollment) {
      console.log('📝 创建新的测试报名记录...');
      enrollment = new Enrollment({
        student: user._id,
        course: course._id,
        enrolledAt: new Date(),
        status: 'active',
        progress: {
          completedLessons: [],
          currentLesson: course.lessons[0]._id,
          completionPercentage: 0,
          totalTimeSpent: 0,
          unlockedLessons: [course.lessons[0]._id],
          earnedXP: 0,
          achievements: [],
          streakDays: 0
        }
      });
      
      await enrollment.save();
      console.log('✅ 测试报名记录创建成功');
    } else {
      console.log('✅ 找到现有测试报名记录');
      // 重置进度以便重新测试
      enrollment.progress.completedLessons = [];
      enrollment.progress.currentLesson = course.lessons[0]._id;
      enrollment.progress.completionPercentage = 0;
      enrollment.progress.unlockedLessons = [course.lessons[0]._id];
      await enrollment.save();
      console.log('✅ 测试报名记录已重置');
    }
    
    return enrollment;
  } catch (error) {
    console.error('❌ 获取/创建测试报名记录失败:', error.message);
    throw error;
  }
};

// 测试实时服务器API
const testRealUserAPI = async () => {
  console.log('\n🚀 开始测试实时服务器游戏化API（使用真实用户数据）...');
  
  try {
    // 连接数据库
    await connectDB();
    
    // 创建测试数据
    const user = await getOrCreateTestUser();
    const course = await getOrCreateTestCourse();
    const enrollment = await getOrCreateTestEnrollment(user, course);
    
    // 生成JWT令牌
    const token = generateToken(user._id);
    
    console.log('\n📋 测试数据准备完成');
    console.log(`用户ID: ${user._id}`);
    console.log(`课程ID: ${course._id}`);
    console.log(`第一课ID: ${course.lessons[0]._id}`);
    
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
    
    // 测试2: 完成第一课（现在应该能看到服务器端的调试日志）
    console.log('\n🧪 测试2: 完成第一课（查看服务器调试日志）');
    console.log('💡 使用真实用户数据，应该能通过认证并看到调试信息');
    
    try {
      const completeResponse = await api.post(
        `/api/gamification/courses/${course._id}/lessons/${course.lessons[0]._id}/complete`,
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
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('\n✅ 测试完成，数据库连接已关闭');
    process.exit(0);
  }
};

// 运行测试
if (require.main === module) {
  testRealUserAPI();
}

module.exports = {
  testRealUserAPI
};