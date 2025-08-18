<template>
  <div class="glass-effect rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
    <div class="p-6">
      <!-- Post Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <img
            :src="(post.author?.profile?.avatar || post.user?.avatar) || '/placeholder.svg?height=40&width=40'"
            :alt="post.author?.profile?.nickname || post.user?.name || '用户'"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 class="font-semibold text-slate-800">{{ post.author?.profile?.nickname || post.author?.username || post.user?.name || '匿名用户' }}</h4>
            <div class="flex items-center text-sm text-slate-500 space-x-2">
              <div class="flex items-center">
                <MapPinIcon class="w-3 h-3 mr-1" />
                {{ post.location?.city || post.user?.location || '未知位置' }}
              </div>
              <span>·</span>
              <span>{{ post.time || post.createdAt }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            v-if="!(post.author?.isFollowing || post.user?.isFollowing)"
            @click="followUser"
            :disabled="isFollowing"
            class="px-4 py-1 text-sm border border-emerald-200 text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isFollowing ? '关注中...' : '关注' }}
          </button>
          <button class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <MoreHorizontalIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Post Content -->
      <div class="mb-4">
        <p class="text-slate-800 leading-relaxed mb-4">{{ post.content }}</p>

        <!-- Post Images -->
        <div v-if="post.images && post.images.length > 0" class="mb-4">
          <div :class="[
            'grid gap-2',
            post.images.length === 1 ? 'grid-cols-1' :
            post.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-3'
          ]">
            <div 
              v-for="(image, index) in post.images" 
              :key="index"
              class="relative overflow-hidden rounded-xl group cursor-pointer"
            >
              <img
                :src="image || '/placeholder.svg?height=200&width=200'"
                :alt="`Post image ${index + 1}`"
                :class="[
                  'w-full object-cover group-hover:scale-105 transition-transform duration-300',
                  post.images.length === 1 ? 'h-64' : 'h-32'
                ]"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
          </div>
        </div>

        <!-- Post Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Post Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-100">
        <div class="flex items-center space-x-6">
          <button 
            @click="toggleLike"
            :disabled="isLiking"
            :class="[
              'flex items-center space-x-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              post.isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-slate-600 hover:text-red-500'
            ]"
          >
            <HeartIcon :class="['w-4 h-4', post.isLiked ? 'fill-current' : '']" />
            <span>{{ post.stats?.likeCount || post.likes || 0 }}</span>
          </button>
          <button 
            @click="toggleComments"
            :class="[
              'flex items-center space-x-2 text-sm font-medium transition-colors',
              showComments ? 'text-blue-500' : 'text-slate-600 hover:text-blue-500'
            ]"
          >
            <MessageCircleIcon class="w-4 h-4" />
            <span>{{ commentCount }}</span>
          </button>
        </div>

        <div v-if="post.reward > 0" class="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
          <GiftIcon class="w-4 h-4 mr-1" />
          +{{ post.reward }}积分
        </div>
      </div>
      
      <!-- Comments Section -->
      <div v-if="showComments" class="mt-4 pt-4 border-t border-slate-100">
        <CommentList 
          :target-type="'Post'"
          :target-id="post._id || post.id"
          @comments-updated="updateCommentCount"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  MapPinIcon, 
  MoreHorizontalIcon, 
  HeartIcon, 
  MessageCircleIcon, 
  GiftIcon 
} from 'lucide-vue-next'
import { postService } from '@/services/postService'
import { socialAPI } from '@/services/api'
import { ElMessage } from 'element-plus'
import CommentList from './CommentList.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const isLiking = ref(false)
const isFollowing = ref(false)
const showComments = ref(false)
const commentCount = ref(props.post.stats?.commentCount || props.post.comments || 0)

// 切换评论显示
const toggleComments = () => {
  showComments.value = !showComments.value
}

// 更新评论数量
const updateCommentCount = (newCount) => {
  commentCount.value = newCount
  // 同步更新post对象中的评论数
  if (props.post.stats) {
    props.post.stats.commentCount = newCount
  }
  props.post.comments = newCount
}

const followUser = async () => {
  if (isFollowing.value) return
  
  try {
    isFollowing.value = true
    const userId = props.post.author?._id || props.post.author?.id || props.post.user?.id
    
    if (!userId) {
      ElMessage.error('用户信息不完整')
      return
    }
    
    const response = await socialAPI.followUser(userId)
    
    if (response.success) {
      // 更新本地状态
      if (props.post.author) {
        props.post.author.isFollowing = true
      }
      if (props.post.user) {
        props.post.user.isFollowing = true
      }
      ElMessage.success('关注成功')
    } else {
      ElMessage.error(response.message || '关注失败')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error('关注失败，请稍后重试')
  } finally {
    isFollowing.value = false
  }
}

const toggleLike = async () => {
  if (isLiking.value) return
  
  try {
    isLiking.value = true
    const response = await postService.toggleLikePost(props.post._id || props.post.id)
    
    // API响应拦截器直接返回了后端data字段的内容，所以response就是{isLiked, likeCount}
    if (response && typeof response.isLiked === 'boolean' && typeof response.likeCount === 'number') {
      // 更新本地状态
      props.post.isLiked = response.isLiked
      props.post.stats = props.post.stats || {}
      props.post.stats.likeCount = response.likeCount
      // 兼容旧的数据结构
      props.post.likes = response.likeCount
      
      // 显示成功消息
      ElMessage.success(response.isLiked ? '点赞成功' : '取消点赞成功')
    } else {
      ElMessage.error('操作失败')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    isLiking.value = false
  }
}
</script>
