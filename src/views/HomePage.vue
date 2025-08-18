<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <!-- Header -->
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <PaletteIcon class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              乡艺未来
            </span>
          </div>

          <!-- Voice Search -->
          <button 
            @click="startVoiceSearch"
            class="flex items-center space-x-2 px-4 py-2 glass-card rounded-2xl hover:shadow-md transition-all duration-300"
          >
            <MicIcon class="w-4 h-4 text-slate-600" />
            <span class="hidden sm:inline text-slate-700 font-medium">语音搜索</span>
          </button>

          <!-- User Menu -->
          <div class="relative">
            <button 
              @click="toggleUserMenu"
              class="w-11 h-11 rounded-2xl gradient-accent flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <UserIcon v-if="!userStore.isAuthenticated" class="w-6 h-6 text-white" />
              <span v-else class="text-white font-bold text-sm">{{ userStore.user.name.charAt(0) }}</span>
            </button>
            
            <!-- 下拉菜单 -->
            <div v-if="showUserMenu" class="absolute right-0 top-14 w-48 glass-card rounded-2xl shadow-xl border border-white/20 py-2 z-50">
              <!-- 未登录状态 -->
              <template v-if="!userStore.isAuthenticated">
                <button 
                  @click="goToLogin"
                  class="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
                >
                  <UserIcon class="w-4 h-4 text-emerald-600" />
                  <span class="text-slate-700 font-medium">登录</span>
                </button>
                <button 
                  @click="goToRegister"
                  class="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
                >
                  <UserPlusIcon class="w-4 h-4 text-blue-600" />
                  <span class="text-slate-700 font-medium">注册</span>
                </button>
                <div class="border-t border-slate-200 my-2"></div>
                <button 
                  @click="handleGuestMode"
                  class="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
                >
                  <EyeIcon class="w-4 h-4 text-slate-500" />
                  <span class="text-slate-700 font-medium">游客体验</span>
                </button>
              </template>
              
              <!-- 已登录状态 -->
              <template v-else>
                <button 
                  @click="goToProfile"
                  class="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
                >
                  <UserIcon class="w-4 h-4 text-slate-600" />
                  <span class="text-slate-700 font-medium">个人中心</span>
                </button>
                <button 
                  @click="goToSettings"
                  class="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
                >
                  <CogIcon class="w-4 h-4 text-slate-600" />
                  <span class="text-slate-700 font-medium">设置</span>
                </button>
                <div class="border-t border-slate-200 my-2"></div>
                <button 
                  @click="handleLogout"
                  class="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3"
                >
                  <ArrowRightOnRectangleIcon class="w-4 h-4 text-red-500" />
                  <span class="text-red-600 font-medium">退出登录</span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <!-- Welcome Banner -->
      <section class="relative overflow-hidden rounded-3xl gradient-primary text-white mb-8 shadow-2xl">
        <!-- Rainbow Brothers Animation Background -->
        <div class="absolute inset-0 opacity-80">
          <div class="rainbow-iframe-container">
            <iframe 
            src="/ddd.html" 
            frameborder="0" 
            scrolling="no"
            class="rainbow-iframe"
          ></iframe>
          </div>
        </div>
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10"></div>
        <div class="relative px-8 py-12 lg:px-12 lg:py-16 z-10">
          <div class="max-w-2xl">
            <h1 class="text-4xl lg:text-5xl font-bold mb-4 leading-tight">欢迎来到乡艺未来</h1>
            <p class="text-xl lg:text-2xl opacity-90 mb-8 leading-relaxed">让艺术与技能在乡村绽放，传承文化，创新未来</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <button 
                @click="$router.push('/learning')"
                class="btn-modern bg-white text-emerald-600 hover:bg-gray-50 shadow-xl"
              >
                开始学习之旅
              </button>
              <button 
                @click="$router.push('/assessment')"
                class="btn-modern border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              >
                能力测试评估
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature Cards -->
      <section class="mb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            v-for="(card, index) in featureCards"
            :key="index"
            :icon="card.icon"
            :title="card.title"
            :description="card.description"
            :badge="card.badge"
            :color="card.color"
            :bgColor="card.bgColor"
            @click="navigateToFeature(card.route)"
          />
        </div>
      </section>

      <!-- Recommended Courses -->
      <section>
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-slate-800">为你推荐</h2>
          <button 
            @click="$router.push('/learning')"
            class="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors font-semibold text-lg"
          >
            查看更多
            <ChevronRightIcon class="w-5 h-5 ml-1" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CourseCard
            v-for="course in recommendedCourses"
            :key="course.id"
            :course="course"
            @click="$router.push(`/course/${course.id}`)"
          />
        </div>
      </section>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
// 直接使用iframe引入原始HTML文件
import { 
  PaletteIcon, 
  MicIcon, 
  ChevronRightIcon,
  BookOpenIcon,
  BotIcon,
  UsersIcon
} from 'lucide-vue-next'
import {
  UserIcon,
  UserPlusIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

import FeatureCard from '../components/FeatureCard.vue'
import CourseCard from '../components/CourseCard.vue'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('home')

// 用户菜单状态
const showUserMenu = ref(false)

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 点击外部关闭菜单
const closeUserMenu = () => {
  showUserMenu.value = false
}

// 用户认证相关方法
const goToLogin = () => {
  closeUserMenu()
  router.push('/login')
}

const goToRegister = () => {
  closeUserMenu()
  router.push('/register')
}

const goToProfile = () => {
  closeUserMenu()
  router.push('/profile')
}

const goToSettings = () => {
  closeUserMenu()
  // TODO: 添加设置页面路由
  console.log('跳转到设置页面')
}

const handleGuestMode = () => {
  closeUserMenu()
  // TODO: 实现游客模式逻辑
  console.log('启用游客模式')
}

const handleLogout = async () => {
  closeUserMenu()
  try {
    await userStore.logout()
    // 可以选择跳转到首页或登录页
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

const featureCards = reactive([
  {
    icon: BookOpenIcon,
    title: "技能学习",
    description: "闯关式学习，轻松掌握新技能",
    badge: "⭐ 离线可用",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    route: "/learning"
  },
  {
    icon: BotIcon,
    title: "AI助教",
    description: "智能答疑，个性化学习指导",
    badge: "🗣️ 方言支持",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    route: "/ai-tutor"
  },
  {
    icon: UsersIcon,
    title: "社区交流",
    description: "分享作品，结识同道中人",
    badge: "🏆 积分奖励",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    route: "/community"
  },
  {
    icon: PaletteIcon,
    title: "创作辅助",
    description: "AI帮你完善艺术创作",
    badge: "🎨 风格多样",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    route: "/create"
  }
])

const recommendedCourses = reactive([
  {
    id: 1,
    title: "陕北剪纸艺术入门",
    description: "传承千年民间艺术，感受文化魅力",
    image: "/traditional-paper-cutting.png",
    duration: "45分钟",
    students: "1,234",
    rating: 4.8,
    progress: 30,
    category: "艺术教育"
  },
  {
    id: 2,
    title: "手机摄影技巧",
    description: "用手机记录美好乡村生活",
    image: "/mobile-rural-landscape.png",
    duration: "60分钟",
    students: "856",
    rating: 4.6,
    progress: 0,
    category: "数字技能"
  },
  {
    id: 3,
    title: "微信小商店运营",
    description: "让土特产走向更广阔的市场",
    image: "/wechat-mini-store-rural-products.png",
    duration: "90分钟",
    students: "2,156",
    rating: 4.9,
    progress: 0,
    category: "数字技能"
  }
])

const navigateToFeature = (route) => {
  if (route === '/ai-tutor') {
    window.dispatchEvent(new CustomEvent('open-ai-immersive'))
  } else {
    router.push(route)
  }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const startVoiceSearch = () => {
  console.log('启动语音搜索')
}

onMounted(() => {
  userStore.loadUserData()
  
  // 添加点击外部关闭菜单的事件监听
  document.addEventListener('click', (event) => {
    const userMenu = event.target.closest('.relative')
    if (!userMenu && showUserMenu.value) {
      closeUserMenu()
    }
  })
})
</script>

<style scoped>
.rainbow-iframe-container {
  position: absolute;
  top: 50%;
  right: 20px;
  width: 400px;
  height: 300px;
  transform: translateY(-50%);
  overflow: hidden;
  pointer-events: none;
  background: transparent;
}

.rainbow-iframe {
  width: 800px;
  height: 500px;
  border: none;
  background: transparent;
  transform: scale(0.5);
  transform-origin: left top;
  pointer-events: none;
}

@media (max-width: 768px) {
  .rainbow-iframe {
    height: 300px;
    transform: scale(0.6);
    transform-origin: center top;
  }
}

@media (max-width: 480px) {
  .rainbow-iframe {
    height: 200px;
    transform: scale(0.4);
  }
}
</style>
