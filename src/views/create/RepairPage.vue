<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-semibold text-slate-800">智能修复</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 功能介绍 -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <WandIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-4">AI智能修复</h1>
        <p class="text-lg text-slate-600">修复老旧艺术品的损坏和缺失部分</p>
      </div>

      <!-- 图片上传 -->
      <div class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">上传需要修复的图片</h2>
        
        <div 
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer"
          :class="{ 'border-purple-500 bg-purple-50': isDragging }"
        >
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect" 
            class="hidden"
          />
          
          <div v-if="!uploadedImage">
            <UploadIcon class="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-slate-800 mb-2">拖拽或点击上传图片</h3>
            <p class="text-slate-600 mb-4">支持 JPG、PNG、WEBP 格式，最大 10MB</p>
            <button 
              @click="$refs.fileInput.click()"
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              选择文件
            </button>
          </div>
          
          <div v-else class="relative">
            <img :src="uploadedImage" alt="上传的图片" class="max-w-full max-h-96 mx-auto rounded-xl shadow-lg" />
            <button 
              @click="removeImage"
              class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- 修复选项 -->
      <div v-if="uploadedImage" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">修复选项</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-slate-800">修复类型</h3>
            <div class="space-y-3">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="repairOptions.cracks"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span class="text-slate-700">裂纹修复</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="repairOptions.stains"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span class="text-slate-700">污渍清除</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="repairOptions.missing"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span class="text-slate-700">缺失补全</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="repairOptions.fading"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span class="text-slate-700">褪色恢复</span>
              </label>
            </div>
          </div>
          
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-slate-800">修复强度</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">修复程度</label>
                <input 
                  type="range" 
                  v-model="repairSettings.intensity"
                  min="1" 
                  max="10" 
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="flex justify-between text-xs text-slate-500 mt-1">
                  <span>轻微</span>
                  <span>{{ repairSettings.intensity }}</span>
                  <span>完全</span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">保真度</label>
                <select v-model="repairSettings.fidelity" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  <option value="high">高保真（保持原貌）</option>
                  <option value="medium">中等（适度修复）</option>
                  <option value="creative">创意（艺术化修复）</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <button 
            @click="startRepair"
            :disabled="!hasSelectedOptions || isRepairing"
            class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {{ isRepairing ? '修复中...' : '开始修复' }}
          </button>
        </div>
      </div>

      <!-- 修复进度 -->
      <div v-if="isRepairing" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">修复进度</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-slate-700">{{ currentStep }}</span>
            <span class="text-purple-600 font-semibold">{{ progress }}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-3">
            <div 
              class="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 修复结果 -->
      <div v-if="repairResult" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">修复结果</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 class="text-lg font-semibold text-slate-800 mb-4">修复前</h3>
            <img :src="uploadedImage" alt="修复前" class="w-full rounded-xl shadow-lg" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-slate-800 mb-4">修复后</h3>
            <img :src="repairResult.image" alt="修复后" class="w-full rounded-xl shadow-lg" />
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
          <h4 class="font-semibold text-slate-800 mb-3">修复报告</h4>
          <ul class="space-y-2 text-slate-700">
            <li v-for="item in repairResult.report" :key="item" class="flex items-center space-x-2">
              <CheckIcon class="w-4 h-4 text-green-600" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
        
        <div class="flex flex-wrap gap-4 justify-center">
          <button class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300">
            下载修复图片
          </button>
          <button class="px-6 py-3 border-2 border-purple-500 text-purple-600 rounded-2xl font-semibold hover:bg-purple-50 transition-all duration-300">
            对比查看
          </button>
          <button class="px-6 py-3 border-2 border-slate-300 text-slate-600 rounded-2xl font-semibold hover:bg-slate-50 transition-all duration-300">
            重新修复
          </button>
        </div>
      </div>

      <!-- AI助手建议 -->
      <div class="glass-effect rounded-3xl p-6">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <BotIcon class="w-5 h-5 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-slate-800">AI助手建议</h3>
        </div>
        <div class="space-y-3">
          <div class="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
            <p class="text-slate-700">{{ aiSuggestion }}</p>
          </div>
          <button 
            @click="getRepairTip"
            class="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            获取修复技巧
          </button>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  WandIcon,
  UploadIcon,
  XIcon,
  CheckIcon,
  BotIcon
} from 'lucide-vue-next'
import BottomNavigation from '../../components/BottomNavigation.vue'

const router = useRouter()
const activeTab = ref('create')

const uploadedImage = ref('')
const isDragging = ref(false)
const isRepairing = ref(false)
const progress = ref(0)
const currentStep = ref('')
const repairResult = ref(null)
const aiSuggestion = ref('上传需要修复的艺术品图片，AI将智能识别损坏区域并提供最佳修复方案。建议上传清晰度较高的图片以获得更好的修复效果。')

const repairOptions = reactive({
  cracks: false,
  stains: false,
  missing: false,
  fading: false
})

const repairSettings = reactive({
  intensity: 5,
  fidelity: 'medium'
})

const hasSelectedOptions = computed(() => {
  return Object.values(repairOptions).some(option => option)
})

const goBack = () => {
  router.back()
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    handleFile(file)
  }
}

const handleFile = (file) => {
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target.result
      aiSuggestion.value = '图片上传成功！AI正在分析图片内容，请选择需要修复的类型。建议根据图片的实际损坏情况选择相应的修复选项。'
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  uploadedImage.value = ''
  repairResult.value = null
  Object.keys(repairOptions).forEach(key => {
    repairOptions[key] = false
  })
  aiSuggestion.value = '上传需要修复的艺术品图片，AI将智能识别损坏区域并提供最佳修复方案。建议上传清晰度较高的图片以获得更好的修复效果。'
}

const startRepair = () => {
  isRepairing.value = true
  progress.value = 0
  repairResult.value = null
  
  const steps = [
    '分析图片内容...',
    '识别损坏区域...',
    '生成修复方案...',
    '应用AI修复算法...',
    '优化修复效果...',
    '生成修复报告...'
  ]
  
  let stepIndex = 0
  const interval = setInterval(() => {
    if (stepIndex < steps.length) {
      currentStep.value = steps[stepIndex]
      progress.value = Math.min(((stepIndex + 1) / steps.length) * 100, 95)
      stepIndex++
    } else {
      clearInterval(interval)
      completeRepair()
    }
  }, 800)
}

const completeRepair = () => {
  progress.value = 100
  currentStep.value = '修复完成！'
  
  setTimeout(() => {
    isRepairing.value = false
    
    const selectedRepairs = Object.keys(repairOptions).filter(key => repairOptions[key])
    const repairNames = {
      cracks: '裂纹修复',
      stains: '污渍清除', 
      missing: '缺失补全',
      fading: '褪色恢复'
    }
    
    repairResult.value = {
      image: '/ddddd.png', // 使用指定图片
      report: selectedRepairs.map(key => `${repairNames[key]}：已成功修复`)
    }
    
    aiSuggestion.value = `修复完成！我已经成功处理了图片中的${selectedRepairs.map(key => repairNames[key]).join('、')}问题。修复后的图片保持了原有的艺术风格，同时显著改善了视觉效果。你可以下载修复后的图片或进行进一步的调整。`
  }, 1000)
}

const getRepairTip = () => {
  const tips = [
    '对于古画修复，建议选择高保真模式以最大程度保持原作风貌。',
    '如果图片有多种损坏，可以分步骤进行修复，先处理主要问题。',
    '修复强度不宜过高，适度修复能更好地保持艺术品的历史感。',
    '对于严重缺失的部分，AI会根据周围内容智能推测并补全。',
    '修复后的图片建议保存为高质量格式，便于后续使用和保存。',
    '如果对修复效果不满意，可以调整参数重新修复。'
  ]
  aiSuggestion.value = tips[Math.floor(Math.random() * tips.length)]
}
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>