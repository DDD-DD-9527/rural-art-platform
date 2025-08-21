<template>
  <div class="gamified-learning-path">
    <!-- 学习路径头部信息 -->
    <div class="path-header glass-card rounded-3xl p-8 mb-8 shadow-xl">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h2 class="text-3xl font-bold mb-3 text-slate-800">{{ pathData.title }}</h2>
          <p class="text-xl text-slate-600 mb-4">{{ pathData.description }}</p>
          
          <!-- 进度信息 -->
          <div class="flex items-center space-x-6 text-lg">
            <div class="flex items-center space-x-2">
              <BookOpenIcon class="w-5 h-5 text-emerald-600" />
              <span class="text-slate-700">
                <strong class="text-emerald-600">{{ completedLessons }}</strong> / {{ totalLessons }} 课程完成
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <StarIcon class="w-5 h-5 text-yellow-500" />
              <span class="text-slate-700">
                <strong class="text-yellow-600">{{ totalPoints }}</strong> 积分获得
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <TrophyIcon class="w-5 h-5 text-purple-600" />
              <span class="text-slate-700">
                等级 <strong class="text-purple-600">{{ userLevel }}</strong>
              </span>
            </div>
          </div>
        </div>
        
        <!-- 进度环形图 -->
        <div class="relative">
          <CircularProgress :progress="progressPercentage" :size="100" />
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl font-bold text-slate-800">{{ Math.round(progressPercentage) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习路径可视化 -->
    <div class="path-visualization gradient-primary rounded-3xl p-8 text-white shadow-2xl">
      <div class="relative overflow-x-auto">
        <!-- 路径连接线 -->
        <svg class="absolute top-0 left-0 w-full h-full pointer-events-none" style="z-index: 1;">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#10b981" stop-opacity="1" />
              <stop offset="50%" stop-color="#3b82f6" stop-opacity="1" />
              <stop offset="100%" stop-color="rgba(255,255,255,0.3)" stop-opacity="1" />
            </linearGradient>
          </defs>
          <path 
            :d="pathSvgData" 
            stroke="url(#pathGradient)" 
            stroke-width="4" 
            fill="none" 
            stroke-linecap="round"
          />
        </svg>

        <!-- 课程节点 -->
        <div class="relative z-10 flex justify-between items-start min-w-max px-12 py-8">
          <div 
            v-for="(lesson, index) in lessons" 
            :key="lesson.id"
            class="lesson-node flex flex-col items-center min-w-0 flex-shrink-0 mx-4"
            :style="{ transform: `translateY(${getNodeOffset(index)}px)` }"
          >
            <!-- 节点圆圈 -->
            <div 
              :class="[
                'relative w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer',
                getNodeClasses(lesson)
              ]"
              @click="handleLessonClick(lesson)"
            >
              <component :is="getNodeIcon(lesson)" class="w-12 h-12 text-white relative z-10" />
              
              <!-- 完成光效 -->
              <div 
                v-if="lesson.status === 'completed'"
                class="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse"
              ></div>
              
              <!-- 当前课程脉冲效果 -->
              <div 
                v-if="lesson.status === 'current'"
                class="absolute -inset-3 rounded-full border-3 border-white/50 animate-pulse"
              ></div>
              
              <!-- 积分显示 -->
              <div 
                v-if="lesson.status !== 'locked'"
                class="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-1 text-xs font-bold shadow-lg"
              >
                +{{ lesson.points }}
              </div>
            </div>

            <!-- 课程信息 -->
            <div class="text-center min-w-[160px]">
              <h4 class="font-bold text-lg mb-2 text-white">{{ lesson.title }}</h4>
              <div class="text-sm opacity-90 mb-3">
                <div class="bg-white/20 px-3 py-1 rounded-full inline-block mb-2 font-medium">
                  {{ lesson.type }}
                </div>
                <div class="font-medium">{{ lesson.duration }}</div>
              </div>
              
              <!-- 解锁要求 -->
              <div v-if="lesson.status === 'locked'" class="text-sm text-white/70 mb-3">
                <LockIcon class="w-4 h-4 mx-auto mb-1" />
                <div>需要 {{ lesson.unlockRequirement.points }} 积分</div>
                <div class="text-xs">或完成前置课程</div>
              </div>
              
              <!-- 操作按钮 -->
              <button 
                v-if="lesson.status === 'current'"
                @click="startLesson(lesson)"
                class="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {{ lesson.progress > 0 ? '继续学习' : '开始学习' }}
              </button>
              
              <button 
                v-else-if="lesson.status === 'completed'"
                @click="reviewLesson(lesson)"
                class="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-all duration-300 shadow-lg"
              >
                复习课程
              </button>
              
              <!-- 课程进度条 -->
              <div v-if="lesson.progress > 0 && lesson.status !== 'completed'" class="mt-3">
                <div class="w-full bg-white/20 rounded-full h-2">
                  <div 
                    class="bg-white h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${lesson.progress}%` }"
                  ></div>
                </div>
                <div class="text-xs text-white/80 mt-1">{{ lesson.progress }}% 完成</div>
              </div>
            </div>
          </div>
          
          <!-- 最终奖励 -->
          <div class="flex flex-col items-center min-w-0 flex-shrink-0 mx-4">
            <div class="relative w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-xl shadow-yellow-400/50">
              <TrophyIcon class="w-14 h-14 text-white" />
              <div v-if="isPathCompleted" class="absolute -inset-3 rounded-full bg-yellow-400/30 animate-pulse"></div>
            </div>
            <div class="text-center min-w-[140px]">
              <h4 class="font-bold text-xl mb-2">{{ pathData.certificate.title }}</h4>
              <div class="text-sm opacity-90 mb-3">
                <div class="bg-white/20 px-3 py-1 rounded-full inline-block mb-2">证书奖励</div>
                <div class="text-yellow-300 font-bold">+{{ pathData.certificate.points }} 积分</div>
              </div>
              <button 
                v-if="isPathCompleted"
                @click="claimCertificate"
                class="px-6 py-3 bg-yellow-400 text-yellow-900 rounded-2xl text-sm font-bold hover:bg-yellow-300 transition-all duration-300 shadow-lg"
              >
                领取证书
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  BookOpenIcon, 
  StarIcon, 
  TrophyIcon, 
  LockIcon, 
  PlayIcon, 
  CheckCircleIcon,
  ClockIcon
} from 'lucide-vue-next'
import CircularProgress from './CircularProgress.vue'
import { gamificationApi } from '../services/api.js'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['lesson-start', 'lesson-complete', 'certificate-claim'])

// 响应式数据
const pathData = ref({
  title: '',
  description: '',
  certificate: {
    title: '',
    points: 0
  }
})

const lessons = ref([])
const userStats = ref({
  totalPoints: 0,
  level: 1,
  completedLessons: 0
})

const loading = ref(true)
const error = ref(null)

// 计算属性
const totalLessons = computed(() => lessons.value.length)
const completedLessons = computed(() => lessons.value.filter(l => l.status === 'completed').length)
const totalPoints = computed(() => userStats.value.totalPoints)
const userLevel = computed(() => userStats.value.level)
const progressPercentage = computed(() => {
  if (totalLessons.value === 0) return 0
  return (completedLessons.value / totalLessons.value) * 100
})

const isPathCompleted = computed(() => completedLessons.value === totalLessons.value)



// SVG路径数据
const pathSvgData = computed(() => {
  if (lessons.value.length === 0) return ''
  
  const nodeWidth = 200 // 节点间距
  const baseY = 100 // 基础Y坐标
  
  let path = `M 50 ${baseY}`
  
  lessons.value.forEach((lesson, index) => {
    const x = 50 + (index + 1) * nodeWidth
    const y = baseY + getNodeOffset(index)
    
    if (index === 0) {
      path += ` L ${x} ${y}`
    } else {
      // 创建波浪形路径
      const prevX = 50 + index * nodeWidth
      const prevY = baseY + getNodeOffset(index - 1)
      const midX = (prevX + x) / 2
      
      path += ` Q ${midX} ${prevY} ${x} ${y}`
    }
  })
  
  // 连接到最终奖励
  const finalX = 50 + (lessons.value.length + 1) * nodeWidth
  path += ` L ${finalX} ${baseY}`
  
  return path
})

// 方法
const getNodeOffset = (index) => {
  // 创建波浪形布局
  return Math.sin(index * 0.5) * 30
}

const getNodeClasses = (lesson) => {
  switch (lesson.status) {
    case 'completed':
      return 'gradient-primary shadow-emerald-400/50'
    case 'current':
      return 'gradient-secondary shadow-indigo-400/50'
    case 'locked':
      return 'bg-white/20 border-2 border-white/30'
    default:
      return 'bg-white/20 border-2 border-white/30'
  }
}

const getNodeIcon = (lesson) => {
  switch (lesson.status) {
    case 'completed':
      return CheckCircleIcon
    case 'current':
      return PlayIcon
    case 'locked':
      return LockIcon
    default:
      return LockIcon
  }
}

const handleLessonClick = (lesson) => {
  if (lesson.status === 'current') {
    startLesson(lesson)
  } else if (lesson.status === 'completed') {
    reviewLesson(lesson)
  }
}

const startLesson = (lesson) => {
  emit('lesson-start', lesson)
}

const reviewLesson = (lesson) => {
  emit('lesson-start', lesson)
}

const claimCertificate = () => {
  emit('certificate-claim', pathData.value.certificate)
}

// 加载学习路径数据
const loadLearningPath = async () => {
  try {
    loading.value = true
    error.value = null
    
    // 获取学习路径
    const pathResponse = await gamificationApi.getLearningPath(props.courseId)
    if (pathResponse.success) {
      lessons.value = pathResponse.lessons
      pathData.value = { ...pathData.value, ...pathResponse.pathInfo }
    }
    
    // 获取用户统计
    if (props.userId) {
      const statsResponse = await gamificationApi.getPointsStats(props.userId)
      if (statsResponse.success) {
        userStats.value = statsResponse.stats
      }
    }
    
  } catch (err) {
    console.error('加载学习路径失败:', err)
    error.value = '加载学习路径失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadLearningPath()
})

// 暴露方法给父组件
defineExpose({
  refresh: loadLearningPath
})
</script>

<style scoped>
.gamified-learning-path {
  @apply w-full;
}

.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.lesson-node {
  transition: transform 0.3s ease;
}

.lesson-node:hover {
  transform: translateY(-5px);
}

/* 自定义滚动条 */
.path-visualization {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.path-visualization::-webkit-scrollbar {
  height: 8px;
}

.path-visualization::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.path-visualization::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.path-visualization::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>