<template>
  <div
    class="glass-effect rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div class="p-6">
      <!-- Post Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <img
            :src="
              post.author?.profile?.avatar ||
              post.user?.avatar ||
              '/placeholder.svg?height=40&width=40'
            "
            :alt="post.author?.profile?.nickname || post.user?.name || '用户'"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 class="font-semibold text-slate-800">
              {{
                post.author?.profile?.nickname ||
                post.author?.username ||
                post.user?.name ||
                "匿名用户"
              }}
            </h4>
            <div class="flex items-center text-sm text-slate-500 space-x-2">
              <div class="flex items-center">
                <MapPinIcon class="w-3 h-3 mr-1" />
                {{ post.location?.city || post.user?.location || "未知位置" }}
              </div>
              <span>·</span>
              <span>{{ post.time || post.createdAt }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- 不是自己的帖子才显示关注按钮 -->
          <template v-if="!isOwnPost">
            <button
              v-if="!isUserFollowed"
              @click="followUser"
              :disabled="isFollowing"
              class="px-4 py-1 text-sm border border-emerald-200 text-emerald-600 rounded-full hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isFollowing ? "关注中..." : "+ 关注" }}
            </button>
            <button
              v-else
              @click="unfollowUser"
              :disabled="isFollowing"
              class="px-4 py-1 text-sm bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isFollowing ? "处理中..." : "✓ 已关注" }}
            </button>
          </template>
          <button
            class="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MoreHorizontalIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Post Content -->
      <div class="mb-4">
        <p class="text-slate-800 leading-relaxed mb-4">{{ post.content }}</p>

        <!-- Post Images -->
        <div v-if="post.images && post.images.length > 0" class="mb-4">
          <div
            :class="[
              'grid gap-2',
              post.images.length === 1
                ? 'grid-cols-1'
                : post.images.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-3',
            ]"
          >
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
                  post.images.length === 1 ? 'h-64' : 'h-32',
                ]"
              />
              <div
                class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"
              ></div>
            </div>
          </div>
        </div>

        <!-- Post Tags -->
        <div
          v-if="post.tags && post.tags.length > 0"
          class="flex flex-wrap gap-2"
        >
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
      <div
        class="flex items-center justify-between pt-4 border-t border-slate-100"
      >
        <div class="flex items-center space-x-6">
          <button
            @click="toggleLike"
            :disabled="isLiking"
            :class="[
              'flex items-center space-x-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
              isLiked
                ? 'text-red-500 hover:text-red-600'
                : 'text-slate-600 hover:text-red-500',
            ]"
          >
            <HeartIcon :class="['w-4 h-4', isLiked ? 'fill-current' : '']" />
            <span>{{ likeCount }}</span>
          </button>
          <button
            @click="toggleComments"
            :class="[
              'flex items-center space-x-2 text-sm font-medium transition-colors',
              showComments
                ? 'text-blue-500'
                : 'text-slate-600 hover:text-blue-500',
            ]"
          >
            <MessageCircleIcon class="w-4 h-4" />
            <span>{{ commentCount }}</span>
          </button>
        </div>

        <div
          v-if="post.reward > 0"
          class="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full"
        >
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
import { ref, computed, onMounted, watch } from "vue";
import {
  MapPinIcon,
  MoreHorizontalIcon,
  HeartIcon,
  MessageCircleIcon,
  GiftIcon,
} from "lucide-vue-next";
import { postService } from "@/services/postService";
import { socialAPI } from "@/services/api";
import { ElMessage } from "element-plus";
import { useSocialStore } from "@/stores/social";
import { useUserStore } from "@/stores/user";
import CommentList from "./CommentList.vue";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const socialStore = useSocialStore();
const userStore = useUserStore();
const showComments = ref(false);
const commentCount = ref(
  props.post.stats?.commentCount || props.post.comments || 0,
);
const isFollowing = ref(false);
const isLiking = ref(false);

// 计算是否为当前用户自己的帖子
const isOwnPost = computed(() => {
  const authorId =
    props.post.author?._id || props.post.author?.id || props.post.user?.id;
  const currentUserId = userStore.user.id;
  return authorId === currentUserId;
});

// 计算用户是否已被关注
const isUserFollowed = computed(() => {
  const authorId =
    props.post.author?._id || props.post.author?.id || props.post.user?.id;
  if (!authorId) {
    console.log("🚫 PostCard: 无法获取作者ID");
    return false;
  }
  const followState = socialStore.getUserFollowState(authorId);
  console.log(`👤 PostCard: 作者 ${authorId} 关注状态:`, followState);
  return followState;
});

// 计算点赞状态
const isLiked = computed(() => {
  const postId = props.post._id || props.post.id;
  if (!postId) {
    console.log("🚫 PostCard: 无法获取帖子ID");
    return false;
  }
  const likeState = socialStore.getPostLikeState(postId);
  console.log(`❤️ PostCard: 帖子 ${postId} 点赞状态:`, likeState);
  return likeState;
});

// 计算点赞数
const likeCount = computed(() => {
  const postId = props.post._id || props.post.id;
  if (!postId) {
    const fallbackCount = props.post.stats?.likeCount || props.post.likes || 0;
    console.log(
      "🚫 PostCard: 无法获取帖子ID，使用fallback点赞数:",
      fallbackCount,
    );
    return fallbackCount;
  }
  const storeCount = socialStore.getPostLikeCount(postId);
  console.log(`🔢 PostCard: 帖子 ${postId} 点赞数:`, storeCount);
  return storeCount;
});

// 初始化组件状态
onMounted(() => {
  // 将当前帖子状态同步到store
  socialStore.initializePostsState([props.post]);
});

// 监听帖子变化，同步状态
watch(
  () => props.post,
  (newPost) => {
    if (newPost) {
      socialStore.initializePostsState([newPost]);
    }
  },
  { deep: true },
);

// 切换评论显示
const toggleComments = () => {
  showComments.value = !showComments.value;
};

// 更新评论数量
const updateCommentCount = (newCount) => {
  commentCount.value = newCount;
  // 同步更新post对象中的评论数
  if (props.post.stats) {
    props.post.stats.commentCount = newCount;
  }
  props.post.comments = newCount;
};

const followUser = async () => {
  const userId =
    props.post.author?._id || props.post.author?.id || props.post.user?.id;
  if (!userId) {
    ElMessage.error("用户信息不完整，无法执行关注操作");
    return;
  }

  // 检查是否试图关注自己
  if (isOwnPost.value) {
    ElMessage.warning("不能关注自己哦 😊");
    return;
  }

  isFollowing.value = true;
  try {
    await socialStore.followUser(userId);
    // store中已有成功提示，这里不需要重复显示
  } catch (error) {
    console.error("关注操作失败:", error);
    // store中已处理大部分错误提示，这里只处理特殊情况
    if (error.message && error.message.includes("不能关注自己")) {
      ElMessage.warning("不能关注自己哦 😊");
    }
  } finally {
    isFollowing.value = false;
  }
};

const unfollowUser = async () => {
  const userId =
    props.post.author?._id || props.post.author?.id || props.post.user?.id;
  if (!userId) {
    ElMessage.error("用户信息不完整，无法执行取消关注操作");
    return;
  }

  isFollowing.value = true;
  try {
    await socialStore.unfollowUser(userId);
    // store中已有成功提示，这里不需要重复显示
  } catch (error) {
    console.error("取消关注操作失败:", error);
    // store中已处理错误提示，这里不需要重复处理
  } finally {
    isFollowing.value = false;
  }
};

const toggleLike = async () => {
  const postId = props.post._id || props.post.id;
  if (!postId) {
    console.log("🚫 PostCard: 点赞操作失败，无法获取帖子ID");
    ElMessage.error("帖子信息不完整，无法执行点赞操作");
    return;
  }

  console.log(`🔄 PostCard: 开始切换帖子 ${postId} 的点赞状态`);
  console.log(
    `🔄 PostCard: 当前状态 - 点赞: ${isLiked.value}, 点赞数: ${likeCount.value}`,
  );

  isLiking.value = true;
  try {
    const result = await socialStore.togglePostLike(postId);
    console.log(`✅ PostCard: 点赞操作完成:`, result);
    // 不需要显示成功消息，UI变化已经足够反馈
  } catch (error) {
    console.error("❌ PostCard: 点赞操作失败:", error);
    ElMessage.error("点赞操作失败，请稍后重试");
  } finally {
    isLiking.value = false;
  }
};
</script>
