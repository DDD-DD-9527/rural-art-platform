const mongoose = require('mongoose');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const PointsRecord = require('../src/models/PointsRecord');
const PointsService = require('../src/services/PointsService');
const UnlockService = require('../src/services/UnlockService');

// 连接测试数据库
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/cuddly_spork_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ 测试数据库连接成功');
  } catch (error) {
    console.error('❌ 测试数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 清理测试数据
const cleanupTestData = async () => {
  try {
    await User.deleteMany({ userId: { $regex: /^test/ } });
    await Course.deleteMany({ title: { $regex: /测试课程/ } });
    await Enrollment.deleteMany({});
    await PointsRecord.deleteMany({});
    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.error('❌ 测试数据清理失败:', error.message);
  }
};

// 测试用户创建
const testUserCreation = async () => {
  console.log('\n🧪 测试用户创建...');
  try {
    const testUser = new User({
      userId: 'test001',
      username: 'testuser',
      password: 'password123',
      profile: {
        name: '测试用户',
        nickname: '测试昵称'
      },
      learningStats: {
        totalPoints: 0,
        level: 1,
        coursesCompleted: 0,
        totalStudyTime: 0
      },
      skillProgress: {
        digitalSkills: {
          title: '数字技能',
          progress: 0,
          skills: [
            {
              name: 'JavaScript',
              progress: 0,
              level: '入门'
            }
          ]
        }
      }
    });
    
    const savedUser = await testUser.save();
    console.log('✅ 用户创建成功:', savedUser.username);
    return savedUser;
  } catch (error) {
    console.error('❌ 用户创建失败:', error.message);
    throw error;
  }
};

// 测试课程创建（包含新的积分奖励字段）
const testCourseCreation = async (instructor) => {
  console.log('\n🧪 测试课程创建（包含积分奖励配置）...');
  try {
    const testCourse = new Course({
      title: '测试课程 - JavaScript基础',
      description: '这是一个测试课程，用于验证关卡式学习功能',
      instructor: instructor._id,
      category: 'programming',
      level: 'beginner',
      price: 0,
      lessons: [
        {
          title: '第一课：变量和数据类型',
          content: '学习JavaScript的基本变量和数据类型',
          duration: 30,
          order: 1,
          pointsReward: {
            basePoints: 100,
            bonusConditions: [
              {
                condition: 'first_attempt',
                points: 50,
                description: '一次通过奖励'
              },
              {
                condition: 'perfect_score',
                points: 30,
                description: '满分奖励'
              }
            ],
            levelMultiplier: 1.0
          },
          unlockConditions: {
            prerequisiteLessons: [],
            pointsRequired: 0,
            levelRequired: 1
          },
          difficultyMultiplier: 1.0
        },
        {
          title: '第二课：函数和作用域',
          content: '深入理解JavaScript函数和作用域',
          duration: 45,
          order: 2,
          pointsReward: {
            basePoints: 150,
            bonusConditions: [
              {
                condition: 'first_attempt',
                points: 75,
                description: '一次通过奖励'
              }
            ],
            levelMultiplier: 1.2
          },
          unlockConditions: {
            prerequisiteLessons: [],
            pointsRequired: 100,
            levelRequired: 1
          },
          difficultyMultiplier: 1.2
        },
        {
          title: '第三课：异步编程',
          content: '掌握Promise和async/await',
          duration: 60,
          order: 3,
          pointsReward: {
            basePoints: 200,
            bonusConditions: [
              {
                condition: 'first_attempt',
                points: 100,
                description: '一次通过奖励'
              },
              {
                condition: 'perfect_score',
                points: 50,
                description: '满分奖励'
              }
            ],
            levelMultiplier: 1.5
          },
          unlockConditions: {
            prerequisiteLessons: [],
            pointsRequired: 250,
            levelRequired: 2
          },
          difficultyMultiplier: 1.5
        }
      ],
      isPublished: true
    });
    
    const savedCourse = await testCourse.save();
    console.log('✅ 课程创建成功:', savedCourse.title);
    console.log('   - 课程数量:', savedCourse.lessons.length);
    console.log('   - 第一课积分奖励:', savedCourse.lessons[0].pointsReward.basePoints);
    return savedCourse;
  } catch (error) {
    console.error('❌ 课程创建失败:', error.message);
    throw error;
  }
};

// 测试课程报名（包含新的进度跟踪字段）
const testEnrollmentCreation = async (user, course) => {
  console.log('\n🧪 测试课程报名（包含扩展进度字段）...');
  try {
    const enrollment = new Enrollment({
      student: user._id,
      course: course._id,
      enrollmentDate: new Date(),
      status: 'active',
      progress: {
        completedLessons: [],
        percentage: 0,
        totalTimeSpent: 0,
        lastAccessedAt: new Date(),
        currentLesson: course.lessons[0]._id,
        unlockedLessons: [
          {
            lessonId: course.lessons[0]._id,
            unlockedAt: new Date(),
            unlockMethod: 'auto'
          }
        ]
      },
      gamificationStats: {
        totalPointsEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageScore: 0,
        perfectCompletions: 0,
        oneAttemptCompletions: 0
      }
    });
    
    const savedEnrollment = await enrollment.save();
    console.log('✅ 课程报名成功');
    console.log('   - 学生ID:', savedEnrollment.student);
    console.log('   - 课程ID:', savedEnrollment.course);
    console.log('   - 已解锁课程数:', savedEnrollment.progress.unlockedLessons.length);
    return savedEnrollment;
  } catch (error) {
    console.error('❌ 课程报名失败:', error.message);
    throw error;
  }
};

// 测试积分记录创建
const testPointsRecordCreation = async (user, course) => {
  console.log('\n🧪 测试积分记录创建...');
  try {
    const pointsRecord = new PointsRecord({
      userId: user._id,
      pointsType: 'lesson_completion',
      source: 'course_learning',
      points: 150,
      resourceId: course.lessons[0]._id,
      resourceType: 'lesson',
      description: '完成课程：变量和数据类型',
      metadata: {
        courseId: course._id,
        lessonId: course.lessons[0]._id,
        attempts: 1,
        score: 95,
        bonusEarned: ['first_attempt', 'perfect_score']
      }
    });
    
    const savedRecord = await pointsRecord.save();
    console.log('✅ 积分记录创建成功');
    console.log('   - 积分数量:', savedRecord.points);
    console.log('   - 积分类型:', savedRecord.pointsType);
    console.log('   - 是否过期:', savedRecord.isExpired);
    return savedRecord;
  } catch (error) {
    console.error('❌ 积分记录创建失败:', error.message);
    throw error;
  }
};

// 测试积分服务
const testPointsService = async (user, course, enrollment) => {
  console.log('\n🧪 测试积分服务...');
  try {
    // 测试课程积分计算
    const lesson = course.lessons[0];
    const performance = {
      attempts: 1,
      score: 95,
      completionTime: 25 * 60 * 1000, // 25分钟
      bonusEarned: ['first_attempt', 'perfect_score']
    };
    
    const calculatedPoints = await PointsService.calculateLessonPoints(
      user._id.toString(),
      course._id.toString(),
      lesson._id.toString(),
      performance
    );
    
    console.log('✅ 积分计算成功');
    console.log('   - 基础积分:', calculatedPoints.basePoints);
    console.log('   - 奖励积分:', calculatedPoints.bonusPoints);
    console.log('   - 总积分:', calculatedPoints.totalPoints);
    
    // 测试积分发放
    const awardResult = await PointsService.awardPoints(
      user._id.toString(),
      'lesson_completion',
      'course_learning',
      calculatedPoints.totalPoints,
      lesson._id.toString(),
      'lesson',
      `完成课程：${lesson.title}`,
      {
        courseId: course._id.toString(),
        lessonId: lesson._id.toString(),
        performance
      }
    );
    
    console.log('✅ 积分发放成功');
    console.log('   - 发放积分:', awardResult.pointsAwarded);
    console.log('   - 用户新等级:', awardResult.newLevel);
    
    return awardResult;
  } catch (error) {
    console.error('❌ 积分服务测试失败:', error.message);
    throw error;
  }
};

// 测试解锁服务
const testUnlockService = async (user, course) => {
  console.log('\n🧪 测试解锁服务...');
  try {
    // 测试第二课解锁条件检查
    const secondLesson = course.lessons[1];
    const unlockCheck = await UnlockService.checkLessonUnlock(
      user._id.toString(),
      course._id.toString(),
      secondLesson._id.toString()
    );
    
    console.log('✅ 解锁条件检查完成');
    console.log('   - 课程标题:', unlockCheck.lesson?.title);
    console.log('   - 可以解锁:', unlockCheck.unlocked);
    console.log('   - 失败条件:', unlockCheck.failedConditions);
    
    // 如果可以解锁，尝试解锁
    if (unlockCheck.unlocked) {
      const unlockResult = await UnlockService.unlockLesson(
        user._id.toString(),
        course._id.toString(),
        secondLesson._id.toString(),
        'auto'
      );
      
      console.log('✅ 课程解锁成功');
      console.log('   - 解锁方式:', unlockResult.unlockMethod);
    }
    
    // 获取用户的课程解锁状态
    const unlockStatus = await UnlockService.getUserLessonUnlockStatus(
      user._id.toString(),
      course._id.toString()
    );
    
    console.log('✅ 获取解锁状态成功');
    console.log('   - 总课程数:', unlockStatus.totalLessons);
    console.log('   - 已解锁数:', unlockStatus.unlockedCount);
    console.log('   - 已完成数:', unlockStatus.completedCount);
    
    return unlockStatus;
  } catch (error) {
    console.error('❌ 解锁服务测试失败:', error.message);
    throw error;
  }
};

// 测试数据查询功能
const testDataQueries = async (user) => {
  console.log('\n🧪 测试数据查询功能...');
  try {
    // 测试用户积分历史查询
    const pointsHistory = await PointsRecord.getUserPointsHistory(user._id.toString());
    console.log('✅ 积分历史查询成功');
    console.log('   - 记录数量:', pointsHistory.length);
    
    // 测试用户总积分计算
    const totalPoints = await PointsRecord.calculateUserTotalPoints(user._id.toString());
    console.log('✅ 总积分计算成功');
    console.log('   - 总积分:', totalPoints);
    
    // 测试积分统计
    const pointsStats = await PointsRecord.getPointsStats(user._id.toString());
    console.log('✅ 积分统计查询成功');
    console.log('   - 统计数据:', JSON.stringify(pointsStats, null, 2));
    
    return { pointsHistory, totalPoints, pointsStats };
  } catch (error) {
    console.error('❌ 数据查询测试失败:', error.message);
    throw error;
  }
};

// 主测试函数
const runTests = async () => {
  console.log('🚀 开始数据库模型测试...');
  
  try {
    // 连接数据库
    await connectDB();
    
    // 清理测试数据
    await cleanupTestData();
    
    // 创建测试用户
    const testUser = await testUserCreation();
    
    // 创建测试课程
    const testCourse = await testCourseCreation(testUser);
    
    // 创建课程报名
    const testEnrollment = await testEnrollmentCreation(testUser, testCourse);
    
    // 创建积分记录
    const testPointsRecord = await testPointsRecordCreation(testUser, testCourse);
    
    // 测试积分服务
    const pointsServiceResult = await testPointsService(testUser, testCourse, testEnrollment);
    
    // 测试解锁服务
    const unlockServiceResult = await testUnlockService(testUser, testCourse);
    
    // 测试数据查询
    const queryResults = await testDataQueries(testUser);
    
    console.log('\n🎉 所有测试完成！');
    console.log('\n📊 测试结果总结:');
    console.log('   ✅ 用户模型扩展 - 正常');
    console.log('   ✅ 课程模型扩展 - 正常');
    console.log('   ✅ 报名模型扩展 - 正常');
    console.log('   ✅ 积分记录模型 - 正常');
    console.log('   ✅ 积分服务 - 正常');
    console.log('   ✅ 解锁服务 - 正常');
    console.log('   ✅ 数据查询功能 - 正常');
    
  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error.message);
    console.error(error.stack);
  } finally {
    // 清理测试数据
    await cleanupTestData();
    
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('\n🔌 数据库连接已关闭');
    process.exit(0);
  }
};

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testUserCreation,
  testCourseCreation,
  testEnrollmentCreation,
  testPointsRecordCreation,
  testPointsService,
  testUnlockService,
  testDataQueries
};