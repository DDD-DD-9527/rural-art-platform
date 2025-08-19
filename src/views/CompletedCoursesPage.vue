<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">已完成课程</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 统计卡片 -->
      <div class="glass-card rounded-3xl p-6 mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-emerald-600 mb-1">{{ totalCourses }}</div>
            <div class="text-sm text-slate-500">总完成课程</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 mb-1">{{ totalHours }}</div>
            <div class="text-sm text-slate-500">总学习时长</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-violet-600 mb-1">{{ totalPoints }}</div>
            <div class="text-sm text-slate-500">获得积分</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-600 mb-1">{{ averageScore }}</div>
            <div class="text-sm text-slate-500">平均评分</div>
          </div>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="glass-card rounded-2xl p-4 mb-6">
        <div class="flex flex-wrap gap-3">
          <button 
            v-for="category in categories" 
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              selectedCategory === category.id 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- 课程列表 -->
      <div class="space-y-4 mb-8">
        <div 
          v-for="course in paginatedCourses" 
          :key="course.id"
          class="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start space-x-4">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <component :is="course.icon" class="w-8 h-8 text-emerald-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-semibold text-slate-800 truncate">{{ course.title }}</h3>
                <div class="flex items-center space-x-2 ml-4">
                  <div class="flex items-center">
                    <StarIcon class="w-4 h-4 text-amber-400 fill-current" />
                    <span class="text-sm font-medium text-slate-600 ml-1">{{ course.rating }}</span>
                  </div>
                </div>
              </div>
              <p class="text-slate-600 text-sm mb-3 line-clamp-2">{{ course.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 text-sm text-slate-500">
                  <div class="flex items-center">
                    <ClockIcon class="w-4 h-4 mr-1" />
                    {{ course.duration }}
                  </div>
                  <div class="flex items-center">
                    <CalendarIcon class="w-4 h-4 mr-1" />
                    {{ course.completedDate }}
                  </div>
                  <div class="flex items-center">
                    <TrophyIcon class="w-4 h-4 mr-1" />
                    +{{ course.points }}积分
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    {{ course.category }}
                  </span>
                  <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    查看证书
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="glass-card rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-600">
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredCourses.length) }} 条，共 {{ filteredCourses.length }} 条记录
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <div class="flex items-center space-x-1">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPage === page 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button 
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  StarIcon, 
  ClockIcon, 
  CalendarIcon, 
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  PaletteIcon,
  CameraIcon,
  SmartphoneIcon,
  ScissorsIcon
} from 'lucide-vue-next'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()
const activeTab = ref('profile')

// 统计数据
const totalCourses = ref(12)
const totalHours = ref('48小时')
const totalPoints = ref(1280)
const averageScore = ref('4.8')

// 分页设置
const currentPage = ref(1)
const pageSize = ref(5)
const selectedCategory = ref('all')

// 课程分类
const categories = reactive([
  { id: 'all', name: '全部' },
  { id: 'art', name: '艺术教育' },
  { id: 'digital', name: '数字技能' },
  { id: 'craft', name: '手工制作' },
  { id: 'photography', name: '摄影技巧' }
])

// 已完成课程数据
const completedCourses = reactive([])

// 计算属性
const filteredCourses = computed(() => {
  if (selectedCategory.value === 'all') {
    return completedCourses
  }
  return completedCourses.filter(course => course.categoryId === selectedCategory.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCourses.value.length / pageSize.value)
})

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCourses.value.slice(start, end)
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
  
  return pages.filter(page => page !== '...')
})

const goBack = () => {
  router.back()
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>