<template>
  <div class="comment-list">
    <!-- 评论统计 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-slate-800">
        评论 ({{ totalCount }})
      </h3>
      <button
        @click="toggleCommentForm"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
      >
        {{ showCommentForm ? "取消" : "发表评论" }}
      </button>
    </div>

    <!-- 发表评论表单 -->
    <CommentForm
      v-if="showCommentForm"
      :target-type="targetType"
      :target-id="targetId"
      @comment-posted="handleCommentPosted"
      @cancel="showCommentForm = false"
      class="mb-6"
    />

    <!-- 评论列表 -->
    <div v-if="loading && comments.length === 0" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"
      ></div>
      <p class="text-slate-500">加载评论中...</p>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8">
      <MessageCircleIcon class="w-12 h-12 mx-auto mb-2 text-slate-300" />
      <p class="text-slate-500">暂无评论</p>
      <p class="text-slate-400 text-sm mt-1">成为第一个发表评论的人吧！</p>
    </div>

    <div v-else class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :target-type="targetType"
        :target-id="targetId"
        @reply-posted="handleReplyPosted"
        @comment-deleted="handleCommentDeleted"
        @comment-liked="handleCommentLiked"
      />
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="text-center mt-6">
      <button
        @click="loadMore"
        :disabled="loading"
        class="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <div
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400 mr-2"
          ></div>
          加载中...
        </span>
        <span v-else>加载更多评论</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { MessageCircleIcon } from "lucide-vue-next";
import { commentAPI } from "@/services/api";
import CommentItem from "./CommentItem.vue";
import CommentForm from "./CommentForm.vue";

const props = defineProps({
  targetType: {
    type: String,
    required: true,
    validator: (value) => ["Post", "Course", "Comment"].includes(value),
  },
  targetId: {
    type: String,
    required: true,
  },
  initialComments: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["comments-updated"]);

// 响应式数据
const comments = ref([]);
const loading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const totalCount = ref(0);
const showCommentForm = ref(false);

// 加载评论列表
const loadComments = async (page = 1) => {
  try {
    loading.value = true;

    const response = await commentAPI.getComments({
      targetType: props.targetType,
      targetId: props.targetId,
      page,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    if (response.success) {
      if (page === 1) {
        comments.value = response.data.comments || [];
      } else {
        comments.value.push(...(response.data.comments || []));
      }

      totalCount.value = response.data.pagination?.totalCount || 0;
      hasMore.value = response.data.pagination?.hasMore || false;
      currentPage.value = page;

      // 通知父组件评论数量更新
      emit("comments-updated", totalCount.value);
    }
  } catch (error) {
    console.error("加载评论失败:", error);
  } finally {
    loading.value = false;
  }
};

// 加载更多评论
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadComments(currentPage.value + 1);
  }
};

// 切换评论表单显示
const toggleCommentForm = () => {
  showCommentForm.value = !showCommentForm.value;
};

// 处理评论发表成功
const handleCommentPosted = (newComment) => {
  comments.value.unshift(newComment);
  totalCount.value++;
  showCommentForm.value = false;
  emit("comments-updated", totalCount.value);
};

// 处理回复发表成功
const handleReplyPosted = (reply, parentCommentId) => {
  const parentComment = comments.value.find((c) => c.id === parentCommentId);
  if (parentComment) {
    if (!parentComment.replies) {
      parentComment.replies = [];
    }
    parentComment.replies.push(reply);
    parentComment.stats.replyCount++;
    totalCount.value++;
    emit("comments-updated", totalCount.value);
  }
};

// 处理评论删除
const handleCommentDeleted = (commentId) => {
  const index = comments.value.findIndex((c) => c.id === commentId);
  if (index > -1) {
    const deletedComment = comments.value[index];
    comments.value.splice(index, 1);
    totalCount.value -= 1 + (deletedComment.stats?.replyCount || 0);
    emit("comments-updated", totalCount.value);
  }
};

// 处理评论点赞
const handleCommentLiked = (commentId, isLiked, likeCount) => {
  const comment = comments.value.find((c) => c.id === commentId);
  if (comment) {
    comment.isLiked = isLiked;
    comment.stats.likeCount = likeCount;
  }
};

// 监听目标变化，重新加载评论
watch(
  () => [props.targetType, props.targetId],
  () => {
    if (props.targetType && props.targetId) {
      currentPage.value = 1;
      hasMore.value = true;
      loadComments(1);
    }
  },
  { immediate: true },
);

// 初始化
onMounted(() => {
  if (props.initialComments.length > 0) {
    comments.value = props.initialComments;
    totalCount.value = props.initialComments.length;
  } else if (props.targetType && props.targetId) {
    loadComments(1);
  }
});
</script>

<style scoped>
.comment-list {
  @apply w-full;
}
</style>
