const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');
const Enrollment = require('./src/models/Enrollment');
const PointsRecord = require('./src/models/PointsRecord');
require('dotenv').config();

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/rural-art-platform-dev?authSource=admin');
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// 清空数据库
const clearDatabase = async () => {
  console.log('🧹 清空现有数据...');
  await User.deleteMany({});
  await Course.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await Enrollment.deleteMany({});
  await PointsRecord.deleteMany({});
  console.log('✅ 数据库清空完成');
};

// 创建用户数据
const createUsers = async () => {
  console.log('👥 创建用户数据...');
  // 使用明文密码，让User模型的pre-save钩子来处理哈希
  const adminPassword = 'admin123456';
  const teacherPassword = 'teacher789';
  const studentPassword = 'student123';
  const  testPassword = 'zhangshan123'; // zhangshan用户密码
  
  const users = [
    // 管理员用户
    {
      userId: 'ADMIN001',
      username: 'admin',
      password: adminPassword,
      profile: {
        nickname: '系统管理员',
        bio: '乡村艺术平台管理员',
        avatar: '/placeholder-user.jpg',
        location: '北京市',
        gender: 'other'
      },
      role: 'admin',
      learningStats: {
        totalPoints: 10000,
        studyDays: 365,
        completedCourses: 20
      }
    },
    // 艺术导师
    {
      userId: 'ART001',
      username: 'teacher_art',
      password: teacherPassword,
      profile: {
        nickname: '艺术导师',
        bio: '专业艺术教育导师，擅长传统文化传承',
        avatar: '/placeholder-user.jpg',
        location: '西安市',
        gender: 'female'
      },
      role: 'creator',
      learningStats: {
        totalPoints: 8500,
        studyDays: 280,
        completedCourses: 15
      },
      creatorStats: {
        coursesCreated: 6,
        totalViews: 12500,
        rating: 4.8
      },
      skillProgress: {
        artSkills: {
          progress: 95,
          skills: [
            { name: '剪纸艺术', level: '专家', progress: 100 },
            { name: '传统绘画', level: '高级', progress: 90 },
            { name: '刺绣工艺', level: '高级', progress: 85 }
          ]
        }
      }
    },
    // 数字技能专家
    {
      userId: 'DIG001',
      username: 'teacher_digital',
      password: teacherPassword,
      profile: {
        nickname: '数字技能专家',
        bio: '数字技能培训专家，专注乡村数字化发展',
        avatar: '/placeholder-user.jpg',
        location: '杭州市',
        gender: 'male'
      },
      role: 'creator',
      learningStats: {
        totalPoints: 7200,
        studyDays: 220,
        completedCourses: 12
      },
      creatorStats: {
        coursesCreated: 4,
        totalViews: 8900,
        rating: 4.6
      },
      skillProgress: {
        digitalSkills: {
          progress: 92,
          skills: [
            { name: '手机摄影', level: '专家', progress: 95 },
            { name: '微信运营', level: '高级', progress: 88 },
            { name: '电商运营', level: '中级', progress: 75 }
          ]
        }
      }
    },
    // 普通学员
    {
      userId: 'STU001',
      username: 'student1',
      password: studentPassword,
      profile: {
        nickname: '小花',
        bio: '热爱传统艺术的乡村学员',
        avatar: '/placeholder-user.jpg',
        location: '延安市',
        gender: 'female'
      },
      role: 'user',
      learningStats: {
        totalPoints: 1250,
        studyDays: 45,
        completedCourses: 3,
        todayStudyTime: 30,
        weeklyStudyDays: 5,
        currentStreak: 7
      },
      socialStats: {
        followersCount: 23,
        followingCount: 15,
        likesReceived: 89
      },
      skillProgress: {
        artSkills: {
          progress: 35,
          skills: [
            { name: '剪纸艺术', level: '初级', progress: 45 },
            { name: '传统绘画', level: '入门', progress: 25 }
          ]
        }
      },
      achievements: [
        {
          id: 1,
          title: '初学者',
          description: '完成第一个课程',
          icon: '🎓',
          earned: true,
          earnedDate: new Date('2024-01-15')
        }
      ]
    },
    {
      userId: 'STU002',
      username: 'student2',
      password: studentPassword,
      profile: {
        nickname: '阿强',
        bio: '想学数字技能帮助家乡发展',
        avatar: '/placeholder-user.jpg',
        location: '榆林市',
        gender: 'male'
      },
      role: 'user',
      learningStats: {
        totalPoints: 890,
        studyDays: 28,
        completedCourses: 2,
        todayStudyTime: 45,
        weeklyStudyDays: 4,
        currentStreak: 3
      },
      socialStats: {
        followersCount: 12,
        followingCount: 28,
        likesReceived: 34
      },
      skillProgress: {
        digitalSkills: {
          progress: 28,
          skills: [
            { name: '手机摄影', level: '初级', progress: 35 },
            { name: '微信运营', level: '入门', progress: 20 }
          ]
        }
      }
    },
    {
      userId: 'STU003',
      username: 'student3',
      password: studentPassword,
      profile: {
        nickname: '梅姐',
        bio: '退休教师，想学习新技能',
        avatar: '/elderly-woman-avatar.png',
        location: '宝鸡市',
        gender: 'female'
      },
      role: 'user',
      learningStats: {
        totalPoints: 2100,
        studyDays: 78,
        completedCourses: 5,
        todayStudyTime: 60,
        weeklyStudyDays: 6,
        currentStreak: 12
      },
      socialStats: {
        followersCount: 45,
        followingCount: 8,
        likesReceived: 156
      },
      skillProgress: {
        artSkills: {
          progress: 68,
          skills: [
            { name: '剪纸艺术', level: '中级', progress: 75 },
            { name: '传统绘画', level: '中级', progress: 60 },
            { name: '书法艺术', level: '初级', progress: 45 }
          ]
        }
      },
      achievements: [
        {
          id: 1,
          title: '初学者',
          description: '完成第一个课程',
          icon: '🎓',
          earned: true,
          earnedDate: new Date('2024-01-10')
        },
        {
          id: 2,
          title: '勤奋学习者',
          description: '连续学习10天',
          icon: '📚',
          earned: true,
          earnedDate: new Date('2024-01-25')
        }
      ]
    },
    // 新增测试用户 - 用于展示卡片式学习路径
    {
      userId: 'STU004',
      username: 'test_user',
      password: testPassword,
      profile: {
        nickname: '测试学员',
        bio: '用于测试各种功能的学员账号',
        avatar: '/placeholder-user.jpg',
        location: '西安市',
        gender: 'male'
      },
      role: 'user',
      learningStats: {
        totalPoints: 3500,
        studyDays: 95,
        completedCourses: 8,
        todayStudyTime: 120,
        weeklyStudyDays: 7,
        currentStreak: 21
      },
      socialStats: {
        followersCount: 67,
        followingCount: 34,
        likesReceived: 234
      },
      skillProgress: {
        artSkills: {
          progress: 85,
          skills: [
            { name: '剪纸艺术', level: '高级', progress: 90 },
            { name: '传统绘画', level: '高级', progress: 85 },
            { name: '书法艺术', level: '中级', progress: 70 },
            { name: '刺绣工艺', level: '中级', progress: 65 }
          ]
        },
        digitalSkills: {
          progress: 78,
          skills: [
            { name: '手机摄影', level: '高级', progress: 88 },
            { name: '微信运营', level: '中级', progress: 75 },
            { name: '电商运营', level: '中级', progress: 70 }
          ]
        }
      },
      achievements: [
        {
          id: 1,
          title: '初学者',
          description: '完成第一个课程',
          icon: '🎓',
          earned: true,
          earnedDate: new Date('2024-01-05')
        },
        {
          id: 2,
          title: '勤奋学习者',
          description: '连续学习10天',
          icon: '📚',
          earned: true,
          earnedDate: new Date('2024-01-15')
        },
        {
          id: 3,
          title: '学习达人',
          description: '连续学习20天',
          icon: '🏆',
          earned: true,
          earnedDate: new Date('2024-01-25')
        },
        {
          id: 4,
          title: '技能专家',
          description: '完成5个不同类别的课程',
          icon: '⭐',
          earned: true,
          earnedDate: new Date('2024-02-01')
        },
        {
          id: 5,
          title: '社交达人',
          description: '获得100个点赞',
          icon: '👥',
          earned: true,
          earnedDate: new Date('2024-02-05')
        }
      ]
    },
    // 新增演示用户zhangshan
    {
      userId: 'zhangshan',
      username: 'zhangshan',
      password: testPassword,
      profile: {
        displayName: '张山',
        bio: '热爱传统文化艺术，特别是瑶族刺绣技艺。已学习多门传统艺术课程，积极参与社区文化传承活动。',
        avatar: '/avatars/zhangshan.jpg',
        location: '广东省清远市连南瑶族自治县',
        birthDate: new Date('1985-03-15'),
        occupation: '文化传承工作者',
        interests: ['瑶绣', '传统工艺', '非遗传承', '民族文化'],
        contactInfo: {
          phone: '13800138888',
          email: 'zhangshan@example.com',
          wechat: 'zhangshan_yao'
        }
      },
      role: 'user',
      learningStats: {
        totalCourses: 5,
        completedCourses: 3,
        totalLearningTime: 2880, // 48小时
        todayStudyTime: 120,
        studyDays: 45,
        weeklyStudyDays: 5,
        totalPoints: 1250,
        currentStreak: 15,
        longestStreak: 28,
        weeklyProgress: 85
      },
      socialStats: {
        followersCount: 89,
        followingCount: 67,
        likesReceived: 156,
        commentsCount: 45
      },
      skillProgress: {
        artSkills: {
          title: '艺术技能',
          progress: 75,
          skills: [
            { name: '瑶绣技艺', level: '中级', progress: 85 },
            { name: '传统工艺', level: '高级', progress: 90 },
            { name: '图案设计', level: '中级', progress: 65 }
          ]
        },
        digitalSkills: {
          title: '数字技能',
          progress: 45,
          skills: [
            { name: '色彩搭配', level: '初级', progress: 60 },
            { name: '文化传承', level: '高级', progress: 92 }
          ]
        }
      },
      achievements: [
        {
          id: 1,
          title: '初学者',
          description: '完成第一门课程',
          icon: 'trophy',
          earned: true,
          earnedDate: new Date('2024-01-15')
        },
        {
          id: 2,
          title: '传统工艺达人',
          description: '在传统工艺技能达到4级',
          icon: 'star',
          earned: true,
          earnedDate: new Date('2024-02-01')
        },
        {
          id: 3,
          title: '勤奋学习者',
          description: '连续学习15天',
          icon: 'calendar',
          earned: true,
          earnedDate: new Date('2024-02-10')
        },
        {
          id: 4,
          title: '社区贡献者',
          description: '发布10篇以上的学习心得',
          icon: 'users',
          earned: true,
          earnedDate: new Date('2024-02-08')
        }
      ],
      preferences: {
        language: 'zh-CN',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          showProfile: true,
          showProgress: true,
          showAchievements: true
        }
      },
      createdAt: new Date('2024-01-10'),
      lastLoginAt: new Date('2024-02-14')
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
    createdUsers.push(user);
    console.log(`✅ 创建用户: ${user.username}`);
  }
  
  return createdUsers;
};

// 创建课程数据（基于现有的seed-courses.js）
const createCourses = async (users) => {
  console.log('📚 创建课程数据...');
  const [admin, artTeacher, digitalTeacher, student1, student2, student3, testUser] = users;

  const courses = [
    {
      title: '陕北剪纸艺术入门',
      description: '传承千年民间艺术，感受文化魅力。学习传统剪纸的基本技法，从简单的花鸟图案开始，逐步掌握复杂的剪纸技艺。',
      category: 'paper-art',
      difficulty: 'beginner',
      thumbnail: '/traditional-paper-cutting.png',
      creator: artTeacher._id,
      estimatedDuration: 45,
      tags: ['剪纸', '传统艺术', '手工制作', '文化传承'],
      lessons: [
        {
          title: '工具认识与准备',
          description: '了解剪纸所需的基本工具和材料',
          videoUrl: '/uploads/videos/lesson-1-tools.mp4',
          duration: 5,
          order: 1,
          isPreview: true
        },
        {
          title: '基础图案练习',
          description: '学习简单的几何图案剪纸技法',
          videoUrl: '/uploads/videos/lesson-2-basic.mp4',
          duration: 8,
          order: 2
        },
        {
          title: '花鸟图案设计',
          description: '掌握花鸟主题的剪纸设计和制作',
          videoUrl: '/uploads/videos/lesson-3-flowers.mp4',
          duration: 12,
          order: 3
        },
        {
          title: '复杂构图技巧',
          description: '学习复杂图案的构图和剪制技巧',
          videoUrl: '/uploads/videos/lesson-4-complex.mp4',
          duration: 15,
          order: 4
        },
        {
          title: '作品创作实践',
          description: '独立完成一幅完整的剪纸作品',
          videoUrl: '/uploads/videos/lesson-5-practice.mp4',
          duration: 20,
          order: 5
        }
      ],
      stats: {
        enrolledCount: 234,
        completedCount: 187,
        viewCount: 1568,
        likeCount: 156,
        rating: { average: 4.8, count: 89 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-01-01')
    },
    {
      title: '传统绘画基础',
      description: '学习中国传统绘画技法，掌握水墨画的基本技巧和意境表达。',
      category: 'painting',
      difficulty: 'beginner',
      thumbnail: '/traditional-chinese-painting.png',
      creator: artTeacher._id,
      estimatedDuration: 60,
      tags: ['绘画', '水墨画', '传统艺术', '文化'],
      lessons: [
        {
          title: '绘画工具介绍',
          description: '了解传统绘画的笔墨纸砚',
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: '基础笔法练习',
          description: '掌握基本的用笔技法',
          duration: 15,
          order: 2
        },
        {
          title: '墨色运用技巧',
          description: '学习墨色的浓淡变化',
          duration: 20,
          order: 3
        },
        {
          title: '简单花卉绘制',
          description: '练习绘制简单的花卉图案',
          duration: 15,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 189,
        completedCount: 134,
        viewCount: 892,
        likeCount: 78,
        rating: { average: 4.7, count: 56 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-01-15')
    },
    {
      title: '手机摄影技巧',
      description: '用手机记录美好乡村生活，掌握手机摄影的构图、光线运用等技巧。',
      category: 'other',
      difficulty: 'beginner',
      thumbnail: '/mobile-rural-landscape.png',
      creator: digitalTeacher._id,
      estimatedDuration: 60,
      tags: ['摄影', '手机摄影', '构图', '光线'],
      lessons: [
        {
          title: '手机摄影基础',
          description: '了解手机摄影的基本原理',
          videoUrl: '/uploads/videos/lesson-1-basics.mp4',
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: '构图技巧',
          description: '学习摄影构图的基本法则',
          videoUrl: '/uploads/videos/lesson-2-composition.mp4',
          duration: 15,
          order: 2
        },
        {
          title: '光线运用',
          description: '掌握自然光的运用技巧',
          videoUrl: '/uploads/videos/lesson-3-lighting.mp4',
          duration: 15,
          order: 3
        },
        {
          title: '后期处理',
          description: '学习基础的照片后期处理',
          videoUrl: '/uploads/videos/lesson-4-editing.mp4',
          duration: 20,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 156,
        completedCount: 98,
        viewCount: 678,
        likeCount: 67,
        rating: { average: 4.6, count: 43 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-01-10')
    },
    {
      title: '微信小商店运营',
      description: '让土特产走向更广阔的市场，学习微信小商店的运营技巧。',
      category: 'other',
      difficulty: 'intermediate',
      thumbnail: '/wechat-mini-store-rural-products.png',
      creator: digitalTeacher._id,
      estimatedDuration: 90,
      tags: ['电商', '微信小商店', '运营', '营销'],
      lessons: [
        {
          title: '小商店开通流程',
          description: '学习如何开通微信小商店',
          videoUrl: '/uploads/videos/lesson-1-setup.mp4',
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: '商品上架技巧',
          description: '掌握商品上架的方法和技巧',
          videoUrl: '/uploads/videos/lesson-2-products.mp4',
          duration: 20,
          order: 2
        },
        {
          title: '店铺装修设计',
          description: '学习店铺页面的装修设计',
          videoUrl: '/uploads/videos/lesson-3-design.mp4',
          duration: 25,
          order: 3
        },
        {
          title: '营销推广策略',
          description: '掌握有效的营销推广方法',
          videoUrl: '/uploads/videos/lesson-4-marketing.mp4',
          duration: 30,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 98,
        completedCount: 45,
        viewCount: 456,
        likeCount: 34,
        rating: { average: 4.5, count: 23 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-01-20')
    },
    // 新增卡片式课程 - 书法艺术进阶
    {
      title: '书法艺术进阶之路',
      description: '从基础笔画到作品创作，系统学习中国书法艺术。采用卡片式学习路径，循序渐进掌握书法精髓。',
      category: 'calligraphy',
      difficulty: 'intermediate',
      thumbnail: '/calligraphy-art.png',
      creator: artTeacher._id,
      estimatedDuration: 120,
      tags: ['书法', '传统艺术', '文化传承', '卡片式学习'],
      // 卡片式学习路径设计
      learningPath: {
        totalCards: 15,
        completedCards: 0,
        currentCard: 1,
        pathType: 'sequential', // 顺序解锁
        cards: [
          {
            id: 1,
            title: '书法基础认知',
            type: 'theory',
            status: 'unlocked',
            points: 30,
            prerequisites: [],
            estimatedTime: 15
          },
          {
            id: 2,
            title: '笔墨纸砚选择',
            type: 'practical',
            status: 'locked',
            points: 40,
            prerequisites: [1],
            estimatedTime: 20
          },
          {
            id: 3,
            title: '基础笔画练习',
            type: 'practice',
            status: 'locked',
            points: 50,
            prerequisites: [2],
            estimatedTime: 30
          }
        ]
      },
      lessons: [
        {
          title: '书法历史与流派',
          description: '了解中国书法的发展历程和主要流派',
          videoUrl: '/uploads/videos/calligraphy-1-history.mp4',
          duration: 15,
          order: 1,
          isPreview: true,
          cardId: 1,
          lessonType: 'theory',
          interactiveElements: [
            {
              type: 'quiz',
              questions: [
                {
                  question: '中国书法有几大基本字体？',
                  options: ['3种', '4种', '5种', '6种'],
                  correct: 2,
                  points: 10
                }
              ]
            }
          ]
        },
        {
          title: '工具材料详解',
          description: '深入了解书法四宝的选择和使用',
          videoUrl: '/uploads/videos/calligraphy-2-tools.mp4',
          duration: 20,
          order: 2,
          cardId: 2,
          lessonType: 'practical',
          practiceTask: {
            type: 'tool_identification',
            description: '识别不同类型的毛笔和纸张',
            points: 15
          }
        },
        {
          title: '基础笔画训练',
          description: '掌握横、竖、撇、捺等基本笔画',
          videoUrl: '/uploads/videos/calligraphy-3-strokes.mp4',
          duration: 30,
          order: 3,
          cardId: 3,
          lessonType: 'practice',
          practiceTask: {
            type: 'stroke_practice',
            description: '完成基础笔画练习',
            requiredPractices: 20,
            points: 25
          }
        }
      ],
      gamification: {
        pointsSystem: {
          lessonCompletion: 50,
          perfectScore: 25,
          practiceCompletion: 30,
          streakBonus: 10
        },
        achievements: [
          {
            id: 'calligraphy_beginner',
            title: '书法入门',
            description: '完成前3个基础课程',
            icon: '✍️',
            points: 100
          },
          {
            id: 'stroke_master',
            title: '笔画大师',
            description: '所有基础笔画练习获得90分以上',
            icon: '🖌️',
            points: 150
          }
        ]
      },
      stats: {
        enrolledCount: 156,
        completedCount: 89,
        viewCount: 1234,
        likeCount: 98,
        rating: { average: 4.9, count: 67 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true,
        enableGamification: true
      },
      publishedAt: new Date('2024-02-01')
    },
    // 新增卡片式课程 - 乡村电商实战
    {
      title: '乡村电商实战训练营',
      description: '从零开始学习电商运营，帮助乡村产品走向市场。包含店铺搭建、产品拍摄、营销推广等全流程实战训练。',
      category: 'other',
      difficulty: 'intermediate',
      thumbnail: '/rural-ecommerce.png',
      creator: digitalTeacher._id,
      estimatedDuration: 180,
      tags: ['电商', '营销', '乡村振兴', '实战训练'],
      // 分支式学习路径
      learningPath: {
        totalCards: 20,
        completedCards: 0,
        currentCard: 1,
        pathType: 'branched', // 分支解锁
        cards: [
          {
            id: 1,
            title: '电商基础概念',
            type: 'theory',
            status: 'unlocked',
            points: 40,
            prerequisites: [],
            estimatedTime: 25
          },
          {
            id: 2,
            title: '平台选择策略',
            type: 'strategy',
            status: 'locked',
            points: 50,
            prerequisites: [1],
            estimatedTime: 30
          },
          {
            id: 3,
            title: '产品拍摄技巧',
            type: 'practical',
            status: 'locked',
            points: 60,
            prerequisites: [2],
            estimatedTime: 45
          },
          {
            id: 4,
            title: '文案撰写技巧',
            type: 'creative',
            status: 'locked',
            points: 55,
            prerequisites: [2],
            estimatedTime: 40
          }
        ]
      },
      lessons: [
        {
          title: '电商生态系统概览',
          description: '了解现代电商的运作模式和发展趋势',
          videoUrl: '/uploads/videos/ecommerce-1-overview.mp4',
          duration: 25,
          order: 1,
          isPreview: true,
          cardId: 1,
          lessonType: 'theory'
        },
        {
          title: '平台对比与选择',
          description: '分析不同电商平台的特点和适用场景',
          videoUrl: '/uploads/videos/ecommerce-2-platforms.mp4',
          duration: 30,
          order: 2,
          cardId: 2,
          lessonType: 'strategy',
          caseStudy: {
            title: '成功案例分析',
            description: '分析3个乡村电商成功案例',
            points: 20
          }
        },
        {
          title: '产品摄影实战',
          description: '学习用手机拍出专业的产品照片',
          videoUrl: '/uploads/videos/ecommerce-3-photography.mp4',
          duration: 45,
          order: 3,
          cardId: 3,
          lessonType: 'practical',
          practiceTask: {
            type: 'photo_assignment',
            description: '拍摄5张不同角度的产品照片',
            points: 30
          }
        }
      ],
      stats: {
        enrolledCount: 234,
        completedCount: 123,
        viewCount: 2156,
        likeCount: 187,
        rating: { average: 4.7, count: 89 }
      },
      settings: {
        isPublished: true,
        isFree: false,
        price: 199,
        allowComments: true,
        enableGamification: true
      },
      publishedAt: new Date('2024-02-10')
    },
    // 新增瑶绣制作技艺培训课程
    {
      title: '瑶绣制作技艺培训',
      description: '深入学习瑶族传统刺绣技艺，掌握瑶绣的历史文化、制作工艺和现代应用。符合广东省专项职业能力补贴条件，补贴标准800元。',
      category: 'traditional-crafts',
      difficulty: 'intermediate',
      thumbnail: '/yao-embroidery-art.png',
      creator: artTeacher._id,
      estimatedDuration: 1320, // 22小时
      tags: ['瑶绣', '非遗传承', '传统工艺', '政府补贴', '专项职业能力'],
      lessons: [
        {
          title: '瑶绣文化与历史',
          description: '深入了解瑶族文化背景、瑶绣的历史发展和文化内涵',
          videoUrl: '/uploads/videos/yao-culture-history.mp4',
          duration: 120,
          order: 1,
          isPreview: true,
          materials: [
            { type: 'pdf', title: '瑶族文化概述', url: '/materials/yao-culture-overview.pdf' },
            { type: 'image', title: '瑶绣历史图片集', url: '/materials/yao-embroidery-history.jpg' },
            { type: 'pdf', title: '瑶绣图案文化寓意解读', url: '/materials/yao-patterns-meaning.pdf' }
          ]
        },
        {
          title: '瑶绣制作基础',
          description: '学习瑶绣制作工具、材料选择和基础针法技巧',
          videoUrl: '/uploads/videos/yao-embroidery-basics.mp4',
          duration: 240,
          order: 2,
          materials: [
            { type: 'pdf', title: '瑶绣工具材料指南', url: '/materials/yao-tools-materials.pdf' },
            { type: 'video', title: '基础针法演示', url: '/materials/basic-stitches-demo.mp4' },
            { type: 'pdf', title: '针法练习图谱', url: '/materials/stitch-practice-patterns.pdf' }
          ]
        },
        {
          title: '瑶绣图案设计与色彩搭配',
          description: '掌握传统图案解析、现代设计思路和色彩搭配原则',
          videoUrl: '/uploads/videos/yao-pattern-design.mp4',
          duration: 240,
          order: 3,
          materials: [
            { type: 'pdf', title: '传统瑶绣图案集', url: '/materials/traditional-yao-patterns.pdf' },
            { type: 'pdf', title: '色彩搭配指南', url: '/materials/color-matching-guide.pdf' },
            { type: 'image', title: '现代瑶绣设计案例', url: '/materials/modern-yao-designs.jpg' }
          ]
        },
        {
          title: '瑶绣制作进阶技法',
          description: '学习复杂图案绣制和创新技法应用',
          videoUrl: '/uploads/videos/yao-advanced-techniques.mp4',
          duration: 360,
          order: 4,
          materials: [
            { type: 'pdf', title: '复杂图案制作指南', url: '/materials/complex-pattern-guide.pdf' },
            { type: 'video', title: '创新技法演示', url: '/materials/innovative-techniques.mp4' },
            { type: 'pdf', title: '瑶绣与现代工艺融合', url: '/materials/modern-fusion-techniques.pdf' }
          ]
        },
        {
          title: '政府补贴政策解读',
          description: '全面了解瑶绣相关的政府补贴政策和申请流程',
          videoUrl: '/uploads/videos/subsidy-policy-explanation.mp4',
          duration: 120,
          order: 5,
          materials: [
            { type: 'pdf', title: '广东省瑶绣补贴政策详解', url: '/materials/guangdong-yao-subsidy-policy.pdf' },
            { type: 'pdf', title: '非遗传承补助政策', url: '/materials/intangible-heritage-subsidy.pdf' },
            { type: 'pdf', title: '文创产品奖励政策', url: '/materials/cultural-product-rewards.pdf' }
          ]
        },
        {
          title: '补贴申请实战指导',
          description: '实际操作补贴申请流程，准备申请材料',
          videoUrl: '/uploads/videos/subsidy-application-practice.mp4',
          duration: 120,
          order: 6,
          materials: [
            { type: 'pdf', title: '补贴申请材料清单', url: '/materials/subsidy-application-checklist.pdf' },
            { type: 'pdf', title: '申请表格填写指南', url: '/materials/application-form-guide.pdf' },
            { type: 'pdf', title: '申请流程操作手册', url: '/materials/application-process-manual.pdf' }
          ]
        },
        {
          title: '瑶绣作品创作实践',
          description: '综合运用所学技能，独立完成瑶绣作品创作',
          videoUrl: '/uploads/videos/yao-embroidery-creation.mp4',
          duration: 240,
          order: 7,
          materials: [
            { type: 'pdf', title: '作品创作指导', url: '/materials/creation-guidance.pdf' },
            { type: 'image', title: '优秀作品展示', url: '/materials/excellent-works-showcase.jpg' },
            { type: 'pdf', title: '作品评价标准', url: '/materials/work-evaluation-criteria.pdf' }
          ]
        }
      ],
      // 政府补贴相关信息
      subsidyInfo: {
        eligible: true,
        subsidyAmount: 800,
        subsidyType: '专项职业能力补贴',
        policyDocument: '广东省职业技能培训补贴（指导）标准目录（2025年版）',
        requirements: [
          '法定劳动年龄内人员',
          '取得广东省内颁发的瑶绣制作专项职业能力证书',
          '完成规定的培训课程并通过考核'
        ],
        applicationProcess: [
          '培训报名',
          '参加培训',
          '考核鉴定',
          '申请补贴',
          '审核拨付'
        ]
      },
      stats: {
        enrolledCount: 89,
        completedCount: 67,
        viewCount: 456,
        likeCount: 78,
        rating: { average: 4.9, count: 45 }
      },
      settings: {
        isPublished: true,
        isFree: false,
        price: 1200,
        allowComments: true,
        enableCertification: true,
        certificationName: '广东省瑶绣制作专项职业能力证书'
      },
      publishedAt: new Date('2024-02-15')
    }
  ];

  const createdCourses = [];
  for (const courseData of courses) {
    const course = new Course(courseData);
    await course.save();
    createdCourses.push(course);
    console.log(`✅ 创建课程: ${course.title}`);
  }
  
  return createdCourses;
};

// 创建帖子数据
const createPosts = async (users, courses) => {
  console.log('📝 创建帖子数据...');
  const [admin, artTeacher, digitalTeacher, student1, student2, student3] = users;
  const [course1, course2, course3, course4] = courses;

  const posts = [
    {
      content: '今天完成了剪纸课程的第一课，学会了基本的工具使用！老师讲得很详细，期待后面的课程。 #剪纸艺术 #学习分享',
      author: student1._id,
      images: [
        {
          url: '/paper-cutting-flower-bird.png',
          alt: '剪纸作品展示',
          width: 800,
          height: 600
        }
      ],
      tags: ['剪纸艺术', '学习分享', '传统文化'],
      type: 'share',
      relatedCourse: course1._id,
      stats: {
        viewCount: 156,
        likeCount: 23,
        commentCount: 8,
        shareCount: 3
      },
      publishedAt: new Date('2024-01-16')
    },
    {
      content: '用手机拍了家乡的田园风光，运用了课程里学到的构图技巧，感觉效果不错！分享给大家看看。',
      author: student2._id,
      images: [
        {
          url: '/rural-landscape-illustration.png',
          alt: '乡村风光摄影',
          width: 1200,
          height: 800
        }
      ],
      tags: ['手机摄影', '乡村风光', '构图技巧'],
      type: 'showcase',
      relatedCourse: course3._id,
      stats: {
        viewCount: 234,
        likeCount: 45,
        commentCount: 12,
        shareCount: 8
      },
      publishedAt: new Date('2024-01-18')
    },
    {
      content: '刚开了微信小商店，准备把家里的土特产卖出去。感谢数字技能课程的指导，让我这个老年人也能跟上时代！',
      author: student3._id,
      tags: ['微信小商店', '电商运营', '土特产'],
      type: 'share',
      relatedCourse: course4._id,
      stats: {
        viewCount: 189,
        likeCount: 67,
        commentCount: 15,
        shareCount: 12
      },
      publishedAt: new Date('2024-01-22')
    },
    {
      content: '大家在学习传统绘画时，有什么好的练习方法吗？我总是掌握不好墨色的浓淡变化。',
      author: student1._id,
      tags: ['传统绘画', '学习求助', '墨色技巧'],
      type: 'question',
      relatedCourse: course2._id,
      stats: {
        viewCount: 98,
        likeCount: 12,
        commentCount: 6,
        shareCount: 2
      },
      publishedAt: new Date('2024-01-25')
    },
    {
      content: '作为艺术导师，我想分享一些剪纸的小技巧：1. 选择合适的纸张很重要 2. 剪刀要保持锋利 3. 从简单图案开始练习。希望对大家有帮助！',
      author: artTeacher._id,
      tags: ['剪纸技巧', '教学分享', '经验总结'],
      type: 'tutorial',
      stats: {
        viewCount: 456,
        likeCount: 89,
        commentCount: 23,
        shareCount: 34
      },
      publishedAt: new Date('2024-01-28')
    },
    {
      content: '数字化时代，乡村也要跟上步伐。通过学习数字技能，我们可以让传统文化通过网络传播得更远。大家一起加油！',
      author: digitalTeacher._id,
      tags: ['数字化', '乡村发展', '文化传播'],
      type: 'discussion',
      stats: {
        viewCount: 312,
        likeCount: 56,
        commentCount: 18,
        shareCount: 15
      },
      publishedAt: new Date('2024-01-30')
    }
  ];

  const createdPosts = [];
  for (const postData of posts) {
    const post = new Post(postData);
    await post.save();
    createdPosts.push(post);
    console.log(`✅ 创建帖子: ${post.content.substring(0, 30)}...`);
  }
  
  return createdPosts;
};

// 创建评论数据
const createComments = async (users, posts) => {
  console.log('💬 创建评论数据...');
  const [admin, artTeacher, digitalTeacher, student1, student2, student3] = users;
  const [post1, post2, post3, post4, post5, post6] = posts;

  const comments = [
    {
      content: '做得很棒！继续加油，剪纸是很有意思的艺术形式。',
      author: artTeacher._id,
      targetType: 'Post',
      targetId: post1._id,
      stats: { likeCount: 5 }
    },
    {
      content: '谢谢老师的鼓励！我会继续努力学习的。',
      author: student1._id,
      targetType: 'Post',
      targetId: post1._id,
      stats: { likeCount: 2 }
    },
    {
      content: '照片拍得真好！构图很有层次感，学以致用的典型例子。',
      author: digitalTeacher._id,
      targetType: 'Post',
      targetId: post2._id,
      stats: { likeCount: 8 }
    },
    {
      content: '梅姐真厉害！我也想学习开网店，可以请教一下吗？',
      author: student1._id,
      targetType: 'Post',
      targetId: post3._id,
      stats: { likeCount: 3 }
    },
    {
      content: '当然可以！我们可以互相交流学习心得。',
      author: student3._id,
      targetType: 'Post',
      targetId: post3._id,
      parentComment: null, // 这里需要设置为上一个评论的ID，简化处理
      level: 1,
      stats: { likeCount: 4 }
    },
    {
      content: '墨色控制确实需要多练习，建议先从调色开始，慢慢掌握水墨比例。',
      author: artTeacher._id,
      targetType: 'Post',
      targetId: post4._id,
      stats: { likeCount: 6 }
    },
    {
      content: '老师的建议很实用！感谢分享这些技巧。',
      author: student2._id,
      targetType: 'Post',
      targetId: post5._id,
      stats: { likeCount: 12 }
    },
    {
      content: '说得对！传统文化需要现代技术来传承和发展。',
      author: student3._id,
      targetType: 'Post',
      targetId: post6._id,
      stats: { likeCount: 7 }
    }
  ];

  const createdComments = [];
  for (const commentData of comments) {
    const comment = new Comment(commentData);
    await comment.save();
    createdComments.push(comment);
    console.log(`✅ 创建评论: ${comment.content.substring(0, 20)}...`);
  }
  
  return createdComments;
};

// 创建学习记录数据
const createEnrollments = async (users, courses) => {
  console.log('📖 创建学习记录数据...');
  const [admin, artTeacher, digitalTeacher, student1, student2, student3, testUser, zhangshan] = users;
  const [course1, course2, course3, course4, course5, course6, yaoEmbroidery] = courses;

  const enrollments = [
    // student1 的学习记录
    {
      student: student1._id,
      course: course1._id,
      status: 'in-progress',
      progress: {
        completedLessons: [
          {
            lessonId: course1.lessons[0]._id,
            completedAt: new Date('2024-01-16'),
            timeSpent: 8,
            performance: {
              attempts: 1,
              score: 85,
              completionTime: 480,
              pointsEarned: 50
            }
          },
          {
            lessonId: course1.lessons[1]._id,
            completedAt: new Date('2024-01-18'),
            timeSpent: 12,
            performance: {
              attempts: 2,
              score: 78,
              completionTime: 720,
              pointsEarned: 40
            }
          }
        ],
        unlockedLessons: [
          { lessonId: course1.lessons[0]._id, unlockedAt: new Date('2024-01-15') },
          { lessonId: course1.lessons[1]._id, unlockedAt: new Date('2024-01-16') },
          { lessonId: course1.lessons[2]._id, unlockedAt: new Date('2024-01-18') }
        ],
        percentage: 40,
        totalTimeSpent: 20,
        currentLesson: course1.lessons[2]._id,
        gamificationStats: {
          totalPointsEarned: 90,
          currentStreak: 3,
          averageScore: 81.5,
          perfectCompletions: 0,
          oneAttemptCompletions: 1
        }
      },
      enrolledAt: new Date('2024-01-15')
    },
    {
      student: student1._id,
      course: course2._id,
      status: 'enrolled',
      progress: {
        completedLessons: [],
        unlockedLessons: [
          { lessonId: course2.lessons[0]._id, unlockedAt: new Date('2024-01-20') }
        ],
        percentage: 0,
        totalTimeSpent: 0,
        currentLesson: course2.lessons[0]._id
      },
      enrolledAt: new Date('2024-01-20')
    },
    // student2 的学习记录
    {
      student: student2._id,
      course: course3._id,
      status: 'completed',
      progress: {
        completedLessons: [
          {
            lessonId: course3.lessons[0]._id,
            completedAt: new Date('2024-01-12'),
            timeSpent: 12,
            performance: {
              attempts: 1,
              score: 92,
              completionTime: 600,
              pointsEarned: 60
            }
          },
          {
            lessonId: course3.lessons[1]._id,
            completedAt: new Date('2024-01-14'),
            timeSpent: 18,
            performance: {
              attempts: 1,
              score: 88,
              completionTime: 900,
              pointsEarned: 55
            }
          },
          {
            lessonId: course3.lessons[2]._id,
            completedAt: new Date('2024-01-16'),
            timeSpent: 20,
            performance: {
              attempts: 1,
              score: 95,
              completionTime: 1080,
              pointsEarned: 65
            }
          },
          {
            lessonId: course3.lessons[3]._id,
            completedAt: new Date('2024-01-18'),
            timeSpent: 25,
            performance: {
              attempts: 2,
              score: 82,
              completionTime: 1500,
              pointsEarned: 45
            }
          }
        ],
        percentage: 100,
        totalTimeSpent: 75,
        gamificationStats: {
          totalPointsEarned: 225,
          currentStreak: 4,
          averageScore: 89.25,
          perfectCompletions: 1,
          oneAttemptCompletions: 3
        }
      },
      review: {
        rating: 5,
        comment: '课程内容很实用，老师讲解清晰，学到了很多摄影技巧！',
        createdAt: new Date('2024-01-19')
      },
      enrolledAt: new Date('2024-01-11'),
      completedAt: new Date('2024-01-18')
    },
    // student3 的学习记录
    {
      student: student3._id,
      course: course1._id,
      status: 'completed',
      progress: {
        completedLessons: course1.lessons.map((lesson, index) => ({
          lessonId: lesson._id,
          completedAt: new Date(2024, 0, 8 + index * 2),
          timeSpent: 15 + index * 3,
          performance: {
            attempts: 1,
            score: 90 + index * 2,
            completionTime: 600 + index * 120,
            pointsEarned: 50 + index * 5
          }
        })),
        percentage: 100,
        totalTimeSpent: 90,
        gamificationStats: {
          totalPointsEarned: 275,
          currentStreak: 5,
          averageScore: 94,
          perfectCompletions: 2,
          oneAttemptCompletions: 5
        }
      },
      review: {
        rating: 5,
        comment: '非常棒的课程！作为退休教师，我觉得这个课程设计得很用心。',
        createdAt: new Date('2024-01-17')
      },
      certificate: {
        issued: true,
        issuedAt: new Date('2024-01-17'),
        certificateId: 'CERT-2024-001'
      },
      enrolledAt: new Date('2024-01-08'),
      completedAt: new Date('2024-01-16')
    },
    {
      student: student3._id,
      course: course4._id,
      status: 'in-progress',
      progress: {
        completedLessons: [
          {
            lessonId: course4.lessons[0]._id,
            completedAt: new Date('2024-01-22'),
            timeSpent: 18,
            performance: {
              attempts: 1,
              score: 88,
              completionTime: 900,
              pointsEarned: 55
            }
          },
          {
            lessonId: course4.lessons[1]._id,
            completedAt: new Date('2024-01-24'),
            timeSpent: 25,
            performance: {
              attempts: 1,
              score: 92,
              completionTime: 1200,
              pointsEarned: 60
            }
          }
        ],
        unlockedLessons: [
          { lessonId: course4.lessons[0]._id, unlockedAt: new Date('2024-01-21') },
          { lessonId: course4.lessons[1]._id, unlockedAt: new Date('2024-01-22') },
          { lessonId: course4.lessons[2]._id, unlockedAt: new Date('2024-01-24') }
        ],
        percentage: 50,
        totalTimeSpent: 43,
        currentLesson: course4.lessons[2]._id,
        gamificationStats: {
          totalPointsEarned: 115,
          currentStreak: 2,
          averageScore: 90,
          perfectCompletions: 0,
          oneAttemptCompletions: 2
        }
      },
      enrolledAt: new Date('2024-01-21')
    },
    // testUser 的新课程学习记录
    {
      student: testUser._id,
      course: course5._id,
      status: 'in-progress',
      progress: {
        completedLessons: [
          {
            lessonId: course5.lessons[0]._id,
            completedAt: new Date('2024-02-02'),
            timeSpent: 15,
            performance: {
              attempts: 1,
              score: 95,
              completionTime: 900,
              pointsEarned: 60
            }
          },
          {
            lessonId: course5.lessons[1]._id,
            completedAt: new Date('2024-02-03'),
            timeSpent: 20,
            performance: {
              attempts: 1,
              score: 88,
              completionTime: 1200,
              pointsEarned: 55
            }
          }
        ],
        unlockedLessons: [
          { lessonId: course5.lessons[0]._id, unlockedAt: new Date('2024-02-01') },
          { lessonId: course5.lessons[1]._id, unlockedAt: new Date('2024-02-02') },
          { lessonId: course5.lessons[2]._id, unlockedAt: new Date('2024-02-03') }
        ],
        percentage: 67,
        totalTimeSpent: 35,
        currentLesson: course5.lessons[2]._id,
        gamificationStats: {
          totalPointsEarned: 115,
          currentStreak: 2,
          averageScore: 91.5,
          perfectCompletions: 1,
          oneAttemptCompletions: 2
        }
      },
      enrolledAt: new Date('2024-02-01'),
      lastAccessedAt: new Date('2024-02-04')
    },
    {
      student: testUser._id,
      course: course6._id,
      status: 'in-progress',
      progress: {
        completedLessons: [
          {
            lessonId: course6.lessons[0]._id,
            completedAt: new Date('2024-02-11'),
            timeSpent: 25,
            performance: {
              attempts: 1,
              score: 92,
              completionTime: 1500,
              pointsEarned: 65
            }
          }
        ],
        unlockedLessons: [
          { lessonId: course6.lessons[0]._id, unlockedAt: new Date('2024-02-10') },
          { lessonId: course6.lessons[1]._id, unlockedAt: new Date('2024-02-11') }
        ],
        percentage: 33,
        totalTimeSpent: 25,
        currentLesson: course6.lessons[1]._id,
        gamificationStats: {
          totalPointsEarned: 65,
          currentStreak: 1,
          averageScore: 92,
          perfectCompletions: 0,
          oneAttemptCompletions: 1
        }
      },
      enrolledAt: new Date('2024-02-10'),
      lastAccessedAt: new Date('2024-02-13')
    },
    // 其他用户的新课程学习记录
    {
      student: student1._id,
      course: course5._id,
      status: 'in-progress',
      progress: {
        completedLessons: [
          {
            lessonId: course5.lessons[0]._id,
            completedAt: new Date('2024-02-07'),
            timeSpent: 18,
            performance: {
              attempts: 2,
              score: 78,
              completionTime: 1100,
              pointsEarned: 45
            }
          }
        ],
        unlockedLessons: [
          { lessonId: course5.lessons[0]._id, unlockedAt: new Date('2024-02-06') },
          { lessonId: course5.lessons[1]._id, unlockedAt: new Date('2024-02-07') }
        ],
        percentage: 33,
        totalTimeSpent: 18,
        currentLesson: course5.lessons[1]._id,
        gamificationStats: {
          totalPointsEarned: 45,
          currentStreak: 1,
          averageScore: 78,
          perfectCompletions: 0,
          oneAttemptCompletions: 0
        }
      },
      enrolledAt: new Date('2024-02-06'),
      lastAccessedAt: new Date('2024-02-08')
    },
    {
      student: student2._id,
      course: course6._id,
      status: 'enrolled',
      progress: {
        completedLessons: [],
        unlockedLessons: [
          { lessonId: course6.lessons[0]._id, unlockedAt: new Date('2024-02-15') }
        ],
        percentage: 0,
        totalTimeSpent: 0,
        currentLesson: course6.lessons[0]._id,
        gamificationStats: {
          totalPointsEarned: 0,
          currentStreak: 0,
          averageScore: 0,
          perfectCompletions: 0,
          oneAttemptCompletions: 0
        }
      },
      enrolledAt: new Date('2024-02-15'),
      lastAccessedAt: new Date('2024-02-15')
    },
    // zhangshan 的瑶绣制作课程学习记录 - 65%进度
    {
      student: zhangshan._id,
      course: yaoEmbroidery._id,
      status: 'in-progress',
      progress: {
        completedLessons: [
          {
            lessonId: yaoEmbroidery.lessons[0]._id, // 瑶绣文化与历史
            completedAt: new Date('2024-01-10'),
            timeSpent: 15,
            performance: {
              attempts: 1,
              score: 92,
              completionTime: 900,
              pointsEarned: 60
            }
          },
          {
            lessonId: yaoEmbroidery.lessons[1]._id, // 瑶绣制作基础
            completedAt: new Date('2024-01-12'),
            timeSpent: 20,
            performance: {
              attempts: 1,
              score: 88,
              completionTime: 1200,
              pointsEarned: 55
            }
          },
          {
            lessonId: yaoEmbroidery.lessons[2]._id, // 针法技巧训练
            completedAt: new Date('2024-01-15'),
            timeSpent: 25,
            performance: {
              attempts: 2,
              score: 85,
              completionTime: 1500,
              pointsEarned: 50
            }
          },
          {
            lessonId: yaoEmbroidery.lessons[3]._id, // 图案设计与创作
            completedAt: new Date('2024-01-18'),
            timeSpent: 30,
            performance: {
              attempts: 1,
              score: 90,
              completionTime: 1800,
              pointsEarned: 58
            }
          }
        ],
        unlockedLessons: [
          { lessonId: yaoEmbroidery.lessons[0]._id, unlockedAt: new Date('2024-01-08') },
          { lessonId: yaoEmbroidery.lessons[1]._id, unlockedAt: new Date('2024-01-10') },
          { lessonId: yaoEmbroidery.lessons[2]._id, unlockedAt: new Date('2024-01-12') },
          { lessonId: yaoEmbroidery.lessons[3]._id, unlockedAt: new Date('2024-01-15') },
          { lessonId: yaoEmbroidery.lessons[4]._id, unlockedAt: new Date('2024-01-18') }
        ],
        percentage: 65,
        totalTimeSpent: 90,
        currentLesson: yaoEmbroidery.lessons[4]._id, // 当前在第5个模块
        gamificationStats: {
          totalPointsEarned: 223,
          currentStreak: 4,
          averageScore: 88.75,
          perfectCompletions: 0,
          oneAttemptCompletions: 3
        }
      },
      enrolledAt: new Date('2024-01-08'),
       lastAccessedAt: new Date('2024-01-20')
     }
   ];

  const createdEnrollments = [];
  for (const enrollmentData of enrollments) {
    const enrollment = new Enrollment(enrollmentData);
    await enrollment.save();
    createdEnrollments.push(enrollment);
    console.log(`✅ 创建学习记录: 学员${enrollment.student} - 课程${enrollment.course}`);
  }
  
  return createdEnrollments;
};

// 创建积分记录数据
const createPointsRecords = async (users, courses) => {
  console.log('🎯 创建积分记录数据...');
  const [admin, artTeacher, digitalTeacher, student1, student2, student3, testUser, zhangshan] = users;
  const [course1, course2, course3, course4, course5, course6, yaoEmbroidery] = courses;

  const pointsRecords = [
    // student1 的积分记录
    {
      user: student1._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 50,
      resourceId: course1.lessons[0]._id,
      resourceType: 'Lesson',
      description: '完成课程《陕北剪纸艺术入门》第1课',
      metadata: {
        courseId: course1._id,
        lessonId: course1.lessons[0]._id,
        lessonTitle: '工具认识与准备',
        completionTime: 480,
        accuracy: 85,
        attempts: 1,
        basePoints: 50,
        multiplier: 1
      },
      createdAt: new Date('2024-01-16')
    },
    {
      user: student1._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 40,
      resourceId: course1.lessons[1]._id,
      resourceType: 'Lesson',
      description: '完成课程《陕北剪纸艺术入门》第2课',
      metadata: {
        courseId: course1._id,
        lessonId: course1.lessons[1]._id,
        lessonTitle: '基础图案练习',
        completionTime: 720,
        accuracy: 78,
        attempts: 2,
        basePoints: 50,
        multiplier: 0.8
      },
      createdAt: new Date('2024-01-18')
    },
    {
      user: student1._id,
      type: 'daily_login',
      source: 'system',
      points: 10,
      description: '每日登录奖励',
      createdAt: new Date('2024-01-16')
    },
    {
      user: student1._id,
      type: 'social_interaction',
      source: 'social',
      points: 5,
      description: '发布学习分享帖子',
      createdAt: new Date('2024-01-16')
    },
    // student2 的积分记录
    {
      user: student2._id,
      type: 'course_completion',
      source: 'course',
      points: 200,
      resourceId: course3._id,
      resourceType: 'Course',
      description: '完成课程《手机摄影技巧》',
      metadata: {
        courseId: course3._id,
        completionTime: 4500,
        averageScore: 89.25,
        perfectCompletions: 1,
        basePoints: 200,
        multiplier: 1
      },
      createdAt: new Date('2024-01-18')
    },
    {
      user: student2._id,
      type: 'perfect_score',
      source: 'lesson',
      points: 25,
      resourceId: course3.lessons[2]._id,
      resourceType: 'Lesson',
      description: '课程《手机摄影技巧》第3课获得满分',
      metadata: {
        courseId: course3._id,
        lessonId: course3.lessons[2]._id,
        score: 95,
        bonusPoints: 25
      },
      createdAt: new Date('2024-01-16')
    },
    {
      user: student2._id,
      type: 'streak_bonus',
      source: 'system',
      points: 30,
      description: '连续学习4天奖励',
      metadata: {
        streak: 4,
        bonusPoints: 30
      },
      createdAt: new Date('2024-01-18')
    },
    // student3 的积分记录
    {
      user: student3._id,
      type: 'course_completion',
      source: 'course',
      points: 250,
      resourceId: course1._id,
      resourceType: 'Course',
      description: '完成课程《陕北剪纸艺术入门》',
      metadata: {
        courseId: course1._id,
        completionTime: 5400,
        averageScore: 94,
        perfectCompletions: 2,
        basePoints: 200,
        multiplier: 1.25
      },
      createdAt: new Date('2024-01-16')
    },
    {
      user: student3._id,
      type: 'achievement_unlock',
      source: 'achievement',
      points: 100,
      description: '解锁成就：勤奋学习者',
      metadata: {
        achievementId: 'achievement_2',
        bonusPoints: 100
      },
      createdAt: new Date('2024-01-25')
    },
    {
      user: student3._id,
      type: 'streak_bonus',
      source: 'system',
      points: 60,
      description: '连续学习12天奖励',
      metadata: {
        streak: 12,
        bonusPoints: 60
      },
      createdAt: new Date('2024-01-30')
    },
    // testUser 的丰富积分记录 - 展示各种积分类型
    {
      user: testUser._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 30,
      resourceId: course5._id,
      resourceType: 'Course',
      description: '完成书法课程卡片：书法基础认知',
      metadata: {
        courseId: course5._id,
        cardId: 1,
        cardTitle: '书法基础认知',
        cardType: 'theory',
        completionTime: 900,
        basePoints: 30,
        multiplier: 1
      },
      createdAt: new Date('2024-02-02')
    },
    {
      user: testUser._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 45,
      resourceId: course5._id,
      resourceType: 'Course',
      description: '书法历史知识测验获得满分',
      metadata: {
        courseId: course5._id,
        quizId: 'quiz_1',
        score: 100,
        maxScore: 100,
        basePoints: 30,
        bonusPoints: 15,
        multiplier: 1.5
      },
      createdAt: new Date('2024-02-02')
    },
    {
      user: testUser._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 25,
      resourceId: course5._id,
      resourceType: 'Course',
      description: '完成基础笔画练习任务',
      metadata: {
        courseId: course5._id,
        practiceId: 'practice_1',
        practiceType: 'stroke_practice',
        completedPractices: 20,
        requiredPractices: 20,
        basePoints: 25
      },
      createdAt: new Date('2024-02-03')
    },
    {
      user: testUser._id,
      type: 'achievement_unlock',
      source: 'achievement',
      points: 100,
      resourceId: course5._id,
      resourceType: 'Course',
      description: '完成书法课程第一阶段里程碑',
      metadata: {
        courseId: course5._id,
        milestone: 'phase_1_complete',
        cardsCompleted: 3,
        totalCards: 15,
        bonusPoints: 100
      },
      createdAt: new Date('2024-02-04')
    },
    {
      user: testUser._id,
      type: 'achievement_unlock',
      source: 'achievement',
      points: 75,
      description: '书法技能等级提升至中级',
      metadata: {
        skillName: '书法艺术',
        previousLevel: '初级',
        newLevel: '中级',
        skillProgress: 70,
        bonusPoints: 75
      },
      createdAt: new Date('2024-02-05')
    },
    {
      user: testUser._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 35,
      resourceId: course6._id,
      resourceType: 'Course',
      description: '完成电商案例分析任务',
      metadata: {
        courseId: course6._id,
        caseStudyId: 'case_1',
        analysisQuality: 'excellent',
        basePoints: 20,
        qualityBonus: 15
      },
      createdAt: new Date('2024-02-12')
    },
    {
      user: testUser._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 40,
      resourceId: course6._id,
      resourceType: 'Course',
      description: '完成产品摄影作业',
      metadata: {
        courseId: course6._id,
        assignmentId: 'photo_1',
        photosSubmitted: 5,
        requiredPhotos: 5,
        averageRating: 4.5,
        basePoints: 30,
        qualityBonus: 10
      },
      createdAt: new Date('2024-02-13')
    },
    {
      user: testUser._id,
      type: 'social_interaction',
      source: 'social',
      points: 20,
      description: '帮助其他学员解答问题',
      metadata: {
        contributionType: 'answer',
        helpfulVotes: 8,
        basePoints: 15,
        popularityBonus: 5
      },
      createdAt: new Date('2024-02-14')
    },
    {
      user: testUser._id,
      type: 'streak_bonus',
      source: 'system',
      points: 150,
      description: '完成本周学习挑战：连续7天学习',
      metadata: {
        challengeId: 'weekly_streak_7',
        challengeType: 'streak',
        targetDays: 7,
        completedDays: 7,
        bonusPoints: 150
      },
      createdAt: new Date('2024-02-15')
    },
    {
      user: testUser._id,
      type: 'social_interaction',
      source: 'social',
      points: 30,
      description: '为同学作品提供优质评价',
      metadata: {
        reviewType: 'peer_assessment',
        reviewsGiven: 3,
        averageHelpfulness: 4.8,
        basePoints: 20,
        qualityBonus: 10
      },
      createdAt: new Date('2024-02-16')
    },
    // 其他用户的新积分记录
    {
      user: student1._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 40,
      resourceId: course5._id,
      resourceType: 'Course',
      description: '完成书法课程卡片：笔墨纸砚选择',
      metadata: {
        courseId: course5._id,
        cardId: 2,
        cardTitle: '笔墨纸砚选择',
        cardType: 'practical',
        completionTime: 1200,
        basePoints: 40
      },
      createdAt: new Date('2024-02-08')
    },
    {
      user: student2._id,
      type: 'achievement_unlock',
      source: 'achievement',
      points: 200,
      description: '达成月度学习目标：完成3门课程',
      metadata: {
        goalType: 'monthly_courses',
        targetCourses: 3,
        completedCourses: 3,
        bonusPoints: 200
      },
      createdAt: new Date('2024-02-28')
    },
    {
      user: student3._id,
      type: 'social_interaction',
      source: 'social',
      points: 50,
      description: '指导新学员获得导师奖励',
      metadata: {
        mentorshipType: 'beginner_guide',
        studentsHelped: 2,
        feedbackScore: 4.9,
        bonusPoints: 50
      },
      createdAt: new Date('2024-02-20')
    },
    // zhangshan 用户的积分记录 - 演示用户的丰富学习经历
    {
      user: zhangshan._id,
      type: 'course_completion',
      source: 'course',
      points: 200,
      resourceId: course1._id,
      resourceType: 'Course',
      description: '完成课程《陕北剪纸艺术入门》',
      metadata: {
        courseId: course1._id,
        completionTime: 4800,
        averageScore: 92,
        perfectCompletions: 2,
        basePoints: 200,
        multiplier: 1
      },
      createdAt: new Date('2024-01-20')
    },
    {
      user: zhangshan._id,
      type: 'course_completion',
      source: 'course',
      points: 220,
      resourceId: course2._id,
      resourceType: 'Course',
      description: '完成课程《传统绘画基础》',
      metadata: {
        courseId: course2._id,
        completionTime: 5200,
        averageScore: 88,
        perfectCompletions: 1,
        basePoints: 200,
        multiplier: 1.1
      },
      createdAt: new Date('2024-01-28')
    },
    {
      user: zhangshan._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 60,
      resourceId: yaoEmbroidery.lessons[0]._id,
      resourceType: 'Lesson',
      description: '完成瑶绣课程：瑶绣文化与历史',
      metadata: {
        courseId: yaoEmbroidery._id,
        lessonId: yaoEmbroidery.lessons[0]._id,
        lessonTitle: '瑶绣文化与历史',
        completionTime: 120,
        accuracy: 95,
        attempts: 1,
        basePoints: 60,
        multiplier: 1
      },
      createdAt: new Date('2024-02-01')
    },
    {
      user: zhangshan._id,
      type: 'lesson_completion',
      source: 'lesson',
      points: 65,
      resourceId: yaoEmbroidery.lessons[1]._id,
      resourceType: 'Lesson',
      description: '完成瑶绣课程：瑶绣制作基础',
      metadata: {
        courseId: yaoEmbroidery._id,
        lessonId: yaoEmbroidery.lessons[1]._id,
        lessonTitle: '瑶绣制作基础',
        completionTime: 240,
        accuracy: 90,
        attempts: 1,
        basePoints: 65,
        multiplier: 1
      },
      createdAt: new Date('2024-02-03')
    },
    {
      user: zhangshan._id,
      type: 'perfect_score',
      source: 'lesson',
      points: 30,
      resourceId: yaoEmbroidery.lessons[2]._id,
      resourceType: 'Lesson',
      description: '瑶绣图案设计课程获得满分',
      metadata: {
        courseId: yaoEmbroidery._id,
        lessonId: yaoEmbroidery.lessons[2]._id,
        score: 98,
        bonusPoints: 30
      },
      createdAt: new Date('2024-02-05')
    },
    {
      user: zhangshan._id,
      type: 'achievement_unlock',
      source: 'achievement',
      points: 100,
      description: '解锁成就：传统工艺达人',
      metadata: {
        achievementId: 'traditional_craft_master',
        skillLevel: 4,
        bonusPoints: 100
      },
      createdAt: new Date('2024-02-01')
    },
    {
      user: zhangshan._id,
      type: 'achievement_unlock',
      source: 'achievement',
      points: 75,
      description: '解锁成就：勤奋学习者',
      metadata: {
        achievementId: 'active_learner',
        streak: 15,
        bonusPoints: 75
      },
      createdAt: new Date('2024-02-10')
    },
    {
      user: zhangshan._id,
      type: 'achievement_unlock',
      source: 'achievement',
      points: 80,
      description: '解锁成就：社区贡献者',
      metadata: {
        achievementId: 'community_contributor',
        postsCount: 12,
        bonusPoints: 80
      },
      createdAt: new Date('2024-02-08')
    },
    {
      user: zhangshan._id,
      type: 'streak_bonus',
      source: 'system',
      points: 45,
      description: '连续学习15天奖励',
      metadata: {
        streak: 15,
        bonusPoints: 45
      },
      createdAt: new Date('2024-02-10')
    },
    {
      user: zhangshan._id,
      type: 'social_interaction',
      source: 'social',
      points: 25,
      description: '分享瑶绣学习心得获得点赞',
      metadata: {
        postType: 'learning_share',
        likes: 15,
        comments: 8,
        basePoints: 15,
        popularityBonus: 10
      },
      createdAt: new Date('2024-02-06')
    },
    {
      user: zhangshan._id,
      type: 'social_interaction',
      source: 'social',
      points: 35,
      description: '帮助新学员解答瑶绣技法问题',
      metadata: {
        helpType: 'technical_guidance',
        helpfulVotes: 12,
        basePoints: 20,
        expertiseBonus: 15
      },
      createdAt: new Date('2024-02-12')
    },
    {
      user: zhangshan._id,
      type: 'daily_login',
      source: 'system',
      points: 10,
      description: '每日登录奖励',
      createdAt: new Date('2024-02-14')
    }
  ];

  const createdPointsRecords = [];
  for (const recordData of pointsRecords) {
    const record = new PointsRecord(recordData);
    await record.save();
    createdPointsRecords.push(record);
    console.log(`✅ 创建积分记录: ${record.description}`);
  }
  
  return createdPointsRecords;
};

// 更新用户关联数据
const updateUserRelations = async (users, posts) => {
  console.log('🔗 更新用户关联数据...');
  const [admin, artTeacher, digitalTeacher, student1, student2, student3] = users;
  const [post1, post2, post3, post4, post5, post6] = posts;

  // 设置用户点赞的帖子
  await User.findByIdAndUpdate(student1._id, {
    $push: {
      likedPosts: { $each: [post2._id, post5._id, post6._id] }
    }
  });

  await User.findByIdAndUpdate(student2._id, {
    $push: {
      likedPosts: { $each: [post1._id, post3._id, post5._id] }
    }
  });

  await User.findByIdAndUpdate(student3._id, {
    $push: {
      likedPosts: { $each: [post1._id, post2._id, post6._id] }
    }
  });

  // 设置用户关注关系
  await User.findByIdAndUpdate(student1._id, {
    $push: {
      followedUsers: { $each: [artTeacher._id, digitalTeacher._id, student3._id] }
    }
  });

  await User.findByIdAndUpdate(student2._id, {
    $push: {
      followedUsers: { $each: [digitalTeacher._id, student1._id] }
    }
  });

  await User.findByIdAndUpdate(student3._id, {
    $push: {
      followedUsers: { $each: [artTeacher._id] }
    }
  });

  console.log('✅ 用户关联数据更新完成');
};

// 主函数
const seedDatabase = async () => {
  try {
    console.log('🌱 开始填充数据库...');
    
    // 连接数据库
    await connectDB();
    
    // 清空现有数据
    await clearDatabase();
    
    // 创建数据
    const users = await createUsers();
    const courses = await createCourses(users);
    const posts = await createPosts(users, courses);
    const comments = await createComments(users, posts);
    const enrollments = await createEnrollments(users, courses);
    const pointsRecords = await createPointsRecords(users, courses);
    
    // 更新关联数据
    await updateUserRelations(users, posts);
    
    console.log('\n🎉 数据库填充完成！');
    console.log('📊 数据统计:');
    console.log(`   - 用户: ${users.length} 个`);
    console.log(`   - 课程: ${courses.length} 个`);
    console.log(`   - 帖子: ${posts.length} 个`);
    console.log(`   - 评论: ${comments.length} 个`);
    console.log(`   - 学习记录: ${enrollments.length} 个`);
    console.log(`   - 积分记录: ${pointsRecords.length} 个`);
    
    console.log('\n🔑 测试账号信息:');
    console.log('   管理员: admin / admin123456');
    console.log('   艺术导师: teacher_art / teacher789');
    console.log('   数字专家: teacher_digital / teacher789');
    console.log('   学员1: student1 / student123');
    console.log('   学员2: student2 / student123');
    console.log('   学员3: student3 / student123');
    
  } catch (error) {
    console.error('❌ 数据库填充失败:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('\n🔌 数据库连接已关闭');
    process.exit(0);
  }
};

// 运行脚本
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  connectDB,
  clearDatabase,
  createUsers,
  createCourses,
  createPosts,
  createComments,
  createEnrollments,
  createPointsRecords
};