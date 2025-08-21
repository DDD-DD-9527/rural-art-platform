// API服务文件 - 统一管理后端接口调用
import axios from 'axios'
import { useUserStore } from '../stores/user'
import { API_CONFIG } from '@/config/constants'

// 创建axios实例
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
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
// 课程数据映射函数
const mapCourseData = (course) => {
  if (!course) return null
  
  return {
    ...course,
    // 字段映射：统一前后端字段命名
    level: course.difficulty || course.level, // 前端使用level，后端使用difficulty
    image: course.thumbnail || course.image, // 前端使用image，后端使用thumbnail
    students: course.stats?.enrolledCount || course.students || 0, // 统一学员数字段
    rating: course.stats?.rating?.average || course.rating || 0, // 统一评分字段
    progress: course.progress || 0, // 学习进度字段
    // 状态字段映射：确保前端能正确获取课程状态
    settings: {
      ...course.settings,
      isPublished: course.settings?.isPublished !== undefined ? course.settings.isPublished : course.isPublished
    },
    // 创建者信息映射
    creator: course.creator ? {
      id: course.creator._id || course.creator.id,
      username: course.creator.username,
      nickname: course.creator.profile?.nickname || course.creator.nickname,
      avatar: course.creator.profile?.avatar || course.creator.avatar,
      bio: course.creator.profile?.bio || course.creator.bio
    } : course.creator,
    // 课程内容映射（如果存在lessons）
    lessons: course.lessons ? course.lessons.map(lesson => ({
      ...lesson,
      xp: lesson.xp || 10, // 默认经验值
      status: lesson.status || 'locked', // 默认状态
      type: lesson.type || 'video' // 默认类型
    })) : []
  }
}

// 课程列表数据映射
const mapCoursesResponse = (response) => {
  if (!response?.data) return response
  
  return {
    ...response,
    data: {
      ...response.data,
      courses: response.data.courses?.map(mapCourseData) || [],
      total: response.data.total || 0
    }
  }
}

export const courseAPI = {
  // 获取课程列表
  getCourses: async (params = {}) => {
    const { 
      page = 1, 
      limit = 20, 
      category = '', 
      difficulty = '', 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      status,
      isPublished
    } = params
    
    // 处理status参数到isPublished的映射
    let finalIsPublished = isPublished
    if (status !== undefined) {
      if (status === 'published') {
        finalIsPublished = true
      } else if (status === 'draft') {
        finalIsPublished = false
      } else if (status === 'archived') {
        // 对于归档状态，我们需要特殊处理
        finalIsPublished = undefined // 让后端处理归档逻辑
      } else if (status === '') {
        finalIsPublished = undefined // 获取所有状态
      }
    }
    
    const requestParams = { page, limit, category, difficulty, search, sortBy, sortOrder }
    if (finalIsPublished !== undefined) {
      requestParams.isPublished = finalIsPublished
    }
    
    const response = await api.get('/courses', {
      params: requestParams
    })
    
    return mapCoursesResponse(response)
  },
  
  // 获取课程详情
  getCourseById: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`)
    return {
      ...response,
      data: mapCourseData(response.data)
    }
  },
  
  // 创建课程
  createCourse: (courseData) => api.post('/courses', courseData),
  
  // 更新课程
  updateCourse: (courseId, courseData) => api.put(`/courses/${courseId}`, courseData),
  
  // 删除课程
  deleteCourse: (courseId) => api.delete(`/courses/${courseId}`),
  
  // 发布课程
  publishCourse: (courseId) => api.patch(`/courses/${courseId}/publish`),
  
  // 取消发布课程
  unpublishCourse: (courseId) => api.patch(`/courses/${courseId}/unpublish`),
  
  // 获取热门课程
  getPopularCourses: async (params = {}) => {
    const { limit = 10 } = params
    const response = await api.get('/courses/popular', {
      params: { limit }
    })
    return {
      ...response,
      data: response.data?.map(mapCourseData) || []
    }
  },
  
  // 获取推荐课程
  getRecommendedCourses: async (params = {}) => {
    const { limit = 10 } = params
    const response = await api.get('/courses/recommended', {
      params: { limit }
    })
    return {
      ...response,
      data: response.data?.map(mapCourseData) || []
    }
  },
  
  // 报名课程
  enrollCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  
  // 更新学习进度
  updateProgress: (courseId, progressData) => api.put(`/courses/${courseId}/progress`, progressData),
  
  // 获取学习进度
  getProgress: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/progress`)
    return {
      ...response,
      data: {
        ...response.data,
        progress: response.data?.progress || 0,
        completedLessons: response.data?.completedLessons || [],
        currentLesson: response.data?.currentLesson || null
      }
    }
  },
  
  // 获取我的课程报名列表
  getMyEnrollments: async (params = {}) => {
    const { 
      status, 
      page = 1, 
      limit = 20, 
      sortBy = 'enrolledAt', 
      sortOrder = 'desc' 
    } = params
    const response = await api.get('/courses/enrollments/my', {
      params: { status, page, limit, sortBy, sortOrder }
    })
    return {
      ...response,
      data: {
        ...response.data,
        enrollments: response.data?.enrollments?.map(enrollment => ({
          ...enrollment,
          course: mapCourseData(enrollment.course)
        })) || [],
        total: response.data?.total || 0
      }
    }
  },
  
  // 获取课程报名学员列表（管理员/创作者）
  getCourseEnrollments: async (courseId, params = {}) => {
    const { 
      status, 
      page = 1, 
      limit = 20, 
      sortBy = 'enrolledAt', 
      sortOrder = 'desc' 
    } = params
    const response = await api.get(`/courses/${courseId}/enrollments`, {
      params: { status, page, limit, sortBy, sortOrder }
    })
    return {
      ...response,
      data: {
        ...response.data,
        enrollments: response.data?.enrollments || [],
        total: response.data?.total || 0
      }
    }
  },

  // 获取用户已注册的课程（别名方法）
  getUserEnrolledCourses: async (userId, params = {}) => {
    // 使用getMyEnrollments方法，但返回课程列表格式
    const response = await courseAPI.getMyEnrollments(params)
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.enrollments?.map(enrollment => ({
          ...enrollment.course,
          progress: enrollment.progress?.percentage || 0,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status
        })) || []
      }
    }
    return response
  }
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

// 管理员相关API
export const adminAPI = {
  // 获取管理员仪表盘统计数据
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // 获取系统概览统计
  getSystemOverview: (params = {}) => {
    const { timeRange = '7d' } = params
    return api.get('/admin/dashboard/overview', {
      params: { timeRange }
    })
  }
}

// 游戏化系统API
export const gamificationApi = {
  // 获取学习路径
  getLearningPath: (courseId) => {
    // 检查courseId是否是有效的MongoDB ObjectId格式（24位十六进制字符串）
    const isValidObjectId = courseId && /^[0-9a-fA-F]{24}$/.test(courseId)
    if (isValidObjectId) {
      return api.get(`/gamification/learning-path/${courseId}`)
    } else {
      return api.get('/gamification/learning-path')
    }
  },
  
  // 解锁课程
  unlockCourse: (courseId, userId) => {
    return api.post('/gamification/unlock-course', {
      courseId,
      userId
    })
  },
  
  // 完成课时
  completeLessonTime: (data) => {
    return api.post('/gamification/complete-lesson-time', data)
  },
  
  // 获取积分统计
  getPointsStats: (userId) => {
    return api.get(`/gamification/points/stats/${userId || ''}`)
  },
  
  // 获取积分历史
  getPointsHistory: (params = {}) => {
    const { userId, page = 1, limit = 20, period } = params
    return api.get(`/gamification/points/history/${userId || ''}`, {
      params: { page, limit, period }
    })
  },
  
  // 获取排行榜
  getLeaderboard: (params = {}) => {
    const { type = 'points', period = 'week', limit = 10 } = params
    return api.get('/gamification/leaderboard', {
      params: { type, period, limit }
    })
  },
  
  // 获取成就列表
  getAchievements: (userId) => {
    // 检查userId是否是有效的MongoDB ObjectId格式（24位十六进制字符串）
    const isValidObjectId = userId && /^[0-9a-fA-F]{24}$/.test(userId)
    if (isValidObjectId) {
      return api.get(`/gamification/achievements/${userId}`)
    } else {
      return api.get('/gamification/achievements')
    }
  },
  
  // 解锁成就
  unlockAchievement: (achievementId, userId) => {
    return api.post('/gamification/unlock-achievement', {
      achievementId,
      userId
    })
  },
  
  // 撤销积分
  revokePoints: (data) => {
    return api.post('/gamification/revoke-points', data)
  },
  
  // 获取用户等级信息
  getUserLevel: (userId) => {
    return api.get(`/gamification/level/${userId || ''}`)
  },
  
  // 获取课程解锁状态
  getCourseUnlockStatus: (courseId, userId) => {
    return api.get(`/gamification/course-unlock-status/${courseId}`, {
      params: { userId }
    })
  },
  
  // 检查课程解锁条件
  checkUnlockRequirements: (courseId, userId) => {
    return api.get(`/gamification/check-unlock/${courseId}`, {
      params: { userId }
    })
  },
  
  // 获取学习统计
  getLearningStats: (userId, period = 'week') => {
    return api.get(`/gamification/learning-stats/${userId || ''}`, {
      params: { period }
    })
  },
  
  // 获取积分获取方式
  getPointsSources: () => {
    return api.get('/gamification/points/sources')
  },
  
  // 获取成就分类
  getAchievementCategories: () => {
    return api.get('/gamification/achievements/categories')
  },
  
  // 获取用户进度概览
  getUserProgress: (userId) => {
    return api.get(`/gamification/progress/${userId || ''}`)
  },
  
  // 更新学习进度
  updateLearningProgress: (data) => {
    return api.post('/gamification/update-progress', data)
  },
  
  // 获取证书信息
  getCertificates: (userId) => {
    return api.get(`/gamification/certificates/${userId || ''}`)
  },
  
  // 领取证书
  claimCertificate: (certificateId, userId) => {
    return api.post('/gamification/claim-certificate', {
      certificateId,
      userId
    })
  }
}

// 导出默认API实例
export default api

// 导出axios实例
export { api }