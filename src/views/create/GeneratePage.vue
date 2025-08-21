<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-semibold text-slate-800">图案生成</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 功能介绍 -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <LayersIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-4">AI图案生成</h1>
        <p class="text-lg text-slate-600">基于传统元素生成新的艺术图案</p>
      </div>

      <!-- 元素选择 -->
      <div class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">选择传统元素</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div 
            v-for="element in traditionalElements"
            :key="element.id"
            @click="toggleElement(element)"
            class="group cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300"
            :class="selectedElements.includes(element.id) ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'"
          >
            <div class="text-center">
              <div class="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <component :is="element.icon" class="w-8 h-8 text-orange-600" />
              </div>
              <h4 class="font-semibold text-slate-800 mb-1">{{ element.name }}</h4>
              <p class="text-xs text-slate-600">{{ element.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <p class="text-slate-600 mb-4">已选择 {{ selectedElements.length }} 个元素</p>
          <button 
            @click="clearSelection"
            v-if="selectedElements.length > 0"
            class="text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            清空选择
          </button>
        </div>
      </div>

      <!-- 风格设置 -->
      <div class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">图案风格</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">复杂度</label>
            <select v-model="patternSettings.complexity" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="simple">简洁</option>
              <option value="medium">适中</option>
              <option value="complex">复杂</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">色彩方案</label>
            <select v-model="patternSettings.colorScheme" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="traditional">传统色彩</option>
              <option value="modern">现代色彩</option>
              <option value="monochrome">单色调</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">图案类型</label>
            <select v-model="patternSettings.patternType" class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option value="symmetric">对称图案</option>
              <option value="border">边框装饰</option>
              <option value="tile">平铺图案</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 文字描述 -->
      <div class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">描述你的想法</h2>
        <textarea 
          v-model="textDescription"
          placeholder="描述你想要的图案效果，比如：结合牡丹和祥云元素，创作一个寓意吉祥的传统图案..."
          class="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
        ></textarea>
        
        <div class="mt-6 text-center">
          <button 
            @click="generatePattern"
            :disabled="selectedElements.length === 0 || isGenerating"
            class="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {{ isGenerating ? '生成中...' : '生成图案' }}
          </button>
        </div>
      </div>

      <!-- 生成结果 -->
      <div v-if="generatedPatterns.length > 0" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">生成的图案</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(pattern, index) in generatedPatterns"
            :key="index"
            class="group relative overflow-hidden rounded-2xl cursor-pointer"
          >
            <img 
              :src="pattern.image" 
              :alt="pattern.title"
              class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
            <div class="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h4 class="text-white font-semibold mb-2">{{ pattern.title }}</h4>
              <p class="text-white/80 text-sm mb-3">{{ pattern.description }}</p>
              <div class="flex space-x-2">
                <button class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm hover:bg-white/30 transition-colors">
                  下载
                </button>
                <button class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm hover:bg-white/30 transition-colors">
                  编辑
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
          <div class="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <BotIcon class="w-5 h-5 text-white" />
          </div>
          <h3 class="text-lg font-semibold text-slate-800">AI助手建议</h3>
        </div>
        <div class="space-y-3">
          <div class="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl">
            <p class="text-slate-700">{{ aiSuggestion }}</p>
          </div>
          <button 
            @click="getDesignTip"
            class="text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            获取设计技巧
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
  LayersIcon,
  BotIcon,
  FlowerIcon,
  CloudIcon,
  StarIcon,
  TreePineIcon,
  FishIcon,
  BirdIcon,
  SunIcon,
  MountainIcon
} from 'lucide-vue-next'
import BottomNavigation from '../../components/BottomNavigation.vue'

const router = useRouter()
const activeTab = ref('create')

const selectedElements = ref([])
const isGenerating = ref(false)
const textDescription = ref('')
const aiSuggestion = ref('选择2-4个传统元素进行组合，能创造出既有传统韵味又富有创新的图案。建议从寓意吉祥的元素开始。')

const patternSettings = reactive({
  complexity: 'medium',
  colorScheme: 'traditional',
  patternType: 'symmetric'
})

const generatedPatterns = reactive([])

const traditionalElements = reactive([
  {
    id: 'peony',
    name: '牡丹',
    description: '富贵吉祥',
    icon: FlowerIcon
  },
  {
    id: 'cloud',
    name: '祥云',
    description: '吉祥如意',
    icon: CloudIcon
  },
  {
    id: 'phoenix',
    name: '凤凰',
    description: '高贵典雅',
    icon: BirdIcon
  },
  {
    id: 'dragon',
    name: '龙纹',
    description: '权威尊贵',
    icon: StarIcon
  },
  {
    id: 'bamboo',
    name: '竹子',
    description: '节节高升',
    icon: TreePineIcon
  },
  {
    id: 'fish',
    name: '鲤鱼',
    description: '年年有余',
    icon: FishIcon
  },
  {
    id: 'lotus',
    name: '莲花',
    description: '纯洁高雅',
    icon: FlowerIcon
  },
  {
    id: 'sun',
    name: '太阳',
    description: '光明希望',
    icon: SunIcon
  },
  {
    id: 'mountain',
    name: '山峰',
    description: '稳重坚毅',
    icon: MountainIcon
  }
])

const goBack = () => {
  router.back()
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}

const toggleElement = (element) => {
  const index = selectedElements.value.indexOf(element.id)
  if (index > -1) {
    selectedElements.value.splice(index, 1)
  } else {
    selectedElements.value.push(element.id)
  }
}

const clearSelection = () => {
  selectedElements.value = []
}

const generatePattern = () => {
  isGenerating.value = true
  
  // 模拟AI生成过程
  setTimeout(() => {
    generatedPatterns.length = 0
    generatedPatterns.push(
      {
        title: '精美传统图案',
        description: '基于传统工艺的精美设计',
        image: '/2025_08_20_22_31_56.jpg'
      },
      {
        title: '经典艺术作品',
        description: '传承经典的艺术表现',
        image: '/2025_08_20_22_31_56.jpg'
      },
      {
        title: '文化精品图案',
        description: '体现深厚文化底蕴',
        image: '/2025_08_20_22_31_56.jpg'
      }
    )
    isGenerating.value = false
    
    const elementNames = selectedElements.value.map(id => 
      traditionalElements.find(el => el.id === id)?.name
    ).join('、')
    
    aiSuggestion.value = `很棒！我为你生成了精美的传统图案设计。这些图案融合了传统文化的精髓，具有很高的艺术价值。你可以进一步编辑或尝试不同的元素组合。`
  }, 3000)
}

const getDesignTip = () => {
  const tips = [
    '对称图案给人稳重平衡的感觉，适合用于正式场合的装饰。',
    '边框图案可以用来装饰文档、海报或其他设计作品的边缘。',
    '平铺图案适合用作背景或纺织品设计，具有很好的延展性。',
    '传统色彩搭配能更好地体现文化内涵，现代色彩则更具时尚感。',
    '简洁的图案更容易应用，复杂的图案则更具艺术价值。',
    '结合不同寓意的元素，可以创造出富有故事性的图案设计。'
  ]
  aiSuggestion.value = tips[Math.floor(Math.random() * tips.length)]
}
</script>