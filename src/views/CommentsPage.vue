<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50"
  >
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button
            @click="goBack"
            class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">我的评论</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 评论统计 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="text-center">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center"
          >
            <MessageCircleIcon class="w-10 h-10 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">
            共发表 {{ comments.length }} 条评论
          </h2>
          <p class="text-slate-600">记录您的观点和想法</p>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <SearchIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
            />
            <input
              v-model="searchQuery"
              @input="handleSearchChange"
              type="text"
              placeholder="搜索评论内容..."
              class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            v-model="filterType"
            @change="handleFilterChange"
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部类型</option>
            <option value="artwork">艺术作品</option>
            <option value="course">课程内容</option>
            <option value="post">社区动态</option>
          </select>
          <select
            v-model="sortBy"
            @change="handleSortChange"
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">最新评论</option>
            <option value="earliest">最早评论</option>
            <option value="popular">最多点赞</option>
          </select>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="glass-card rounded-3xl p-6">
        <div v-if="filteredComments.length === 0" class="text-center py-12">
          <MessageCircleIcon class="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p class="text-slate-500 text-lg mb-2">暂无评论</p>
          <p class="text-slate-400 text-sm">去社区参与讨论，发表您的观点吧！</p>
          <button
            @click="goToCommunity"
            class="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            去社区看看
          </button>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="comment in filteredComments"
            :key="comment.id"
            class="bg-white/50 rounded-xl p-6 hover:bg-white/70 transition-colors"
          >
            <!-- 评论头部 -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div
                    class="flex items-center space-x-2 text-sm text-slate-500"
                  >
                    <span>{{ comment.date }}</span>
                    <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span :class="getTypeColor(comment.targetType)">{{
                      getTypeText(comment.targetType)
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="editComment(comment)"
                  class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <EditIcon class="w-4 h-4" />
                </button>
                <button
                  @click="deleteComment(comment)"
                  class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- 原内容信息 -->
            <div class="mb-4 p-4 bg-slate-50 rounded-xl">
              <div class="flex items-center space-x-3 mb-2">
                <img
                  :src="
                    comment.target.author?.avatar || '/placeholder-user.jpg'
                  "
                  :alt="comment.target.author?.nickname || '用户'"
                  class="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                />
                <div>
                  <h4 class="font-medium text-slate-800 text-sm">
                    {{
                      comment.target.author?.nickname ||
                      comment.target.author?.username ||
                      "匿名用户"
                    }}
                  </h4>
                </div>
              </div>
              <h5 class="font-medium text-slate-700 mb-2">
                {{ comment.target.title }}
              </h5>
              <p class="text-sm text-slate-600 line-clamp-2">
                {{ comment.target.content }}
              </p>
            </div>

            <!-- 我的评论内容 -->
            <div class="mb-4">
              <div class="flex items-start space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                  alt="我的头像"
                  class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div class="flex-1">
                  <div class="bg-blue-50 rounded-xl p-4">
                    <p class="text-slate-800">{{ comment.content }}</p>
                  </div>

                  <!-- 评论图片 -->
                  <div
                    v-if="comment.images && comment.images.length > 0"
                    class="mt-3"
                  >
                    <div class="grid grid-cols-3 gap-2">
                      <img
                        v-for="(image, index) in comment.images.slice(0, 3)"
                        :key="index"
                        :src="image"
                        :alt="`评论图片 ${index + 1}`"
                        class="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        @click="viewImage(image)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 评论统计和操作 -->
            <div
              class="flex items-center justify-between pt-4 border-t border-slate-200"
            >
              <div class="flex items-center space-x-6 text-sm text-slate-500">
                <span class="flex items-center">
                  <HeartIcon class="w-4 h-4 mr-1" />
                  {{ comment.likes }} 点赞
                </span>
                <span class="flex items-center">
                  <MessageCircleIcon class="w-4 h-4 mr-1" />
                  {{ comment.replies }} 回复
                </span>
              </div>
              <button
                @click="viewOriginal(comment)"
                class="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                查看原内容
              </button>
            </div>

            <!-- 回复列表 -->
            <div
              v-if="comment.recentReplies && comment.recentReplies.length > 0"
              class="mt-4 pl-6"
            >
              <div class="space-y-3">
                <div
                  v-for="reply in comment.recentReplies"
                  :key="reply.id"
                  class="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg"
                >
                  <img
                    :src="reply.author.avatar"
                    :alt="reply.author.name"
                    class="w-6 h-6 rounded-full object-cover"
                  />
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="text-sm font-medium text-slate-700">{{
                        reply.author.name
                      }}</span>
                      <span class="text-xs text-slate-400">{{
                        reply.date
                      }}</span>
                    </div>
                    <p class="text-sm text-slate-600">{{ reply.content }}</p>
                  </div>
                </div>
              </div>
              <button
                v-if="comment.replies > comment.recentReplies.length"
                class="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                查看全部 {{ comment.replies }} 条回复
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="text-center mt-8">
        <button
          @click="loadMore"
          :disabled="loading"
          class="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center">
            <div
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            ></div>
            加载中...
          </span>
          <span v-else>加载更多</span>
        </button>
      </div>
    </main>

    <!-- 图片预览模态框 -->
    <div
      v-if="previewImage"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="relative max-w-4xl max-h-full">
        <img
          :src="previewImage"
          alt="预览图片"
          class="max-w-full max-h-full object-contain rounded-lg"
        />
        <button
          @click="previewImage = null"
          class="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  MessageCircleIcon,
  SearchIcon,
  HeartIcon,
  EditIcon,
  TrashIcon,
  XIcon,
} from "lucide-vue-next";
import { commentAPI } from "@/services/api";

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goToCommunity = () => {
  router.push("/community");
};

// 搜索和筛选
const searchQuery = ref("");
const filterType = ref("all");
const sortBy = ref("recent");
const loading = ref(false);
const hasMore = ref(true);
const previewImage = ref(null);
const error = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

// 评论数据
const comments = ref([]);
const totalCount = ref(0);

// 加载我的评论
const loadMyComments = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await commentAPI.getMyComments({
      page: currentPage.value,
      limit: pageSize.value,
      type: filterType.value !== "all" ? filterType.value : undefined,
      search: searchQuery.value || undefined,
      sort: sortBy.value,
    });

    if (response.success) {
      if (currentPage.value === 1) {
        comments.value = response.data.list;
      } else {
        comments.value.push(...response.data.list);
      }
      totalCount.value = response.data.pagination?.total || 0;
      hasMore.value =
        currentPage.value < (response.data.pagination?.pages || 1);
    }
  } catch (err) {
    error.value = "加载评论失败";
    console.error("Load comments error:", err);
  } finally {
    loading.value = false;
  }
};

// 过滤和排序评论（现在由后端处理）
const filteredComments = computed(() => {
  return comments.value;
});

// 重新加载评论（当筛选条件改变时）
const reloadComments = () => {
  currentPage.value = 1;
  loadMyComments();
};

// 监听筛选条件变化
const handleFilterChange = () => {
  reloadComments();
};

const handleSearchChange = () => {
  reloadComments();
};

const handleSortChange = () => {
  reloadComments();
};

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    artwork: "艺术作品",
    course: "课程内容",
    post: "社区动态",
  };
  return typeMap[type] || "未知类型";
};

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    artwork: "text-purple-600",
    course: "text-blue-600",
    post: "text-green-600",
  };
  return colorMap[type] || "text-slate-600";
};

// 编辑评论
const editComment = async (comment) => {
  try {
    // 这里可以打开编辑对话框或跳转到编辑页面
    console.log("编辑评论:", comment.content);
  } catch (err) {
    console.error("Edit comment error:", err);
  }
};

// 删除评论
const deleteComment = async (comment) => {
  try {
    const response = await commentAPI.deleteComment(comment.id);
    if (response.success) {
      const index = comments.value.findIndex((c) => c.id === comment.id);
      if (index > -1) {
        comments.value.splice(index, 1);
        totalCount.value--;
      }
    }
  } catch (err) {
    console.error("Delete comment error:", err);
  }
};

// 查看原内容
const viewOriginal = (comment) => {
  // 根据内容类型跳转到对应页面
  if (comment.target && comment.target.id) {
    const routeMap = {
      artwork: "/artwork/",
      course: "/course/",
      post: "/post/",
    };
    const basePath = routeMap[comment.targetType] || "/post/";
    router.push(basePath + comment.target.id);
  }
};

// 查看图片
const viewImage = (image) => {
  previewImage.value = image;
};

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    currentPage.value++;
    loadMyComments();
  }
};

onMounted(() => {
  loadMyComments();
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-morphism {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
