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

        <!-- Updated Filter Tabs - 只有3个大标签 -->
        <div class="flex space-x-4 overflow-x-auto pb-2">
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
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <CourseCard
          v-for="course in filteredCourses"
          :key="course.id"
          :course="course"
          @click="navigateToCourse(course.id)"
        />
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

// 只有3个大标签
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

const gamifiedLessons = reactive([
  {
    id: 1,
    title: "工具认识",
    type: "基础",
    duration: "5分钟",
    xp: 50,
    status: "completed"
  },
  {
    id: 2,
    title: "基础图案",
    type: "练习",
    duration: "8分钟",
    xp: 75,
    status: "completed"
  },
  {
    id: 3,
    title: "花鸟图案",
    type: "进阶",
    duration: "12分钟",
    xp: 100,
    status: "current"
  },
  {
    id: 4,
    title: "复杂构图",
    type: "高级",
    duration: "15分钟",
    xp: 150,
    status: "locked"
  },
  {
    id: 5,
    title: "作品创作",
    type: "实战",
    duration: "20分钟",
    xp: 200,
    status: "locked"
  }
])

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
const artCourses = reactive([
  {
    id: 1,
    title: "陕北剪纸艺术入门",
    description: "传承千年民间艺术，感受文化魅力",
    image: "/art-coursesart-courses-placeholder.png",
    progress: 30,
    difficulty: "初级",
    category: "艺术教育",
    duration: "45分钟",
    students: "1,234",
    rating: 4.8
  },
  {
    id: 6,
    title: "传统绘画基础",
    description: "学习中国传统绘画技法",
    image: "/art-coursesart-courses-placeholder.png",
    progress: 0,
    difficulty: "初级",
    category: "艺术教育",
    duration: "60分钟",
    students: "892",
    rating: 4.7
  },
  {
    id: 7,
    title: "民间刺绣工艺",
    description: "掌握传统刺绣技法和图案设计",
    image: "/art-coursesart-courses-placeholder.png",
    progress: 0,
    difficulty: "中级",
    category: "艺术教育",
    duration: "90分钟",
    students: "567",
    rating: 4.9
  },
  {
    id: 8,
    title: "陶艺制作入门",
    description: "体验泥土与火的艺术",
    image: "/art-coursesart-courses-placeholder.png",
    progress: 0,
    difficulty: "初级",
    category: "艺术教育",
    duration: "120分钟",
    students: "423",
    rating: 4.6
  },
  {
    id: 9,
    title: "书法艺术基础",
    description: "感受汉字之美，练习书法技巧",
    image: "/art-coursesart-courses-placeholder.png",
    progress: 0,
    difficulty: "初级",
    category: "艺术教育",
    duration: "80分钟",
    students: "756",
    rating: 4.8
  },
  {
    id: 10,
    title: "民族音乐欣赏",
    description: "了解传统民族音乐文化",
    image: "/art-coursesart-courses-placeholder.png",
    progress: 0,
    difficulty: "初级",
    category: "艺术教育",
    duration: "50分钟",
    students: "634",
    rating: 4.5
  }
])

// 数字技能课程（包含原生活技能）
const digitalCourses = reactive([
  {
    id: 2,
    title: "手机摄影技巧",
    description: "用手机记录美好乡村生活",
    image: "/digital-skills-courses-placeholder.png",
    progress: 0,
    difficulty: "初级",
    category: "数字技能",
    duration: "60分钟",
    students: "856",
    rating: 4.6
  },
  {
    id: 3,
    title: "微信小商店运营",
    description: "让土特产走向更广阔的市场",
    image: "/digital-skills-courses-placeholder.png",
    progress: 15,
    difficulty: "中级",
    category: "数字技能",
    duration: "90分钟",
    students: "2,156",
    rating: 4.9
  },
  {
    id: 11,
    title: "短视频制作技巧",
    description: "用短视频展示乡村文化",
    image: "/digital-skills-courses-placeholder.png",
    progress: 0,
    difficulty: "中级",
    category: "数字技能",
    duration: "75分钟",
    students: "1,345",
    rating: 4.7
  },
  {
    id: 12,
    title: "电商直播入门",
    description: "学会直播带货，推广农产品",
    image: "/digital-skills-courses-placeholder.png",
    progress: 0,
    difficulty: "中级",
    category: "数字技能",
    duration: "100分钟",
    students: "987",
    rating: 4.8
  },
  {
    id: 13,
    title: "图片编辑基础",
    description: "美化产品图片，提升销售效果",
    image: "/digital-skills-courses-placeholder.png",
    progress: 0,
    difficulty: "初级",
    category: "数字技能",
    duration: "50分钟",
    students: "1,567",
    rating: 4.5
  },
  {
    id: 14,
    title: "农产品包装设计",
    description: "设计吸引人的产品包装",
    image: "/digital-skills-courses-placeholder.png",
    progress: 0,
    difficulty: "中级",
    category: "数字技能",
    duration: "85分钟",
    students: "678",
    rating: 4.6
  },
  {
    id: 15,
    title: "社交媒体营销",
    description: "利用社交平台推广产品",
    image: "/digital-skills-courses-placeholder.png",
    progress: 0,
    difficulty: "中级",
    category: "数字技能",
    duration: "95分钟",
    students: "1,234",
    rating: 4.7
  },
  {
    id: 16,
    title: "在线客服技巧",
    description: "提升客户服务质量",
    image: "/digital-skills-courses-placeholder.png",
    progress: 0,
    difficulty: "初级",
    category: "数字技能",
    duration: "40分钟",
    students: "892",
    rating: 4.4
  }
])

const allCourses = computed(() => [...artCourses, ...digitalCourses])

const filteredCourses = computed(() => {
  let courses = allCourses.value
  
  if (activeFilter.value === '艺术教育') {
    courses = artCourses
  } else if (activeFilter.value === '数字技能') {
    courses = digitalCourses
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

onMounted(() => {
  // 页面初始化逻辑
})
</script>
