<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-semibold text-slate-800">风格转换</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 功能介绍 -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <PaletteIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-4">AI风格转换</h1>
        <p class="text-lg text-slate-600">将你的作品转换为不同的艺术风格</p>
      </div>

      <!-- 上传区域 -->
      <div class="glass-effect rounded-3xl p-8 mb-8">
        <div 
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-purple-400 transition-colors duration-300"
          :class="{ 'border-purple-400 bg-purple-50': isDragging }"
        >
          <div v-if="!uploadedImage">
            <UploadIcon class="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-slate-700 mb-2">上传你的作品</h3>
            <p class="text-slate-500 mb-6">支持照片、手绘作品等各种图片格式</p>
            <button 
              @click="triggerFileInput"
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
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
            <button 
              @click="clearImage"
              class="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              重新上传
            </button>
          </div>
        </div>
      </div>

      <!-- 风格选择 -->
      <div v-if="uploadedImage" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">选择转换风格</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="style in artStyles"
            :key="style.id"
            @click="selectStyle(style)"
            class="group cursor-pointer"
            :class="{ 'ring-2 ring-purple-500': selectedStyle?.id === style.id }"
          >
            <div class="relative overflow-hidden rounded-2xl">
              <img 
                :src="style.preview" 
                :alt="style.name"
                class="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <h4 class="text-white font-semibold text-sm">{{ style.name }}</h4>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedStyle" class="mt-6 text-center">
          <button 
            @click="convertStyle"
            :disabled="isProcessing"
            class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {{ isProcessing ? '转换中...' : `转换为${selectedStyle.name}` }}
          </button>
        </div>
      </div>

      <!-- 转换结果 -->
      <div v-if="convertedResults.length > 0" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">转换结果</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-slate-700">原图</h3>
            <img :src="uploadedImage" alt="原图" class="w-full rounded-xl shadow-lg" />
          </div>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-slate-700">{{ selectedStyle.name }}风格</h3>
            <img :src="convertedResults[0].image" alt="转换结果" class="w-full rounded-xl shadow-lg" />
            <div class="flex space-x-3">
              <button class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300">
                下载图片
              </button>
              <button class="flex-1 px-4 py-2 border border-purple-300 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors">
                分享作品
              </button>
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
          <div class="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
            <p class="text-slate-700">{{ aiSuggestion }}</p>
          </div>
          <button 
            @click="getStyleAdvice"
            class="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            获取风格建议
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
  PaletteIcon, 
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
const selectedStyle = ref(null)
const aiSuggestion = ref('选择合适的艺术风格可以让你的作品呈现完全不同的视觉效果。建议根据作品内容和想要表达的情感来选择风格。')

const convertedResults = reactive([])

const artStyles = reactive([
  {
    id: 'ink',
    name: '水墨风',
    preview: '/traditional-chinese-painting.png'
  },
  {
    id: 'cartoon',
    name: '卡通风',
    preview: '/creative-course-placeholder.png'
  },
  {
    id: 'oil',
    name: '油画风',
    preview: '/original-works-placeholder.png'
  },
  {
    id: 'paper-cut',
    name: '剪纸风',
    preview: '/traditional-paper-cutting.png'
  },
  {
    id: 'sketch',
    name: '素描风',
    preview: '/placeholder.jpg'
  },
  {
    id: 'watercolor',
    name: '水彩风',
    preview: '/paper-cutting-flower-bird.png'
  }
])

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
  selectedStyle.value = null
  convertedResults.length = 0
}

const selectStyle = (style) => {
  selectedStyle.value = style
}

const convertStyle = () => {
  isProcessing.value = true
  
  // 模拟AI处理过程
  setTimeout(() => {
    convertedResults.length = 0
    convertedResults.push({
      style: selectedStyle.value.name,
      image: '/2025_08_20_22_28_36.jpg'
    })
    isProcessing.value = false
    aiSuggestion.value = `${selectedStyle.value.name}转换完成！AI已为您的作品生成了专业的风格转换效果。`
  }, 3000)
}

const getStyleAdvice = () => {
  const advices = [
    '水墨风格适合表现意境深远的作品，特别是山水和花鸟题材。',
    '卡通风格能让作品更加生动有趣，适合儿童教育和趣味表达。',
    '油画风格能增强作品的质感和层次，适合人物肖像和静物。',
    '剪纸风格体现了传统文化特色，适合节庆和民俗主题。',
    '素描风格突出线条和结构，适合学习绘画基础和表现形体。',
    '水彩风格清新淡雅，适合表现自然风光和抒情主题。'
  ]
  aiSuggestion.value = advices[Math.floor(Math.random() * advices.length)]
}
</script>