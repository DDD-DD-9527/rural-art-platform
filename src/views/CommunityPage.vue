<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="$router.back()" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">社区交流</h1>
          <div class="flex items-center space-x-3">
            <button class="p-2 text-slate-600 hover:text-slate-900 transition-colors">
              <SearchIcon class="w-5 h-5" />
            </button>
            <button 
              @click="showPublishModal = true"
              class="flex items-center px-4 py-2 gradient-primary text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <PlusIcon class="w-4 h-4 mr-1" />
              发布
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- Navigation Tabs -->
      <div class="flex space-x-2 mb-8 glass-card rounded-2xl p-2 shadow-lg">
        <button
          v-for="tab in navTabs"
          :key="tab"
          @click="handleNavTabChange(tab)"
          :class="[
            'flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-lg',
            activeNavTab === tab
              ? 'gradient-primary text-white shadow-lg transform scale-105'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Trending Topics (只在推荐页显示) -->
      <div v-if="activeNavTab === '推荐'" class="glass-card rounded-2xl p-6 mb-8">
        <h3 class="text-xl font-bold mb-4 text-slate-800 flex items-center">
          <TrendingUpIcon class="w-6 h-6 mr-2 text-emerald-600" />
          热门话题
        </h3>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="topic in trendingTopics"
            :key="topic"
            class="px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium hover:from-emerald-100 hover:to-blue-100 transition-all duration-200 hover:scale-105"
          >
            {{ topic }}
          </button>
        </div>
      </div>

      <!-- Local Community Info (只在本地页显示) -->
      <div v-if="activeNavTab === '本地'" class="glass-card rounded-2xl p-6 mb-8">
        <h3 class="text-xl font-bold mb-4 text-slate-800 flex items-center">
          <MapPinIcon class="w-6 h-6 mr-2 text-blue-600" />
          {{ LOCATION_CONFIG.DEFAULT_REGION }} 社区
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-emerald-50 rounded-2xl">
            <div class="text-2xl font-bold text-emerald-600">156</div>
            <div class="text-sm text-slate-600">本地学员</div>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-2xl">
            <div class="text-2xl font-bold text-blue-600">23</div>
            <div class="text-sm text-slate-600">活跃讲师</div>
          </div>
          <div class="text-center p-4 bg-violet-50 rounded-2xl">
            <div class="text-2xl font-bold text-violet-600">89</div>
            <div class="text-sm text-slate-600">今日动态</div>
          </div>
          <div class="text-center p-4 bg-orange-50 rounded-2xl">
            <div class="text-2xl font-bold text-orange-600">12</div>
            <div class="text-sm text-slate-600">线下活动</div>
          </div>
        </div>
      </div>

      <!-- Topic Categories (只在话题页显示) -->
      <div v-if="activeNavTab === '话题'" class="glass-card rounded-2xl p-6 mb-8">
        <h3 class="text-xl font-bold mb-4 text-slate-800 flex items-center">
          <HashIcon class="w-6 h-6 mr-2 text-violet-600" />
          话题分类
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div 
            v-for="category in topicCategories"
            :key="category.name"
            @click="selectTopic(category.name)"
            :class="[
              'p-4 rounded-2xl border transition-all duration-300 cursor-pointer group',
              selectedTopic === category.name 
                ? 'bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-300 shadow-lg' 
                : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:shadow-lg'
            ]"
          >
            <div class="flex items-center mb-2">
              <component :is="category.icon" class="w-6 h-6 mr-2 text-slate-600 group-hover:text-emerald-600 transition-colors" />
              <h4 class="font-semibold text-slate-800">{{ category.name }}</h4>
            </div>
            <p class="text-sm text-slate-600 mb-2">{{ category.description }}</p>
            <div class="text-xs text-emerald-600 font-medium">{{ category.count }} 个帖子</div>
          </div>
        </div>
      </div>

      <!-- Posts Feed -->
      <div class="space-y-6">
        <PostCard
          v-for="post in currentPosts"
          :key="post.id"
          :post="post"
        />
      </div>

      <!-- Load More -->
      <div class="text-center mt-8" v-if="pagination.current < pagination.total">
        <button 
          @click="loadMore"
          :disabled="loading"
          class="px-8 py-3 glass-card rounded-2xl text-slate-600 hover:bg-white hover:shadow-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '加载中...' : '加载更多内容' }}
        </button>
      </div>
      
      <!-- 没有更多内容 -->
      <div class="text-center mt-8 text-slate-500" v-else-if="posts.length > 0">
        没有更多内容了
      </div>
      
      <!-- 加载状态 -->
      <div class="text-center mt-8" v-if="loading && posts.length === 0">
        <div class="text-slate-500">加载中...</div>
      </div>
    </main>

    <!-- Publish Modal -->
    <PublishModal 
      v-if="showPublishModal" 
      @close="showPublishModal = false"
      @publish="handlePublish"
    />

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  SearchIcon, 
  PlusIcon, 
  TrendingUpIcon,
  MapPinIcon,
  HashIcon,
  PaletteIcon,
  CameraIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  MusicIcon,
  HeartIcon
} from 'lucide-vue-next'

import PostCard from '../components/PostCard.vue'
import PublishModal from '../components/PublishModal.vue'
import BottomNavigation from '../components/BottomNavigation.vue'
import { postService } from '@/services/postService'
import { topicAPI, postAPI } from '@/services/api'
import { useUserStore } from '@/stores/user'
import { useSocialStore } from '@/stores/social'
import { ElMessage } from 'element-plus'
import { LOCATION_CONFIG, COURSE_CONFIG } from '@/config/constants'

const router = useRouter()
const userStore = useUserStore()
const socialStore = useSocialStore()
const activeTab = ref('community')
const activeNavTab = ref('推荐')
const selectedTopic = ref('') // 选中的话题
const showPublishModal = ref(false)
const loading = ref(false)
const posts = ref([])
const pagination = ref({
  current: 1,
  total: 1,
  pageSize: 20
})

const navTabs = ['推荐', '关注', '本地', '话题']
const trendingTopics = ref([
  '#' + COURSE_CONFIG.CATEGORIES[0] + '展示',
  '#手机摄影技巧',
  '#乡村生活记录', 
  '#传统文化传承',
  '#AI创作分享',
  '#电商运营心得'
])

const topicCategories = reactive([])
const topicCategoriesLoading = ref(false)

// 获取话题分类数据
const fetchTopicCategories = async () => {
  try {
    topicCategoriesLoading.value = true
    
    // 定义默认话题 - 基于配置生成
    const defaultTopics = [
      {
        name: '传统艺术',
        description: COURSE_CONFIG.CATEGORIES.slice(0, 3).join('、') + '等传统手工艺',
        count: 0,
        icon: PaletteIcon,
        color: '#FF6B6B'
      },
      {
        name: '摄影分享',
        description: '乡村风景、生活记录、手机摄影',
        count: 0,
        icon: CameraIcon,
        color: '#4ECDC4'
      },
      {
        name: '电商技能',
        description: '网店运营、直播带货、产品推广',
        count: 0,
        icon: ShoppingBagIcon,
        color: '#45B7D1'
      },
      {
        name: '学习心得',
        description: '课程学习、技能提升、经验分享',
        count: 0,
        icon: BookOpenIcon,
        color: '#96CEB4'
      },
      {
        name: '民族文化',
        description: '传统节日、民族音乐、文化传承',
        count: 0,
        icon: MusicIcon,
        color: '#FFEAA7'
      },
      {
        name: '生活感悟',
        description: '日常生活、心情随笔、人生感悟',
        count: 0,
        icon: HeartIcon,
        color: '#DDA0DD'
      }
    ]
    
    const response = await fetch(`/api/topics/categories?limit=20&_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    const data = await response.json()
    console.log('话题分类API响应:', data)
    
    if (data.success) {
      // 清空现有数据
      topicCategories.splice(0, topicCategories.length)
      
      // 创建一个Map来存储API返回的话题，用于快速查找
      const apiTopicsMap = new Map()
      data.data.forEach(topic => {
        apiTopicsMap.set(topic.name, topic)
      })
      
      // 合并默认话题和API话题
      const mergedTopics = []
      
      // 首先添加默认话题，如果API中有对应数据则使用API的count
      defaultTopics.forEach(defaultTopic => {
        const apiTopic = apiTopicsMap.get(defaultTopic.name)
        mergedTopics.push({
          name: defaultTopic.name,
          description: apiTopic ? apiTopic.description : defaultTopic.description,
          count: apiTopic ? apiTopic.count : defaultTopic.count,
          icon: getTopicIcon(defaultTopic.name),
          color: apiTopic ? apiTopic.color : defaultTopic.color
        })
        // 从Map中移除已处理的话题
        if (apiTopic) {
          apiTopicsMap.delete(defaultTopic.name)
        }
      })
      
      // 添加API中剩余的话题（不在默认话题中的）
      apiTopicsMap.forEach(topic => {
        mergedTopics.push({
          name: topic.name,
          description: topic.description,
          count: topic.count,
          icon: getTopicIcon(topic.name),
          color: topic.color
        })
      })
      
      // 添加合并后的话题到响应式数组
      topicCategories.push(...mergedTopics)
    } else {
      // 如果API调用失败，使用默认话题
      topicCategories.splice(0, topicCategories.length, ...defaultTopics)
    }
  } catch (error) {
    console.error('获取话题分类失败:', error)
    // 如果API失败，使用默认数据
    const defaultTopics = [
      {
        name: '传统艺术',
        description: '剪纸、绘画、刺绣等传统手工艺',
        count: 0,
        icon: PaletteIcon,
        color: '#FF6B6B'
      },
      {
        name: '摄影分享',
        description: '乡村风景、生活记录、手机摄影',
        count: 0,
        icon: CameraIcon,
        color: '#4ECDC4'
      },
      {
        name: '电商技能',
        description: '网店运营、直播带货、产品推广',
        count: 0,
        icon: ShoppingBagIcon,
        color: '#45B7D1'
      },
      {
        name: '学习心得',
        description: '课程学习、技能提升、经验分享',
        count: 0,
        icon: BookOpenIcon,
        color: '#96CEB4'
      },
      {
        name: '民族文化',
        description: '传统节日、民族音乐、文化传承',
        count: 0,
        icon: MusicIcon,
        color: '#FFEAA7'
      },
      {
        name: '生活感悟',
        description: '日常生活、心情随笔、人生感悟',
        count: 0,
        icon: HeartIcon,
        color: '#DDA0DD'
      }
    ]
    topicCategories.splice(0, topicCategories.length, ...defaultTopics)
  } finally {
    topicCategoriesLoading.value = false
  }
}

// 根据话题名称获取对应图标
const getTopicIcon = (topicName) => {
  const iconMap = {
    '剪纸': PaletteIcon,
    '传统文化': BookOpenIcon,
    '手工艺': PaletteIcon,
    '绘画': PaletteIcon,
    '书法': BookOpenIcon,
    '陶艺': PaletteIcon,
    '编织': PaletteIcon,
    '木工': PaletteIcon,
    '摄影': CameraIcon,
    '民俗': MusicIcon,
    '传统艺术': PaletteIcon,
    '摄影分享': CameraIcon,
    '电商技能': ShoppingBagIcon,
    '学习心得': BookOpenIcon,
    '民族文化': MusicIcon,
    '生活感悟': HeartIcon
  }
  return iconMap[topicName] || BookOpenIcon
}

// 移除硬编码的推荐帖子数据，完全依赖API

// 移除硬编码的关注帖子数据，完全依赖API

// 移除硬编码的本地帖子数据，完全依赖API

// 移除硬编码的话题帖子数据，完全依赖API

// 直接使用服务器返回的帖子数据，确保状态准确性
const mergePostsWithLocalState = (newPosts, existingPosts) => {
  console.log('mergePostsWithLocalState 输入参数:', { newPosts, existingPosts })
  
  if (!newPosts || !Array.isArray(newPosts)) {
    console.warn('newPosts 不是数组:', newPosts)
    return []
  }
  
  // 直接返回服务器数据，因为后端已经正确设置了所有状态
  console.log('直接使用服务器返回的状态数据')
  newPosts.forEach((post, index) => {
    if (post.author) {
      console.log(`帖子 ${index + 1} 作者 ${post.author._id} 关注状态: ${post.author.isFollowing}, 点赞状态: ${post.isLiked}`)
    }
  })
  
  return newPosts
}

// 获取帖子数据
const fetchPosts = async (page = 1, forceRefresh = false) => {
  try {
    loading.value = true
    let params = {
      page,
      limit: pagination.value.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    
    // 添加时间戳参数来避免缓存
    if (forceRefresh || page === 1) {
      params._t = Date.now()
    }
    
    console.log('🔄 开始获取帖子数据，activeNavTab:', activeNavTab.value, 'page:', page, 'forceRefresh:', forceRefresh)
    console.log('📋 获取帖子参数:', params)
    
    let response
    if (activeNavTab.value === '推荐') {
      const recommendedResponse = await postService.getRecommendedPosts({
        limit: pagination.value.pageSize,
        _t: Date.now()
      })
      
      console.log('📡 推荐帖子响应:', recommendedResponse)
      
      if (recommendedResponse && recommendedResponse.posts && recommendedResponse.posts.length > 0) {
        response = recommendedResponse
      } else {
        // 如果没有推荐帖子，回退到普通帖子
        console.log('⚠️ 没有推荐帖子，回退到普通帖子')
        const fallbackResponse = await postService.getPosts(params)
        console.log('📡 回退帖子响应:', fallbackResponse)
        response = fallbackResponse
      }
    } else if (activeNavTab.value === '本地') {
      // 获取本地帖子
      params.location = '本地' // 或者根据用户位置设置
      const localResponse = await postService.getPosts(params)
      console.log('📡 本地帖子响应:', localResponse)
      response = localResponse
    } else if (activeNavTab.value === '话题') {
      // 获取话题帖子
      if (selectedTopic.value) {
        params.tags = [selectedTopic.value]
        console.log('🏷️ 选中话题:', selectedTopic.value)
      }
      const topicResponse = await postService.getPosts(params)
      console.log('📡 话题帖子响应:', topicResponse)
      response = topicResponse
    } else {
      // 默认获取所有帖子
      const defaultResponse = await postService.getPosts(params)
      console.log('📡 默认帖子响应:', defaultResponse)
      response = defaultResponse
    }
     
     if (response && response.posts) {
       console.log('📊 API响应数据结构:', {
         postsCount: response.posts.length,
         pagination: response.pagination,
         hasMore: response.pagination?.current < response.pagination?.total
       })
       
       // 详细检查每个帖子的状态
       response.posts.forEach((post, index) => {
         console.log(`📝 帖子 ${index + 1}:`, {
           id: post._id,
           content: post.content?.substring(0, 50) + '...',
           isLiked: post.isLiked,
           likeCount: post.stats?.likeCount || post.likes || 0,
           author: {
             id: post.author?._id || post.author?.id,
             username: post.author?.username || post.author?.profile?.nickname,
             isFollowing: post.author?.isFollowing
           }
         })
       })
       
       const mergedPosts = mergePostsWithLocalState(response.posts, posts.value)
       posts.value = page === 1 ? mergedPosts : [...posts.value, ...mergedPosts]
       pagination.value = response.pagination || { current: 1, total: 1, count: 0, totalCount: 0, pageSize: 20 }
       
       console.log('📈 更新后的帖子总数:', posts.value.length)
       console.log('📄 分页信息:', pagination.value)
       
       console.log('🔧 开始初始化社交状态...')
       // 将帖子状态同步到社交状态store
       socialStore.initializePostsState(posts.value)
       console.log('✅ 社交状态初始化完成')
       
       console.log('📋 最终帖子状态摘要:', posts.value.map(post => ({
         authorId: post.author?._id,
         isFollowing: post.author?.isFollowing,
         isLiked: post.isLiked
       })))
     } else {
       console.error('❌ API响应格式错误:', response)
       posts.value = []
       pagination.value = { current: 1, total: 1, count: 0, totalCount: 0, pageSize: 20 }
     }
   } catch (error) {
     console.error('❌ 获取帖子失败:', error)
     ElMessage.error('获取帖子失败，请稍后重试')
   } finally {
     loading.value = false
   }
 }

 const currentPosts = computed(() => {
  return posts.value
})

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const handleNavTabChange = (tab) => {
  activeNavTab.value = tab
  // 切换到话题页面时重置选中的话题
  if (tab === '话题') {
    selectedTopic.value = ''
  }
  fetchPosts(1, true) // 强制刷新第一页数据
}

// 选择话题
const selectTopic = (topicName) => {
  // 确保切换到话题页面
  if (activeNavTab.value !== '话题') {
    activeNavTab.value = '话题'
  }
  
  if (selectedTopic.value === topicName) {
    // 如果点击的是已选中的话题，则取消选择
    selectedTopic.value = ''
  } else {
    // 选择新话题
    selectedTopic.value = topicName
  }
  // 重新获取帖子数据
  fetchPosts(1, true)
}

const handlePublish = async (postData) => {
  // 发布成功后，重新获取帖子列表以确保数据同步
  showPublishModal.value = false
  await fetchPosts(1, true) // 强制刷新第一页数据
}

const loadMore = () => {
  if (pagination.value.current < pagination.value.total) {
    fetchPosts(pagination.value.current + 1)
  }
}

// 处理关注状态变化
const handleFollowStateChanged = (event) => {
  const { userId, isFollowing } = event.detail
  
  // 更新posts中对应作者的关注状态
  posts.value.forEach(post => {
    if (post.author && (post.author._id === userId || post.author.id === userId)) {
      post.author.isFollowing = isFollowing
      console.log(`更新帖子作者 ${userId} 的关注状态为: ${isFollowing}`)
    }
  })
  
  // 重新同步到社交状态store
  socialStore.initializePostsState(posts.value)
}

// 初始化数据
onMounted(async () => {
  await Promise.all([
    fetchTopicCategories(),
    fetchPosts(1, true)
  ])
  
  // 监听关注状态变化事件
  window.addEventListener('followStateChanged', handleFollowStateChanged)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('followStateChanged', handleFollowStateChanged)
})
</script>
