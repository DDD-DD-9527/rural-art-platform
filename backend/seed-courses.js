const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const User = require('./src/models/User');
require('dotenv').config();

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rural-art-platform');
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    process.exit(1);
  }
};

// 创建默认用户（课程创建者）
const createDefaultUsers = async () => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const users = [
    {
      userId: 'ART001',
      username: 'teacher_art',
      password: hashedPassword,
      profile: {
        nickname: '艺术导师',
        bio: '专业艺术教育导师，擅长传统文化传承',
        avatar: '/placeholder-user.jpg'
      },
      role: 'creator'
    },
    {
      userId: 'DIG001',
      username: 'teacher_digital',
      password: hashedPassword,
      profile: {
        nickname: '数字技能专家',
        bio: '数字技能培训专家，专注乡村数字化发展',
        avatar: '/placeholder-user.jpg'
      },
      role: 'creator'
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const existingUser = await User.findOne({ username: userData.username });
    if (!existingUser) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`创建用户: ${user.username}`);
    } else {
      createdUsers.push(existingUser);
      console.log(`用户已存在: ${existingUser.username}`);
    }
  }
  return createdUsers;
};

// 课程种子数据
const createCourseSeeds = async (users) => {
  const [artTeacher, digitalTeacher] = users;

  const courses = [
    // 艺术教育课程
    {
      title: '陕北剪纸艺术入门',
      description: '传承千年民间艺术，感受文化魅力。学习传统剪纸的基本技法，从简单的花鸟图案开始，逐步掌握复杂的剪纸技艺。',
      category: 'paper-art',
      difficulty: 'beginner',
      thumbnail: '/traditional-paper-cutting.png',
      creator: artTeacher._id,
      estimatedDuration: 45,
      tags: ['剪纸', '传统艺术', '手工制作', '文化传承'],
      videos: [
        {
          originalName: '剪纸基础教学.mp4',
          filename: 'paper-cutting-basic-1234567890.mp4',
          url: '/uploads/videos/paper-cutting-basic-1234567890.mp4',
          size: 52428800,
          mimetype: 'video/mp4',
          uploadedAt: new Date('2024-01-01')
        }
      ],
      materials: [
        {
          originalName: '剪纸图案模板.pdf',
          filename: 'paper-cutting-templates-1234567890.pdf',
          url: '/uploads/materials/paper-cutting-templates-1234567890.pdf',
          size: 2097152,
          mimetype: 'application/pdf',
          uploadedAt: new Date('2024-01-01')
        }
      ],
      lessons: [
        {
          title: '工具认识与准备',
          description: '了解剪纸所需的基本工具和材料',
          videoUrl: '/uploads/videos/lesson-1-tools.mp4',
          duration: 5,
          order: 1,
          isPreview: true,
          materials: [
            {
              name: '剪纸专用剪刀',
              description: '尖头细剪刀，适合精细剪纸',
              optional: false
            },
            {
              name: '彩色纸张',
              description: '各种颜色的薄纸',
              optional: false
            }
          ],
          steps: [
            {
              stepNumber: 1,
              title: '准备工具',
              description: '准备剪刀、纸张、铅笔等工具',
              images: ['/images/step1-tools.jpg'],
              tips: '选择锋利的小剪刀，便于精细操作'
            }
          ]
        },
        {
          title: '基础图案练习',
          description: '学习简单的几何图案剪纸技法',
          videoUrl: '/uploads/videos/lesson-2-basic.mp4',
          duration: 8,
          order: 2,
          materials: [
            {
              name: '练习纸张',
              description: '用于练习的普通纸张',
              optional: false
            }
          ],
          steps: [
            {
              stepNumber: 1,
              title: '画出基础图形',
              description: '在纸上画出简单的几何图形',
              images: ['/images/step2-draw.jpg'],
              tips: '先从简单的圆形、三角形开始'
            },
            {
              stepNumber: 2,
              title: '剪制图形',
              description: '沿着线条小心剪制',
              images: ['/images/step2-cut.jpg'],
              tips: '保持剪刀垂直，动作要稳'
            }
          ]
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
      requirements: {
        prerequisites: ['无特殊要求'],
        materials: [
          {
            name: '剪纸专用剪刀',
            description: '尖头细剪刀，适合精细剪纸',
            estimatedCost: 15,
            optional: false
          },
          {
            name: '彩色纸张',
            description: '各种颜色的薄纸，A4大小',
            estimatedCost: 10,
            optional: false
          }
        ],
        tools: [
          {
            name: '铅笔',
            description: '用于画草图',
            optional: true
          }
        ]
      },
      learningObjectives: [
        '掌握剪纸的基本工具使用方法',
        '学会简单几何图案的剪制技巧',
        '了解传统剪纸的文化内涵',
        '能够独立完成基础剪纸作品'
      ],
      stats: {
        enrolledCount: 1234,
        completedCount: 987,
        viewCount: 5678,
        likeCount: 456,
        rating: { average: 4.8, count: 156 }
      },
      settings: {
        isPublished: true,
        isArchived: false,
        isFree: true,
        price: 0,
        allowComments: true,
        allowDownload: false
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
        enrolledCount: 892,
        viewCount: 2341,
        rating: { average: 4.7, count: 89 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-01-15')
    },
    {
      title: '民间刺绣工艺',
      description: '掌握传统刺绣技法和图案设计，学习各种针法和色彩搭配。',
      category: 'textile',
      difficulty: 'intermediate',
      thumbnail: '/art-coursesart-courses-placeholder.png',
      creator: artTeacher._id,
      estimatedDuration: 90,
      tags: ['刺绣', '手工艺', '传统技艺', '针线活'],
      lessons: [
        {
          title: '刺绣基础知识',
          description: '了解刺绣的历史和基本概念',
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: '基础针法学习',
          description: '掌握常用的刺绣针法',
          duration: 25,
          order: 2
        },
        {
          title: '图案设计与转移',
          description: '学习图案设计和转移技巧',
          duration: 20,
          order: 3
        },
        {
          title: '色彩搭配技巧',
          description: '掌握刺绣中的色彩运用',
          duration: 15,
          order: 4
        },
        {
          title: '完整作品制作',
          description: '完成一件完整的刺绣作品',
          duration: 15,
          order: 5
        }
      ],
      stats: {
        enrolledCount: 567,
        viewCount: 1234,
        rating: { average: 4.9, count: 67 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-02-01')
    },
    {
      title: '陶艺制作入门',
      description: '体验泥土与火的艺术，学习基础的陶艺制作技法。',
      category: 'pottery',
      difficulty: 'beginner',
      thumbnail: '/art-coursesart-courses-placeholder.png',
      creator: artTeacher._id,
      estimatedDuration: 120,
      tags: ['陶艺', '手工制作', '艺术创作', '传统工艺'],
      lessons: [
        {
          title: '陶艺工具与材料',
          description: '认识陶艺制作的基本工具和材料',
          duration: 20,
          order: 1,
          isPreview: true
        },
        {
          title: '基础成型技法',
          description: '学习基本的陶艺成型方法',
          duration: 30,
          order: 2
        },
        {
          title: '装饰技巧',
          description: '掌握陶艺作品的装饰方法',
          duration: 25,
          order: 3
        },
        {
          title: '烧制工艺',
          description: '了解陶艺作品的烧制过程',
          duration: 20,
          order: 4
        },
        {
          title: '作品完成与保养',
          description: '完成作品并学习保养方法',
          duration: 25,
          order: 5
        }
      ],
      stats: {
        enrolledCount: 423,
        viewCount: 987,
        rating: { average: 4.6, count: 45 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-02-15')
    },
    {
      title: '书法艺术基础',
      description: '感受汉字之美，练习书法技巧，提升文化修养。',
      category: 'calligraphy',
      difficulty: 'beginner',
      thumbnail: '/art-coursesart-courses-placeholder.png',
      creator: artTeacher._id,
      estimatedDuration: 80,
      tags: ['书法', '汉字', '传统文化', '艺术'],
      lessons: [
        {
          title: '书法基础知识',
          description: '了解书法的历史和基本概念',
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: '执笔与坐姿',
          description: '学习正确的执笔方法和坐姿',
          duration: 10,
          order: 2
        },
        {
          title: '基本笔画练习',
          description: '练习汉字的基本笔画',
          duration: 20,
          order: 3
        },
        {
          title: '常用字练习',
          description: '练习常用汉字的书写',
          duration: 25,
          order: 4
        },
        {
          title: '作品创作',
          description: '完成一幅完整的书法作品',
          duration: 10,
          order: 5
        }
      ],
      stats: {
        enrolledCount: 756,
        viewCount: 1876,
        rating: { average: 4.8, count: 78 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-03-01')
    },
    {
      title: '民族音乐欣赏',
      description: '了解传统民族音乐文化，提升音乐鉴赏能力。',
      category: 'folk-art',
      difficulty: 'beginner',
      thumbnail: '/art-coursesart-courses-placeholder.png',
      creator: artTeacher._id,
      estimatedDuration: 50,
      tags: ['音乐', '民族音乐', '文化欣赏', '传统艺术'],
      lessons: [
        {
          title: '民族音乐概述',
          description: '了解中国民族音乐的特点',
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: '传统乐器介绍',
          description: '认识常见的传统乐器',
          duration: 15,
          order: 2
        },
        {
          title: '经典曲目欣赏',
          description: '欣赏经典的民族音乐作品',
          duration: 20,
          order: 3
        },
        {
          title: '音乐文化背景',
          description: '了解音乐背后的文化内涵',
          duration: 5,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 634,
        viewCount: 1543,
        rating: { average: 4.5, count: 56 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-03-15')
    },

    // 数字技能课程
    {
      title: '手机摄影技巧',
      description: '用手机记录美好乡村生活，掌握手机摄影的构图、光线运用等技巧。',
      category: 'other',
      difficulty: 'beginner',
      thumbnail: '/mobile-rural-landscape.png',
      creator: digitalTeacher._id,
      estimatedDuration: 60,
      tags: ['摄影', '手机摄影', '构图', '光线'],
      videos: [
        {
          originalName: '手机摄影基础教程.mp4',
          filename: 'smartphone-photography-basics-1234567890.mp4',
          url: '/uploads/videos/smartphone-photography-basics-1234567890.mp4',
          size: 157286400,
          mimetype: 'video/mp4',
          uploadedAt: new Date('2024-01-10')
        }
      ],
      materials: [
        {
          originalName: '摄影构图指南.pdf',
          filename: 'photography-composition-guide-1234567890.pdf',
          url: '/uploads/materials/photography-composition-guide-1234567890.pdf',
          size: 5242880,
          mimetype: 'application/pdf',
          uploadedAt: new Date('2024-01-10')
        }
      ],
      lessons: [
        {
          title: '手机摄影基础',
          description: '了解手机摄影的基本原理',
          videoUrl: '/uploads/videos/lesson-1-basics.mp4',
          duration: 10,
          order: 1,
          isPreview: true,
          materials: [
            {
              name: '智能手机',
              description: '具备拍照功能的智能手机',
              optional: false
            }
          ],
          steps: [
            {
              stepNumber: 1,
              title: '了解手机相机功能',
              description: '熟悉手机相机的各项功能设置',
              images: ['/images/phone-camera-settings.jpg'],
              tips: '不同品牌手机的相机界面可能有所不同'
            }
          ]
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
      requirements: {
        prerequisites: ['基本的手机操作能力'],
        materials: [
          {
            name: '智能手机',
            description: '具备拍照功能的智能手机',
            estimatedCost: 0,
            optional: false
          }
        ],
        tools: [
          {
            name: '手机支架',
            description: '用于稳定拍摄（可选）',
            optional: true
          },
          {
            name: '后期处理APP',
            description: '如VSCO、Snapseed等',
            optional: true
          }
        ]
      },
      learningObjectives: [
        '掌握手机摄影的基本技巧',
        '学会运用构图原则拍摄',
        '了解光线对摄影的影响',
        '能够进行基础的后期处理'
      ],
      stats: {
        enrolledCount: 856,
        completedCount: 678,
        viewCount: 2134,
        likeCount: 345,
        rating: { average: 4.6, count: 98 }
      },
      settings: {
        isPublished: true,
        isArchived: false,
        isFree: true,
        price: 0,
        allowComments: true,
        allowDownload: true
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
      videos: [
        {
          originalName: '微信小商店开通教程.mp4',
          filename: 'wechat-store-tutorial-1234567890.mp4',
          url: '/uploads/videos/wechat-store-tutorial-1234567890.mp4',
          size: 104857600,
          mimetype: 'video/mp4',
          uploadedAt: new Date('2024-01-20')
        }
      ],
      materials: [
        {
          originalName: '小商店运营手册.pdf',
          filename: 'wechat-store-manual-1234567890.pdf',
          url: '/uploads/materials/wechat-store-manual-1234567890.pdf',
          size: 3145728,
          mimetype: 'application/pdf',
          uploadedAt: new Date('2024-01-20')
        }
      ],
      lessons: [
        {
          title: '小商店开通流程',
          description: '学习如何开通微信小商店',
          videoUrl: '/uploads/videos/lesson-1-setup.mp4',
          duration: 15,
          order: 1,
          isPreview: true,
          materials: [
            {
              name: '营业执照',
              description: '个体工商户或企业营业执照',
              optional: false
            },
            {
              name: '银行卡',
              description: '用于收款的银行卡',
              optional: false
            }
          ],
          steps: [
            {
              stepNumber: 1,
              title: '注册微信小商店',
              description: '在微信公众平台注册小商店',
              images: ['/images/wechat-register.jpg'],
              tips: '准备好营业执照和身份证照片'
            }
          ]
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
      requirements: {
        prerequisites: ['基础的手机操作能力', '了解微信基本功能'],
        materials: [
          {
            name: '智能手机',
            description: '支持微信的智能手机',
            estimatedCost: 0,
            optional: false
          },
          {
            name: '营业执照',
            description: '个体工商户或企业营业执照',
            estimatedCost: 200,
            optional: false
          }
        ],
        tools: [
          {
            name: '电脑',
            description: '用于后台管理（可选）',
            optional: true
          }
        ]
      },
      learningObjectives: [
        '掌握微信小商店的开通流程',
        '学会商品上架和管理技巧',
        '了解店铺装修和营销策略',
        '能够独立运营微信小商店'
      ],
      stats: {
        enrolledCount: 2156,
        completedCount: 1543,
        viewCount: 5432,
        likeCount: 789,
        rating: { average: 4.9, count: 234 }
      },
      settings: {
        isPublished: true,
        isArchived: false,
        isFree: true,
        price: 0,
        allowComments: true,
        allowDownload: true
      },
      publishedAt: new Date('2024-01-20')
    },
    {
      title: '短视频制作技巧',
      description: '用短视频展示乡村文化，学习短视频的拍摄和制作技巧。',
      category: 'other',
      difficulty: 'intermediate',
      thumbnail: '/digital-skills-courses-placeholder.png',
      creator: digitalTeacher._id,
      estimatedDuration: 75,
      tags: ['短视频', '视频制作', '内容创作', '社交媒体'],
      lessons: [
        {
          title: '短视频平台介绍',
          description: '了解主流短视频平台特点',
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: '拍摄技巧',
          description: '掌握短视频的拍摄方法',
          duration: 20,
          order: 2
        },
        {
          title: '剪辑基础',
          description: '学习基础的视频剪辑技巧',
          duration: 25,
          order: 3
        },
        {
          title: '发布与推广',
          description: '学习视频发布和推广策略',
          duration: 20,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 1345,
        viewCount: 3456,
        rating: { average: 4.7, count: 145 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-02-10')
    },
    {
      title: '电商直播入门',
      description: '学会直播带货，推广农产品，掌握直播销售的技巧。',
      category: 'other',
      difficulty: 'intermediate',
      thumbnail: '/digital-skills-courses-placeholder.png',
      creator: digitalTeacher._id,
      estimatedDuration: 100,
      tags: ['直播', '电商', '带货', '销售技巧'],
      lessons: [
        {
          title: '直播平台选择',
          description: '了解各大直播平台的特点',
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: '直播设备准备',
          description: '学习直播所需的设备配置',
          duration: 20,
          order: 2
        },
        {
          title: '直播话术技巧',
          description: '掌握直播中的沟通技巧',
          duration: 30,
          order: 3
        },
        {
          title: '互动与转化',
          description: '学习提高观众互动和转化率',
          duration: 35,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 987,
        viewCount: 2345,
        rating: { average: 4.8, count: 123 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-02-25')
    },
    {
      title: '图片编辑基础',
      description: '美化产品图片，提升销售效果，学习基础的图片编辑技巧。',
      category: 'other',
      difficulty: 'beginner',
      thumbnail: '/digital-skills-courses-placeholder.png',
      creator: digitalTeacher._id,
      estimatedDuration: 50,
      tags: ['图片编辑', 'PS', '美化', '产品图'],
      lessons: [
        {
          title: '编辑软件介绍',
          description: '了解常用的图片编辑软件',
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: '基础调色技巧',
          description: '学习图片的基础调色方法',
          duration: 15,
          order: 2
        },
        {
          title: '产品图优化',
          description: '掌握产品图片的优化技巧',
          duration: 15,
          order: 3
        },
        {
          title: '文字与水印',
          description: '学习添加文字和水印',
          duration: 10,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 1567,
        viewCount: 3234,
        rating: { average: 4.5, count: 167 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-03-10')
    },
    {
      title: '农产品包装设计',
      description: '设计吸引人的产品包装，提升产品竞争力。',
      category: 'other',
      difficulty: 'intermediate',
      thumbnail: '/digital-skills-courses-placeholder.png',
      creator: digitalTeacher._id,
      estimatedDuration: 85,
      tags: ['包装设计', '设计', '品牌', '视觉'],
      lessons: [
        {
          title: '包装设计原理',
          description: '了解包装设计的基本原理',
          duration: 15,
          order: 1,
          isPreview: true
        },
        {
          title: '色彩与字体',
          description: '学习色彩搭配和字体选择',
          duration: 20,
          order: 2
        },
        {
          title: '版面布局',
          description: '掌握包装版面的布局技巧',
          duration: 25,
          order: 3
        },
        {
          title: '实际案例制作',
          description: '完成一个完整的包装设计',
          duration: 25,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 678,
        viewCount: 1456,
        rating: { average: 4.6, count: 78 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-03-20')
    },
    {
      title: '社交媒体营销',
      description: '利用社交平台推广产品，掌握社交媒体营销策略。',
      category: 'other',
      difficulty: 'intermediate',
      thumbnail: '/digital-skills-courses-placeholder.png',
      creator: digitalTeacher._id,
      estimatedDuration: 95,
      tags: ['社交媒体', '营销', '推广', '内容运营'],
      lessons: [
        {
          title: '社交平台分析',
          description: '了解各大社交平台的特点',
          duration: 20,
          order: 1,
          isPreview: true
        },
        {
          title: '内容策划',
          description: '学习社交媒体内容的策划',
          duration: 25,
          order: 2
        },
        {
          title: '粉丝运营',
          description: '掌握粉丝增长和维护技巧',
          duration: 25,
          order: 3
        },
        {
          title: '数据分析',
          description: '学习营销效果的数据分析',
          duration: 25,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 1234,
        viewCount: 2876,
        rating: { average: 4.7, count: 134 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-04-01')
    },
    {
      title: '在线客服技巧',
      description: '提升客户服务质量，学习专业的在线客服技巧。',
      category: 'other',
      difficulty: 'beginner',
      thumbnail: '/digital-skills-courses-placeholder.png',
      creator: digitalTeacher._id,
      estimatedDuration: 40,
      tags: ['客服', '沟通技巧', '服务质量', '客户关系'],
      lessons: [
        {
          title: '客服基础知识',
          description: '了解客服工作的基本要求',
          duration: 10,
          order: 1,
          isPreview: true
        },
        {
          title: '沟通技巧',
          description: '掌握与客户沟通的技巧',
          duration: 15,
          order: 2
        },
        {
          title: '问题处理',
          description: '学习处理客户问题的方法',
          duration: 10,
          order: 3
        },
        {
          title: '服务提升',
          description: '提升客户满意度的策略',
          duration: 5,
          order: 4
        }
      ],
      stats: {
        enrolledCount: 892,
        viewCount: 1789,
        rating: { average: 4.4, count: 89 }
      },
      settings: {
        isPublished: true,
        isFree: true,
        allowComments: true
      },
      publishedAt: new Date('2024-04-10')
    }
  ];

  // 清空现有课程数据
  await Course.deleteMany({});
  console.log('清空现有课程数据');

  // 插入新的课程数据
  for (const courseData of courses) {
    const course = new Course(courseData);
    await course.save();
    console.log(`创建课程: ${course.title}`);
  }

  console.log(`成功创建 ${courses.length} 门课程`);
};

// 主函数
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('开始创建种子数据...');
    
    // 创建用户
    const users = await createDefaultUsers();
    
    // 创建课程
    await createCourseSeeds(users);
    
    console.log('种子数据创建完成!');
    process.exit(0);
  } catch (error) {
    console.error('创建种子数据失败:', error);
    process.exit(1);
  }
};

// 运行脚本
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };