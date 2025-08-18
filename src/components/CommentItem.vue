<template>
  <div class="comment-item bg-white rounded-lg p-4 border border-slate-200">
    <!-- 评论头部 -->
    <div class="flex items-start space-x-3">
      <!-- 用户头像 -->
      <img 
        :src="comment.author?.avatar || '/default-avatar.png'"
        :alt="comment.author?.username"
        class="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      
      <div class="flex-1 min-w-0">
        <!-- 用户信息和时间 -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <h4 class="font-medium text-slate-800 truncate">
              {{ comment.author?.username || '匿名用户' }}
            </h4>
            <span v-if="comment.author?.role === 'expert'" class="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              专家
            </span>
            <span v-if="comment.isPinned" class="px-2 py-0.5 bg-yellow-100 text-yellow-600 text-xs rounded-full">
              置顶
            </span>
          </div>
          <div class="flex items-center space-x-2 text-sm text-slate-500">
            <span>{{ formatTime(comment.createdAt) }}</span>
            <button 
              v-if="canDelete"
              @click="deleteComment"
              class="text-red-500 hover:text-red-600 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
        
        <!-- 评论内容 -->
        <div class="mb-3">
          <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
          
          <!-- 提及的用户 -->
          <div v-if="comment.mentions && comment.mentions.length > 0" class="mt-2">
            <span class="text-sm text-slate-500">提及: </span>
            <span 
              v-for="(mention, index) in comment.mentions" 
              :key="mention.id"
              class="text-sm text-blue-600"
            >
              @{{ mention.username }}<span v-if="index < comment.mentions.length - 1">, </span>
            </span>
          </div>
        </div>
        
        <!-- 评论操作 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <!-- 点赞 -->
            <button 
              @click="toggleLike"
              :class="[
                'flex items-center space-x-1 transition-colors',
                comment.isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
              ]"
            >
              <HeartIcon :class="['w-4 h-4', comment.isLiked ? 'fill-current' : '']" />
              <span class="text-sm">{{ comment.stats?.likeCount || 0 }}</span>
            </button>
            
            <!-- 回复 -->
            <button 
              @click="toggleReplyForm"
              class="flex items-center space-x-1 text-slate-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircleIcon class="w-4 h-4" />
              <span class="text-sm">回复</span>
            </button>
            
            <!-- 回复数量 -->
            <span v-if="comment.stats?.replyCount > 0" class="text-sm text-slate-500">
              {{ comment.stats.replyCount }} 条回复
            </span>
          </div>
          
          <!-- 举报 -->
          <button 
            @click="reportComment"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FlagIcon class="w-4 h-4" />
          </button>
        </div>
        
        <!-- 回复表单 -->
        <CommentForm 
          v-if="showReplyForm"
          :target-type="'Comment'"
          :target-id="comment.id"
          :parent-id="comment.id"
          :root-id="comment.rootId || comment.id"
          :placeholder="`回复 @${comment.author?.username}...`"
          @comment-posted="handleReplyPosted"
          @cancel="showReplyForm = false"
          class="mt-3"
        />
        
        <!-- 回复列表 -->
        <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-3">
          <div 
            v-for="reply in displayedReplies" 
            :key="reply.id"
            class="bg-slate-50 rounded-lg p-3 border-l-2 border-blue-200"
          >
            <CommentItem 
              :comment="reply"
              :target-type="targetType"
              :target-id="targetId"
              :is-reply="true"
              @reply-posted="handleNestedReply"
              @comment-deleted="handleReplyDeleted"
              @comment-liked="handleReplyLiked"
            />
          </div>
          
          <!-- 展开更多回复 -->
          <button 
            v-if="comment.replies.length > displayedReplyCount"
            @click="showMoreReplies"
            class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            展开更多回复 ({{ comment.replies.length - displayedReplyCount }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { HeartIcon, MessageCircleIcon, FlagIcon } from 'lucide-vue-next'
import { commentAPI } from '@/services/api'
import { useUserStore } from '@/stores/user'
import CommentForm from './CommentForm.vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  targetType: {
    type: String,
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  isReply: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reply-posted', 'comment-deleted', 'comment-liked'])

const userStore = useUserStore()
const showReplyForm = ref(false)
const displayedReplyCount = ref(3)

// 计算属性
const canDelete = computed(() => {
  return userStore.user && (
    userStore.user.id === props.comment.author?.id ||
    userStore.user.role === 'admin'
  )
})

const displayedReplies = computed(() => {
  if (!props.comment.replies) return []
  return props.comment.replies.slice(0, displayedReplyCount.value)
})

// 格式化时间
const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 切换点赞
const toggleLike = async () => {
  try {
    const response = await commentAPI.toggleLike(props.comment.id)
    if (response.success) {
      emit('comment-liked', props.comment.id, response.data.isLiked, response.data.likeCount)
    }
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 切换回复表单
const toggleReplyForm = () => {
  if (!authStore.user) {
    // 可以在这里添加登录提示
    alert('请先登录')
    return
  }
  showReplyForm.value = !showReplyForm.value
}

// 处理回复发表
const handleReplyPosted = (reply) => {
  showReplyForm.value = false
  emit('reply-posted', reply, props.comment.id)
}

// 处理嵌套回复
const handleNestedReply = (reply, parentId) => {
  emit('reply-posted', reply, parentId)
}

// 处理回复删除
const handleReplyDeleted = (replyId) => {
  if (props.comment.replies) {
    const index = props.comment.replies.findIndex(r => r.id === replyId)
    if (index > -1) {
      props.comment.replies.splice(index, 1)
      props.comment.stats.replyCount--
    }
  }
}

// 处理回复点赞
const handleReplyLiked = (replyId, isLiked, likeCount) => {
  if (props.comment.replies) {
    const reply = props.comment.replies.find(r => r.id === replyId)
    if (reply) {
      reply.isLiked = isLiked
      reply.stats.likeCount = likeCount
    }
  }
}

// 删除评论
const deleteComment = async () => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const response = await commentAPI.deleteComment(props.comment.id)
    if (response.success) {
      emit('comment-deleted', props.comment.id)
    }
  } catch (error) {
    console.error('删除评论失败:', error)
    alert('删除失败，请重试')
  }
}

// 举报评论
const reportComment = async () => {
  if (!authStore.user) {
    alert('请先登录')
    return
  }
  
  const reason = prompt('请输入举报理由：')
  if (!reason) return
  
  try {
    const response = await commentAPI.reportComment(props.comment.id, reason)
    if (response.success) {
      alert('举报成功，我们会尽快处理')
    }
  } catch (error) {
    console.error('举报失败:', error)
    alert('举报失败，请重试')
  }
}

// 展开更多回复
const showMoreReplies = () => {
  displayedReplyCount.value += 5
}
</script>

<style scoped>
.comment-item {
  @apply transition-all duration-200;
}

.comment-item:hover {
  @apply shadow-sm;
}
</style>