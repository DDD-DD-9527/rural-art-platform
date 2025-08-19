import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './style.css'
import { useUserStore } from './stores/user.js'

// 导入页面组件
import HomePage from './views/HomePage.vue'
import LearningPage from './views/LearningPage.vue'
import CommunityPage from './views/CommunityPage.vue'
import CreatePage from './views/CreatePage.vue'
import CoursePage from './views/CoursePage.vue'
import AssessmentPage from './views/AssessmentPage.vue'
import SubsidyPage from './views/SubsidyPage.vue'
import AchievementsPage from './views/AchievementsPage.vue'
import FansPage from './views/FansPage.vue'
import FollowingPage from './views/FollowingPage.vue'
import LikesPage from './views/LikesPage.vue'
import CommentsPage from './views/CommentsPage.vue'

// 导入创作工具页面
import EnhancePage from './views/create/EnhancePage.vue'
import StylePage from './views/create/StylePage.vue'
import GeneratePage from './views/create/GeneratePage.vue'
import RepairPage from './views/create/RepairPage.vue'

// 导入新增页面
import MembershipPage from './views/MembershipPage.vue'
import MyWorksPage from './views/MyWorksPage.vue'
import LikesReceivedPage from './views/LikesReceivedPage.vue'
import TodayStudyTimePage from './views/TodayStudyTimePage.vue'
import WeeklyStudyDaysPage from './views/WeeklyStudyDaysPage.vue'
import CompletedCoursesPage from './views/CompletedCoursesPage.vue'
import LearningPointsPage from './views/LearningPointsPage.vue'
import LearningDaysPage from './views/LearningDaysPage.vue'

// 导入后台管理页面
import AdminDashboard from './views/admin/AdminDashboard.vue'
import AdminCoursesPage from './views/admin/AdminCoursesPage.vue'

// 路由配置
const routes = [
  { path: '/', component: HomePage },
  { path: '/learning', component: LearningPage },
  { path: '/community', component: CommunityPage },
  { path: '/create', component: CreatePage },
  { path: '/create/enhance', component: EnhancePage },
  { path: '/create/style', component: StylePage },
  { path: '/create/generate', component: GeneratePage },
  { path: '/create/repair', component: RepairPage },
  { path: '/course/:id', component: CoursePage },
  { path: '/assessment', component: AssessmentPage },
  { path: '/profile', component: () => import('./views/ProfilePage.vue') },
  { path: '/subsidy', component: SubsidyPage },
  { path: '/points-shop', component: () => import('./views/PointsShopPage.vue') },
  { path: '/achievements', component: AchievementsPage },
  { path: '/fans', component: FansPage },
  { path: '/following', component: FollowingPage },
  { path: '/likes', component: LikesPage },
  { path: '/comments', component: CommentsPage },
  { path: '/membership', component: MembershipPage },
  { path: '/my-works', component: MyWorksPage },
  { path: '/likes-received', component: LikesReceivedPage },
  { path: '/today-study-time', component: TodayStudyTimePage },
  { path: '/weekly-study-days', component: WeeklyStudyDaysPage },
  { path: '/completed-courses', component: CompletedCoursesPage },
  { path: '/learning-points', component: LearningPointsPage },
  { path: '/learning-days', component: LearningDaysPage },
  { path: '/debug', component: () => import('./views/DebugPage.vue') },
  { path: '/register', component: () => import('./views/RegisterPage.vue') },
  { path: '/login', component: () => import('./views/LoginPage.vue') },
  // 后台管理路由
  { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/courses', component: AdminCoursesPage, meta: { requiresAuth: true, requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 如果用户未登录，重定向到登录页
    if (!userStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
      // 确保用户信息已加载
      if (!userStore.user) {
        try {
          await userStore.checkAuth()
        } catch (error) {
          next('/login')
          return
        }
      }
      
      // 检查用户是否为管理员
      if (!userStore.isAdmin) {
        // 非管理员用户，重定向到首页
        next('/')
        return
      }
    }
  }
  
  next()
})

import { createPersistedState } from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(createPersistedState({
  storage: localStorage
}))

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 应用启动时初始化用户状态
app.mount('#app')

// 在应用挂载后初始化用户状态
const userStore = useUserStore()

// 检查用户登录状态并获取数据
userStore.checkAuth().catch(error => {
  console.log('用户未登录或token已过期')
  // 如果没有有效token，设置为游客模式
  userStore.setGuestMode()
})