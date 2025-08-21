<template>
  <div class="achievement-system">
    <!-- 成就概览 -->
    <div class="achievement-overview glass-card rounded-3xl p-8 mb-8 shadow-xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-slate-800">我的成就</h2>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <div class="text-2xl font-bold text-purple-600">{{ unlockedCount }}/{{ totalCount }}</div>
            <div class="text-sm text-slate-600">已解锁</div>
          </div>
          <button 
            @click="refreshAchievements"
            :disabled="loading"
            class="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <RefreshCwIcon :class="['w-5 h-5 text-slate-600', { 'animate-spin': loading }]" />
          </button>
        </div>
      </div>
      
      <!-- 成就进度环 -->
      <div class="flex justify-center mb-8">
        <div class="relative">
          <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <!-- 背景圆环 -->
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="#e2e8f0"
              stroke-width="8"
              fill="none"
            />
            <!-- 进度圆环 -->
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="url(#gradient)"
              stroke-width="8"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="circumference - (achievementProgress / 100) * circumference"
              class="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#8b5cf6" />
                <stop offset="100%" stop-color="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-600">{{ Math.round(achievementProgress) }}%</div>
              <div class="text-xs text-slate-600">完成度</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近解锁的成就 -->
      <div v-if="recentAchievements.length > 0" class="recent-achievements">
        <h3 class="text-lg font-semibold text-slate-800 mb-4">最近解锁</h3>
        <div class="flex space-x-4 overflow-x-auto pb-2">
          <div 
            v-for="achievement in recentAchievements" 
            :key="achievement.id"
            class="flex-shrink-0 text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200"
          >
            <div class="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <component :is="getAchievementIcon(achievement.type)" class="w-8 h-8 text-white" />
            </div>
            <div class="text-sm font-semibold text-slate-800">{{ achievement.title }}</div>
            <div class="text-xs text-slate-600 mt-1">{{ formatDate(achievement.unlockedAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成就分类 -->
    <div class="achievement-categories mb-8">
      <div class="flex flex-wrap gap-2 justify-center">
        <button 
          v-for="category in categories"
          :key="category.value"
          @click="selectedCategory = category.value"
          :class="[
            'px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2',
            selectedCategory === category.value
              ? 'bg-purple-500 text-white shadow-lg transform scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-50 shadow-md'
          ]"
        >
          <component :is="category.icon" class="w-5 h-5" />
          <span>{{ category.label }}</span>
          <span class="text-xs opacity-75">({{ getCategoryCount(category.value) }})</span>
        </button>
      </div>
    </div>

    <!-- 成就网格 -->
    <div class="achievements-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="achievement in filteredAchievements" 
        :key="achievement.id"
        :class="[
          'achievement-card glass-card rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer',
          achievement.unlocked ? 'border-2 border-purple-200' : 'opacity-75'
        ]"
        @click="showAchievementDetail(achievement)"
      >
        <!-- 成就图标 -->
        <div class="relative mb-4">
          <div :class="[
            'w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg',
            achievement.unlocked 
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
              : 'bg-slate-300'
          ]">
            <component 
              :is="getAchievementIcon(achievement.type)" 
              :class="[
                'w-10 h-10',
                achievement.unlocked ? 'text-white' : 'text-slate-500'
              ]" 
            />
          </div>
          
          <!-- 解锁状态指示器 -->
          <div v-if="achievement.unlocked" class="absolute -top-2 -right-2">
            <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckIcon class="w-5 h-5 text-white" />
            </div>
          </div>
          
          <!-- 稀有度标识 -->
          <div :class="[
            'absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-bold',
            getRarityClass(achievement.rarity)
          ]">
            {{ getRarityLabel(achievement.rarity) }}
          </div>
        </div>
        
        <!-- 成就信息 -->
        <div class="text-center">
          <h3 :class="[
            'text-lg font-bold mb-2',
            achievement.unlocked ? 'text-slate-800' : 'text-slate-500'
          ]">
            {{ achievement.title }}
          </h3>
          <p :class="[
            'text-sm mb-4',
            achievement.unlocked ? 'text-slate-600' : 'text-slate-400'
          ]">
            {{ achievement.description }}
          </p>
          
          <!-- 奖励信息 -->
          <div class="flex items-center justify-center space-x-4 mb-4">
            <div class="flex items-center space-x-1">
              <StarIcon class="w-4 h-4 text-yellow-500" />
              <span :class="[
                'text-sm font-semibold',
                achievement.unlocked ? 'text-yellow-600' : 'text-slate-400'
              ]">
                +{{ achievement.points }}
              </span>
            </div>
            <div v-if="achievement.badge" class="flex items-center space-x-1">
              <AwardIcon class="w-4 h-4 text-purple-500" />
              <span :class="[
                'text-sm font-semibold',
                achievement.unlocked ? 'text-purple-600' : 'text-slate-400'
              ]">
                徽章
              </span>
            </div>
          </div>
          
          <!-- 进度条 -->
          <div v-if="!achievement.unlocked && achievement.progress !== undefined" class="mb-4">
            <div class="flex justify-between text-xs text-slate-600 mb-1">
              <span>进度</span>
              <span>{{ achievement.current }}/{{ achievement.target }}</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${achievement.progress}%` }"
              ></div>
            </div>
            <div class="text-xs text-slate-500 mt-1">{{ Math.round(achievement.progress) }}% 完成</div>
          </div>
          
          <!-- 解锁时间 -->
          <div v-if="achievement.unlocked" class="text-xs text-emerald-600">
            {{ formatDate(achievement.unlockedAt) }} 解锁
          </div>
        </div>
      </div>
    </div>

    <!-- 成就详情弹窗 -->
    <div 
      v-if="selectedAchievement"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeAchievementDetail"
    >
      <div 
        class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300"
        @click.stop
      >
        <!-- 关闭按钮 -->
        <button 
          @click="closeAchievementDetail"
          class="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <XIcon class="w-5 h-5 text-slate-600" />
        </button>
        
        <!-- 成就详情内容 -->
        <div class="text-center">
          <div :class="[
            'w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-xl',
            selectedAchievement.unlocked 
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
              : 'bg-slate-300'
          ]">
            <component 
              :is="getAchievementIcon(selectedAchievement.type)" 
              :class="[
                'w-12 h-12',
                selectedAchievement.unlocked ? 'text-white' : 'text-slate-500'
              ]" 
            />
          </div>
          
          <h2 class="text-2xl font-bold text-slate-800 mb-2">{{ selectedAchievement.title }}</h2>
          <p class="text-slate-600 mb-6">{{ selectedAchievement.description }}</p>
          
          <!-- 详细信息 -->
          <div class="space-y-4">
            <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span class="text-slate-600">奖励积分</span>
              <span class="font-semibold text-yellow-600">+{{ selectedAchievement.points }}</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span class="text-slate-600">稀有度</span>
              <span :class="['font-semibold', getRarityTextClass(selectedAchievement.rarity)]">
                {{ getRarityLabel(selectedAchievement.rarity) }}
              </span>
            </div>
            
            <div v-if="selectedAchievement.unlocked" class="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span class="text-slate-600">解锁时间</span>
              <span class="font-semibold text-emerald-600">{{ formatDate(selectedAchievement.unlockedAt) }}</span>
            </div>
            
            <div v-else-if="selectedAchievement.progress !== undefined" class="p-3 bg-slate-50 rounded-xl">
              <div class="flex justify-between text-sm text-slate-600 mb-2">
                <span>完成进度</span>
                <span>{{ selectedAchievement.current }}/{{ selectedAchievement.target }}</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3">
                <div 
                  class="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                  :style="{ width: `${selectedAchievement.progress}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- 解锁提示 -->
          <div v-if="!selectedAchievement.unlocked" class="mt-6 p-4 bg-blue-50 rounded-xl">
            <div class="text-sm text-blue-800">
              <strong>解锁条件：</strong>{{ selectedAchievement.unlockHint || '继续学习即可解锁' }}
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
  RefreshCwIcon,
  CheckIcon,
  StarIcon,
  AwardIcon,
  XIcon,
  BookOpenIcon,
  CalendarIcon,
  TrophyIcon,
  FlameIcon,
  GraduationCapIcon,
  HeartIcon,
  ZapIcon,
  CrownIcon,
  ShieldIcon,
  GemIcon
} from 'lucide-vue-next'
import { gamificationApi } from '../services/api.js'

const props = defineProps({
  userId: {
    type: String,
    default: null
  }
})

// 响应式数据
const loading = ref(false)
const achievements = ref([])
const selectedCategory = ref('all')
const selectedAchievement = ref(null)

// 成就分类
const categories = [
  { label: '全部', value: 'all', icon: AwardIcon },
  { label: '学习', value: 'learning', icon: BookOpenIcon },
  { label: '坚持', value: 'persistence', icon: FlameIcon },
  { label: '成就', value: 'milestone', icon: TrophyIcon },
  { label: '特殊', value: 'special', icon: CrownIcon }
]

// 计算属性
const unlockedCount = computed(() => 
  achievements.value.filter(a => a.unlocked).length
)

const totalCount = computed(() => achievements.value.length)

const achievementProgress = computed(() => 
  totalCount.value > 0 ? (unlockedCount.value / totalCount.value) * 100 : 0
)

const circumference = computed(() => 2 * Math.PI * 50)

const recentAchievements = computed(() => 
  achievements.value
    .filter(a => a.unlocked)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 3)
)

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return achievements.value
  }
  return achievements.value.filter(a => a.category === selectedCategory.value)
})

// 方法
const getCategoryCount = (category) => {
  if (category === 'all') return achievements.value.length
  return achievements.value.filter(a => a.category === category).length
}

const getAchievementIcon = (type) => {
  const iconMap = {
    first_lesson: BookOpenIcon,
    daily_streak: FlameIcon,
    course_complete: GraduationCapIcon,
    points_milestone: StarIcon,
    perfect_week: CalendarIcon,
    speed_learner: ZapIcon,
    dedicated_learner: HeartIcon,
    achievement_hunter: TrophyIcon,
    rare_achievement: GemIcon,
    legendary: CrownIcon,
    default: AwardIcon
  }
  return iconMap[type] || iconMap.default
}

const getRarityClass = (rarity) => {
  const classMap = {
    common: 'bg-slate-500 text-white',
    uncommon: 'bg-emerald-500 text-white',
    rare: 'bg-blue-500 text-white',
    epic: 'bg-purple-500 text-white',
    legendary: 'bg-yellow-500 text-white'
  }
  return classMap[rarity] || classMap.common
}

const getRarityTextClass = (rarity) => {
  const classMap = {
    common: 'text-slate-600',
    uncommon: 'text-emerald-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-yellow-600'
  }
  return classMap[rarity] || classMap.common
}

const getRarityLabel = (rarity) => {
  const labelMap = {
    common: '普通',
    uncommon: '稀有',
    rare: '珍贵',
    epic: '史诗',
    legendary: '传说'
  }
  return labelMap[rarity] || '普通'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return '今天'
  } else if (diffDays === 2) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays - 1}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

const showAchievementDetail = (achievement) => {
  selectedAchievement.value = achievement
}

const closeAchievementDetail = () => {
  selectedAchievement.value = null
}

// 加载成就数据
const loadAchievements = async () => {
  try {
    loading.value = true
    const response = await gamificationApi.getAchievements(props.userId)
    
    if (response.success) {
      achievements.value = response.achievements.map(achievement => ({
        ...achievement,
        progress: achievement.current && achievement.target 
          ? (achievement.current / achievement.target) * 100 
          : undefined
      }))
    }
  } catch (error) {
    console.error('加载成就失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshAchievements = () => {
  loadAchievements()
}

// 生命周期
onMounted(() => {
  loadAchievements()
})

// 暴露方法给父组件
defineExpose({
  refresh: refreshAchievements,
  loadAchievements
})
</script>

<style scoped>
.achievement-system {
  @apply w-full;
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.achievement-card {
  position: relative;
  overflow: hidden;
}

.achievement-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.achievement-card:hover::before {
  left: 100%;
}

/* 成就解锁动画 */
@keyframes unlock {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.achievement-card.unlocked {
  animation: unlock 0.6s ease-out;
}

/* 稀有度光效 */
.achievement-card[data-rarity="legendary"] {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.achievement-card[data-rarity="epic"] {
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
}

.achievement-card[data-rarity="rare"] {
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

/* 弹窗动画 */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

.fixed > div {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>