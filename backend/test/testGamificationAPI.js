const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const PointsRecord = require('../src/models/PointsRecord');
const jwt = require('jsonwebtoken');

// 测试数据库连接
const connectTestDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/rural-art-platform-dev?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ 测试数据库连接成功');
  } catch (error) {
    console.error('❌ 测试数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 清理测试数据
const cleanupTestData = async () => {
  try {
    await User.deleteMany({ userId: { $in: ['test_user_001', 'test_user_002'] } });
    await Course.deleteMany({ title: { $regex: /^测试课程/ } });
    await Enrollment.deleteMany({});
    await PointsRecord.deleteMany({});
    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.error('❌ 测试数据清理失败:', error.message);
  }
};

// 创建测试用户
const createTestUser = async () => {
  try {
    const testUser = new User({
      userId: 'test_user_001',
      username: 'testuser001',
      password: 'password123',
      profile: {
        nickname: '测试用户',
        name: '测试用户'
      },
      learningStats: {
        totalPoints: 0,
        coursesCompleted: 0,
        totalStudyTime: 0
      },
      skillProgress: {
        digitalSkills: {
          level: 1,
          experience: 0
        }
      }
    });
    
    await testUser.save();
    console.log('✅ 测试用户创建成功');
    return testUser;
  } catch (error) {
    console.error('❌ 测试用户创建失败:', error.message);
    throw error;
  }
};

// 创建测试课程
const createTestCourse = async () => {
  try {
    const testCourse = new Course({
      title: '测试课程 - 关卡式学习',
      description: '用于测试关卡式学习功能的课程',
      thumbnail: 'https://example.com/thumbnail.jpg',
      creator: new mongoose.Types.ObjectId(),
      category: 'traditional-crafts',
      difficulty: 'beginner',
      settings: {
        isPublished: true,
        isFree: true,
        price: 0
      },
      lessons: [
        {
          title: '第一课：基础知识',
          description: '学习基础知识',
          order: 1,
          duration: 30,
          pointsReward: {
            basePoints: 10,
            bonusConditions: {
              perfectScore: {
                enabled: true,
                points: 5,
                threshold: 100
              },
              oneAttempt: {
                enabled: true,
                points: 3
              },
              speedBonus: {
                enabled: true,
                points: 2,
                timeLimit: 1800
              }
            }
          },
          difficultyMultiplier: 1.0,
          unlockConditions: {
            prerequisiteLessons: [],
            pointsRequired: 0,
            levelRequired: 1
          }
        },
        {
          title: '第二课：进阶内容',
          description: '学习进阶内容',
          order: 2,
          duration: 45,
          pointsReward: {
            basePoints: 15,
            bonusConditions: {
              perfectScore: {
                enabled: true,
                points: 8,
                threshold: 100
              },
              oneAttempt: {
                enabled: true,
                points: 5
              },
              speedBonus: {
                enabled: true,
                points: 3,
                timeLimit: 2700
              }
            }
          },
          difficultyMultiplier: 1.2,
          unlockConditions: {
            prerequisiteLessons: [{
              lessonId: null, // 将在创建后设置
              required: true
            }],
            pointsRequired: 0,
            levelRequired: 1
          }
        },
        {
          title: '第三课：高级应用',
          description: '学习高级应用',
          order: 3,
          duration: 60,
          pointsReward: {
            basePoints: 20,
            bonusConditions: {
              perfectScore: {
                enabled: true,
                points: 10,
                threshold: 100
              },
              oneAttempt: {
                enabled: true,
                points: 7
              },
              speedBonus: {
                enabled: true,
                points: 5,
                timeLimit: 3600
              }
            }
          },
          difficultyMultiplier: 1.5,
          unlockConditions: {
            prerequisiteLessons: [{
              lessonId: null, // 将在创建后设置
              required: true
            }],
            pointsRequired: 50,
            levelRequired: 1
          }
        }
      ]
    });
    
    // 设置解锁条件中的lessonId
    if (testCourse.lessons[1].unlockConditions && testCourse.lessons[1].unlockConditions.prerequisiteLessons && testCourse.lessons[1].unlockConditions.prerequisiteLessons[0]) {
      testCourse.lessons[1].unlockConditions.prerequisiteLessons[0].lessonId = testCourse.lessons[0]._id;
    }
    if (testCourse.lessons[2].unlockConditions && testCourse.lessons[2].unlockConditions.prerequisiteLessons && testCourse.lessons[2].unlockConditions.prerequisiteLessons[0]) {
      testCourse.lessons[2].unlockConditions.prerequisiteLessons[0].lessonId = testCourse.lessons[1]._id;
    }
    
    await testCourse.save();
    console.log('✅ 测试课程创建成功');
    return testCourse;
  } catch (error) {
    console.error('❌ 测试课程创建失败:', error.message);
    throw error;
  }
};

// 创建测试报名记录
const createTestEnrollment = async (user, course) => {
  try {
    const enrollment = new Enrollment({
      student: user._id,
      course: course._id,
      enrolledAt: new Date(),
      progress: {
        completedLessons: [],
        totalTimeSpent: 0,
        isCompleted: false,
        gamificationStats: {
          totalPointsEarned: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageScore: 0,
          perfectCompletions: 0,
          oneAttemptCompletions: 0
        }
      }
    });
    
    await enrollment.save();
    console.log('✅ 测试报名记录创建成功');
    return enrollment;
  } catch (error) {
    console.error('❌ 测试报名记录创建失败:', error.message);
    throw error;
  }
};

// 生成JWT令牌
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      username: user.username,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

// 测试游戏化API
const testGamificationAPI = async () => {
  console.log('\n🚀 开始测试游戏化API...');
  
  try {
    // 创建测试数据
    const user = await createTestUser();
    const course = await createTestCourse();
    const enrollment = await createTestEnrollment(user, course);
    const token = generateToken(user);
    
    console.log('\n📋 测试数据准备完成');
    console.log(`用户ID: ${user._id}`);
    console.log(`课程ID: ${course._id}`);
    console.log(`第一课ID: ${course.lessons[0]._id}`);
    
    // 测试1: 获取学习路径
    console.log('\n🧪 测试1: 获取学习路径');
    const pathResponse = await request(app)
      .get(`/api/gamification/courses/${course._id}/path`)
      .set('Authorization', `Bearer ${token}`);
    
    console.log('状态码:', pathResponse.status);
    if (pathResponse.status === 200) {
      console.log('✅ 学习路径获取成功');
      console.log('课程信息:', pathResponse.body.data.course.title);
      console.log('课时数量:', pathResponse.body.data.lessons.length);
      console.log('第一课状态:', pathResponse.body.data.lessons[0].status);
    } else {
      console.log('❌ 学习路径获取失败:', pathResponse.body);
    }
    
    // 测试2: 检查课时解锁状态
    console.log('\n🧪 测试2: 检查第一课解锁状态');
    const unlockResponse = await request(app)
      .get(`/api/gamification/courses/${course._id}/lessons/${course.lessons[0]._id}/unlock`)
      .set('Authorization', `Bearer ${token}`);
    
    console.log('状态码:', unlockResponse.status);
    if (unlockResponse.status === 200) {
      console.log('✅ 解锁状态检查成功');
      console.log('是否解锁:', unlockResponse.body.data.isUnlocked);
      console.log('课时标题:', unlockResponse.body.data.lesson.title);
    } else {
      console.log('❌ 解锁状态检查失败:', unlockResponse.body);
    }
    
    // 测试3: 完成第一课
    console.log('\n🧪 测试3: 完成第一课');
    const completeResponse = await request(app)
      .post(`/api/gamification/courses/${course._id}/lessons/${course.lessons[0]._id}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        timeSpent: 1800, // 30分钟
        score: 95,
        attempts: 1,
        completionData: {
          exercisesCompleted: 5,
          correctAnswers: 4
        }
      });
    
    console.log('状态码:', completeResponse.status);
    if (completeResponse.status === 200) {
      console.log('✅ 第一课完成成功');
      console.log('获得积分:', completeResponse.body.data.pointsEarned);
      console.log('进度百分比:', completeResponse.body.data.progress.percentage + '%');
      console.log('解锁的下一课时:', completeResponse.body.data.nextUnlockedLessons.length);
      
      // 立即检查数据库中的积分记录
      console.log('\n🔍 检查数据库中的积分记录...');
      const pointsRecords = await PointsRecord.find({ userId: user._id }).sort({ createdAt: -1 });
      console.log('积分记录数量:', pointsRecords.length);
      if (pointsRecords.length > 0) {
        console.log('最新积分记录:', {
          points: pointsRecords[0].points,
          type: pointsRecords[0].type,
          description: pointsRecords[0].description
        });
      }
      
      // 检查Enrollment更新
      const updatedEnrollment = await Enrollment.findOne({ student: user._id, course: course._id });
      console.log('课程进度更新:', {
        completedLessons: updatedEnrollment.progress.completedLessons.length,
        totalPointsEarned: updatedEnrollment.progress.gamificationStats.totalPointsEarned
      });
    } else {
      console.log('❌ 第一课完成失败:', completeResponse.body);
    }
    
    // 测试4: 获取积分统计
    console.log('\n🧪 测试4: 获取积分统计');
    const statsResponse = await request(app)
      .get('/api/gamification/stats')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('状态码:', statsResponse.status);
    if (statsResponse.status === 200) {
      console.log('✅ 积分统计获取成功');
      console.log('总积分:', statsResponse.body.data.totalPoints);
      console.log('当前等级:', statsResponse.body.data.level);
      console.log('等级进度:', statsResponse.body.data.levelProgress + '%');
    } else {
      console.log('❌ 积分统计获取失败:', statsResponse.body);
    }
    
    // 测试5: 获取积分历史
    console.log('\n🧪 测试5: 获取积分历史');
    const historyResponse = await request(app)
      .get('/api/gamification/points/history')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('状态码:', historyResponse.status);
    if (historyResponse.status === 200) {
      console.log('✅ 积分历史获取成功');
      console.log('记录数量:', historyResponse.body.data.records.length);
      if (historyResponse.body.data.records.length > 0) {
        console.log('最新记录:', historyResponse.body.data.records[0].description);
      }
    } else {
      console.log('❌ 积分历史获取失败:', historyResponse.body);
    }
    
    // 测试6: 获取用户成就
    console.log('\n🧪 测试6: 获取用户成就');
    const achievementsResponse = await request(app)
      .get('/api/gamification/achievements')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('状态码:', achievementsResponse.status);
    if (achievementsResponse.status === 200) {
      console.log('✅ 用户成就获取成功');
      console.log('成就数量:', achievementsResponse.body.data.achievements.length);
      console.log('统计信息:', achievementsResponse.body.data.stats);
    } else {
      console.log('❌ 用户成就获取失败:', achievementsResponse.body);
    }
    
    console.log('\n🎉 游戏化API测试完成!');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
};

// 主测试函数
const runTests = async () => {
  console.log('🧪 开始游戏化API功能测试');
  console.log('================================');
  
  try {
    await connectTestDB();
    await cleanupTestData();
    await testGamificationAPI();
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    console.log('\n🧹 清理测试数据...');
    await cleanupTestData();
    await mongoose.connection.close();
    console.log('✅ 测试完成，数据库连接已关闭');
  }
};

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testGamificationAPI
};