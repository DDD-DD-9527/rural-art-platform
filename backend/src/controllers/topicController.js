const Post = require('../models/Post');
const { validationResult } = require('express-validator');

// 获取话题分类列表
const getTopicCategories = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const limit = parseInt(req.query.limit) || 20;

    // 从数据库中获取所有不重复的标签
    const allTags = await Post.distinct('tags', { 
      status: 'published',
      visibility: 'public',
      tags: { $exists: true, $ne: [] }
    });

    // 过滤掉空值和undefined
    const validTags = allTags.filter(tag => tag && tag.trim());

    // 为每个标签统计帖子数量
    const tagStats = await Promise.all(
      validTags.map(async (tag) => {
        const count = await Post.countDocuments({
          tags: tag,
          status: 'published',
          visibility: 'public'
        });
        return { tag, count };
      })
    );

    // 按帖子数量排序并限制数量
    const sortedTags = tagStats
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // 构建话题分类数据结构
    const categories = sortedTags.map((item, index) => ({
      id: `topic_${index + 1}`,
      name: item.tag,
      description: getTopicDescription(item.tag),
      count: item.count,
      icon: getTopicIcon(item.tag),
      color: getTopicColor(index)
    }));

    res.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('获取话题分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取话题分类失败',
      error: error.message
    });
  }
};

// 获取热门话题
const getTrendingTopics = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;
    
    // 计算时间范围
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 获取指定时间范围内的热门标签
    const pipeline = [
      {
        $match: {
          status: 'published',
          visibility: 'public',
          createdAt: { $gte: startDate },
          tags: { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          totalLikes: { $sum: '$stats.likeCount' },
          totalComments: { $sum: '$stats.commentCount' }
        }
      },
      {
        $addFields: {
          hotScore: {
            $add: [
              '$count',
              { $multiply: ['$totalLikes', 2] },
              { $multiply: ['$totalComments', 3] }
            ]
          }
        }
      },
      { $sort: { hotScore: -1 } },
      { $limit: limit }
    ];

    const trendingTags = await Post.aggregate(pipeline);

    const topics = trendingTags.map((item, index) => ({
      id: `trending_${index + 1}`,
      name: item._id,
      description: getTopicDescription(item._id),
      count: item.count,
      hotScore: item.hotScore,
      icon: getTopicIcon(item._id),
      color: getTopicColor(index)
    }));

    res.json({
      success: true,
      data: topics,
      total: topics.length
    });
  } catch (error) {
    console.error('获取热门话题失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门话题失败',
      error: error.message
    });
  }
};

// 获取话题统计信息
const getTopicStats = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '参数验证失败',
        errors: errors.array()
      });
    }

    const { tags } = req.query;
    
    if (!tags) {
      return res.status(400).json({
        success: false,
        message: '请提供标签参数'
      });
    }

    const tagArray = tags.split(',').map(tag => tag.trim());

    const stats = await Promise.all(
      tagArray.map(async (tag) => {
        const postCount = await Post.countDocuments({
          tags: tag,
          status: 'published',
          visibility: 'public'
        });

        const totalStats = await Post.aggregate([
          {
            $match: {
              tags: tag,
              status: 'published',
              visibility: 'public'
            }
          },
          {
            $group: {
              _id: null,
              totalLikes: { $sum: '$stats.likeCount' },
              totalComments: { $sum: '$stats.commentCount' },
              totalViews: { $sum: '$stats.viewCount' }
            }
          }
        ]);

        const aggregatedStats = totalStats[0] || {
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0
        };

        return {
          tag,
          postCount,
          ...aggregatedStats
        };
      })
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取话题统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取话题统计失败',
      error: error.message
    });
  }
};

// 辅助函数：根据话题名称生成描述
function getTopicDescription(topicName) {
  const descriptions = {
    '剪纸': '传统剪纸艺术，展现民间智慧与创意',
    '传统文化': '弘扬中华传统文化，传承民族精神',
    '手工艺': '精美手工艺品制作技巧与经验分享',
    '绘画': '国画、水彩、素描等绘画技法交流',
    '书法': '毛笔字、硬笔书法练习与作品展示',
    '陶艺': '陶瓷制作工艺与创意设计',
    '编织': '传统编织技艺与现代创新应用',
    '木工': '木制品制作技巧与工具使用',
    '摄影': '乡村风光与民俗文化摄影分享',
    '民俗': '地方民俗文化与传统节庆活动'
  };
  
  return descriptions[topicName] || `关于${topicName}的讨论与分享`;
}

// 辅助函数：根据话题名称生成图标
function getTopicIcon(topicName) {
  const icons = {
    '剪纸': '✂️',
    '传统文化': '🏮',
    '手工艺': '🎨',
    '绘画': '🖌️',
    '书法': '✍️',
    '陶艺': '🏺',
    '编织': '🧶',
    '木工': '🔨',
    '摄影': '📷',
    '民俗': '🎭'
  };
  
  return icons[topicName] || '📝';
}

// 辅助函数：根据索引生成颜色
function getTopicColor(index) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  
  return colors[index % colors.length];
}

module.exports = {
  getTopicCategories,
  getTrendingTopics,
  getTopicStats
};