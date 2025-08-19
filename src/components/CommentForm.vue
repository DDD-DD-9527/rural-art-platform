<template>
  <div class="comment-form bg-slate-50 rounded-lg p-4 border border-slate-200">
    <div class="flex items-start space-x-3">
      <!-- 用户头像 -->
      <img 
        :src="currentUser?.avatar || '/default-avatar.png'"
        :alt="currentUser?.username"
        class="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      
      <div class="flex-1">
        <!-- 输入框 -->
        <textarea
          v-model="content"
          :placeholder="placeholder"
          :disabled="submitting"
          @keydown.ctrl.enter="submitComment"
          @keydown.meta.enter="submitComment"
          class="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          :class="{
            'bg-slate-100 cursor-not-allowed': submitting,
            'border-red-300 focus:ring-red-500': error
          }"
          rows="3"
          maxlength="1000"
        ></textarea>
        
        <!-- 字数统计和错误提示 -->
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center space-x-4">
            <span 
              :class="[
                'text-sm',
                content.length > 900 ? 'text-red-500' : 'text-slate-500'
              ]"
            >
              {{ content.length }}/1000
            </span>
            <span v-if="error" class="text-sm text-red-500">{{ error }}</span>
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- 提及功能提示 -->
            <span class="text-xs text-slate-400 hidden sm:inline">
              Ctrl+Enter 发送
            </span>
            
            <!-- 操作按钮 -->
            <button 
              @click="$emit('cancel')"
              :disabled="submitting"
              class="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button 
              @click="submitComment"
              :disabled="!canSubmit || submitting"
              class="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submitting" class="flex items-center">
                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                发送中...
              </span>
              <span v-else>{{ isReply ? '回复' : '发表评论' }}</span>
            </button>
          </div>
        </div>
        
        <!-- 提及建议 -->
        <div 
          v-if="showMentionSuggestions && mentionSuggestions.length > 0"
          class="mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto"
        >
          <button
            v-for="(user, index) in mentionSuggestions"
            :key="user.id"
            @click="selectMention(user)"
            :class="[
              'w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center space-x-2',
              index === selectedMentionIndex ? 'bg-blue-50' : ''
            ]"
          >
            <img 
              :src="user.avatar || '/default-avatar.png'"
              :alt="user.username"
              class="w-6 h-6 rounded-full object-cover"
            />
            <div>
              <div class="font-medium text-sm">{{ user.username }}</div>
              <div v-if="user.role === 'expert'" class="text-xs text-blue-600">专家</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { commentAPI, userAPI } from '@/services/api'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  targetType: {
    type: String,
    required: true,
    validator: (value) => ['Post', 'Course', 'Comment'].includes(value)
  },
  targetId: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    default: null
  },
  rootId: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: '写下你的评论...'
  }
})

const emit = defineEmits(['comment-posted', 'cancel'])

const userStore = useUserStore()
const content = ref('')
const submitting = ref(false)
const error = ref('')

// 提及功能相关
const showMentionSuggestions = ref(false)
const mentionSuggestions = ref([])
const selectedMentionIndex = ref(0)
const mentionQuery = ref('')
const mentionStartPos = ref(-1)

// 计算属性
const currentUser = computed(() => userStore.user)
const isReply = computed(() => !!props.parentId)
const canSubmit = computed(() => {
  return content.value && content.value.trim().length > 0 && content.value.length <= 1000 && !submitting.value
})

// 监听内容变化，处理@提及
watch(content, async (newContent) => {
  error.value = ''
  
  // 检查是否有@符号
  const cursorPos = newContent.length
  const beforeCursor = newContent.substring(0, cursorPos)
  const atMatch = beforeCursor.match(/@([\w\u4e00-\u9fa5]*)$/)
  
  if (atMatch) {
    mentionQuery.value = atMatch[1]
    mentionStartPos.value = atMatch.index
    
    if (mentionQuery.value.length >= 1) {
      await searchUsers(mentionQuery.value)
    } else {
      showMentionSuggestions.value = false
    }
  } else {
    showMentionSuggestions.value = false
  }
})

// 搜索用户
const searchUsers = async (query) => {
  try {
    const response = await userAPI.searchUsers({ 
      keyword: query, 
      limit: 5 
    })
    
    if (response.success && response.data.users) {
      mentionSuggestions.value = response.data.users
      showMentionSuggestions.value = true
      selectedMentionIndex.value = 0
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
  }
}

// 选择提及用户
const selectMention = (user) => {
  const beforeMention = content.value.substring(0, mentionStartPos.value)
  const afterMention = content.value.substring(mentionStartPos.value + mentionQuery.value.length + 1)
  
  content.value = beforeMention + `@${user.username} ` + afterMention
  showMentionSuggestions.value = false
}

// 提交评论
const submitComment = async () => {
  if (!canSubmit.value) return
  
  try {
    submitting.value = true
    error.value = ''
    
    // 提取提及的用户
    const mentions = extractMentions(content.value)
    
    const commentData = {
      content: content.value ? content.value.trim() : '',
      targetType: props.targetType,
      targetId: props.targetId,
      parentId: props.parentId,
      rootId: props.rootId,
      mentions: mentions.map(m => m.id)
    }
    
    const response = await commentAPI.createComment(commentData)
    
    if (response.success) {
      emit('comment-posted', response.data)
      content.value = ''
    } else {
      error.value = response.message || '发表评论失败'
    }
  } catch (err) {
    console.error('发表评论失败:', err)
    error.value = err.response?.data?.message || '发表评论失败，请重试'
  } finally {
    submitting.value = false
  }
}

// 提取提及的用户
const extractMentions = (text) => {
  const mentionRegex = /@([\w\u4e00-\u9fa5]+)/g
  const mentions = []
  let match
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1]
    // 这里应该根据用户名查找用户ID，简化处理
    const user = mentionSuggestions.value.find(u => u.username === username)
    if (user) {
      mentions.push(user)
    }
  }
  
  return mentions
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (showMentionSuggestions.value) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      selectedMentionIndex.value = Math.min(
        selectedMentionIndex.value + 1,
        mentionSuggestions.value.length - 1
      )
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      selectedMentionIndex.value = Math.max(selectedMentionIndex.value - 1, 0)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (mentionSuggestions.value[selectedMentionIndex.value]) {
        selectMention(mentionSuggestions.value[selectedMentionIndex.value])
      }
    } else if (event.key === 'Escape') {
      showMentionSuggestions.value = false
    }
  }
}

// 组件挂载时添加键盘事件监听
nextTick(() => {
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听
// 注意：在Vue 3的setup中，需要在onUnmounted中清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.comment-form {
  @apply transition-all duration-200;
}

.comment-form:focus-within {
  @apply ring-2 ring-blue-500 ring-opacity-20;
}
</style>