<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
     <!-- Header  -->
    <header class="glass-effect border-b border-slate-200/50 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="$router.back()" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-semibold text-slate-800">能力测试</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
       <!-- Assessment Header  -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <TargetIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-4">技能能力测试</h1>
        <p class="text-lg text-slate-600">了解你的技能水平，为你推荐最适合的学习路径</p>
      </div>

       <!-- Assessment Categories  -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          v-for="category in assessmentCategories"
          :key="category.id"
          class="glass-effect rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
          @click="startAssessment(category.id)"
        >
          <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300', category.bgColor]">
            <component :is="category.icon" :class="['w-8 h-8', category.color]" />
          </div>
          <h3 class="text-xl font-semibold text-slate-800 mb-2">{{ category.title }}</h3>
          <p class="text-slate-600 mb-4">{{ category.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-500">{{ category.duration }}</span>
            <div class="flex items-center text-emerald-600">
              <span class="text-sm font-medium mr-2">开始测试</span>
              <ArrowRightIcon class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

       <!-- Previous Results  -->
      <div v-if="previousResults.length > 0" class="glass-effect rounded-2xl p-6">
        <h2 class="text-xl font-semibold text-slate-800 mb-4">历史测试结果</h2>
        <div class="space-y-4">
          <div 
            v-for="result in previousResults"
            :key="result.id"
            class="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
          >
            <div class="flex items-center space-x-4">
              <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', result.bgColor]">
                <component :is="result.icon" :class="['w-6 h-6', result.color]" />
              </div>
              <div>
                <h4 class="font-semibold text-slate-800">{{ result.category }}</h4>
                <p class="text-sm text-slate-600">{{ result.date }}</p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-slate-800">{{ result.score }}分</div>
              <div :class="['text-sm font-medium', result.levelColor]">{{ result.level }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, TargetIcon, ArrowRightIcon, PaletteIcon, SmartphoneIcon } from 'lucide-vue-next'
import BottomNavigation from '../components/BottomNavigation.vue'

const router = useRouter()
const activeTab = ref('home')

const assessmentCategories = reactive([
  {
    id: 'art',
    title: '艺术技能测试',
    description: '测试你的传统艺术基础和创作能力',
    duration: '15分钟',
    icon: PaletteIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    id: 'digital',
    title: '数字技能测试',
    description: '评估你的数字化工具使用能力',
    duration: '12分钟',
    icon: SmartphoneIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  }
])

const previousResults = reactive([
  {
    id: 1,
    category: '艺术技能测试',
    score: 85,
    level: '高级',
    levelColor: 'text-emerald-600',
    date: '2024-01-15',
    icon: PaletteIcon,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  }
])

const startAssessment = (categoryId) => {
  router.push(`/assessment/${categoryId}`)
}

const handleTabChange = (tab) => {
  activeTab.value = tab
}
</script>
