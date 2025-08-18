<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="$router.back()" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">{{ course.title }}</h1>
          <button class="p-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ShareIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- Course Hero -->
      <div class="glass-card rounded-3xl overflow-hidden mb-8 shadow-2xl">
        <div class="relative h-80 gradient-primary">
          <img 
            :src="course.image" 
            :alt="course.title"
            class="w-full h-full object-cover opacity-80"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div class="absolute bottom-8 left-8 right-8 text-white">
            <h1 class="text-4xl font-bold mb-3">{{ course.title }}</h1>
            <p class="text-xl opacity-90 leading-relaxed">{{ course.description }}</p>
          </div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button 
              @click="startCourse"
              class="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group shadow-2xl"
            >
              <PlayIcon class="w-12 h-12 text-white ml-1 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        <div class="p-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-8 text-slate-600">
              <div class="flex items-center text-lg">
                <ClockIcon class="w-5 h-5 mr-2" />
                {{ course.duration }}
              </div>
              <div class="flex items-center text-lg">
                <UsersIcon class="w-5 h-5 mr-2" />
                {{ course.students }} 学员
              </div>
              <div class="flex items-center text-lg">
                <StarIcon class="w-5 h-5 mr-2 text-yellow-400 fill-current" />
                {{ course.rating }}
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-2xl text-lg font-semibold">
                {{ course.difficulty }}
              </span>
            </div>
          </div>
          
          <div v-if="course.progress > 0" class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-lg font-semibold text-slate-700">学习进度</span>
              <span class="text-lg font-bold text-emerald-600">{{ course.progress }}%</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-3">
              <div 
                class="gradient-primary h-3 rounded-full transition-all duration-500"
                :style="{ width: `${course.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-8">
        <!-- Course Content - Duolingo Style -->
        <div class="glass-card rounded-3xl p-8">
          <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <BookOpenIcon class="w-7 h-7 mr-3 text-emerald-600" />
            课程内容
          </h2>
          
          <!-- Lesson Path -->
          <div class="relative">
            <!-- Path Line -->
            <div class="absolute top-12 left-12 right-12 h-2 bg-gradient-to-r from-emerald-400 via-emerald-400 to-slate-300 rounded-full"></div>
            
            <!-- Lessons -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              <div 
                v-for="(lesson, index) in lessons"
                :key="lesson.id"
                class="flex flex-col items-center cursor-pointer group"
                @click="startLesson(lesson.id)"
              >
                <!-- Lesson Node -->
                <div :class="[
                  'w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl transition-all duration-300 group-hover:scale-110',
                  lesson.status === 'completed' ? 'gradient-primary shadow-emerald-400/50' :
                  lesson.status === 'current' ? 'gradient-secondary shadow-indigo-400/50' :
                  'bg-slate-200 text-slate-400'
                ]">
                  <component :is="getLessonIcon(lesson.status)" class="w-10 h-10 text-white" />
                  
                  <!-- Completion Glow -->
                  <div 
                    v-if="lesson.status === 'completed'"
                    class="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse"
                  ></div>
                  
                  <!-- Current Pulse -->
                  <div 
                    v-if="lesson.status === 'current'"
                    class="absolute -inset-2 rounded-full border-2 border-indigo-400 animate-pulse"
                  ></div>
                </div>

                <!-- Lesson Info -->
                <div class="text-center">
                  <h4 class="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors mb-2">
                    {{ index + 1 }}. {{ lesson.title }}
                  </h4>
                  <p class="text-slate-600 mb-2">{{ lesson.duration }}</p>
                  <div class="flex items-center justify-center space-x-2">
                    <span v-if="lesson.xp" class="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-semibold">
                      +{{ lesson.xp }} XP
                    </span>
                    <span :class="[
                      'text-sm px-3 py-1 rounded-full font-semibold',
                      lesson.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      lesson.status === 'current' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-500'
                    ]">
                      {{ lesson.type }}
                    </span>
                  </div>
                  
                  <button 
                    v-if="lesson.status === 'current'"
                    class="mt-3 btn-modern btn-primary text-sm"
                  >
                    开始学习
                  </button>
                  
                  <div v-if="lesson.status === 'locked'" class="text-sm text-slate-500 mt-2">
                    完成前置课程解锁
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Course Description -->
        <div class="glass-card rounded-3xl p-8">
          <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <InfoIcon class="w-7 h-7 mr-3 text-blue-600" />
            课程介绍
          </h2>
          <div class="prose prose-slate max-w-none text-lg leading-relaxed">
            <p class="text-slate-600 mb-6">
              陕北剪纸是中国传统民间艺术的瑰宝，承载着深厚的文化内涵和艺术价值。本课程将带你从零开始，
              系统学习剪纸的基本技法、图案设计和创作方法。通过理论讲解与实践操作相结合的方式，
              让你在短时间内掌握这门古老而美丽的艺术。
            </p>
            <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">你将学到：</h3>
            <ul class="space-y-3 text-slate-600">
              <li class="flex items-start">
                <CheckIcon class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                剪纸工具的选择和使用方法
              </li>
              <li class="flex items-start">
                <CheckIcon class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                基础图案的设计和剪制技巧
              </li>
              <li class="flex items-start">
                <CheckIcon class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                传统花鸟图案的创作方法
              </li>
              <li class="flex items-start">
                <CheckIcon class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                复杂构图的设计原理
              </li>
              <li class="flex items-start">
                <CheckIcon class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                独立完成剪纸作品的能力
              </li>
            </ul>
          </div>
        </div>

        <!-- Instructor -->
        <div class="glass-card rounded-3xl p-8">
          <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <UserIcon class="w-7 h-7 mr-3 text-violet-600" />
            讲师介绍
          </h2>
          <div class="flex items-start space-x-6">
            <img 
              src="/elderly-woman-avatar.png" 
              alt="讲师头像"
              class="w-20 h-20 rounded-full object-cover shadow-lg"
            />
            <div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">李师傅</h3>
              <p class="text-lg text-emerald-600 mb-3">陕北剪纸非遗传承人</p>
              <p class="text-slate-600 leading-relaxed">
                从事剪纸艺术30余年，作品多次获得国家级奖项，致力于传统文化的传承与发展。
                擅长将传统技艺与现代教学方法相结合，帮助学员快速掌握剪纸精髓。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  PlayIcon, 
  ClockIcon, 
  UsersIcon, 
  StarIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  LockIcon,
  CheckIcon,
  BookOpenIcon,
  InfoIcon,
  UserIcon
} from 'lucide-vue-next'
import BottomNavigation from '../components/BottomNavigation.vue'

const route = useRoute()
const router = useRouter()
const activeTab = ref('learning')

const course = reactive({
  id: parseInt(route.params.id),
  title: "陕北剪纸艺术入门",
  description: "传承千年民间艺术，感受文化魅力",
  image: "/traditional-paper-cutting.png",
  duration: "45分钟",
  students: "1,234",
  rating: 4.8,
  progress: 30,
  difficulty: "初级"
})

const lessons = reactive([
  {
    id: 1,
    title: "工具认识与准备",
    duration: "5分钟",
    xp: 50,
    status: "completed",
    type: "基础"
  },
  {
    id: 2,
    title: "基础图案练习",
    duration: "8分钟",
    xp: 75,
    status: "completed",
    type: "练习"
  },
  {
    id: 3,
    title: "花鸟图案设计",
    duration: "12分钟",
    xp: 100,
    status: "current",
    type: "进阶"
  },
  {
    id: 4,
    title: "复杂构图技巧",
    duration: "15分钟",
    xp: 150,
    status: "locked",
    type: "高级"
  },
  {
    id: 5,
    title: "作品创作实践",
    duration: "20分钟",
    xp: 200,
    status: "locked",
    type: "实战"
  },
  {
    id: 6,
    title: "作品展示分享",
    duration: "10分钟",
    xp: 100,
    status: "locked",
    type: "分享"
  }
])

const getLessonIcon = (status) => {
  switch (status) {
    case 'completed':
      return CheckCircleIcon
    case 'current':
      return PlayCircleIcon
    case 'locked':
      return LockIcon
    default:
      return PlayCircleIcon
  }
}

const startCourse = () => {
  const currentLesson = lessons.find(lesson => lesson.status === 'current')
  if (currentLesson) {
    router.push(`/lesson/${currentLesson.id}`)
  } else {
    router.push(`/lesson/${lessons[0].id}`)
  }
}

const startLesson = (lessonId) => {
  const lesson = lessons.find(l => l.id === lessonId)
  if (lesson && lesson.status !== 'locked') {
    router.push(`/lesson/${lessonId}`)
  }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}
</script>
