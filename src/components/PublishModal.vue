<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="glass-effect rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
       <!-- Header  -->
      <div class="flex items-center justify-between p-6 border-b border-slate-200/50">
        <h2 class="text-xl font-semibold text-slate-800">发布动态</h2>
        <button 
          @click="close"
          class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <XIcon class="w-4 h-4 text-slate-600" />
        </button>
      </div>

       <!-- Content  -->
      <div class="p-6 space-y-6">
         <!-- User Info  -->
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-full overflow-hidden">
            <img v-if="userStore.user.avatar" :src="userStore.user.avatar" :alt="userStore.user.name || '用户头像'" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <span class="text-white font-semibold">{{ (userStore.user.name || userStore.user.username || '我').charAt(0) }}</span>
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-slate-800">{{ userStore.user.name || userStore.user.username || '用户' }}</h3>
            <p class="text-sm text-slate-600">{{ userStore.user.location || '未设置位置' }}</p>
          </div>
        </div>

         <!-- Post Type Selection  -->
        <div>
          <h4 class="font-medium text-slate-800 mb-3">选择动态类型</h4>
          <div class="flex flex-wrap gap-2 mb-4">
            <button
              v-for="typeOption in postTypes"
              :key="typeOption.value"
              @click="postType = typeOption.value"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                postType === typeOption.value
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
              ]"
            >
              <component :is="typeOption.icon" class="w-4 h-4" />
              <span>{{ typeOption.label }}</span>
            </button>
          </div>
        </div>

         <!-- Content Input  -->
        <div>
          <textarea
            v-model="content"
            :placeholder="getPlaceholderText()"
            class="w-full h-32 p-4 border border-slate-200 rounded-2xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-700"
          ></textarea>
        </div>

         <!-- Image Upload  -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-slate-800">添加图片</h4>
            <span class="text-sm text-slate-500">最多9张</span>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div 
              v-for="(image, index) in images" 
              :key="image.id || index"
              class="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group"
            >
              <img :src="image.url || image" :alt="`图片${index + 1}`" class="w-full h-full object-cover" />
              <button 
                @click="removeImage(index)"
                class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon class="w-3 h-3" />
              </button>
            </div>
            <button 
              v-if="images.length < 9"
              @click="addImage"
              class="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors group"
            >
              <div class="text-center">
                <PlusIcon class="w-8 h-8 text-slate-400 group-hover:text-emerald-500 mx-auto mb-1" />
                <span class="text-xs text-slate-500 group-hover:text-emerald-600">添加图片</span>
              </div>
            </button>
          </div>
        </div>

         <!-- Tags  -->
        <div>
          <h4 class="font-medium text-slate-800 mb-3">添加话题标签</h4>
          <div class="flex flex-wrap gap-2 mb-3">
            <button
              v-for="tag in suggestedTags"
              :key="tag"
              @click="toggleTag(tag)"
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium transition-all duration-200',
                selectedTags.includes(tag)
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              {{ tag }}
            </button>
          </div>
          <input
            v-model="customTag"
            @keyup.enter="addCustomTag"
            placeholder="输入自定义标签..."
            class="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-700"
          />
        </div>
      </div>

       <!-- Footer  -->
      <div class="flex items-center justify-between p-6 border-t border-slate-200/50">
        <div class="flex items-center space-x-4 text-sm text-slate-500">
          <button @click="showLocationInput = !showLocationInput" class="flex items-center hover:text-slate-700 transition-colors">
            <MapPinIcon class="w-4 h-4 mr-1" />
            {{ locationData.address || '添加位置' }}
          </button>
          <button class="flex items-center hover:text-slate-700 transition-colors">
            <SmileIcon class="w-4 h-4 mr-1" />
            表情
          </button>
        </div>
        
        <!-- Location Input -->
        <div v-if="showLocationInput" class="px-6 pb-4">
          <div class="bg-slate-50 rounded-xl p-4 space-y-3">
            <h5 class="font-medium text-slate-800 mb-2">添加位置信息</h5>
            <div class="grid grid-cols-3 gap-3">
              <input
                v-model="locationData.province"
                placeholder="省份"
                class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <input
                v-model="locationData.city"
                placeholder="城市"
                class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
              <input
                v-model="locationData.district"
                placeholder="区县"
                class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <input
              v-model="locationData.address"
              placeholder="详细地址（可选）"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            @click="close"
            class="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            取消
          </button>
          <button 
            @click="publish"
            :disabled="!canPublish"
            class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
          >
            {{ isPublishing ? '发布中...' : '发布' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { XIcon, PlusIcon, MapPinIcon, SmileIcon, ShareIcon, HelpCircleIcon, ImageIcon, BookOpenIcon, MessageCircleIcon } from 'lucide-vue-next'
import { postService } from '@/services/postService'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['publish', 'close'])
const userStore = useUserStore()

const content = ref('')
const postType = ref('share')
const images = reactive([])
const selectedTags = reactive([])
const customTag = ref('')
const locationData = reactive({
  province: '',
  city: '',
  district: '',
  address: ''
})
const showLocationInput = ref(false)
const isPublishing = ref(false)

// 帖子类型定义
const postTypes = [
  { value: 'share', label: '分享', icon: ShareIcon },
  { value: 'question', label: '提问', icon: HelpCircleIcon },
  { value: 'showcase', label: '作品展示', icon: ImageIcon },
  { value: 'tutorial', label: '教程', icon: BookOpenIcon },
  { value: 'discussion', label: '讨论', icon: MessageCircleIcon }
]

const suggestedTags = ['传统艺术', '摄影分享', '电商技能', '学习心得', '民族文化', '生活感悟']

const canPublish = computed(() => {
  return content.value.trim().length > 0 && !isPublishing.value
})

// 根据帖子类型生成占位符文本
const getPlaceholderText = () => {
  const placeholders = {
    share: '分享你的学习心得、作品或生活感悟...',
    question: '描述你遇到的问题，寻求大家的帮助...',
    showcase: '展示你的作品，分享创作过程和心得...',
    tutorial: '分享你的教程，帮助更多人学习...',
    discussion: '发起一个话题，和大家一起讨论...'
  }
  return placeholders[postType.value] || placeholders.share
}

const addImage = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = (event) => {
    const files = Array.from(event.target.files)
    files.forEach(file => {
      if (images.length < 9) {
        const reader = new FileReader()
        reader.onload = (e) => {
          images.push({
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file
          })
        }
        reader.readAsDataURL(file)
      }
    })
  }
  input.click()
}

const removeImage = (index) => {
  images.splice(index, 1)
}

const toggleTag = (tag) => {
  const index = selectedTags.indexOf(tag)
  if (index > -1) {
    selectedTags.splice(index, 1)
  } else {
    selectedTags.push(tag)
  }
}

const addCustomTag = () => {
  if (customTag.value.trim() && !selectedTags.includes(customTag.value.trim())) {
    selectedTags.push(customTag.value.trim())
    customTag.value = ''
  }
}

const publish = async () => {
  if (!canPublish.value) return
  
  try {
    isPublishing.value = true
    
    // 构建发帖数据
    const postData = {
      content: content.value,
      type: postType.value,
      tags: [...selectedTags],
      // 暂时不发送图片数据，因为需要先上传到服务器获取URL
      // images: images.map(img => img.url),
    }
    
    // 添加位置信息（如果有填写）
    if (locationData.province || locationData.city || locationData.district || locationData.address) {
      postData.location = {
        province: locationData.province || undefined,
        city: locationData.city || undefined,
        district: locationData.district || undefined,
        address: locationData.address || undefined
      }
      // 移除空值
      Object.keys(postData.location).forEach(key => {
        if (!postData.location[key]) {
          delete postData.location[key]
        }
      })
    }
    
    // 调用API创建帖子
    const result = await postService.createPost(postData)
    
    // API响应拦截器已经处理了错误情况，能到这里说明请求成功
    if (result && result.success) {
      ElMessage.success('发布成功！')
      emit('publish', result.data)
      close()
    } else {
      // 如果没有success字段但有data，说明是成功的响应
      ElMessage.success('发布成功！')
      emit('publish', result.data || result)
      close()
    }
  } catch (error) {
    console.error('发布帖子失败:', error)
    ElMessage.error(error.message || '发布失败，请稍后重试')
  } finally {
    isPublishing.value = false
  }
}

const close = () => {
  content.value = ''
  postType.value = 'share'
  images.splice(0, images.length)
  selectedTags.splice(0, selectedTags.length)
  customTag.value = ''
  locationData.province = ''
  locationData.city = ''
  locationData.district = ''
  locationData.address = ''
  showLocationInput.value = false
  emit('close')
}
</script>
