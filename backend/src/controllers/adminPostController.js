const Post = require('../models/Post');

const buildPostQuery = ({
  search,
  status,
  visibility,
  type,
  authorId,
  reportedOnly,
  pinned
}) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  if (visibility) {
    query.visibility = visibility;
  }

  if (type) {
    query.type = type;
  }

  if (authorId) {
    query.author = authorId;
  }

  if (reportedOnly === 'true') {
    query['reports.0'] = { $exists: true };
  }

  if (pinned === 'true') {
    query.isPinned = true;
  }

  if (pinned === 'false') {
    query.isPinned = false;
  }

  if (search) {
    query.$text = { $search: search };
  }

  return query;
};

exports.listPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      visibility = '',
      type = '',
      authorId = '',
      reportedOnly = 'false',
      pinned = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const query = buildPostQuery({
      search,
      status,
      visibility,
      type,
      authorId,
      reportedOnly,
      pinned
    });

    const sort = {};
    sort.isPinned = -1;
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'userId username profile.nickname profile.avatar role status')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query)
    ]);

    const normalized = posts.map((p) => ({
      ...p,
      reportsCount: Array.isArray(p.reports) ? p.reports.length : 0
    }));

    res.json({
      success: true,
      data: {
        posts: normalized,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('管理员获取帖子列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取帖子列表失败'
    });
  }
};

exports.updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const post = await Post.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate('author', 'userId username profile.nickname profile.avatar role status')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    res.json({
      success: true,
      data: {
        post: {
          ...post,
          reportsCount: Array.isArray(post.reports) ? post.reports.length : 0
        }
      }
    });
  } catch (error) {
    console.error('管理员更新帖子状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新帖子状态失败'
    });
  }
};

exports.setPostPinned = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;

    const post = await Post.findByIdAndUpdate(
      id,
      { $set: { isPinned: !!isPinned } },
      { new: true, runValidators: true }
    )
      .populate('author', 'userId username profile.nickname profile.avatar role status')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    res.json({
      success: true,
      data: {
        post: {
          ...post,
          reportsCount: Array.isArray(post.reports) ? post.reports.length : 0
        }
      }
    });
  } catch (error) {
    console.error('管理员置顶/取消置顶帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '更新帖子置顶状态失败'
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(
      id,
      { $set: { status: 'deleted' } },
      { new: true }
    )
      .populate('author', 'userId username profile.nickname profile.avatar role status')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    res.json({
      success: true,
      data: {
        post: {
          ...post,
          reportsCount: Array.isArray(post.reports) ? post.reports.length : 0
        }
      }
    });
  } catch (error) {
    console.error('管理员删除帖子错误:', error);
    res.status(500).json({
      success: false,
      message: '删除帖子失败'
    });
  }
};

