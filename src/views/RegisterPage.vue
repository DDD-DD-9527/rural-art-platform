<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md">
      <!-- 返回按钮 -->
      <button 
        @click="goBack"
        class="absolute -top-16 left-0 flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
      >
        <ArrowLeftIcon class="w-5 h-5" />
        <span class="text-sm font-medium">返回</span>
      </button>

      <!-- 注册卡片 -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <!-- 头部 -->
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlusIcon class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-slate-800 mb-2">欢迎加入乡艺未来</h1>
          <p class="text-slate-600">开启您的乡村艺术学习之旅</p>
        </div>

        <!-- 注册表单 -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 注册号 -->
          <div>
            <label for="userId" class="block text-sm font-medium text-slate-700 mb-2">
              注册号 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HashtagIcon class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="userId"
                v-model="form.userId"
                type="text"
                required
                placeholder="请输入您的注册号"
                class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white/50"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.userId }"
              />
            </div>
            <p v-if="errors.userId" class="mt-1 text-sm text-red-600">{{ errors.userId }}</p>
          </div>

          <!-- 注册名 -->
          <div>
            <label for="username" class="block text-sm font-medium text-slate-700 mb-2">
              注册名 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                placeholder="请输入您的用户名"
                class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white/50"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.username }"
              />
            </div>
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>

          <!-- 密码 -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-2">
              密码 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="请输入密码"
                class="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white/50"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-slate-400 hover:text-slate-600" />
                <EyeSlashIcon v-else class="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            <p class="mt-1 text-xs text-slate-500">密码至少6个字符，包含字母和数字</p>
          </div>

          <!-- 确认密码 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-2">
              确认密码 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                placeholder="请再次输入密码"
                class="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white/50"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.confirmPassword }"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5 text-slate-400 hover:text-slate-600" />
                <EyeSlashIcon v-else class="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- 注册按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{{ isLoading ? '注册中...' : '立即注册' }}</span>
          </button>
        </form>

        <!-- 登录链接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-slate-600">
            已有账号？
            <button 
              @click="goToLogin"
              class="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  ArrowLeftIcon,
  UserPlusIcon,
  HashtagIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const form = reactive({
  userId: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// 表单状态
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = reactive({})

// 表单验证
const validateForm = () => {
  // 清空之前的错误
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true

  // 验证注册号
  if (!form.userId || !form.userId.trim()) {
    errors.userId = '请输入注册号'
    isValid = false
  } else if (form.userId.length < 3) {
    errors.userId = '注册号至少3个字符'
    isValid = false
  }

  // 验证用户名
  if (!form.username || !form.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (form.username.length < 2) {
    errors.username = '用户名至少2个字符'
    isValid = false
  } else if (form.username.length > 20) {
    errors.username = '用户名不能超过20个字符'
    isValid = false
  }

  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码至少6个字符'
    isValid = false
  } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
    errors.password = '密码必须包含至少一个字母和一个数字'
    isValid = false
  }

  // 验证确认密码
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  return isValid
}

// 处理注册
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // 调用用户store的注册方法
    await userStore.register({
      userId: form.userId,
      username: form.username,
      password: form.password
    })

    // 注册成功，跳转到首页
    router.push('/')
  } catch (error) {
    console.error('注册失败:', error)
    // 处理注册错误
    if (error.message.includes('用户名已存在')) {
      errors.username = '用户名已存在，请选择其他用户名'
    } else if (error.message.includes('注册号已存在')) {
      errors.userId = '注册号已存在，请选择其他注册号'
    } else {
      errors.general = '注册失败，请稍后重试'
    }
  } finally {
    isLoading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}
</script>