<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">我的关注</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 关注统计 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <UserPlusIcon class="w-10 h-10 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">关注了 {{ following.length }} 人</h2>
          <p class="text-slate-600">发现更多优秀的创作者</p>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索关注的人..."
              class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select v-model="sortBy" class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="recent">最近关注</option>
            <option value="earliest">最早关注</option>
            <option value="name">按昵称排序</option>
            <option value="active">最近活跃</option>
          </select>
        </div>
      </div>

      <!-- 关注列表 -->
      <div class="glass-card rounded-3xl p-6">
        <div v-if="filteredFollowing.length === 0" class="text-center py-12">
          <UserPlusIcon class="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p class="text-slate-500 text-lg mb-2">暂未关注任何人</p>
          <p class="text-slate-400 text-sm">去社区发现更多优秀的创作者吧！</p>
          <button 
            @click="goToCommunity"
            class="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            去社区看看
          </button>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="user in filteredFollowing" 
            :key="user.id"
            class="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <!-- 头像 -->
              <div class="relative">
                <img 
                  :src="user.avatar" 
                  :alt="user.name"
                  class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div v-if="user.isOnline" class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <!-- 用户信息 -->
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-medium text-slate-800">{{ user.name }}</h3>
                  <span v-if="user.isVip" class="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full font-medium">
                    VIP
                  </span>
                  <span v-if="user.level" :class="[
                    'px-2 py-1 text-xs rounded-full font-medium',
                    user.level >= 10 ? 'bg-purple-100 text-purple-600' :
                    user.level >= 5 ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  ]">
                    Lv.{{ user.level }}
                  </span>
                </div>
                <div class="flex items-center space-x-4 mt-1">
                  <p class="text-sm text-slate-500">{{ user.followDate }} 关注</p>
                  <div class="flex items-center space-x-3 text-xs text-slate-400">
                    <span class="flex items-center">
                      <UsersIcon class="w-3 h-3 mr-1" />
                      {{ user.followers }} 粉丝
                    </span>
                    <span class="flex items-center">
                      <PaletteIcon class="w-3 h-3 mr-1" />
                      {{ user.works }} 作品
                    </span>
                  </div>
                </div>
                <p v-if="user.bio" class="text-sm text-slate-500 mt-1">{{ user.bio }}</p>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex items-center space-x-2">
              <button 
                @click="viewProfile(user)"
                class="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                查看资料
              </button>
              <button 
                @click="unfollowUser(user)"
                class="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                取消关注
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐关注 -->
      <div v-if="recommendedUsers.length > 0" class="glass-card rounded-3xl p-6 mt-8">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <SparklesIcon class="w-5 h-5 mr-2 text-amber-500" />
          推荐关注
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="user in recommendedUsers" 
            :key="user.id"
            class="p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors text-center"
          >
            <img 
              :src="user.avatar" 
              :alt="user.name"
              class="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-white shadow-sm"
            />
            <h4 class="font-medium text-slate-800 mb-1">{{ user.name }}</h4>
            <p class="text-sm text-slate-500 mb-3">{{ user.followers }} 粉丝 · {{ user.works }} 作品</p>
            <button 
              @click="followUser(user)"
              class="w-full py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              关注
            </button>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="text-center mt-8">
        <button 
          @click="loadMore"
          :disabled="loading"
          class="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            加载中...
          </span>
          <span v-else>加载更多</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  UserPlusIcon,
  SearchIcon,
  UsersIcon,
  PaletteIcon,
  SparklesIcon
} from 'lucide-vue-next'
import { socialAPI } from '../services/api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const goBack = () => {
  router.go(-1)
}

const goToCommunity = () => {
  router.push('/community')
}

// 搜索和排序
const searchQuery = ref('')
const sortBy = ref('recent')
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)

// 关注的用户数据
const following = ref([])
const totalCount = ref(0)
const error = ref('')

// 推荐用户
const recommendedUsers = ref([])

// 加载关注列表
const loadFollowing = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await socialAPI.getFollowing({
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      search: searchQuery.value
    })
    
    if (currentPage.value === 1) {
      following.value = response.data.list
    } else {
      following.value.push(...response.data.list)
    }
    
    totalCount.value = response.data.total
    hasMore.value = following.value.length < totalCount.value
  } catch (err) {
    error.value = '加载关注列表失败'
    console.error('Load following error:', err)
  } finally {
    loading.value = false
  }
}

// 加载推荐用户
const loadRecommendedUsers = async () => {
  try {
    const response = await socialAPI.getRecommendedUsers({ limit: 6 })
    recommendedUsers.value = response.data.list
  } catch (err) {
    console.error('Load recommended users error:', err)
  }
}

// 过滤和排序关注列表
const filteredFollowing = computed(() => {
  let result = following.value
  
  // 搜索过滤
  if (searchQuery.value) {
    result = result.filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  
  // 排序
  switch (sortBy.value) {
    case 'recent':
      result = result.sort((a, b) => new Date(b.followDate) - new Date(a.followDate))
      break
    case 'earliest':
      result = result.sort((a, b) => new Date(a.followDate) - new Date(b.followDate))
      break
    case 'name':
      result = result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'active':
      result = result.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
      break
  }
  
  return result
})

// 查看用户资料
const viewProfile = (user) => {
  router.push(`/profile/${user.id}`)
}

// 取消关注
const unfollowUser = async (user) => {
  try {
    await socialAPI.unfollowUser(user.id)
    const index = following.value.findIndex(f => f.id === user.id)
    if (index > -1) {
      following.value.splice(index, 1)
      totalCount.value--
    }
    // 更新用户store中的关注数
    userStore.updateFollowingCount(-1)
  } catch (err) {
    error.value = '取消关注失败'
    console.error('Unfollow user error:', err)
  }
}

// 关注推荐用户
const followUser = async (user) => {
  try {
    await socialAPI.followUser(user.id)
    
    // 将推荐用户添加到关注列表
    const newFollowing = {
      ...user,
      followDate: new Date().toISOString().split('T')[0],
      isOnline: false,
      lastActive: new Date().toISOString().split('T')[0]
    }
    following.value.unshift(newFollowing)
    totalCount.value++
    
    // 从推荐列表中移除
    const index = recommendedUsers.value.findIndex(r => r.id === user.id)
    if (index > -1) {
      recommendedUsers.value.splice(index, 1)
    }
    
    // 更新用户store中的关注数
    userStore.updateFollowingCount(1)
  } catch (err) {
    error.value = '关注失败'
    console.error('Follow user error:', err)
  }
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    currentPage.value++
    loadFollowing()
  }
}

// 监听搜索和排序变化
watch([searchQuery, sortBy], () => {
  currentPage.value = 1
  loadFollowing()
}, { debounce: 300 })

onMounted(() => {
  loadFollowing()
  loadRecommendedUsers()
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-morphism {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
</style>