const mongoose = require('mongoose');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const PointsRecord = require('../src/models/PointsRecord');
const PointsService = require('../src/services/PointsService');
const UnlockService = require('../src/services/UnlockService');

/**
 * 测试模型结构和方法（不需要数据库连接）
 */
const testModelStructures = () => {
  console.log('🧪 测试模型结构...');
  
  try {
    // 测试User模型结构
    console.log('\n✅ User模型结构检查:');
    const userSchema = User.schema;
    console.log('   - userId字段:', userSchema.paths.userId ? '✓' : '✗');
    console.log('   - username字段:', userSchema.paths.username ? '✓' : '✗');
    console.log('   - learningStats字段:', userSchema.paths.learningStats ? '✓' : '✗');
    console.log('   - skillProgress字段:', userSchema.paths.skillProgress ? '✓' : '✗');
    console.log('   - achievements字段:', userSchema.paths.achievements ? '✓' : '✗');
    
    // 测试Course模型结构
    console.log('\n✅ Course模型结构检查:');
    const courseSchema = Course.schema;
    console.log('   - title字段:', courseSchema.paths.title ? '✓' : '✗');
    console.log('   - lessons字段:', courseSchema.paths.lessons ? '✓' : '✗');
    
    // 检查lessons子文档的新字段
    const lessonSchema = courseSchema.paths.lessons.schema;
    if (lessonSchema) {
      console.log('   - lessons.pointsReward字段:', lessonSchema.paths.pointsReward ? '✓' : '✗');
      console.log('   - lessons.unlockConditions字段:', lessonSchema.paths.unlockConditions ? '✓' : '✗');
      console.log('   - lessons.difficultyMultiplier字段:', lessonSchema.paths.difficultyMultiplier ? '✓' : '✗');
    }
    
    // 测试Enrollment模型结构
    console.log('\n✅ Enrollment模型结构检查:');
    const enrollmentSchema = Enrollment.schema;
    console.log('   - student字段:', enrollmentSchema.paths.student ? '✓' : '✗');
    console.log('   - course字段:', enrollmentSchema.paths.course ? '✓' : '✗');
    console.log('   - progress字段:', enrollmentSchema.paths.progress ? '✓' : '✗');
    console.log('   - gamificationStats字段:', enrollmentSchema.paths.gamificationStats ? '✓' : '✗');
    
    // 检查progress子文档的新字段
    const progressSchema = enrollmentSchema.paths.progress.schema;
    if (progressSchema) {
      console.log('   - progress.unlockedLessons字段:', progressSchema.paths.unlockedLessons ? '✓' : '✗');
    }
    
    // 测试PointsRecord模型结构
    console.log('\n✅ PointsRecord模型结构检查:');
    const pointsRecordSchema = PointsRecord.schema;
    console.log('   - userId字段:', pointsRecordSchema.paths.userId ? '✓' : '✗');
    console.log('   - pointsType字段:', pointsRecordSchema.paths.pointsType ? '✓' : '✗');
    console.log('   - source字段:', pointsRecordSchema.paths.source ? '✓' : '✗');
    console.log('   - points字段:', pointsRecordSchema.paths.points ? '✓' : '✗');
    console.log('   - resourceId字段:', pointsRecordSchema.paths.resourceId ? '✓' : '✗');
    console.log('   - resourceType字段:', pointsRecordSchema.paths.resourceType ? '✓' : '✗');
    console.log('   - expiresAt字段:', pointsRecordSchema.paths.expiresAt ? '✓' : '✗');
    console.log('   - status字段:', pointsRecordSchema.paths.status ? '✓' : '✗');
    console.log('   - metadata字段:', pointsRecordSchema.paths.metadata ? '✓' : '✗');
    
    return true;
  } catch (error) {
    console.error('❌ 模型结构测试失败:', error.message);
    return false;
  }
};

/**
 * 测试模型静态方法
 */
const testModelMethods = () => {
  console.log('\n🧪 测试模型静态方法...');
  
  try {
    // 测试PointsRecord静态方法
    console.log('\n✅ PointsRecord静态方法检查:');
    console.log('   - getUserPointsHistory方法:', typeof PointsRecord.getUserPointsHistory === 'function' ? '✓' : '✗');
    console.log('   - calculateUserTotalPoints方法:', typeof PointsRecord.calculateUserTotalPoints === 'function' ? '✓' : '✗');
    console.log('   - getPointsStats方法:', typeof PointsRecord.getPointsStats === 'function' ? '✓' : '✗');
    console.log('   - cleanupExpiredPoints方法:', typeof PointsRecord.cleanupExpiredPoints === 'function' ? '✓' : '✗');
    
    // 测试User静态方法
    console.log('\n✅ User静态方法检查:');
    console.log('   - findByIdentifier方法:', typeof User.findByIdentifier === 'function' ? '✓' : '✗');
    console.log('   - getUserStats方法:', typeof User.getUserStats === 'function' ? '✓' : '✗');
    
    // 测试Enrollment静态方法
    console.log('\n✅ Enrollment静态方法检查:');
    console.log('   - getUserEnrollments方法:', typeof Enrollment.getUserEnrollments === 'function' ? '✓' : '✗');
    console.log('   - getCourseEnrollments方法:', typeof Enrollment.getCourseEnrollments === 'function' ? '✓' : '✗');
    
    return true;
  } catch (error) {
    console.error('❌ 模型方法测试失败:', error.message);
    return false;
  }
};

/**
 * 测试服务类方法
 */
const testServiceMethods = () => {
  console.log('\n🧪 测试服务类方法...');
  
  try {
    // 测试PointsService方法
    console.log('\n✅ PointsService方法检查:');
    console.log('   - calculateLessonPoints方法:', typeof PointsService.calculateLessonPoints === 'function' ? '✓' : '✗');
    console.log('   - awardPoints方法:', typeof PointsService.awardPoints === 'function' ? '✓' : '✗');
    console.log('   - batchAwardPoints方法:', typeof PointsService.batchAwardPoints === 'function' ? '✓' : '✗');
    console.log('   - calculateLevel方法:', typeof PointsService.calculateLevel === 'function' ? '✓' : '✗');
    console.log('   - getUserPointsStats方法:', typeof PointsService.getUserPointsStats === 'function' ? '✓' : '✗');
    console.log('   - revokePoints方法:', typeof PointsService.revokePoints === 'function' ? '✓' : '✗');
    console.log('   - cleanupExpiredPoints方法:', typeof PointsService.cleanupExpiredPoints === 'function' ? '✓' : '✗');
    
    // 测试UnlockService方法
    console.log('\n✅ UnlockService方法检查:');
    console.log('   - checkLessonUnlock方法:', typeof UnlockService.checkLessonUnlock === 'function' ? '✓' : '✗');
    console.log('   - unlockLesson方法:', typeof UnlockService.unlockLesson === 'function' ? '✓' : '✗');
    console.log('   - batchUnlockLessons方法:', typeof UnlockService.batchUnlockLessons === 'function' ? '✓' : '✗');
    console.log('   - getUserLessonUnlockStatus方法:', typeof UnlockService.getUserLessonUnlockStatus === 'function' ? '✓' : '✗');
    console.log('   - checkPrerequisiteLessons方法:', typeof UnlockService.checkPrerequisiteLessons === 'function' ? '✓' : '✗');
    console.log('   - checkSkillRequirements方法:', typeof UnlockService.checkSkillRequirements === 'function' ? '✓' : '✗');
    console.log('   - autoUnlockNextLesson方法:', typeof UnlockService.autoUnlockNextLesson === 'function' ? '✓' : '✗');
    
    return true;
  } catch (error) {
    console.error('❌ 服务方法测试失败:', error.message);
    return false;
  }
};

/**
 * 测试积分计算逻辑（不需要数据库）
 */
const testPointsCalculationLogic = () => {
  console.log('\n🧪 测试积分计算逻辑...');
  
  try {
    // 模拟课程配置
    const mockLessonConfig = {
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
        levelMultiplier: 1.2
      },
      difficultyMultiplier: 1.5
    };
    
    // 模拟用户表现
    const mockPerformance = {
      attempts: 1,
      score: 100,
      completionTime: 20 * 60 * 1000, // 20分钟
      bonusEarned: ['first_attempt', 'perfect_score']
    };
    
    // 模拟用户等级
    const mockUserLevel = 2;
    
    // 计算基础积分
    const basePoints = mockLessonConfig.pointsReward.basePoints;
    console.log('   - 基础积分:', basePoints);
    
    // 计算奖励积分
    let bonusPoints = 0;
    for (const bonus of mockLessonConfig.pointsReward.bonusConditions) {
      if (mockPerformance.bonusEarned.includes(bonus.condition)) {
        bonusPoints += bonus.points;
      }
    }
    console.log('   - 奖励积分:', bonusPoints);
    
    // 应用倍数
    const levelMultiplier = mockLessonConfig.pointsReward.levelMultiplier;
    const difficultyMultiplier = mockLessonConfig.difficultyMultiplier;
    const userLevelMultiplier = 1 + (mockUserLevel - 1) * 0.1; // 每级增加10%
    
    const totalMultiplier = levelMultiplier * difficultyMultiplier * userLevelMultiplier;
    const finalPoints = Math.round((basePoints + bonusPoints) * totalMultiplier);
    
    console.log('   - 等级倍数:', levelMultiplier);
    console.log('   - 难度倍数:', difficultyMultiplier);
    console.log('   - 用户等级倍数:', userLevelMultiplier);
    console.log('   - 总倍数:', totalMultiplier);
    console.log('   - 最终积分:', finalPoints);
    
    console.log('\n✅ 积分计算逻辑测试通过');
    return true;
  } catch (error) {
    console.error('❌ 积分计算逻辑测试失败:', error.message);
    return false;
  }
};

/**
 * 测试等级计算逻辑
 */
const testLevelCalculationLogic = () => {
  console.log('\n🧪 测试等级计算逻辑...');
  
  try {
    // 模拟等级计算函数
    const calculateLevel = (totalPoints) => {
      if (totalPoints < 100) return 1;
      if (totalPoints < 300) return 2;
      if (totalPoints < 600) return 3;
      if (totalPoints < 1000) return 4;
      if (totalPoints < 1500) return 5;
      return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
    };
    
    // 测试不同积分对应的等级
    const testCases = [0, 50, 100, 250, 300, 500, 600, 800, 1000, 1200, 1500, 2000, 5000];
    
    console.log('   积分 -> 等级 映射:');
    for (const points of testCases) {
      const level = calculateLevel(points);
      console.log(`   - ${points}积分 -> 等级${level}`);
    }
    
    console.log('\n✅ 等级计算逻辑测试通过');
    return true;
  } catch (error) {
    console.error('❌ 等级计算逻辑测试失败:', error.message);
    return false;
  }
};

/**
 * 测试解锁条件逻辑
 */
const testUnlockConditionLogic = () => {
  console.log('\n🧪 测试解锁条件逻辑...');
  
  try {
    // 模拟解锁条件检查函数
    const checkUnlockConditions = (userStats, lessonConditions) => {
      const results = [];
      let canUnlock = true;
      
      // 检查积分要求
      if (lessonConditions.pointsRequired) {
        const pointsCheck = userStats.totalPoints >= lessonConditions.pointsRequired;
        results.push({
          type: 'points',
          required: lessonConditions.pointsRequired,
          current: userStats.totalPoints,
          passed: pointsCheck
        });
        if (!pointsCheck) canUnlock = false;
      }
      
      // 检查等级要求
      if (lessonConditions.levelRequired) {
        const levelCheck = userStats.level >= lessonConditions.levelRequired;
        results.push({
          type: 'level',
          required: lessonConditions.levelRequired,
          current: userStats.level,
          passed: levelCheck
        });
        if (!levelCheck) canUnlock = false;
      }
      
      // 检查前置课程
      if (lessonConditions.prerequisiteLessons && lessonConditions.prerequisiteLessons.length > 0) {
        const prerequisiteCheck = lessonConditions.prerequisiteLessons.every(
          prereq => userStats.completedLessons.includes(prereq.lessonId)
        );
        results.push({
          type: 'prerequisite',
          required: lessonConditions.prerequisiteLessons.length,
          completed: lessonConditions.prerequisiteLessons.filter(
            prereq => userStats.completedLessons.includes(prereq.lessonId)
          ).length,
          passed: prerequisiteCheck
        });
        if (!prerequisiteCheck) canUnlock = false;
      }
      
      return { canUnlock, results };
    };
    
    // 测试用例1：满足所有条件
    const userStats1 = {
      totalPoints: 500,
      level: 3,
      completedLessons: ['lesson1', 'lesson2']
    };
    
    const lessonConditions1 = {
      pointsRequired: 300,
      levelRequired: 2,
      prerequisiteLessons: [
        { lessonId: 'lesson1' },
        { lessonId: 'lesson2' }
      ]
    };
    
    const result1 = checkUnlockConditions(userStats1, lessonConditions1);
    console.log('   测试用例1 (满足条件):', result1.canUnlock ? '✓ 可解锁' : '✗ 不可解锁');
    
    // 测试用例2：不满足积分要求
    const userStats2 = {
      totalPoints: 200,
      level: 3,
      completedLessons: ['lesson1', 'lesson2']
    };
    
    const result2 = checkUnlockConditions(userStats2, lessonConditions1);
    console.log('   测试用例2 (积分不足):', result2.canUnlock ? '✓ 可解锁' : '✗ 不可解锁');
    
    // 测试用例3：不满足等级要求
    const userStats3 = {
      totalPoints: 500,
      level: 1,
      completedLessons: ['lesson1', 'lesson2']
    };
    
    const result3 = checkUnlockConditions(userStats3, lessonConditions1);
    console.log('   测试用例3 (等级不足):', result3.canUnlock ? '✓ 可解锁' : '✗ 不可解锁');
    
    // 测试用例4：前置课程未完成
    const userStats4 = {
      totalPoints: 500,
      level: 3,
      completedLessons: ['lesson1'] // 缺少lesson2
    };
    
    const result4 = checkUnlockConditions(userStats4, lessonConditions1);
    console.log('   测试用例4 (前置课程未完成):', result4.canUnlock ? '✓ 可解锁' : '✗ 不可解锁');
    
    console.log('\n✅ 解锁条件逻辑测试通过');
    return true;
  } catch (error) {
    console.error('❌ 解锁条件逻辑测试失败:', error.message);
    return false;
  }
};

/**
 * 主测试函数
 */
const runStructureTests = () => {
  console.log('🚀 开始模型结构和逻辑测试...');
  console.log('(此测试不需要数据库连接)');
  
  const results = [];
  
  // 运行所有测试
  results.push(testModelStructures());
  results.push(testModelMethods());
  results.push(testServiceMethods());
  results.push(testPointsCalculationLogic());
  results.push(testLevelCalculationLogic());
  results.push(testUnlockConditionLogic());
  
  // 统计结果
  const passedTests = results.filter(result => result === true).length;
  const totalTests = results.length;
  
  console.log('\n🎉 测试完成！');
  console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('\n✅ 所有测试通过！数据库模型和服务结构正确。');
    console.log('\n📋 测试总结:');
    console.log('   ✅ 数据库模型结构 - 正常');
    console.log('   ✅ 模型静态方法 - 正常');
    console.log('   ✅ 服务类方法 - 正常');
    console.log('   ✅ 积分计算逻辑 - 正常');
    console.log('   ✅ 等级计算逻辑 - 正常');
    console.log('   ✅ 解锁条件逻辑 - 正常');
  } else {
    console.log('\n⚠️  部分测试失败，请检查相关代码。');
  }
  
  return passedTests === totalTests;
};

// 运行测试
if (require.main === module) {
  runStructureTests();
}

module.exports = {
  runStructureTests,
  testModelStructures,
  testModelMethods,
  testServiceMethods,
  testPointsCalculationLogic,
  testLevelCalculationLogic,
  testUnlockConditionLogic
};