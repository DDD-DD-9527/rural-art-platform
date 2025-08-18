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

      <!-- 登录卡片 -->
      <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <!-- 头部 -->
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-slate-800 mb-2">欢迎回来</h1>
          <p class="text-slate-600">登录您的乡艺未来账号</p>
        </div>

        <!-- 错误提示 -->
        <div v-if="errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-sm text-red-600 flex items-center">
            <ExclamationTriangleIcon class="w-4 h-4 mr-2" />
            {{ errors.general }}
          </p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 用户名/注册号 -->
          <div>
            <label for="identifier" class="block text-sm font-medium text-slate-700 mb-2">
              用户名或注册号 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon class="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="identifier"
                v-model="form.identifier"
                type="text"
                required
                placeholder="请输入用户名或注册号"
                class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 bg-white/50"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.identifier }"
              />
            </div>
            <p v-if="errors.identifier" class="mt-1 text-sm text-red-600">{{ errors.identifier }}</p>
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
          </div>

          <!-- 记住我 -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
              />
              <span class="ml-2 text-sm text-slate-600">记住我</span>
            </label>
            <button
              type="button"
              @click="goToForgotPassword"
              class="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
            >
              忘记密码？
            </button>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{{ isLoading ? '登录中...' : '立即登录' }}</span>
          </button>
        </form>

        <!-- 注册链接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-slate-600">
            还没有账号？
            <button 
              @click="goToRegister"
              class="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
            >
              立即注册
            </button>
          </p>
        </div>

        <!-- 快速登录 -->
        <div class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-slate-500">或者</span>
            </div>
          </div>

          <div class="mt-6">
            <button
              @click="handleGuestLogin"
              class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <UserIcon class="w-5 h-5" />
              <span>游客体验</span>
            </button>
          </div>
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
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const form = reactive({
  identifier: '',
  password: '',
  rememberMe: false
})

// 表单状态
const isLoading = ref(false)
const showPassword = ref(false)
const errors = reactive({})

// 表单验证
const validateForm = () => {
  // 清空之前的错误
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true

  // 验证用户名/注册号
  if (!form.identifier.trim()) {
    errors.identifier = '请输入用户名或注册号'
    isValid = false
  }

  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  }

  return isValid
}

// 处理登录
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // 调用用户store的登录方法
    await userStore.login({
      identifier: form.identifier,
      password: form.password,
      rememberMe: form.rememberMe
    })

    // 登录成功，跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    // 处理登录错误
    if (error.message.includes('用户不存在') || error.message.includes('密码错误')) {
      errors.general = '用户名/注册号或密码错误'
    } else if (error.message.includes('账户被禁用')) {
      errors.general = '账户已被禁用，请联系管理员'
    } else {
      errors.general = '登录失败，请稍后重试'
    }
  } finally {
    isLoading.value = false
  }
}

// 游客登录
const handleGuestLogin = () => {
  // 设置游客模式
  userStore.setGuestMode()
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}

// 跳转到忘记密码页
const goToForgotPassword = () => {
  // TODO: 实现忘记密码功能
  console.log('跳转到忘记密码页面')
}
</script>