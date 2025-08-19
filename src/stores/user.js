import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const useUserStore = defineStore('user', () => {
  // 认证状态
  const isAuthenticated = ref(false)
  const isGuest = ref(false)
  const token = ref(localStorage.getItem('auth_token') || '')
  
  // 用户基本信息
  const user = reactive({
    id: null,
    userId: '',
    username: '',
    name: '',
    avatar: '',
    location: '',
    bio: '',
    joinDate: '',
    role: 'user'
  })

  // 学习统计
  const learningStats = reactive({
    studyDays: 0,
    completedCourses: 0,
    totalPoints: 0,
    followers: 0,
    weeklyProgress: 0,
    currentStreak: 0,
    todayStudyTime: 0,
    weeklyStudyDays: 0,
    totalLearningTime: 0,
    longestStreak: 0,
    lastLearningDate: null
  })

  // 技能进度
  const skillProgress = reactive({
    artSkills: {
      title: '艺术技能',
      progress: 0,
      skills: []
    },
    digitalSkills: {
      title: '数字技能',
      progress: 0,
      skills: []
    }
  })

  // 成就徽章
  const achievements = reactive([])

  // 用户偏好设置
  const preferences = reactive({
    language: 'zh-CN',
    dialect: '',
    learningTime: '',
    difficulty: '',
    interests: []
  })

  // 计算属性
  const isAdmin = computed(() => user.role === 'admin')

  // 加载用户数据
  const loadUserData = async () => {
    // 模拟API调用
    console.log('Loading user data...')
  }

  const updateProfile = (newData) => {
    Object.assign(user, newData)
  }

  const addAchievement = async (achievement) => {
    if (isAuthenticated.value) {
      // 调用API更新后端数据
      const success = await addAchievementAPI(achievement)
      if (success) {
        return true
      }
    }
    
    // 本地更新（游客模式或API失败时）
    const existingIndex = achievements.findIndex(a => a.id === achievement.id)
    if (existingIndex >= 0) {
      achievements[existingIndex] = { ...achievements[existingIndex], ...achievement, earned: true }
    } else {
      achievements.push({ ...achievement, earned: true })
    }
    return true
  }

  const updateSkillProgress = async (skillType, skillName, progress) => {
    if (isAuthenticated.value) {
      // 调用API更新后端数据
      const success = await updateSkillProgressAPI(skillType, skillName, progress)
      if (success) {
        return true
      }
    }
    
    // 本地更新（游客模式或API失败时）
    if (skillProgress[skillType]) {
      const skill = skillProgress[skillType].skills.find(s => s.name === skillName)
      if (skill) {
        skill.progress = progress
      } else {
        skillProgress[skillType].skills.push({
          name: skillName,
          progress: progress
        })
      }
      
      // 重新计算整体进度
      const totalProgress = skillProgress[skillType].skills.reduce((sum, skill) => sum + skill.progress, 0)
      skillProgress[skillType].progress = Math.round(totalProgress / skillProgress[skillType].skills.length)
    }
    return true
  }

  const incrementPoints = async (points) => {
    const newStats = {
      ...learningStats,
      totalPoints: learningStats.totalPoints + points
    }
    
    if (isAuthenticated.value) {
      // 调用API更新后端数据
      const success = await updateLearningStats(newStats)
      if (success) {
        return true
      }
    }
    
    // 本地更新（游客模式或API失败时）
    learningStats.totalPoints += points
    return true
  }

  const updateStreak = async (days) => {
    const newStats = {
      ...learningStats,
      currentStreak: days,
      longestStreak: Math.max(days, learningStats.longestStreak || 0)
    }
    
    if (isAuthenticated.value) {
      // 调用API更新后端数据
      const success = await updateLearningStats(newStats)
      if (success) {
        return true
      }
    }
    
    // 本地更新（游客模式或API失败时）
    learningStats.currentStreak = days
    if (days > (learningStats.longestStreak || 0)) {
      learningStats.longestStreak = days
    }
    return true
  }

  // 初始化认证状态
  const initAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      token.value = savedToken
      isAuthenticated.value = true
      // 可以在这里验证token有效性
    }
  }

  // 用户注册
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: userData.username,
          userId: userData.userId,
          password: userData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '注册失败')
      }

      // 注册成功后自动登录
      if (data.data && data.data.token) {
        token.value = data.data.token
        localStorage.setItem('auth_token', data.data.token)
        isAuthenticated.value = true
        isGuest.value = false
        
        // 获取完整的用户数据
        await getCurrentUser()
      }

      return data
    } catch (error) {
      console.error('注册错误:', error)
      throw error
    }
  }

  // 用户登录
  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: credentials.identifier,
          password: credentials.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '登录失败')
      }

      // 登录成功
      if (data.data && data.data.token) {
        token.value = data.data.token
        localStorage.setItem('auth_token', data.data.token)
        isAuthenticated.value = true
        isGuest.value = false
        
        // 获取完整的用户数据
        await getCurrentUser()
        
        // 如果选择记住我，设置更长的过期时间
        if (credentials.rememberMe) {
          localStorage.setItem('remember_me', 'true')
        }
      }

      return data
    } catch (error) {
      console.error('登录错误:', error)
      throw error
    }
  }

  // 用户登出
  const logout = async () => {
    token.value = ''
    isAuthenticated.value = false
    isGuest.value = false
    localStorage.removeItem('auth_token')
    localStorage.removeItem('remember_me')
    
    // 清空用户信息
    Object.assign(user, {
      id: null,
      userId: '',
      username: '',
      name: '',
      avatar: '',
      location: '',
      bio: '',
      joinDate: '',
      role: 'user'
    })
    
    // 清空学习统计
    Object.assign(learningStats, {
      studyDays: 0,
      completedCourses: 0,
      totalPoints: 0,
      followers: 0,
      weeklyProgress: 0,
      currentStreak: 0,
      todayStudyTime: 0,
      weeklyStudyDays: 0,
      totalLearningTime: 0,
      longestStreak: 0,
      lastLearningDate: null
    })
    
    // 清空技能进度
    skillProgress.artSkills.progress = 0
    skillProgress.artSkills.skills = []
    skillProgress.digitalSkills.progress = 0
    skillProgress.digitalSkills.skills = []
    
    // 清空成就徽章
    achievements.length = 0
    
    // 重置偏好设置
    Object.assign(preferences, {
      language: 'zh-CN',
      dialect: '',
      learningTime: '',
      difficulty: '',
      interests: []
    })
    
    return Promise.resolve()
  }

  // 设置游客模式
  const setGuestMode = () => {
    isGuest.value = true
    isAuthenticated.value = false
    token.value = ''
    
    // 设置游客用户信息
    Object.assign(user, {
      id: 'guest',
      userId: 'guest',
      username: '游客用户',
      name: '游客用户',
      avatar: '/placeholder-user.jpg',
      location: '未知',
      bio: '游客体验模式',
      joinDate: new Date().toISOString().split('T')[0],
      role: 'guest'
    })
    
    // 设置游客模式的示例数据
    Object.assign(learningStats, {
      studyDays: 3,
      completedCourses: 1,
      totalPoints: 50,
      followers: 0,
      weeklyProgress: 20,
      currentStreak: 1,
      todayStudyTime: 30,
      weeklyStudyDays: 2,
      totalLearningTime: 90,
      longestStreak: 2,
      lastLearningDate: new Date().toISOString().split('T')[0]
    })
    
    // 设置游客模式的技能进度示例
    skillProgress.artSkills.progress = 25
    skillProgress.artSkills.skills = [
      { name: '剪纸入门', progress: 30 }
    ]
    skillProgress.digitalSkills.progress = 15
    skillProgress.digitalSkills.skills = [
      { name: '手机摄影', progress: 20 }
    ]
    
    // 设置游客模式的成就示例
    achievements.length = 0
    achievements.push({
      id: 1,
      title: '学习新手',
      description: '完成第一门课程',
      icon: '/badge-beginner.svg',
      earned: true,
      earnedDate: new Date().toISOString().split('T')[0]
    })
  }

  // 获取当前用户信息
  const getCurrentUser = async () => {
    if (!token.value) {
      throw new Error('未登录')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '获取用户信息失败')
      }

      // 更新用户信息
      const userData = data.data.user
      Object.assign(user, {
        id: userData._id,
        userId: userData.userId,
        username: userData.username,
        name: userData.profile?.name || userData.profile?.nickname || userData.username,
        avatar: userData.profile?.avatar || '',
        location: userData.profile?.location || '',
        bio: userData.profile?.bio || '',
        joinDate: userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : '',
        role: userData.role || 'user'
      })
      
      // 更新学习统计
      if (userData.learningStats) {
        Object.assign(learningStats, {
          studyDays: userData.learningStats.studyDays || 0,
          completedCourses: userData.learningStats.completedCourses || 0,
          totalPoints: userData.learningStats.totalPoints || 0,
          followers: userData.socialStats?.followersCount || 0,
          weeklyProgress: userData.learningStats.weeklyProgress || 0,
          currentStreak: userData.learningStats.currentStreak || 0,
          todayStudyTime: userData.learningStats.todayStudyTime || 0,
          weeklyStudyDays: userData.learningStats.weeklyStudyDays || 0,
          totalLearningTime: userData.learningStats.totalLearningTime || 0,
          longestStreak: userData.learningStats.longestStreak || 0,
          lastLearningDate: userData.learningStats.lastLearningDate || null
        })
      }
      
      // 更新技能进度
      if (userData.skillProgress) {
        Object.assign(skillProgress, userData.skillProgress)
      }
      
      // 更新成就徽章
      if (userData.achievements) {
        achievements.length = 0
        achievements.push(...userData.achievements)
      }
      
      // 更新偏好设置
      if (userData.preferences) {
        Object.assign(preferences, userData.preferences)
      }
      
      return data
    } catch (error) {
      console.error('获取用户信息错误:', error)
      // 如果token无效，清除认证状态
      if (error.message.includes('token') || error.message.includes('认证')) {
        logout()
      }
      throw error
    }
  }

  // 更新学习统计
  const updateLearningStats = async (stats) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/learning-stats`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stats)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          Object.assign(learningStats, data.data.learningStats)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('更新学习统计失败:', error)
      return false
    }
  }

  // 更新技能进度API
  const updateSkillProgressAPI = async (skillType, skillName, progress) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/skill-progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ skillType, skillName, progress })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          Object.assign(skillProgress, data.data.skillProgress)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('更新技能进度失败:', error)
      return false
    }
  }

  // 添加成就徽章API
  const addAchievementAPI = async (achievement) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/achievements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(achievement)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          achievements.length = 0
          achievements.push(...data.data.achievements)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('添加成就徽章失败:', error)
      return false
    }
  }

  // 检查是否已登录并获取用户数据
  const checkAuth = async () => {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      token.value = savedToken
      try {
        // 获取真实的用户数据
        await getCurrentUser()
        isAuthenticated.value = true
        isGuest.value = false
        return true
      } catch (error) {
        console.error('Token验证失败:', error)
        // Token无效，清除本地存储
        localStorage.removeItem('auth_token')
        token.value = ''
        return false
      }
    }
    return false
  }

  // 获取认证头
  const getAuthHeaders = () => {
    if (!token.value) {
      return {}
    }
    return {
      'Authorization': `Bearer ${token.value}`
    }
  }

  // 初始化时检查认证状态
  initAuth()

  return {
    // 状态
    isAuthenticated,
    isGuest,
    token,
    user,
    learningStats,
    skillProgress,
    achievements,
    preferences,
    isAdmin,
    
    // 认证方法
    register,
    login,
    logout,
    setGuestMode,
    getCurrentUser,
    checkAuth,
    getAuthHeaders,
    
    // 原有方法
    loadUserData,
    updateProfile,
    addAchievement,
    updateSkillProgress,
    incrementPoints,
    updateStreak,
    
    // 新增API方法
    updateLearningStats,
    updateSkillProgressAPI,
    addAchievementAPI,
    
    // 社交统计更新
    updateSocialStats: (stats) => {
      if (stats.following !== undefined) {
        learningStats.followers = stats.followers || 0
      }
      if (stats.followers !== undefined) {
        // 可以添加粉丝数到learningStats或创建新的socialStats对象
        learningStats.followers = stats.followers || 0
      }
    }
  }
})
