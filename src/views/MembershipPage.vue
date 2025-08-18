<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-semibold text-slate-800">会员中心</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 当前会员状态 -->
      <div class="glass-effect rounded-3xl p-6 mb-8">
        <div class="text-center mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CrownIcon class="w-10 h-10 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">{{ currentMember.level }}</h2>
          <p class="text-slate-600">{{ currentMember.description }}</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-emerald-600 mb-1">{{ currentMember.aiCredits }}</div>
            <div class="text-sm text-slate-600">AI创作次数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 mb-1">{{ currentMember.storageGB }}GB</div>
            <div class="text-sm text-slate-600">云端存储</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 mb-1">{{ currentMember.courses }}</div>
            <div class="text-sm text-slate-600">专属课程</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600 mb-1">{{ currentMember.priority }}</div>
            <div class="text-sm text-slate-600">处理优先级</div>
          </div>
        </div>

        <div v-if="currentMember.level !== '钻石会员'" class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-slate-800 mb-1">升级享受更多特权</h3>
              <p class="text-sm text-slate-600">解锁更多AI创作功能和专属服务</p>
            </div>
            <button class="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              立即升级
            </button>
          </div>
        </div>
      </div>

      <!-- 会员套餐 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6 text-center">选择适合你的会员套餐</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="plan in membershipPlans"
            :key="plan.id"
            :class="[
              'relative rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2',
              plan.popular ? 'border-gradient-to-r from-amber-500 to-orange-600 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-slate-200 glass-effect'
            ]"
            @click="selectPlan(plan)"
          >
            <div v-if="plan.popular" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                最受欢迎
              </span>
            </div>

            <div class="text-center mb-6">
              <div :class="[
                'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4',
                plan.gradient
              ]">
                <component :is="plan.icon" class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">{{ plan.name }}</h3>
              <div class="text-3xl font-bold text-slate-800 mb-1">
                ¥{{ plan.price }}
                <span class="text-sm font-normal text-slate-600">/{{ plan.period }}</span>
              </div>
              <p class="text-sm text-slate-600">{{ plan.description }}</p>
            </div>

            <div class="space-y-3 mb-6">
              <div 
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-center space-x-3"
              >
                <CheckIcon class="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span class="text-sm text-slate-700">{{ feature }}</span>
              </div>
            </div>

            <button :class="[
              'w-full py-3 rounded-2xl font-semibold transition-all duration-300',
              plan.popular 
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            ]">
              {{ currentMember.level === plan.name ? '当前套餐' : '选择套餐' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 会员特权说明 -->
      <div class="glass-effect rounded-3xl p-6">
        <h2 class="text-2xl font-bold text-slate-800 mb-6 text-center">会员专享特权</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            v-for="privilege in memberPrivileges"
            :key="privilege.id"
            class="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200"
          >
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              privilege.gradient
            ]">
              <component :is="privilege.icon" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-800 mb-1">{{ privilege.title }}</h3>
              <p class="text-sm text-slate-600">{{ privilege.description }}</p>
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
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  ArrowLeftIcon,
  CrownIcon,
  CheckIcon,
  SparklesIcon,
  CloudIcon,
  BookOpenIcon,
  ZapIcon,
  ShieldIcon,
  HeadphonesIcon,
  TrendingUpIcon,
  GiftIcon
} from 'lucide-vue-next'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('profile')

// 当前会员信息（基于用户数据动态计算）
const currentMember = computed(() => {
  const totalPoints = userStore.learningStats.totalPoints || 0
  const completedCourses = userStore.learningStats.completedCourses || 0
  
  // 根据积分和学习进度确定会员等级
  // 新用户默认为普通会员，需要达到更高的门槛才能升级
  let level = '普通会员'
  let description = '享受基础AI创作服务'
  let aiCredits = 10
  let storageGB = 1
  let courses = 5
  let priority = '标准'
  
  // 只有当用户真正达到较高积分和课程完成数时才升级
  if (totalPoints >= 2000 && completedCourses >= 20) {
    level = '钻石会员'
    description = '无限创作，专业级服务'
    aiCredits = 999
    storageGB = 100
    courses = 999
    priority = '最高'
  } else if (totalPoints >= 1000 && completedCourses >= 10) {
    level = '黄金会员'
    description = '进阶功能，创作更自由'
    aiCredits = 100
    storageGB = 10
    courses = 50
    priority = '优先'
  }
  
  return {
    level,
    description,
    aiCredits,
    storageGB,
    courses,
    priority
  }
})

// 会员套餐
const membershipPlans = reactive([
  {
    id: 1,
    name: '普通会员',
    price: 0,
    period: '永久',
    description: '基础功能，适合初学者',
    icon: BookOpenIcon,
    gradient: 'bg-gradient-to-br from-slate-500 to-slate-600',
    popular: false,
    features: [
      '每月10次AI创作',
      '1GB云端存储',
      '基础教程访问',
      '社区互动功能'
    ]
  },
  {
    id: 2,
    name: '黄金会员',
    price: 29,
    period: '月',
    description: '进阶功能，创作更自由',
    icon: CrownIcon,
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    popular: true,
    features: [
      '每月100次AI创作',
      '10GB云端存储',
      '全部教程访问',
      '优先处理队列',
      '专属客服支持',
      '高清导出功能'
    ]
  },
  {
    id: 3,
    name: '钻石会员',
    price: 99,
    period: '月',
    description: '无限创作，专业级服务',
    icon: SparklesIcon,
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
    popular: false,
    features: [
      '无限次AI创作',
      '100GB云端存储',
      '独家大师课程',
      '最高优先级处理',
      '一对一指导服务',
      '商业授权许可',
      '定制化AI模型'
    ]
  }
])

// 会员特权
const memberPrivileges = reactive([
  {
    id: 1,
    title: 'AI创作加速',
    description: '享受更快的AI处理速度，创作效率提升3倍',
    icon: ZapIcon,
    gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600'
  },
  {
    id: 2,
    title: '云端存储',
    description: '安全可靠的云端存储，随时随地访问你的作品',
    icon: CloudIcon,
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600'
  },
  {
    id: 3,
    title: '专属课程',
    description: '获得大师级教程和独家创作技巧分享',
    icon: BookOpenIcon,
    gradient: 'bg-gradient-to-br from-emerald-500 to-green-600'
  },
  {
    id: 4,
    title: '优先支持',
    description: '享受7x24小时专属客服，问题快速解决',
    icon: HeadphonesIcon,
    gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600'
  },
  {
    id: 5,
    title: '数据分析',
    description: '详细的创作数据分析，帮助提升艺术水平',
    icon: TrendingUpIcon,
    gradient: 'bg-gradient-to-br from-pink-500 to-rose-600'
  },
  {
    id: 6,
    title: '专属福利',
    description: '定期获得限量版素材和创作工具',
    icon: GiftIcon,
    gradient: 'bg-gradient-to-br from-red-500 to-pink-600'
  }
])

const selectPlan = (plan) => {
  if (plan.name === currentMember.level) return
  
  // 这里可以添加支付逻辑
  console.log('选择套餐:', plan.name)
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>