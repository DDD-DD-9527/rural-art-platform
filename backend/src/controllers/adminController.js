const User = require('../models/User');
const Course = require('../models/Course');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Enrollment = require('../models/Enrollment');
const { validationResult } = require('express-validator');

// 获取管理员仪表盘统计数据
const getDashboardStats = async (req, res) => {
  try {
    // 并行获取各项统计数据
    const [userStats, courseStats, postStats, commentStats, enrollmentStats] = await Promise.all([
      // 用户统计
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            },
            creators: {
              $sum: {
                $cond: [{ $eq: ['$role', 'creator'] }, 1, 0]
              }
            },
            admins: {
              $sum: {
                $cond: [{ $eq: ['$role', 'admin'] }, 1, 0]
              }
            }
          }
        }
      ]),
      
      // 课程统计
      Course.aggregate([
        {
          $group: {
            _id: null,
            totalCourses: { $sum: 1 },
            publishedCourses: {
              $sum: {
                $cond: [{ $eq: ['$settings.isPublished', true] }, 1, 0]
              }
            },
            draftCourses: {
              $sum: {
                $cond: [{ $eq: ['$settings.isPublished', false] }, 1, 0]
              }
            },
            totalEnrollments: { $sum: '$stats.enrolledCount' },
            totalViews: { $sum: '$stats.viewCount' }
          }
        }
      ]),
      
      // 帖子统计
      Post.aggregate([
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            publishedPosts: {
              $sum: {
                $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
              }
            },
            draftPosts: {
              $sum: {
                $cond: [{ $eq: ['$status', 'draft'] }, 1, 0]
              }
            },
            totalLikes: { $sum: '$stats.likeCount' },
            totalViews: { $sum: '$stats.viewCount' }
          }
        }
      ]),
      
      // 评论统计
      Comment.aggregate([
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 },
            publishedComments: {
              $sum: {
                $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
              }
            }
          }
        }
      ]),
      
      // 报名统计
      Enrollment.aggregate([
        {
          $group: {
            _id: null,
            totalEnrollments: { $sum: 1 },
            completedEnrollments: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            },
            activeEnrollments: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    // 获取最近活动数据
    const recentActivities = await Promise.all([
      // 最近注册用户
      User.find({ status: 'active' })
        .select('username profile.nickname createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      
      // 最近发布课程
      Course.find({ 'settings.isPublished': true })
        .select('title creator publishedAt')
        .populate('creator', 'username profile.nickname')
        .sort({ publishedAt: -1 })
        .limit(5)
        .lean(),
      
      // 最近发布帖子
      Post.find({ status: 'published' })
        .select('content author createdAt type')
        .populate('author', 'username profile.nickname')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // 格式化统计数据
    const stats = {
      users: {
        total: userStats[0]?.totalUsers || 0,
        active: userStats[0]?.activeUsers || 0,
        creators: userStats[0]?.creators || 0,
        admins: userStats[0]?.admins || 0
      },
      courses: {
        total: courseStats[0]?.totalCourses || 0,
        published: courseStats[0]?.publishedCourses || 0,
        draft: courseStats[0]?.draftCourses || 0,
        totalEnrollments: courseStats[0]?.totalEnrollments || 0,
        totalViews: courseStats[0]?.totalViews || 0
      },
      posts: {
        total: postStats[0]?.totalPosts || 0,
        published: postStats[0]?.publishedPosts || 0,
        draft: postStats[0]?.draftPosts || 0,
        totalLikes: postStats[0]?.totalLikes || 0,
        totalViews: postStats[0]?.totalViews || 0
      },
      comments: {
        total: commentStats[0]?.totalComments || 0,
        published: commentStats[0]?.publishedComments || 0
      },
      enrollments: {
        total: enrollmentStats[0]?.totalEnrollments || 0,
        completed: enrollmentStats[0]?.completedEnrollments || 0,
        active: enrollmentStats[0]?.activeEnrollments || 0
      }
    };

    // 格式化最近活动
    const activities = {
      recentUsers: recentActivities[0].map(user => ({
        id: user._id,
        name: user.profile?.nickname || user.username,
        action: '新用户注册',
        time: user.createdAt
      })),
      recentCourses: recentActivities[1].map(course => ({
        id: course._id,
        title: course.title,
        creator: course.creator?.profile?.nickname || course.creator?.username,
        action: '发布课程',
        time: course.publishedAt
      })),
      recentPosts: recentActivities[2].map(post => ({
        id: post._id,
        content: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
        author: post.author?.profile?.nickname || post.author?.username,
        type: post.type,
        action: '发布帖子',
        time: post.createdAt
      }))
    };

    res.json({
      success: true,
      data: {
        stats,
        activities
      }
    });
  } catch (error) {
    console.error('获取管理员仪表盘统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error.message
    });
  }
};

// 获取系统概览统计
const getSystemOverview = async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // 计算时间范围
    let startDate = new Date();
    switch (timeRange) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // 获取时间范围内的增长数据
    const [newUsers, newCourses, newPosts, newComments] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Course.countDocuments({ createdAt: { $gte: startDate } }),
      Post.countDocuments({ createdAt: { $gte: startDate } }),
      Comment.countDocuments({ createdAt: { $gte: startDate } })
    ]);

    res.json({
      success: true,
      data: {
        timeRange,
        growth: {
          newUsers,
          newCourses,
          newPosts,
          newComments
        }
      }
    });
  } catch (error) {
    console.error('获取系统概览失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统概览失败',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getSystemOverview
};