<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">获赞记录</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 统计卡片 -->
      <div class="glass-card rounded-2xl p-6 mb-6">
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-rose-50 rounded-xl">
            <div class="text-2xl font-bold text-rose-600">{{ totalLikes }}</div>
            <div class="text-sm text-slate-500">总获赞数</div>
          </div>
          <div class="text-center p-4 bg-emerald-50 rounded-xl">
            <div class="text-2xl font-bold text-emerald-600">{{ todayLikes }}</div>
            <div class="text-sm text-slate-500">今日获赞</div>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-2xl font-bold text-blue-600">{{ weekLikes }}</div>
            <div class="text-sm text-slate-500">本周获赞</div>
          </div>
        </div>
      </div>

      <!-- 获赞列表 -->
      <div class="space-y-4">
        <div v-for="like in paginatedLikes" :key="like.id" class="glass-card rounded-2xl p-6">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0">
              <UserIcon class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-slate-800">{{ like.userName }}</span>
                  <span class="text-sm text-slate-500">{{ like.userLocation }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <HeartIcon class="w-4 h-4 text-rose-500 fill-current" />
                  <span class="text-sm text-slate-500">{{ like.time }}</span>
                </div>
              </div>
              <p class="text-slate-600 mb-3">赞了你的{{ like.contentType }}：</p>
              <div class="bg-slate-50 rounded-xl p-4">
                <p class="text-slate-700">{{ like.content }}</p>
                <div v-if="like.image" class="mt-3">
                  <div class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <PaletteIcon class="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="glass-card rounded-2xl p-4 mt-6">
        <div class="flex items-center justify-between">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon class="w-4 h-4 mr-1" />
            上一页
          </button>
          
          <div class="flex items-center space-x-2">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                page === currentPage 
                  ? 'bg-violet-500 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
            <ArrowRightIcon class="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div class="text-center mt-4 text-sm text-slate-500">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页，总计 {{ totalLikes }} 条记录
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="likesData.length === 0" class="glass-card rounded-2xl p-12 text-center">
        <HeartIcon class="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-600 mb-2">暂无获赞记录</h3>
        <p class="text-slate-500">发布更多优质内容，获得更多点赞吧！</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  UserIcon, 
  HeartIcon,
  PaletteIcon
} from 'lucide-vue-next'
import { socialAPI } from '@/services/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const error = ref('')

// 获赞数据
const likesData = reactive([])
const totalCount = ref(0)

// 加载获赞记录
const loadReceivedLikes = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await socialAPI.getReceivedLikes({
      page: currentPage.value,
      limit: pageSize.value
    })
    
    if (response.success) {
      // 清空现有数据并添加新数据
      likesData.splice(0, likesData.length, ...response.data.list)
      totalCount.value = response.data.pagination?.total || 0
      
      // 更新统计数据
      if (response.data.stats) {
        statsData.value = {
          total: response.data.stats.totalLikes || 0,
          today: response.data.stats.todayLikes || 0,
          week: response.data.stats.weekLikes || 0
        }
      }
    }
  } catch (err) {
    error.value = '加载获赞记录失败'
    console.error('Load received likes error:', err)
  } finally {
    loading.value = false
  }
}

// 统计数据
const statsData = ref({
  total: 0,
  today: 0,
  week: 0
})

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await socialAPI.getLikeStats()
    if (response.success) {
      statsData.value = response.data
    }
  } catch (err) {
    console.error('Load stats error:', err)
  }
}

// 计算属性
const totalLikes = computed(() => statsData.value.total)
const todayLikes = computed(() => statsData.value.today)
const weekLikes = computed(() => statsData.value.week)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

const paginatedLikes = computed(() => {
  return likesData
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }
  
  return pages
})

// 方法
const goBack = () => {
  router.back()
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadReceivedLikes()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadReceivedLikes()
  }
}

const goToPage = (page) => {
  if (typeof page === 'number' && page !== currentPage.value) {
    currentPage.value = page
    loadReceivedLikes()
  }
}

// 监听页码变化
watch(currentPage, () => {
  loadReceivedLikes()
})

// 组件挂载时加载数据
onMounted(() => {
  loadReceivedLikes()
  loadStats()
})
</script>