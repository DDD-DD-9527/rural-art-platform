<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">学习天数</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 学习天数统计卡片 -->
      <div class="glass-card rounded-3xl p-6 mb-6">
        <div class="text-center mb-6">
          <div class="text-4xl font-bold text-violet-600 mb-2">{{ totalLearningDays }}</div>
          <div class="text-slate-600">累计学习天数</div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-xl font-bold text-emerald-600 mb-1">{{ continuousDays }}</div>
            <div class="text-sm text-slate-500">连续学习</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-blue-600 mb-1">{{ thisMonthDays }}</div>
            <div class="text-sm text-slate-500">本月学习</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-amber-600 mb-1">{{ averageHours }}</div>
            <div class="text-sm text-slate-500">日均时长</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-rose-600 mb-1">{{ longestStreak }}</div>
            <div class="text-sm text-slate-500">最长连续</div>
          </div>
        </div>
      </div>

      <!-- 学习目标进度 -->
      <div class="glass-card rounded-2xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <TargetIcon class="w-5 h-5 mr-2 text-violet-600" />
          本月学习目标
        </h3>
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-slate-600">已学习 {{ thisMonthDays }} 天</span>
          <span class="text-sm font-medium text-slate-600">目标 {{ monthlyGoal }} 天</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-3 mb-2">
          <div 
            class="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            :style="{ width: goalProgress + '%' }"
          ></div>
        </div>
        <div class="text-center text-sm text-slate-600">
          {{ goalProgress >= 100 ? '🎉 恭喜完成本月目标！' : `还需学习 ${monthlyGoal - thisMonthDays} 天完成目标` }}
        </div>
      </div>

      <!-- 时间范围选择器 -->
      <div class="glass-card rounded-2xl p-4 mb-6">
        <div class="flex flex-wrap gap-3">
          <button 
            v-for="period in timePeriods" 
            :key="period.id"
            @click="selectedPeriod = period.id"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              selectedPeriod === period.id 
                ? 'bg-violet-500 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ period.name }}
          </button>
        </div>
      </div>

      <!-- 学习日历 -->
      <div class="glass-card rounded-2xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <CalendarIcon class="w-5 h-5 mr-2 text-blue-600" />
          学习日历
        </h3>
        <div class="grid grid-cols-7 gap-2 mb-4">
          <div v-for="day in weekDays" :key="day" class="text-center text-sm font-medium text-slate-500 py-2">
            {{ day }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <div 
            v-for="date in calendarDates" 
            :key="date.date"
            :class="[
              'aspect-square rounded-lg flex items-center justify-center text-sm relative cursor-pointer transition-colors',
              date.isCurrentMonth 
                ? 'text-slate-800' 
                : 'text-slate-400',
              date.isToday 
                ? 'bg-blue-500 text-white font-bold' 
                : date.hasLearning 
                  ? 'bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200' 
                  : 'hover:bg-slate-100'
            ]"
            @click="selectDate(date)"
          >
            {{ date.day }}
            <div v-if="date.hasLearning && !date.isToday" class="absolute bottom-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <!-- 学习记录列表 -->
      <div class="space-y-4 mb-8">
        <div 
          v-for="record in paginatedRecords" 
          :key="record.id"
          class="glass-card rounded-2xl p-4 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                <CalendarIcon class="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h4 class="font-semibold text-slate-800">{{ record.date }}</h4>
                <p class="text-sm text-slate-600">{{ record.dayOfWeek }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-violet-600">{{ record.totalHours }}</div>
              <div class="text-xs text-slate-500">学习时长</div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <h5 class="text-sm font-medium text-slate-700">学习内容</h5>
              <div class="space-y-1">
                <div v-for="course in record.courses" :key="course.id" class="flex items-center justify-between text-sm">
                  <span class="text-slate-600">{{ course.name }}</span>
                  <span class="text-slate-500">{{ course.duration }}</span>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <h5 class="text-sm font-medium text-slate-700">学习成果</h5>
              <div class="flex items-center space-x-4 text-sm text-slate-600">
                <div class="flex items-center">
                  <TrophyIcon class="w-4 h-4 mr-1 text-amber-500" />
                  +{{ record.pointsEarned }}积分
                </div>
                <div class="flex items-center">
                  <CheckCircleIcon class="w-4 h-4 mr-1 text-emerald-500" />
                  {{ record.completedLessons }}节课
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
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredRecords.length) }} 条，共 {{ filteredRecords.length }} 条记录
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
                    ? 'bg-violet-500 text-white' 
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
  CalendarIcon,
  TargetIcon,
  TrophyIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-vue-next'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()
const activeTab = ref('profile')

// 学习天数统计数据
const totalLearningDays = ref(45)
const continuousDays = ref(7)
const thisMonthDays = ref(18)
const averageHours = ref('2.3小时')
const longestStreak = ref('21天')
const monthlyGoal = ref(20)
const goalProgress = computed(() => Math.min(100, (thisMonthDays.value / monthlyGoal.value) * 100))

// 分页设置
const currentPage = ref(1)
const pageSize = ref(6)
const selectedPeriod = ref('month')

// 时间范围选择器
const timePeriods = reactive([
  { id: 'week', name: '本周' },
  { id: 'month', name: '本月' },
  { id: 'quarter', name: '本季度' },
  { id: 'year', name: '本年' }
])

// 星期标题
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 生成日历数据
const generateCalendarDates = () => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  const learningDates = new Set([
    '2024-03-01', '2024-03-03', '2024-03-05', '2024-03-07', '2024-03-09',
    '2024-03-11', '2024-03-13', '2024-03-15', '2024-03-17', '2024-03-19',
    '2024-03-21', '2024-03-23', '2024-03-25', '2024-03-27', '2024-03-29',
    '2024-03-31', '2024-04-02', '2024-04-04'
  ])
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateString = date.toISOString().split('T')[0]
    
    dates.push({
      date: dateString,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === currentMonth,
      isToday: dateString === today.toISOString().split('T')[0],
      hasLearning: learningDates.has(dateString)
    })
  }
  
  return dates
}

const calendarDates = ref(generateCalendarDates())

// 学习记录数据
const learningRecords = reactive([])

// 计算属性
const filteredRecords = computed(() => {
  // 根据选择的时间范围过滤记录
  const now = new Date()
  const records = learningRecords.filter(record => {
    const recordDate = new Date(record.date)
    
    switch (selectedPeriod.value) {
      case 'week':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        return recordDate >= weekStart
      case 'month':
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        const recordQuarter = Math.floor(recordDate.getMonth() / 3)
        return recordQuarter === quarter && recordDate.getFullYear() === now.getFullYear()
      case 'year':
        return recordDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  })
  
  return records.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalPages = computed(() => {
  return Math.ceil(filteredRecords.value.length / pageSize.value)
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRecords.value.slice(start, end)
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

const selectDate = (date) => {
  if (date.hasLearning) {
    // 可以在这里添加查看具体日期学习详情的逻辑
    console.log('查看', date.date, '的学习详情')
  }
}

const goBack = () => {
  router.back()
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}
</script>