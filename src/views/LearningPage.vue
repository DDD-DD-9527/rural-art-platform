<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">学习平台</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- Search and Filter -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-6">
          <div class="flex-1 relative">
            <SearchIcon class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              placeholder="搜索你感兴趣的课程..."
              class="w-full pl-12 pr-12 py-4 glass-card border-0 shadow-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700 text-lg"
            />
            <button class="absolute right-4 top-1/2 transform -translate-y-1/2 p-1">
              <MicIcon class="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <!-- Updated Filter Tabs - 只有2个分类标签 -->
        <div class="flex justify-center space-x-4 overflow-x-auto pb-2">
          <button
            v-for="tab in filterTabs"
            :key="tab"
            @click="activeFilter = tab"
            :class="[
              'whitespace-nowrap px-8 py-4 rounded-2xl font-bold transition-all duration-300 text-lg shadow-lg',
              activeFilter === tab
                ? 'gradient-primary text-white shadow-xl transform scale-105'
                : 'glass-card text-slate-700 hover:shadow-xl hover:scale-102'
            ]"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="glass-card rounded-3xl p-8 mb-8 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold mb-3 text-slate-800">本周学习进度</h3>
            <div class="flex items-center space-x-6 text-lg text-slate-600">
              <span><strong class="text-emerald-600 text-xl">{{ weeklyStats.courses }}</strong> 门课程</span>
              <span><strong class="text-blue-600 text-xl">{{ weeklyStats.minutes }}</strong> 分钟</span>
            </div>
          </div>
          <div class="relative">
            <CircularProgress :progress="weeklyStats.progress" :size="80" />
          </div>
        </div>
      </div>

      <!-- Gamified Course Section - 陕北剪纸艺术之旅 -->
      <div class="gradient-primary rounded-3xl p-8 mb-8 text-white shadow-2xl">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold mb-3">{{ currentPath.title }}</h2>
            <p class="text-xl opacity-90">{{ currentPath.description }}</p>
          </div>
          <div class="relative">
            <CircularProgress :progress="currentPath.progress" :size="80" color="white" />
          </div>
        </div>

        <!-- Duolingo-style Learning Path -->
        <div class="relative">
          <!-- Path Line -->
          <div class="absolute top-12 left-12 right-12 h-2 bg-gradient-to-r from-emerald-400 via-emerald-400 to-white/30 rounded-full"></div>
          
          <!-- Lessons in Path -->
          <div class="flex justify-between items-start relative z-10 overflow-x-auto pb-6">
            <LessonNode
              v-for="(lesson, index) in gamifiedLessons"
              :key="lesson.id"
              :lesson="lesson"
              :index="index"
              @start-lesson="startLesson"
            />
            
            <!-- Certificate Reward -->
            <div class="flex flex-col items-center min-w-0 flex-shrink-0">
              <div class="relative w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-xl shadow-yellow-400/50">
                <GiftIcon class="w-10 h-10 text-white" />
                <div class="absolute -inset-2 rounded-full bg-yellow-400/30 animate-pulse"></div>
              </div>
              <div class="text-center min-w-[120px]">
                <h4 class="font-bold text-lg mb-2">技能证书</h4>
                <div class="text-sm opacity-80">
                  <div class="bg-white/20 px-3 py-1 rounded-full inline-block mb-1">奖励</div>
                </div>
                <div class="text-sm text-yellow-300 mt-2">🏆 剪纸入门证书</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Learning Stats -->
        <div class="flex justify-center space-x-12 mt-8 pt-8 border-t border-white/20">
          <div v-for="stat in learningStats" :key="stat.label" class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <component :is="stat.icon" class="w-6 h-6" />
            </div>
            <div>
              <div class="text-2xl font-bold">{{ stat.number }}</div>
              <div class="text-sm opacity-80">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Categories -->
      <div v-if="activeFilter === '全部'" class="space-y-12">
        <!-- Art Education Courses -->
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-8 flex items-center">
            <PaletteIcon class="w-8 h-8 mr-3 text-emerald-600" />
            艺术教育课程
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CourseCard
              v-for="course in artCourses"
              :key="course.id"
              :course="course"
              @click="navigateToCourse(course.id)"
            />
          </div>
        </div>

        <!-- Digital Skills Courses -->
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-8 flex items-center">
            <SmartphoneIcon class="w-8 h-8 mr-3 text-blue-600" />
            数字技能课程
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CourseCard
              v-for="course in digitalCourses"
              :key="course.id"
              :course="course"
              @click="navigateToCourse(course.id)"
            />
          </div>
        </div>
      </div>

      <!-- Filtered Courses -->
      <div v-else>
        <h2 class="text-3xl font-bold text-slate-800 mb-8 flex items-center">
          <PaletteIcon v-if="activeFilter === '艺术教育'" class="w-8 h-8 mr-3 text-emerald-600" />
          <SmartphoneIcon v-if="activeFilter === '数字技能'" class="w-8 h-8 mr-3 text-blue-600" />
          {{ activeFilter }}课程
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.id"
            :course="course"
            @click="navigateToCourse(course.id)"
          />
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { courseAPI } from '../services/api'
import { 
  ArrowLeftIcon, 
  SearchIcon, 
  MicIcon,
  GiftIcon,
  ZapIcon,
  StarIcon,
  TargetIcon,
  PaletteIcon,
  SmartphoneIcon
} from 'lucide-vue-next'

import CircularProgress from '../components/CircularProgress.vue'
import LessonNode from '../components/LessonNode.vue'
import CourseCard from '../components/CourseCard.vue'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()
const activeTab = ref('learning')
const searchQuery = ref('')
const activeFilter = ref('全部')

// 筛选标签
const filterTabs = ['全部', '艺术教育', '数字技能']

const weeklyStats = reactive({
  courses: 3,
  minutes: 120,
  progress: 65
})

const currentPath = reactive({
  title: '陕北剪纸艺术之旅',
  description: '传承千年文化，掌握传统技艺',
  progress: 30
})

const gamifiedLessons = reactive([])

const learningStats = reactive([
  {
    icon: ZapIcon,
    number: "7",
    label: "连续学习天数"
  },
  {
    icon: StarIcon,
    number: "1,250",
    label: "总经验值"
  },
  {
    icon: TargetIcon,
    number: "2/5",
    label: "完成关卡"
  }
])

// 艺术教育课程
const artCourses = reactive([])

// 数字技能课程（包含原生活技能）
const digitalCourses = reactive([])

const allCourses = computed(() => [...artCourses, ...digitalCourses])

const filteredCourses = computed(() => {
  let courses = []
  
  if (activeFilter.value === '全部') {
    courses = allCourses.value
  } else if (activeFilter.value === '艺术教育') {
    // 艺术教育课程的category包括: paper-art, painting, textile, pottery, calligraphy, folk-art
    const artCategories = ['paper-art', 'painting', 'textile', 'pottery', 'calligraphy', 'folk-art']
    courses = allCourses.value.filter(course => artCategories.includes(course.category))
  } else if (activeFilter.value === '数字技能') {
    // 数字技能课程的category是: other
    courses = allCourses.value.filter(course => course.category === 'other')
  }
  
  if (searchQuery.value) {
    courses = courses.filter(course => 
      course.title.includes(searchQuery.value) || 
      course.description.includes(searchQuery.value)
    )
  }
  
  return courses
})

const startLesson = (lessonId) => {
  router.push(`/lesson/${lessonId}`)
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const goBack = () => {
  router.back()
}

const navigateToCourse = (courseId) => {
  router.push(`/course/${courseId}`)
}

// API 获取数据的函数
const fetchCourses = async () => {
  try {
    // 获取艺术类课程（传统工艺、绘画、雕塑等）
    const artCategories = ['traditional-crafts', 'painting', 'sculpture', 'textile', 'pottery', 'woodwork', 'paper-art', 'folk-art', 'calligraphy']
    
    // 分别获取每个艺术分类的课程
    const artCoursesData = []
    for (const category of artCategories) {
      const response = await courseAPI.getCourses({ category })
      artCoursesData.push(...(response.data?.courses || []))
    }
    artCourses.splice(0, artCourses.length, ...artCoursesData)
     
     // 获取数字技能课程（其他类别）
     const digitalResponse = await courseAPI.getCourses({ category: 'other' })
     digitalCourses.splice(0, digitalCourses.length, ...digitalResponse.data?.courses || [])
    
    // 游戏化课程使用前3个课程
     const allCourses = [...artCoursesData, ...(digitalResponse.data?.courses || [])]
     gamifiedLessons.splice(0, gamifiedLessons.length, ...allCourses.slice(0, 3))
  } catch (error) {
    console.error('获取课程数据失败:', error)
  }
}

onMounted(() => {
  fetchCourses()
})
</script>
