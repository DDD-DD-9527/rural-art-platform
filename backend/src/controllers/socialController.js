const Follow = require('../models/Follow');
const Like = require('../models/Like');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { validationResult } = require('express-validator');

// 关注用户
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;
    
    // 不能关注自己
    if (userId === followerId.toString()) {
      return res.status(400).json({
        success: false,
        message: '不能关注自己'
      });
    }
    
    // 检查目标用户是否存在
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 检查是否已经关注
    const existingFollow = await Follow.isFollowing(followerId, userId);
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: '已经关注该用户'
      });
    }
    
    // 创建关注关系
    const follow = new Follow({
      follower: followerId,
      following: userId
    });
    
    await follow.save();
    
    // 更新用户统计
    await Promise.all([
      User.findByIdAndUpdate(followerId, {
        $inc: { 'socialStats.followingCount': 1 }
      }),
      User.findByIdAndUpdate(userId, {
        $inc: { 'socialStats.followersCount': 1 }
      })
    ]);
    
    res.json({
      success: true,
      message: '关注成功',
      data: {
        isFollowing: true,
        followDate: follow.createdAt
      }
    });
    
  } catch (error) {
    console.error('关注用户失败:', error);
    res.status(500).json({
      success: false,
      message: '关注失败，请稍后重试'
    });
  }
};

// 获取点赞统计
exports.getLikeStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Like.getLikeStats(userId);
    
    res.json({
      success: true,
      data: {
        total: stats.receivedLikes,
        today: stats.todayReceived,
        week: stats.weekReceived,
        given: stats.givenLikes
      }
    });
    
  } catch (error) {
    console.error('获取点赞统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取点赞统计失败'
    });
  }
};

// 取消关注用户
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user._id;
    
    // 查找并删除关注关系
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });
    
    if (!follow) {
      return res.status(400).json({
        success: false,
        message: '未关注该用户'
      });
    }
    
    // 更新用户统计
    await Promise.all([
      User.findByIdAndUpdate(followerId, {
        $inc: { 'socialStats.followingCount': -1 }
      }),
      User.findByIdAndUpdate(userId, {
        $inc: { 'socialStats.followersCount': -1 }
      })
    ]);
    
    res.json({
      success: true,
      message: '取消关注成功',
      data: {
        isFollowing: false
      }
    });
    
  } catch (error) {
    console.error('取消关注失败:', error);
    res.status(500).json({
      success: false,
      message: '取消关注失败，请稍后重试'
    });
  }
};

// 获取关注列表
exports.getFollowingList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // 获取关注列表
    let followingList = await Follow.getFollowingList(userId, pageNum, limitNum);
    
    // 如果有搜索条件，进行过滤
    if (search) {
      followingList = followingList.filter(item => 
        item.following.username.toLowerCase().includes(search.toLowerCase()) ||
        (item.following.profile.nickname && item.following.profile.nickname.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // 获取总数
    const total = await Follow.countDocuments({ follower: userId });
    
    // 格式化数据
    const formattedList = followingList.map(item => ({
      id: item.following._id,
      name: item.following.profile.nickname || item.following.username,
      username: item.following.username,
      avatar: item.following.profile.avatar,
      bio: item.following.profile.bio,
      followDate: item.createdAt,
      followers: item.following.socialStats.followersCount,
      works: item.following.creatorStats?.worksCount || 0,
      isVip: false, // 可以根据实际业务逻辑设置
      level: Math.floor((item.following.learningStats?.totalPoints || 0) / 100) + 1
    }));
    
    res.json({
      success: true,
      data: {
        list: formattedList,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error) {
    console.error('获取关注列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取关注列表失败'
    });
  }
};

// 获取粉丝列表
exports.getFollowersList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // 获取粉丝列表
    let followersList = await Follow.getFollowersList(userId, pageNum, limitNum);
    
    // 如果有搜索条件，进行过滤
    if (search) {
      followersList = followersList.filter(item => 
        item.follower.username.toLowerCase().includes(search.toLowerCase()) ||
        (item.follower.profile.nickname && item.follower.profile.nickname.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // 获取总数
    const total = await Follow.countDocuments({ following: userId });
    
    // 检查当前用户是否关注了这些粉丝
    const currentUserId = req.user._id;
    const followerIds = followersList.map(item => item.follower._id);
    const followingRelations = await Follow.find({
      follower: currentUserId,
      following: { $in: followerIds }
    }).lean();
    
    const followingMap = {};
    followingRelations.forEach(rel => {
      followingMap[rel.following.toString()] = true;
    });
    
    // 格式化数据
    const formattedList = followersList.map(item => ({
      id: item.follower._id,
      name: item.follower.profile.nickname || item.follower.username,
      username: item.follower.username,
      avatar: item.follower.profile.avatar,
      bio: item.follower.profile.bio,
      followDate: item.createdAt,
      likes: 0, // 可以根据实际需求计算
      comments: 0, // 可以根据实际需求计算
      isFollowing: !!followingMap[item.follower._id.toString()],
      isVip: false,
      level: Math.floor((item.follower.learningStats?.totalPoints || 0) / 100) + 1
    }));
    
    res.json({
      success: true,
      data: {
        list: formattedList,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error) {
    console.error('获取粉丝列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取粉丝列表失败'
    });
  }
};

// 获取收到的点赞列表
exports.getReceivedLikes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // 获取收到的点赞
    const likesList = await Like.getReceivedLikes(userId, pageNum, limitNum);
    
    // 获取总数和统计
    const [total, stats] = await Promise.all([
      Like.countDocuments({ targetAuthor: userId }),
      Like.getLikeStats(userId)
    ]);
    
    // 格式化数据
    const formattedList = likesList.map(item => ({
      id: item._id,
      userName: item.user.profile.nickname || item.user.username,
      userLocation: item.user.profile.location || '未知地区',
      time: item.createdAt,
      contentType: item.targetType === 'Post' ? '作品' : item.targetType === 'Comment' ? '评论' : '课程',
      content: item.targetId?.content || item.targetId?.title || '内容已删除',
      image: !!item.targetId?.image
    }));
    
    res.json({
      success: true,
      data: {
        list: formattedList,
        stats: {
          totalLikes: stats.receivedLikes,
          todayLikes: stats.todayReceived,
          weekLikes: stats.weekReceived
        },
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
    
  } catch (error) {
    console.error('获取点赞记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取点赞记录失败'
    });
  }
};

// 检查关注状态
exports.checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    const isFollowing = await Follow.isFollowing(currentUserId, userId);
    
    res.json({
      success: true,
      data: {
        isFollowing: !!isFollowing,
        followDate: isFollowing?.createdAt
      }
    });
    
  } catch (error) {
    console.error('检查关注状态失败:', error);
    res.status(500).json({
      success: false,
      message: '检查关注状态失败'
    });
  }
};

// 获取社交统计
exports.getSocialStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [followStats, likeStats] = await Promise.all([
      Follow.getFollowStats(userId),
      Like.getLikeStats(userId)
    ]);
    
    res.json({
      success: true,
      data: {
        ...followStats,
        ...likeStats
      }
    });
    
  } catch (error) {
    console.error('获取社交统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取社交统计失败'
    });
  }
};

// 获取互相关注的用户
exports.getMutualFollows = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const mutualFollows = await Follow.getMutualFollows(userId, pageNum, limitNum);
    
    // 格式化数据
    const formattedList = mutualFollows.map(item => ({
      id: item.follower._id,
      name: item.follower.profile.nickname || item.follower.username,
      username: item.follower.username,
      avatar: item.follower.profile.avatar,
      bio: item.follower.profile.bio,
      followers: item.follower.socialStats.followersCount,
      works: item.follower.creatorStats?.worksCount || 0
    }));
    
    res.json({
      success: true,
      data: {
        list: formattedList,
        pagination: {
          current: pageNum,
          pageSize: limitNum
        }
      }
    });
    
  } catch (error) {
    console.error('获取互相关注用户失败:', error);
    res.status(500).json({
      success: false,
      message: '获取共同关注失败'
    });
  }
};

// 获取用户点赞记录
exports.getUserLikes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type = 'all', search = '', sort = 'recent' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // 构建查询条件
    const query = { user: userId };
    
    // 根据类型过滤
    if (type !== 'all') {
      query.targetType = type;
    }
    
    // 构建排序条件
    let sortCondition = {};
    switch (sort) {
      case 'recent':
        sortCondition = { createdAt: -1 };
        break;
      case 'oldest':
        sortCondition = { createdAt: 1 };
        break;
      default:
        sortCondition = { createdAt: -1 };
    }
    
    // 获取点赞记录
    let likes = await Like.find(query)
      .populate({
        path: 'targetId',
        select: 'title content images author createdAt',
        populate: {
          path: 'author',
          select: 'username profile.nickname profile.avatar'
        }
      })
      .sort(sortCondition)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // 如果有搜索条件，进行过滤
    if (search) {
      likes = likes.filter(like => {
        if (!like.targetId) return false;
        const title = like.targetId.title || '';
        const content = like.targetId.content || '';
        const authorName = like.targetId.author?.profile?.nickname || like.targetId.author?.username || '';
        return title.toLowerCase().includes(search.toLowerCase()) ||
               content.toLowerCase().includes(search.toLowerCase()) ||
               authorName.toLowerCase().includes(search.toLowerCase());
      });
    }
    
    // 获取总数
    const total = await Like.countDocuments(query);
    
    // 格式化数据
    const formattedLikes = likes.map(like => ({
      id: like._id,
      type: like.targetType,
      target: like.targetId ? {
        id: like.targetId._id,
        title: like.targetId.title || (like.targetType === 'Post' ? '社区动态' : like.targetType === 'Comment' ? '评论回复' : like.targetId.title || '无标题'),
        content: like.targetId.content,
        images: like.targetId.images || [],
        author: like.targetId.author ? {
          id: like.targetId.author._id,
          name: like.targetId.author.profile?.nickname || like.targetId.author.username,
          avatar: like.targetId.author.profile?.avatar
        } : null,
        createdAt: like.targetId.createdAt
      } : null,
      likedAt: like.createdAt
    })).filter(like => like.target !== null && like.target.author !== null);
    
    res.json({
      success: true,
      data: {
        likes: formattedLikes,
        pagination: {
          current: pageNum,
          total: Math.ceil(total / limitNum),
          count: total
        }
      }
    });
  } catch (error) {
    console.error('获取用户点赞记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取点赞记录失败'
    });
  }
};

// 获取推荐用户
exports.getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    
    // 获取当前用户已关注的用户ID列表
    const followingList = await Follow.find({ follower: currentUserId }).select('following');
    const followingIds = followingList.map(f => f.following);
    followingIds.push(currentUserId); // 排除自己
    
    // 获取推荐用户（排除已关注的用户）
    const recommendedUsers = await User.find({
      _id: { $nin: followingIds },
      'profile.isActive': { $ne: false }
    })
    .select('username profile.nickname profile.avatar profile.bio')
    .limit(limitNum)
    .lean();
    
    // 格式化数据
    const formattedUsers = recommendedUsers.map(user => ({
      id: user._id,
      name: user.profile?.nickname || user.username,
      username: user.username,
      avatar: user.profile?.avatar,
      bio: user.profile?.bio,
      isFollowing: false // 推荐用户默认未关注
    }));
    
    res.json({
      success: true,
      data: {
        users: formattedUsers
      }
    });
  } catch (error) {
    console.error('获取推荐用户失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐用户失败'
    });
  }
};

// 获取关注统计
exports.getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 验证用户权限（只能查看自己的统计）
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '无权限查看该用户统计'
      });
    }
    
    // 获取关注数和粉丝数
    const [followingCount, followersCount] = await Promise.all([
      Follow.countDocuments({ follower: userId }),
      Follow.countDocuments({ following: userId })
    ]);
    
    res.json({
       success: true,
       data: {
         following: followingCount,
         followers: followersCount
       }
     });
   } catch (error) {
     console.error('获取关注统计失败:', error);
     res.status(500).json({
       success: false,
       message: '获取关注统计失败'
     });
   }
 };