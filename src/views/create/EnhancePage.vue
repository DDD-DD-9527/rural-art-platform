<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-semibold text-slate-800">图片增强</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 功能介绍 -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ImageIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-4">AI图片增强</h1>
        <p class="text-lg text-slate-600">上传手绘作品，AI自动补全色彩和优化构图</p>
      </div>

      <!-- 上传区域 -->
      <div class="glass-effect rounded-3xl p-8 mb-8">
        <div 
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-emerald-400 transition-colors duration-300"
          :class="{ 'border-emerald-400 bg-emerald-50': isDragging }"
        >
          <div v-if="!uploadedImage">
            <UploadIcon class="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-slate-700 mb-2">上传你的手绘作品</h3>
            <p class="text-slate-500 mb-6">拖拽图片到此处，或点击选择文件</p>
            <button 
              @click="triggerFileInput"
              class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              选择图片
            </button>
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              @change="handleFileSelect" 
              class="hidden"
            >
          </div>
          
          <div v-else class="space-y-4">
            <img :src="uploadedImage" alt="上传的图片" class="max-w-full max-h-64 mx-auto rounded-xl shadow-lg" />
            <div class="flex justify-center space-x-4">
              <button 
                @click="clearImage"
                class="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                重新上传
              </button>
              <button 
                @click="enhanceImage"
                :disabled="isProcessing"
                class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {{ isProcessing ? '处理中...' : '开始增强' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 处理结果 -->
      <div v-if="enhancedResults.length > 0" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">增强结果</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(result, index) in enhancedResults"
            :key="index"
            class="group relative overflow-hidden rounded-2xl cursor-pointer"
          >
            <img 
              :src="result.image" 
              :alt="result.title"
              class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
            <div class="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h4 class="text-white font-semibold mb-2">{{ result.title }}</h4>
              <div class="flex space-x-2">
                <button class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm hover:bg-white/30 transition-colors">
                  下载
                </button>
                <button class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm hover:bg-white/30 transition-colors">
                  分享
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI助手建议 -->
      <div class="glass-effect rounded-3xl p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <BotIcon class="w-5 h-5 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-slate-800">AI助手建议</h3>
        </div>
        <div class="space-y-3">
          <div class="p-4 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl">
            <p class="text-slate-700">{{ aiSuggestion }}</p>
          </div>
          <button 
            @click="getNewSuggestion"
            class="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            获取更多建议
          </button>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  ImageIcon, 
  UploadIcon,
  BotIcon
} from 'lucide-vue-next'
import BottomNavigation from '../../components/BottomNavigation.vue'

const router = useRouter()
const activeTab = ref('create')

const uploadedImage = ref(null)
const isDragging = ref(false)
const isProcessing = ref(false)
const fileInput = ref(null)
const aiSuggestion = ref('建议在上传图片时选择光线充足、构图清晰的手绘作品，这样AI能更好地识别和增强细节。')

const enhancedResults = reactive([])

const goBack = () => {
  router.back()
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  uploadedImage.value = null
  enhancedResults.length = 0
}

const enhanceImage = () => {
  isProcessing.value = true
  
  // 模拟AI处理过程
  setTimeout(() => {
    enhancedResults.push(
      {
        title: '色彩增强版',
        image: '/original-works-placeholder.png'
      },
      {
        title: '构图优化版',
        image: '/traditional-paper-cutting.png'
      },
      {
        title: '风格转换版',
        image: '/traditional-chinese-painting.png'
      }
    )
    isProcessing.value = false
    aiSuggestion.value = '很棒的作品！AI已经为你生成了三个不同的增强版本。色彩增强版突出了原作的色彩层次，构图优化版调整了画面平衡，风格转换版则融入了传统艺术元素。'
  }, 3000)
}

const getNewSuggestion = () => {
  const suggestions = [
    '尝试上传不同类型的手绘作品，比如素描、水彩或彩铅画，AI会根据不同媒介提供相应的增强效果。',
    '在拍摄手绘作品时，建议使用自然光源，避免阴影遮挡，这样能让AI更准确地识别线条和色彩。',
    '如果你的作品包含传统元素，AI会自动识别并提供相应的文化背景增强建议。'
  ]
  aiSuggestion.value = suggestions[Math.floor(Math.random() * suggestions.length)]
}
</script>