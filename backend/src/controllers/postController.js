const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Like = require('../models/Like');
const { validationResult } = require('express-validator');

// 获取帖子列表
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', type, location, author, search } = req.query;
    // 处理数组格式的tags参数 (tags[] 或 tags)
    const tags = req.query['tags[]'] || req.query.tags;

    const skip = (page - 1) * limit;
    let query = { status: 'published', visibility: 'public' };

    // 筛选条件
    if (type) {
      query.type = type;
    }
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      if (tagArray.length > 0 && tagArray[0]) {
        query.tags = { $in: tagArray };
      }
    }
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }
    if (author) {
      query.author = author;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    sort.isPinned = -1; // 置顶帖子优先
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(query)
      .populate('author', 'username profile.nickname profile.avatar')
      .populate('relatedCourse', 'title coverImage')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 如果用户已登录，为每个帖子添加点赞状态
    if (req.user) {
      const user = await User.findById(req.user.id).lean();
      const likedPostIds = user.likedPosts.map(id => id.toString());
      
      posts.forEach(post => {
        post.isLiked = likedPostIds.includes(post._id.toString());
      });
    } else {
      // 未登录用户，所有帖子都未点赞
      posts.forEach(post => {
        post.isLiked = false;
      });
    }

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: posts.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败',
      error: error.message
    });
  }
};

// 获取帖子详情
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const post = await Post.findById(id)
      .populate('author', 'username profile.nickname profile.avatar profile.bio')
      .populate('relatedCourse', 'title coverImage description')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 检查访问权限
    if (post.status !== 'published' || post.visibility === 'private') {
      if (!userId || (post.author._id.toString() !== userId && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: '无权访问此帖子'
        });
      }
    }

    // 增加浏览量
    await Post.findByIdAndUpdate(id, {
      $inc: { 'stats.viewCount': 1 }
    });

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子详情失败',
      error: error.message
    });
  }
};

// 创建帖子
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const postData = {
      ...req.body,
      author: req.user.id
    };

    const post = new Post(postData);
    await post.save();

    // 填充作者信息
    await post.populate('author', 'username profile.nickname profile.avatar');

    // 更新用户统计
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.social.postsCount': 1 }
    });

    res.status(201).json({
      success: true,
      message: '帖子创建成功',
      data: post
    });
  } catch (error) {
    console.error('创建帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '创建帖子失败',
      error: error.message
    });
  }
};

// 更新帖子
exports.updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 检查权限
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权修改此帖子'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('author', 'username profile.nickname profile.avatar');

    res.json({
      success: true,
      message: '帖子更新成功',
      data: updatedPost
    });
  } catch (error) {
    console.error('更新帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '更新帖子失败',
      error: error.message
    });
  }
};

// 删除帖子
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 检查权限
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权删除此帖子'
      });
    }

    await Post.findByIdAndDelete(id);

    // 删除相关评论
    await Comment.deleteMany({ targetType: 'Post', targetId: id });

    // 更新用户统计
    await User.findByIdAndUpdate(post.author, {
      $inc: { 'stats.social.postsCount': -1 }
    });

    res.json({
      success: true,
      message: '帖子删除成功'
    });
  } catch (error) {
    console.error('删除帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '删除帖子失败',
      error: error.message
    });
  }
};

// 点赞/取消点赞帖子
exports.toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    const user = await User.findById(userId);
    const isLiked = user.likedPosts.includes(id);

    if (isLiked) {
      // 取消点赞
      await Promise.all([
        Post.findByIdAndUpdate(id, {
          $inc: { 'stats.likeCount': -1 }
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { likedPosts: id }
        }),
        // 从Like模型中删除记录
        Like.findOneAndDelete({
          user: userId,
          targetType: 'Post',
          targetId: id
        })
      ]);
    } else {
      // 点赞
      await Promise.all([
        Post.findByIdAndUpdate(id, {
          $inc: { 'stats.likeCount': 1 }
        }),
        User.findByIdAndUpdate(userId, {
          $push: { likedPosts: id }
        }),
        // 在Like模型中创建记录
        Like.create({
          user: userId,
          targetType: 'Post',
          targetId: id,
          targetAuthor: post.author
        })
      ]);
    }

    // 获取更新后的帖子数据以确保返回准确的点赞数
    const updatedPost = await Post.findById(id);

    res.json({
      success: true,
      message: isLiked ? '取消点赞成功' : '点赞成功',
      data: {
        isLiked: !isLiked,
        likeCount: updatedPost.stats.likeCount
      }
    });
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({
      success: false,
      message: '点赞操作失败',
      error: error.message
    });
  }
};

// 获取热门帖子
exports.getHotPosts = async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const posts = await Post.find({
      status: 'published',
      visibility: 'public',
      createdAt: { $gte: dateThreshold }
    })
    .populate('author', 'username profile.nickname profile.avatar')
    .sort({
      'stats.likeCount': -1,
      'stats.commentCount': -1,
      'stats.viewCount': -1
    })
    .limit(parseInt(limit))
    .lean();

    // 如果用户已登录，为每个帖子添加点赞状态
    if (req.user) {
      const user = await User.findById(req.user.id).lean();
      const likedPostIds = user.likedPosts.map(id => id.toString());
      
      posts.forEach(post => {
        post.isLiked = likedPostIds.includes(post._id.toString());
      });
    } else {
      // 未登录用户，所有帖子都未点赞
      posts.forEach(post => {
        post.isLiked = false;
      });
    }

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('获取热门帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门帖子失败',
      error: error.message
    });
  }
};

// 获取推荐帖子
exports.getRecommendedPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user?.id;

    let posts;
    
    if (userId) {
      // 基于用户兴趣推荐
      const user = await User.findById(userId);
      const userTags = user.profile.interests || [];
      
      if (userTags.length > 0) {
        posts = await Post.find({
          status: 'published',
          visibility: 'public',
          tags: { $in: userTags },
          author: { $ne: userId } // 排除自己的帖子
        })
        .populate('author', 'username profile.nickname profile.avatar')
        .sort({ 'stats.likeCount': -1, createdAt: -1 })
        .limit(parseInt(limit))
        .lean();
      }
    }
    
    // 如果没有基于兴趣的推荐，则返回热门帖子
    if (!posts || posts.length === 0) {
      posts = await Post.find({
        status: 'published',
        visibility: 'public'
      })
      .populate('author', 'username profile.nickname profile.avatar')
      .sort({ 'stats.likeCount': -1, 'stats.viewCount': -1 })
      .limit(parseInt(limit))
      .lean();
    }

    // 如果用户已登录，为每个帖子添加点赞状态
    if (req.user) {
      const user = await User.findById(req.user.id).lean();
      const likedPostIds = user.likedPosts.map(id => id.toString());
      
      posts.forEach(post => {
        post.isLiked = likedPostIds.includes(post._id.toString());
      });
    } else {
      // 未登录用户，所有帖子都未点赞
      posts.forEach(post => {
        post.isLiked = false;
      });
    }

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('获取推荐帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐帖子失败',
      error: error.message
    });
  }
};

// 举报帖子
exports.reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    // 检查是否已经举报过
    const existingReport = post.reports.find(
      report => report.reporter.toString() === userId
    );
    
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: '您已经举报过此帖子'
      });
    }

    await Post.findByIdAndUpdate(id, {
      $push: {
        reports: {
          reporter: userId,
          reason,
          description,
          reportedAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: '举报提交成功'
    });
  } catch (error) {
    console.error('举报帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '举报提交失败',
      error: error.message
    });
  }
};

// 获取用户的帖子
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, status = 'published' } = req.query;
    const currentUserId = req.user?.id;

    const skip = (page - 1) * limit;
    let query = { author: userId };

    // 如果不是本人或管理员，只能看到已发布的公开帖子
    if (currentUserId !== userId && req.user?.role !== 'admin') {
      query.status = 'published';
      query.visibility = 'public';
    } else if (status) {
      query.status = status;
    }

    const posts = await Post.find(query)
      .populate('author', 'username profile.nickname profile.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: posts.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('获取用户帖子失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户帖子失败',
      error: error.message
    });
  }
};