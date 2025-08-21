const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const { validationResult } = require('express-validator');
const { PAGINATION_CONFIG } = require('../config/constants');

// 获取评论列表
exports.getComments = async (req, res) => {
  try {
    const {
      targetType,
      targetId,
      page = 1,
      limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      parentComment
    } = req.query;

    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：targetType 和 targetId'
      });
    }

    const skip = (page - 1) * limit;
    let query = {
      targetType,
      targetId,
      status: 'published'
    };

    if (parentComment) {
      query.parentComment = parentComment;
    } else {
      // 只获取顶级评论
      query.parentComment = { $exists: false };
    }

    const sort = {};
    sort.isPinned = -1; // 置顶评论优先
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const comments = await Comment.find(query)
      .populate('author', 'username profile.nickname profile.avatar')
      .populate('mentions', 'username profile.nickname')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Comment.countDocuments(query);

    // 格式化评论数据
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      likeCount: comment.stats?.likeCount || 0,
      replyCount: comment.stats?.replyCount || 0,
      targetType: comment.targetType,
      target: comment.targetId ? {
        id: comment.targetId._id,
        title: comment.targetId.title || comment.targetId.name || comment.targetId.content?.substring(0, 50) + '...',
        author: comment.targetId.author
      } : null,
      author: comment.author
    }));

    res.json({
      success: true,
      data: {
        comments: formattedComments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: formattedComments.length,
          totalCount: total,
          hasMore: skip + formattedComments.length < total
        }
      }
    });
  } catch (error) {
    console.error('获取我的评论失败:', error);
    res.status(500).json({
      success: false,
      message: '获取我的评论失败',
      error: error.message
    });
  }
};

// 获取评论树结构
exports.getCommentTree = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const { limit = 50 } = req.query;

    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：targetType 和 targetId'
      });
    }

    const commentTree = await Comment.getCommentTree(targetType, targetId, { limit });

    res.json({
      success: true,
      data: commentTree
    });
  } catch (error) {
    console.error('获取评论树失败:', error);
    res.status(500).json({
      success: false,
      message: '获取评论树失败',
      error: error.message
    });
  }
};

// 获取评论详情
exports.getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id)
      .populate('author', 'username profile.nickname profile.avatar profile.bio')
      .populate('mentions', 'username profile.nickname')
      .populate('parentComment', 'content author')
      .lean();

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    if (comment.status !== 'published') {
      const userId = req.user?.id;
      if (!userId || (comment.author._id.toString() !== userId && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: '无权访问此评论'
        });
      }
    }

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('获取评论详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取评论详情失败',
      error: error.message
    });
  }
};

// 创建评论
exports.createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { targetType, targetId, content, parentComment, mentions } = req.body;
    const userId = req.user.id;

    // 验证目标对象是否存在
    let targetModel;
    switch (targetType) {
      case 'Post':
        targetModel = Post;
        break;
      case 'Course':
        targetModel = Course;
        break;
      case 'Comment':
        targetModel = Comment;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: '无效的目标类型'
        });
    }

    const targetObject = await targetModel.findById(targetId);
    if (!targetObject) {
      return res.status(404).json({
        success: false,
        message: '目标对象不存在'
      });
    }

    // 如果是回复评论，验证父评论是否存在
    if (parentComment) {
      const parentCommentObj = await Comment.findById(parentComment);
      if (!parentCommentObj) {
        return res.status(404).json({
          success: false,
          message: '父评论不存在'
        });
      }
      
      // 检查回复层级限制
      if (parentCommentObj.level >= 3) {
        return res.status(400).json({
          success: false,
          message: '回复层级不能超过3级'
        });
      }
    }

    const commentData = {
      content,
      author: userId,
      targetType,
      targetId,
      parentComment,
      mentions: mentions || []
    };

    const comment = new Comment(commentData);
    await comment.save();

    // 填充作者信息
    await comment.populate('author', 'username profile.nickname profile.avatar');
    await comment.populate('mentions', 'username profile.nickname');

    // 更新父评论的回复数
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $inc: { 'stats.replyCount': 1 }
      });
    }

    // 更新目标对象的评论数
    if (targetType === 'Post') {
      await Post.findByIdAndUpdate(targetId, {
        $inc: { 'stats.commentCount': 1 }
      });
    } else if (targetType === 'Course') {
      await Course.findByIdAndUpdate(targetId, {
        $inc: { 'stats.commentCount': 1 }
      });
    }

    // 更新用户统计
    await User.findByIdAndUpdate(userId, {
      $inc: { 'socialStats.commentsCount': 1 }
    });

    res.status(201).json({
      success: true,
      message: '评论创建成功',
      data: comment
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({
      success: false,
      message: '创建评论失败',
      error: error.message
    });
  }
};

// 更新评论
exports.updateComment = async (req, res) => {
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
    const { content, mentions } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 检查权限
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权修改此评论'
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        content,
        mentions: mentions || comment.mentions,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    .populate('author', 'username profile.nickname profile.avatar')
    .populate('mentions', 'username profile.nickname');

    res.json({
      success: true,
      message: '评论更新成功',
      data: updatedComment
    });
  } catch (error) {
    console.error('更新评论失败:', error);
    res.status(500).json({
      success: false,
      message: '更新评论失败',
      error: error.message
    });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 检查权限
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权删除此评论'
      });
    }

    // 先统计要删除的评论数量
    const deletedCount = await Comment.countDocuments({
      $or: [
        { _id: id },
        { rootComment: id }
      ]
    });

    // 删除评论及其所有回复
    await Comment.deleteMany({
      $or: [
        { _id: id },
        { rootComment: id }
      ]
    });

    // 更新父评论的回复数
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { 'stats.replyCount': -1 }
      });
    }

    if (comment.targetType === 'Post') {
      await Post.findByIdAndUpdate(comment.targetId, {
        $inc: { 'stats.commentCount': -deletedCount }
      });
    } else if (comment.targetType === 'Course') {
      await Course.findByIdAndUpdate(comment.targetId, {
        $inc: { 'stats.commentCount': -deletedCount }
      });
    }

    // 更新用户统计
    await User.findByIdAndUpdate(comment.author, {
      $inc: { 'socialStats.commentsCount': -deletedCount }
    });

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败',
      error: error.message
    });
  }
};

// 点赞/取消点赞评论
exports.toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    const user = await User.findById(userId);
    const isLiked = user.likedComments.includes(id);

    if (isLiked) {
      // 取消点赞
      await Promise.all([
        Comment.findByIdAndUpdate(id, {
          $inc: { 'stats.likeCount': -1 }
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { likedComments: id }
        }),
        // 从Like模型中删除记录
        Like.findOneAndDelete({
          user: userId,
          targetType: 'Comment',
          targetId: id
        })
      ]);
    } else {
      // 点赞
      await Promise.all([
        Comment.findByIdAndUpdate(id, {
          $inc: { 'stats.likeCount': 1 }
        }),
        User.findByIdAndUpdate(userId, {
          $push: { likedComments: id }
        }),
        // 在Like模型中创建记录
        Like.create({
          user: userId,
          targetType: 'Comment',
          targetId: id,
          targetAuthor: comment.author
        })
      ]);
    }

    res.json({
      success: true,
      message: isLiked ? '取消点赞成功' : '点赞成功',
      data: {
        isLiked: !isLiked,
        likeCount: comment.stats.likeCount + (isLiked ? -1 : 1)
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

// 举报评论
exports.reportComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 检查是否已经举报过
    const existingReport = comment.reports.find(
      report => report.reporter.toString() === userId
    );
    
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: '您已经举报过此评论'
      });
    }

    await Comment.findByIdAndUpdate(id, {
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
    console.error('举报评论失败:', error);
    res.status(500).json({
      success: false,
      message: '举报提交失败',
      error: error.message
    });
  }
};

// 获取用户的评论
exports.getUserComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE, status = 'published' } = req.query;
    const currentUserId = req.user?.id;

    const skip = (page - 1) * limit;
    let query = { author: userId };

    // 如果不是本人或管理员，只能看到已发布的评论
    if (currentUserId !== userId && req.user?.role !== 'admin') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    const comments = await Comment.find(query)
      .populate('author', 'username profile.nickname profile.avatar')
      .populate('targetId', 'title content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: comments.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('获取用户评论失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户评论失败',
      error: error.message
    });
  }
};

// 获取我的评论
exports.getMyComments = async (req, res) => {
  try {
    const { page = 1, limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE, type, search, sort = 'recent' } = req.query;
    const userId = req.user.id;
    const skip = (page - 1) * limit;

    let query = { author: userId, status: 'published' };

    // 根据类型筛选
    if (type && type !== 'all') {
      query.targetType = type;
    }

    // 搜索功能
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    // 排序设置
    let sortOptions = {};
    switch (sort) {
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'likes':
        sortOptions['stats.likeCount'] = -1;
        break;
      case 'recent':
      default:
        sortOptions.createdAt = -1;
        break;
    }

    const comments = await Comment.find(query)
      .populate('author', 'username profile.nickname profile.avatar')
      .populate({
        path: 'targetId',
        select: 'title content name',
        populate: {
          path: 'author',
          select: 'username profile.nickname profile.avatar'
        }
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Comment.countDocuments(query);

    // 格式化评论数据
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author._id,
        username: comment.author.username,
        nickname: comment.author.profile?.nickname || comment.author.username,
        avatar: comment.author.profile?.avatar || '/default-avatar.png'
      },
      target: {
        id: comment.targetId._id,
        type: comment.targetType,
        title: comment.targetId.title || comment.targetId.name || (comment.targetType === 'post' ? '动态内容' : comment.targetType === 'course' ? '课程内容' : '内容'),
        content: comment.targetId.content || comment.targetId.description || '',
        author: comment.targetId.author ? {
          id: comment.targetId.author._id,
          username: comment.targetId.author.username,
          nickname: comment.targetId.author.profile?.nickname || comment.targetId.author.username,
          avatar: comment.targetId.author.profile?.avatar || '/default-avatar.png'
        } : null
      },
      stats: {
        likeCount: comment.stats?.likeCount || 0,
        replyCount: comment.stats?.replyCount || 0
      },
      isLiked: false // 这里可以根据需要查询用户是否点赞了该评论
    }));

    res.json({
      success: true,
      data: {
        list: formattedComments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          pages: Math.ceil(total / limit),
          pageSize: parseInt(limit),
          count: formattedComments.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('获取我的评论失败:', error);
    res.status(500).json({
      success: false,
      message: '获取我的评论失败',
      error: error.message
    });
   }
 };