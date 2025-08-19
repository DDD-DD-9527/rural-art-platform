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
import { ref, reactive, onMounted, nextTick } from 'vue'
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

// Coze智能体相关状态
const isCozeReady = ref(false)
const cozeClient = ref(null)

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

// 初始化Coze智能体聊天界面
const initCozeAgent = async () => {
  try {
    if (window.CozeWebSDK) {
      // 创建一个隐藏的容器用于Coze聊天界面
      const cozeContainer = document.createElement('div')
      cozeContainer.id = 'coze-chat-container'
      cozeContainer.style.display = 'none'
      document.body.appendChild(cozeContainer)
      
      cozeClient.value = new window.CozeWebSDK.WebChatClient({
        config: {
          botId: '7538355440988979239',
        },
        chatBot: {
          title: 'AI图片增强助手',
          el: cozeContainer,
          width: 400,
          height: 600
        },
        auth: {
          type: 'token',
          token: 'pat_********', // 注意：实际使用时需要替换为真实token
          onRefreshToken: function () {
            return 'pat_********' // 注意：实际使用时需要替换为真实token
          }
        }
      })
      isCozeReady.value = true
      console.log('Coze智能体初始化成功')
      aiSuggestion.value = 'AI图片增强助手已就绪！由于Coze SDK主要用于聊天界面，当前使用模拟增强功能。'
    }
  } catch (error) {
    console.error('Coze智能体初始化失败:', error)
    isCozeReady.value = false
  }
}

// 模拟使用Coze智能体处理图片增强（实际需要后端API支持）
const enhanceImageWithCoze = async (imageData) => {
  try {
    // 注意：Coze WebSDK 主要用于创建聊天界面，不直接支持图片处理API
    // 实际的图片增强需要通过后端调用Coze API来实现
    console.log('模拟Coze智能体处理图片增强')
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 返回模拟的增强结果
    return {
      success: true,
      images: [
        { url: '/original-works-placeholder.png', title: 'AI色彩增强版' },
        { url: '/traditional-paper-cutting.png', title: 'AI构图优化版' },
        { url: '/traditional-chinese-painting.png', title: 'AI风格转换版' }
      ],
      suggestion: 'AI已为您的作品生成了多个增强版本，每个版本都针对不同的艺术效果进行了优化。'
    }
  } catch (error) {
    console.error('Coze智能体处理失败:', error)
    throw error
  }
}

const enhanceImage = async () => {
  isProcessing.value = true
  
  try {
    if (isCozeReady.value && uploadedImage.value) {
      // 使用Coze智能体处理图片（当前为模拟实现）
      const response = await enhanceImageWithCoze(uploadedImage.value)
      
      // 处理Coze智能体的响应
      if (response && response.success && response.images) {
        enhancedResults.length = 0 // 清空之前的结果
        response.images.forEach((img, index) => {
          enhancedResults.push({
            title: img.title || `AI增强版本 ${index + 1}`,
            image: img.url || img.data
          })
        })
        aiSuggestion.value = response.suggestion || 'AI已成功增强您的图片！您可以查看不同的增强版本，选择最满意的效果。'
      } else {
        // 如果Coze响应格式不符合预期，使用模拟数据
        enhancedResults.push(
          {
            title: 'AI色彩增强版',
            image: '/original-works-placeholder.png'
          },
          {
            title: 'AI构图优化版',
            image: '/traditional-paper-cutting.png'
          },
          {
            title: 'AI风格转换版',
            image: '/traditional-chinese-painting.png'
          }
        )
        aiSuggestion.value = 'AI已为您的作品生成了多个增强版本。每个版本都针对不同的艺术效果进行了优化。'
      }
    } else {
      // 降级到模拟处理
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
      aiSuggestion.value = isCozeReady.value ? 'AI处理完成！' : 'AI智能体正在初始化中，当前使用模拟增强效果。'
    }
  } catch (error) {
    console.error('图片增强处理失败:', error)
    // 错误时使用模拟数据
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
    aiSuggestion.value = '处理过程中遇到问题，已为您提供基础增强版本。'
  } finally {
    isProcessing.value = false
  }
}

const getNewSuggestion = () => {
  const suggestions = [
    '尝试上传不同类型的手绘作品，比如素描、水彩或彩铅画，AI会根据不同媒介提供相应的增强效果。',
    '在拍摄手绘作品时，建议使用自然光源，避免阴影遮挡，这样能让AI更准确地识别线条和色彩。',
    '如果你的作品包含传统元素，AI会自动识别并提供相应的文化背景增强建议。',
    'Coze智能体可以识别多种艺术风格，包括传统中国画、剪纸艺术、水墨画等，为您提供专业的增强建议。',
    '上传高分辨率的图片可以获得更好的AI增强效果，建议图片尺寸不小于800x600像素。'
  ]
  aiSuggestion.value = suggestions[Math.floor(Math.random() * suggestions.length)]
}

// 组件挂载时初始化Coze智能体
onMounted(() => {
  // 延迟初始化，确保SDK已加载
  nextTick(() => {
    setTimeout(() => {
      initCozeAgent()
    }, 1000)
  })
})
</script>