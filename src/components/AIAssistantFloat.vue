<template>
  <div class="fixed bottom-24 right-4 z-50">
     <!-- Immersive AI Panel  -->
    <transition name="slide-up">
      <div 
        v-if="isImmersive"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
        @click="closeImmersive"
      >
        <div 
          class="glass-effect rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl"
          @click.stop
        >
           <!-- Immersive Header  -->
          <div class="flex items-center justify-between p-6 border-b border-indigo-200/60">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <BotIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 class="text-xl font-semibold text-slate-800">小艺老师</h2>
                <p class="text-sm text-slate-600">你的专属AI学习助手</p>
              </div>
            </div>
            <button
              @click="closeImmersive"
              class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <XIcon class="w-5 h-5 text-slate-600" />
            </button>
          </div>

           <!-- Immersive Content  -->
          <div class="flex-1 flex">
             <!-- Chat Area  -->
            <div class="flex-1 flex flex-col">
               <!-- Messages  -->
              <div class="flex-1 overflow-y-auto p-6 space-y-4">
                <div 
                  v-for="message in messages" 
                  :key="message.id"
                  :class="[
                    'flex',
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div :class="[
                    'max-w-xs lg:max-w-md px-4 py-3 rounded-2xl',
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-800'
                  ]">
                    {{ message.content }}
                  </div>
                </div>
              </div>

               <!-- Input Area  -->
              <div class="p-6 border-t border-indigo-200/60">
                <div class="flex space-x-3">
                  <input
                    v-model="inputMessage"
                    @keyup.enter="sendMessage"
                    placeholder="有什么问题尽管问我..."
                    class="flex-1 px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-700"
                  />
                  <button
                    @click="sendMessage"
                    class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white rounded-2xl font-medium transition-all duration-200"
                  >
                    <SendIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

             <!-- Quick Actions Sidebar  -->
            <div class="w-80 border-l border-indigo-200/60 p-6">
              <h3 class="font-semibold text-slate-800 mb-4">快速帮助</h3>
              <div class="space-y-3">
                <button
                  v-for="action in quickActions"
                  :key="action.label"
                  @click="handleQuickAction(action.action)"
                  class="w-full flex items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-colors text-left"
                >
                  <component :is="action.icon" class="w-5 h-5 mr-3 text-slate-600" />
                  <div>
                    <div class="font-medium text-slate-800">{{ action.label }}</div>
                    <div class="text-sm text-slate-600">{{ action.description }}</div>
                  </div>
                </button>
              </div>

               <!-- Learning Suggestions  -->
              <div class="mt-8">
                <h3 class="font-semibold text-slate-800 mb-4">学习建议</h3>
                <div class="space-y-3">
                  <div class="p-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl">
                    <div class="font-medium text-slate-800 mb-1">继续学习剪纸</div>
                    <div class="text-sm text-slate-600">你的剪纸课程还有3个关卡未完成</div>
                  </div>
                  <div class="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                    <div class="font-medium text-slate-800 mb-1">尝试AI创作</div>
                    <div class="text-sm text-slate-600">用AI工具增强你的手绘作品</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

     <!-- Regular AI Panel  -->
    <transition name="slide-up">
      <div 
        v-if="isOpen && !isImmersive"
        class="absolute bottom-20 right-0 w-80 h-96 border-0 glass-effect shadow-2xl rounded-3xl flex flex-col"
      >
         <!-- Header  -->
        <div class="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-3xl">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <BotIcon class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-semibold">小艺老师</h4>
              <span class="text-xs opacity-80">在线</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="openImmersive"
              class="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              title="展开对话"
            >
              <MaximizeIcon class="w-4 h-4" />
            </button>
            <button
              @click="isOpen = false"
              class="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

         <!-- Content  -->
        <div class="flex-1 p-4 flex flex-col">
          <div class="mb-4">
            <h5 class="font-semibold text-sm mb-3 text-slate-800">我可以帮你：</h5>
            <div class="space-y-2">
              <button
                v-for="item in quickHelp"
                :key="item.label"
                @click="handleQuickHelp(item.action)"
                class="w-full flex items-center justify-start px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-sm"
              >
                <component :is="item.icon" class="w-4 h-4 mr-2 text-slate-600" />
                {{ item.label }}
              </button>
            </div>
          </div>

           <!-- Chat Messages  -->
          <div class="flex-1 overflow-y-auto mb-4 space-y-3">
            <div 
              v-for="message in messages.slice(-3)" 
              :key="message.id"
              :class="[
                'p-3 rounded-xl text-sm',
                message.type === 'user' 
                  ? 'bg-emerald-100 text-emerald-800 ml-4' 
                  : 'bg-slate-100 text-slate-800 mr-4'
              ]"
            >
              {{ message.content }}
            </div>
          </div>

           <!-- Chat Input  -->
          <div class="flex space-x-2">
            <input
              v-model="inputMessage"
              @keyup.enter="sendMessage"
              placeholder="有什么问题尽管问我..."
              class="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <button
              @click="sendMessage"
              class="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200"
            >
              <SendIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </transition>

     <!-- Float Button  -->
    <button
      @click="togglePanel"
      class="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <div class="relative">
        <BotIcon class="w-8 h-8 text-white mx-auto" />
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full">
          <div class="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  BotIcon, 
  XIcon, 
  SendIcon, 
  MaximizeIcon,
  HelpCircleIcon, 
  LightbulbIcon, 
  TargetIcon,
  BookOpenIcon,
  PaletteIcon,
  UsersIcon
} from 'lucide-vue-next'

const isOpen = ref(false)
const isImmersive = ref(false)
const inputMessage = ref('')
const messages = reactive([
  {
    id: 1,
    type: 'ai',
    content: '你好！我是小艺老师，你的专属AI学习助手。有什么问题可以随时问我哦！'
  }
])

const quickHelp = [
  { icon: HelpCircleIcon, label: '答疑解惑', action: 'help' },
  { icon: LightbulbIcon, label: '学习建议', action: 'advice' },
  { icon: TargetIcon, label: '制定计划', action: 'plan' }
]

const quickActions = [
  { 
    icon: BookOpenIcon, 
    label: '学习指导', 
    description: '获取个性化学习建议',
    action: 'learning'
  },
  { 
    icon: PaletteIcon, 
    label: '创作帮助', 
    description: '艺术创作技巧指导',
    action: 'creation'
  },
  { 
    icon: UsersIcon, 
    label: '社区互动', 
    description: '如何更好地参与社区',
    action: 'community'
  }
]

const togglePanel = () => {
  isOpen.value = !isOpen.value
}

const openImmersive = () => {
  isImmersive.value = true
  isOpen.value = false
}

const closeImmersive = () => {
  isImmersive.value = false
}

const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  messages.push({
    id: Date.now(),
    type: 'user',
    content: inputMessage.value
  })
  
  setTimeout(() => {
    messages.push({
      id: Date.now() + 1,
      type: 'ai',
      content: '我理解你的问题，让我来帮你解答...'
    })
  }, 1000)
  
  inputMessage.value = ''
}

const handleQuickHelp = (action) => {
  const responses = {
    help: '我可以帮你解答学习过程中遇到的任何问题！',
    advice: '根据你的学习进度，我建议你可以尝试...',
    plan: '让我为你制定一个个性化的学习计划！'
  }
  
  messages.push({
    id: Date.now(),
    type: 'ai',
    content: responses[action]
  })
}

const handleQuickAction = (action) => {
  const responses = {
    learning: '我可以根据你的学习进度和兴趣，为你推荐最适合的课程和学习路径。',
    creation: '在艺术创作中，我可以帮你分析作品构图、色彩搭配，并提供改进建议。',
    community: '积极参与社区讨论，分享你的作品和学习心得，可以获得更多的反馈和灵感。'
  }
  
  messages.push({
    id: Date.now(),
    type: 'ai',
    content: responses[action]
  })
}

// Listen for immersive mode trigger from homepage
onMounted(() => {
  window.addEventListener('open-ai-immersive', () => {
    openImmersive()
  })
})
</script>
