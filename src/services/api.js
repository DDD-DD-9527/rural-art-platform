// API服务文件 - 统一管理后端接口调用
import axios from 'axios'
import { useUserStore } from '../stores/user'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应和错误
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 处理401未授权错误
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // 返回错误信息
    const message = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// 用户相关API
export const userAPI = {
  // 用户注册
  register: (userData) => api.post('/users/register', userData),
  
  // 用户登录
  login: (credentials) => api.post('/users/login', credentials),
  
  // 获取用户资料
  getProfile: () => api.get('/users/profile'),
  
  // 更新用户资料
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  
  // 修改密码
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
  
  // 获取用户统计
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
  
  // 搜索用户
  searchUsers: (params = {}) => {
    const { keyword, limit = 10 } = params
    return api.get('/users/search', {
      params: { keyword, limit }
    })
  }
}

// 社交相关API
export const socialAPI = {
  // 关注用户
  followUser: (userId) => api.post(`/social/follow/${userId}`),
  
  // 取消关注用户
  unfollowUser: (userId) => api.delete(`/social/follow/${userId}`),
  
  // 检查关注状态
  checkFollowStatus: (userId) => api.get(`/social/follow/status/${userId}`),
  
  // 获取关注列表
  getFollowingList: (userId, params = {}) => {
    const { page = 1, limit = 10, search = '' } = params
    return api.get(`/social/following/${userId}`, {
      params: { page, limit, search }
    })
  },
  
  // 获取粉丝列表
  getFollowersList: (userId, params = {}) => {
    const { page = 1, limit = 10, search = '' } = params
    return api.get(`/social/followers/${userId}`, {
      params: { page, limit, search }
    })
  },
  
  // 获取收到的点赞列表
  getReceivedLikes: (params = {}) => {
    const { page = 1, limit = 10 } = params
    return api.get('/social/likes/received', {
      params: { page, limit }
    })
  },
  
  // 获取社交统计
  getSocialStats: (userId) => api.get(`/social/stats/${userId}`),
  
  // 获取互相关注的用户
  getMutualFollows: (params = {}) => {
    const { page = 1, limit = 10 } = params
    return api.get('/social/mutual-follows', {
      params: { page, limit }
    })
  },
  
  // 获取点赞统计
  getLikeStats: () => api.get('/social/likes/stats'),
  
  // 获取用户点赞记录
  getUserLikes: (params = {}) => {
    const { page = 1, limit = 10, type, search, sort = 'recent' } = params
    return api.get('/social/likes/given', {
      params: { page, limit, type, search, sort }
    })
  },
  
  // 获取关注列表（我的关注）
  getFollowing: (params = {}) => {
    const { page = 1, limit = 10, search, sort = 'recent' } = params
    // 使用当前用户ID，从用户store获取
    const userStore = useUserStore()
    const userId = userStore.user?.id
    if (!userId) {
      return Promise.reject(new Error('用户未登录'))
    }
    return api.get(`/social/following/${userId}`, {
      params: { page, limit, search, sort }
    })
  },
  
  // 获取粉丝列表（我的粉丝）
  getFollowers: (params = {}) => {
    const { page = 1, limit = 10, search, sort = 'recent' } = params
    // 使用当前用户ID，从用户store获取
    const userStore = useUserStore()
    const userId = userStore.user?.id
    if (!userId) {
      return Promise.reject(new Error('用户未登录'))
    }
    return api.get(`/social/followers/${userId}`, {
      params: { page, limit, search, sort }
    })
  },
  
  // 获取推荐用户
  getRecommendedUsers: (params = {}) => {
    const { limit = 10 } = params
    return api.get('/social/recommended', {
      params: { limit }
    })
  },
  
  // 获取关注统计
  getFollowStats: () => {
    const userStore = useUserStore()
    const userId = userStore.user?.id
    if (!userId) {
      return Promise.reject(new Error('用户未登录'))
    }
    return api.get(`/social/follow-stats/${userId}`)
  }
}

// 帖子相关API
export const postAPI = {
  // 获取帖子列表
  getPosts: (params = {}) => {
    const { page = 1, limit = 10, type = 'recommend' } = params
    return api.get('/posts', {
      params: { page, limit, type }
    })
  },
  
  // 获取帖子详情
  getPostById: (postId) => api.get(`/posts/${postId}`),
  
  // 创建帖子
  createPost: (postData) => api.post('/posts', postData),
  
  // 更新帖子
  updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
  
  // 删除帖子
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  
  // 点赞/取消点赞帖子
  toggleLikePost: (postId) => api.post(`/posts/${postId}/like`),
  
  // 获取帖子评论
  getPostComments: (postId, params = {}) => {
    const { page = 1, limit = 10 } = params
    return api.get(`/posts/${postId}/comments`, {
      params: { page, limit }
    })
  },
  
  // 添加帖子评论
  addPostComment: (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData),
  
  // 获取关注用户的帖子
  getFollowingPosts: (params = {}) => {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params
    return api.get('/posts/following', {
      params: { page, limit, sortBy, sortOrder }
    })
  }
}

// 评论相关API
export const commentAPI = {
  // 获取评论列表
  getComments: (params = {}) => {
    const { targetType, targetId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', parentId } = params
    return api.get('/comments', {
      params: { targetType, targetId, page, limit, sortBy, sortOrder, parentId }
    })
  },
  
  // 创建评论
  createComment: (commentData) => api.post('/comments', commentData),
  
  // 获取我的评论
  getMyComments: (params = {}) => {
    const { page = 1, limit = 10, type, search, sort = 'recent' } = params
    return api.get('/comments/my', {
      params: { page, limit, type, search, sort }
    })
  },
  
  // 获取评论详情
  getCommentById: (commentId) => api.get(`/comments/${commentId}`),
  
  // 更新评论
  updateComment: (commentId, commentData) => api.put(`/comments/${commentId}`, commentData),
  
  // 删除评论
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  
  // 点赞/取消点赞评论
  toggleLike: (commentId) => api.post(`/comments/${commentId}/like`),
  
  // 举报评论
  reportComment: (commentId, reason) => api.post(`/comments/${commentId}/report`, { reason }),
  
  // 回复评论
  replyToComment: (commentId, replyData) => api.post(`/comments/${commentId}/reply`, replyData)
}

// 课程相关API
export const courseAPI = {
  // 获取课程列表
  getCourses: (params = {}) => {
    const { page = 1, limit = 10, category = '', search = '' } = params
    return api.get('/courses', {
      params: { page, limit, category, search }
    })
  },
  
  // 获取课程详情
  getCourseById: (courseId) => api.get(`/courses/${courseId}`),
  
  // 报名课程
  enrollCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  
  // 更新学习进度
  updateProgress: (courseId, progressData) => api.put(`/courses/${courseId}/progress`, progressData),
  
  // 获取学习进度
  getProgress: (courseId) => api.get(`/courses/${courseId}/progress`)
}

// 文件上传API
export const uploadAPI = {
  // 上传图片
  uploadImage: (file, type = 'post') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 上传头像
  uploadAvatar: (file) => {
    return uploadAPI.uploadImage(file, 'avatar')
  }
}

// AI工具相关API
// 话题相关API
export const topicAPI = {
  // 获取话题分类列表
  getTopicCategories: (params = {}) => {
    const { limit = 20 } = params
    return api.get('/topics/categories', {
      params: { limit }
    })
  },
  
  // 获取热门话题
  getTrendingTopics: (params = {}) => {
    const { limit = 10, days = 7 } = params
    return api.get('/topics/trending', {
      params: { limit, days }
    })
  },
  
  // 获取话题统计
  getTopicStats: (tags) => {
    return api.get('/topics/stats', {
      params: { tags: Array.isArray(tags) ? tags.join(',') : tags }
    })
  }
}

export const aiAPI = {
  // AI图像增强
  enhanceImage: (file, enhanceType) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('enhanceType', enhanceType)
    
    return api.post('/ai/enhance-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 风格转换
  styleTransfer: (file, style) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('style', style)
    
    return api.post('/ai-tools/style-transfer', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 图案生成
  generatePattern: (generationParams) => {
    return api.post('/ai-tools/pattern-generate', generationParams)
  },
  
  // 智能修复
  repairImage: (file, repairOptions) => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('repairOptions', JSON.stringify(repairOptions))
    
    return api.post('/ai-tools/repair', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 获取AI创作历史
  getAIHistory: (params = {}) => {
    const { page = 1, limit = 10 } = params
    return api.get('/ai-tools/history', {
      params: { page, limit }
    })
  }
}

// 导出默认API实例
export default api

// 导出axios实例
export { api }