<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">用户数据调试页面</h1>
      
      <!-- 认证状态 -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">认证状态</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">已认证:</label>
            <p class="text-lg">{{ userStore.isAuthenticated }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">游客模式:</label>
            <p class="text-lg">{{ userStore.isGuest }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Token:</label>
            <p class="text-sm break-all">{{ userStore.token ? userStore.token.substring(0, 50) + '...' : '无' }}</p>
          </div>
        </div>
      </div>

      <!-- 用户基本信息 -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">用户基本信息</h2>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ JSON.stringify(userStore.user, null, 2) }}</pre>
      </div>

      <!-- 学习统计 -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">学习统计</h2>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ JSON.stringify(userStore.learningStats, null, 2) }}</pre>
      </div>

      <!-- 技能进度 -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">技能进度</h2>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ JSON.stringify(userStore.skillProgress, null, 2) }}</pre>
      </div>

      <!-- 成就徽章 -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">成就徽章</h2>
        <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ JSON.stringify(userStore.achievements, null, 2) }}</pre>
      </div>

      <!-- 操作按钮 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">调试操作</h2>
        <div class="space-x-4">
          <button @click="refreshUserData" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            刷新用户数据
          </button>
          <button @click="setGuestMode" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            设置游客模式
          </button>
          <button @click="checkAuthStatus" class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            检查认证状态
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const refreshUserData = async () => {
  try {
    await userStore.getCurrentUser()
    alert('用户数据已刷新')
  } catch (error) {
    alert('刷新失败: ' + error.message)
  }
}

const setGuestMode = () => {
  userStore.setGuestMode()
  alert('已设置为游客模式')
}

const checkAuthStatus = async () => {
  try {
    const result = await userStore.checkAuth()
    alert('认证检查结果: ' + result)
  } catch (error) {
    alert('认证检查失败: ' + error.message)
  }
}
</script>