const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  // 关注者
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 被关注者
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 关注时间
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 复合索引，确保同一用户不能重复关注同一人
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// 索引优化查询
followSchema.index({ follower: 1, createdAt: -1 }); // 查询某用户的关注列表
followSchema.index({ following: 1, createdAt: -1 }); // 查询某用户的粉丝列表

// 静态方法：获取用户关注列表
followSchema.statics.getFollowingList = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ follower: userId })
    .populate('following', 'username profile.nickname profile.avatar profile.bio socialStats creatorStats')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// 静态方法：获取用户粉丝列表
followSchema.statics.getFollowersList = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ following: userId })
    .populate('follower', 'username profile.nickname profile.avatar profile.bio socialStats creatorStats')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// 静态方法：检查是否已关注
followSchema.statics.isFollowing = function(followerId, followingId) {
  return this.findOne({ follower: followerId, following: followingId });
};

// 静态方法：获取关注统计
followSchema.statics.getFollowStats = async function(userId) {
  const [followingCount, followersCount] = await Promise.all([
    this.countDocuments({ follower: userId }),
    this.countDocuments({ following: userId })
  ]);
  
  return {
    followingCount,
    followersCount
  };
};

// 静态方法：获取互相关注的用户
followSchema.statics.getMutualFollows = async function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  // 查找用户关注的人
  const following = await this.find({ follower: userId }).select('following');
  const followingIds = following.map(f => f.following);
  
  // 查找这些人中也关注了该用户的
  return this.find({
    follower: { $in: followingIds },
    following: userId
  })
    .populate('follower', 'username profile.nickname profile.avatar profile.bio socialStats')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('Follow', followSchema);