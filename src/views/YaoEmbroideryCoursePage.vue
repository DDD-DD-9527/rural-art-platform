<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
    <!-- 顶部导航 -->
    <header class="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeftIcon class="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-900">瑶绣制作艺术之旅</h1>
              <p class="text-sm text-gray-500">传承千年文化，掌握传统技艺</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="text-right">
              <div class="text-2xl font-bold text-emerald-600">{{ userProgress }}%</div>
              <div class="text-xs text-gray-500">学习进度</div>
            </div>
            <div class="w-16 h-16 relative">
              <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="4" fill="none" />
                <circle 
                  cx="32" cy="32" r="28" 
                  stroke="url(#progressGradient)" 
                  stroke-width="4" 
                  fill="none"
                  :stroke-dasharray="`${userProgress * 1.76} 176`"
                  stroke-linecap="round"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <GiftIcon class="w-6 h-6 text-emerald-600" />
              </div>
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#10b981" />
                  <stop offset="100%" style="stop-color:#3b82f6" />
                </linearGradient>
              </defs>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 课程英雄区域 -->
    <section class="relative py-16 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 opacity-90"></div>
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-[url('/yao-embroidery-pattern.svg')] opacity-10 bg-repeat bg-center"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 class="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
          陕北瑶绣艺术之旅
        </h2>
        <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
          传承千年瑶族文化，掌握传统刺绣技艺，获得政府补贴支持
        </p>
        <div class="flex flex-wrap justify-center gap-6 text-sm">
          <div class="flex items-center space-x-2">
            <ClockIcon class="w-5 h-5" />
            <span>总计 22 学时</span>
          </div>
          <div class="flex items-center space-x-2">
            <UsersIcon class="w-5 h-5" />
            <span>{{ totalStudents }} 人已学习</span>
          </div>
          <div class="flex items-center space-x-2">
            <StarIcon class="w-5 h-5 fill-current" />
            <span>{{ courseRating }} 分好评</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 课程路径 -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h3 class="text-3xl font-bold text-gray-900 mb-4">学习路径</h3>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            循序渐进的学习体系，从文化认知到技能掌握，再到政策应用
          </p>
        </div>

        <!-- 课程模块卡片 -->
        <div class="space-y-8">
          <div 
            v-for="(module, index) in courseModules" 
            :key="module.id"
            class="relative"
          >
            <!-- 连接线 -->
            <div 
              v-if="index < courseModules.length - 1"
              class="absolute left-1/2 transform -translate-x-1/2 top-full w-1 h-8 bg-gradient-to-b from-emerald-400 to-blue-400 z-10"
              :class="{
                'from-emerald-400 to-blue-400': module.status === 'completed',
                'from-gray-300 to-gray-300': module.status !== 'completed'
              }"
            ></div>

            <!-- 模块卡片 -->
            <div 
              class="relative group cursor-pointer"
              :class="{
                'lg:flex-row': index % 2 === 0,
                'lg:flex-row-reverse': index % 2 === 1
              }"
              @click="startModule(module)"
            >
              <div class="flex flex-col lg:flex-row items-center gap-8">
                <!-- 模块图标和状态 -->
                <div class="relative flex-shrink-0">
                  <div 
                    class="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl transform group-hover:scale-110 transition-all duration-300"
                    :class="getModuleIconClass(module.status)"
                  >
                    <component :is="module.icon" class="w-10 h-10" />
                  </div>
                  <!-- 状态徽章 -->
                  <div 
                    class="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                    :class="getStatusBadgeClass(module.status)"
                  >
                    <CheckIcon v-if="module.status === 'completed'" class="w-4 h-4" />
                    <PlayIcon v-else-if="module.status === 'current'" class="w-4 h-4" />
                    <LockIcon v-else class="w-4 h-4" />
                  </div>
                </div>

                <!-- 模块内容 -->
                <div 
                  class="flex-1 bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 group-hover:shadow-2xl group-hover:bg-white/80 transition-all duration-300"
                  :class="{
                    'lg:text-right': index % 2 === 1
                  }"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div :class="{ 'lg:order-2': index % 2 === 1 }">
                      <h4 class="text-2xl font-bold text-gray-900 mb-2">{{ module.title }}</h4>
                      <p class="text-gray-600 mb-4">{{ module.description }}</p>
                    </div>
                    <div :class="{ 'lg:order-1': index % 2 === 1 }" class="ml-4 lg:ml-0">
                      <div class="text-right lg:text-left" :class="{ 'lg:text-right': index % 2 === 1 }">
                        <div class="text-sm text-gray-500 mb-1">学时</div>
                        <div class="text-2xl font-bold text-emerald-600">{{ module.duration }}h</div>
                      </div>
                    </div>
                  </div>

                  <!-- 进度条 -->
                  <div class="mb-6">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm font-medium text-gray-700">学习进度</span>
                      <span class="text-sm font-bold text-emerald-600">{{ module.progress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                        :style="{ width: module.progress + '%' }"
                      ></div>
                    </div>
                  </div>

                  <!-- 学习要点 -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div 
                      v-for="point in module.keyPoints" 
                      :key="point"
                      class="flex items-center space-x-2 text-sm text-gray-600"
                    >
                      <div class="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"></div>
                      <span>{{ point }}</span>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="flex items-center space-x-1 text-sm text-gray-500">
                        <BookOpenIcon class="w-4 h-4" />
                        <span>{{ module.lessons }} 节课</span>
                      </div>
                      <div class="flex items-center space-x-1 text-sm text-gray-500">
                        <UsersIcon class="w-4 h-4" />
                        <span>{{ module.students }} 人学习</span>
                      </div>
                    </div>
                    <button 
                      class="px-6 py-3 rounded-full font-semibold text-white shadow-lg transform hover:scale-105 transition-all duration-200"
                      :class="getActionButtonClass(module.status)"
                      :disabled="module.status === 'locked'"
                    >
                      {{ getActionButtonText(module.status) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 课程统计 -->
    <section class="py-16 bg-white/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-3xl font-bold text-emerald-600 mb-2">{{ completedLessons }}</div>
            <div class="text-sm text-gray-600">已完成课程</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ studyHours }}</div>
            <div class="text-sm text-gray-600">学习时长</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ earnedPoints }}</div>
            <div class="text-sm text-gray-600">获得积分</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ certificates }}</div>
            <div class="text-sm text-gray-600">获得证书</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部导航 -->
    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  UsersIcon, 
  StarIcon,
  PlayIcon,
  CheckIcon,
  LockIcon,
  BookOpenIcon,
  GiftIcon,
  PaletteIcon,
  ScissorsIcon,
  SparklesIcon,
  TrendingUpIcon,
  FileTextIcon,
  DollarSignIcon
} from 'lucide-vue-next'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()
const activeTab = ref('learning')

// 用户学习进度
const userProgress = ref(65) // 张山用户的进度
const totalStudents = ref(1250)
const courseRating = ref(4.8)
const completedLessons = ref(7)
const studyHours = ref(15)
const earnedPoints = ref(850)
const certificates = ref(2)

// 课程模块数据
const courseModules = reactive([
  {
    id: 'culture-history',
    title: '瑶绣文化与历史',
    description: '深入了解瑶族刺绣的历史渊源、文化内涵和艺术特色',
    duration: 2,
    progress: 100,
    status: 'completed',
    icon: BookOpenIcon,
    lessons: 4,
    students: 1180,
    keyPoints: [
      '瑶族历史文化背景',
      '刺绣在瑶族生活中的地位',
      '瑶绣的艺术特色分析',
      '传统图案的文化寓意'
    ]
  },
  {
    id: 'basic-skills',
    title: '瑶绣制作基础',
    description: '掌握瑶绣的基本工具、材料选择和基础针法技巧',
    duration: 4,
    progress: 100,
    status: 'completed',
    icon: ScissorsIcon,
    lessons: 8,
    students: 1050,
    keyPoints: [
      '工具材料的选择与准备',
      '基础针法的学习与练习',
      '绣布的处理和固定',
      '绣线的搭配与使用'
    ]
  },
  {
    id: 'pattern-design',
    title: '瑶绣图案设计与色彩搭配',
    description: '学习传统图案的设计原理和现代色彩搭配技巧',
    duration: 4,
    progress: 100,
    status: 'completed',
    icon: PaletteIcon,
    lessons: 8,
    students: 980,
    keyPoints: [
      '传统图案的构成要素',
      '图案设计的基本原则',
      '色彩搭配的理论与实践',
      '个性化图案的创作方法'
    ]
  },
  {
    id: 'advanced-skills',
    title: '瑶绣制作进阶',
    description: '掌握复杂图案的绣制技巧和创新技法的应用',
    duration: 6,
    progress: 75,
    status: 'current',
    icon: SparklesIcon,
    lessons: 12,
    students: 850,
    keyPoints: [
      '复杂图案的绣制技巧',
      '创新技法的学习与应用',
      '作品质量的提升方法',
      '个人风格的培养'
    ]
  },
  {
    id: 'policy-interpretation',
    title: '政府补贴政策解读',
    description: '全面了解相关政府补贴政策和申请条件',
    duration: 2,
    progress: 0,
    status: 'locked',
    icon: FileTextIcon,
    lessons: 4,
    students: 720,
    keyPoints: [
      '政策体系的全面介绍',
      '补贴标准和申请条件',
      '政策获取与咨询途径',
      '成功案例分析'
    ]
  },
  {
    id: 'subsidy-application',
    title: '补贴申请实战',
    description: '实际操作补贴申请流程，提高申请成功率',
    duration: 2,
    progress: 0,
    status: 'locked',
    icon: DollarSignIcon,
    lessons: 4,
    students: 650,
    keyPoints: [
      '申请材料的准备',
      '申报流程的详细指导',
      '模拟申报与审核',
      '提高成功率的技巧'
    ]
  }
])

// 计算属性和方法
const getModuleIconClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-gradient-to-br from-emerald-500 to-green-600'
    case 'current':
      return 'bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse'
    case 'locked':
      return 'bg-gradient-to-br from-gray-400 to-gray-500'
    default:
      return 'bg-gradient-to-br from-gray-400 to-gray-500'
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500'
    case 'current':
      return 'bg-blue-500 animate-pulse'
    case 'locked':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}

const getActionButtonClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
    case 'current':
      return 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
    case 'locked':
      return 'bg-gray-400 cursor-not-allowed'
    default:
      return 'bg-gray-400 cursor-not-allowed'
  }
}

const getActionButtonText = (status) => {
  switch (status) {
    case 'completed':
      return '复习课程'
    case 'current':
      return '继续学习'
    case 'locked':
      return '即将开放'
    default:
      return '开始学习'
  }
}

const goBack = () => {
  router.go(-1)
}

const startModule = (module) => {
  if (module.status !== 'locked') {
    // 跳转到具体的模块学习页面
    router.push(`/yao-embroidery/module/${module.id}`)
  }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

onMounted(() => {
  // 页面加载时的初始化逻辑
  console.log('瑶绣制作课程页面已加载')
})
</script>

<style scoped>
/* 自定义动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 渐变文字效果 */
.bg-clip-text {
  background-clip: text;
  -webkit-background-clip: text;
}

/* 毛玻璃效果增强 */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(6px);
}

/* 卡片悬停效果 */
.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* 进度条动画 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .lg\:flex-row-reverse {
    flex-direction: column;
  }
  
  .lg\:text-right {
    text-align: left;
  }
}
</style>