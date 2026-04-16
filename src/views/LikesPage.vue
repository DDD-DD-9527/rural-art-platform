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
          <h1 class="text-lg font-bold text-slate-800">我的点赞</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 点赞统计 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="text-center">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center"
          >
            <HeartIcon class="w-10 h-10 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">
            共点赞 {{ likedItems.length }} 个内容
          </h2>
          <p class="text-slate-600">记录您喜欢的精彩内容</p>
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
              type="text"
              placeholder="搜索点赞内容..."
              class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <select
            v-model="filterType"
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">全部类型</option>
            <option value="Post">社区动态</option>
            <option value="Comment">评论</option>
            <option value="Course">课程内容</option>
          </select>
          <select
            v-model="sortBy"
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="recent">最近点赞</option>
            <option value="oldest">最早点赞</option>
          </select>
        </div>
      </div>

      <!-- 点赞内容列表 -->
      <div class="glass-card rounded-3xl p-6">
        <div v-if="filteredLikes.length === 0" class="text-center py-12">
          <HeartIcon class="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p class="text-slate-500 text-lg mb-2">暂无点赞内容</p>
          <p class="text-slate-400 text-sm">去社区发现更多精彩内容吧！</p>
          <button
            @click="goToCommunity"
            class="mt-4 px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
          >
            去社区看看
          </button>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="item in filteredLikes"
            :key="item.id"
            class="bg-white/50 rounded-xl p-6 hover:bg-white/70 transition-colors"
          >
            <!-- 内容头部 -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center space-x-3">
                <img
                  :src="item.author.avatar"
                  :alt="item.author.name"
                  class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h3 class="font-medium text-slate-800">
                    {{ item.author.name }}
                  </h3>
                  <div
                    class="flex items-center space-x-2 text-sm text-slate-500"
                  >
                    <span>{{ item.publishDate }}</span>
                    <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span :class="getTypeColor(item.type)">{{
                      getTypeText(item.type)
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-slate-400"
                  >{{ item.likeDate }} 点赞</span
                >
                <button
                  @click="unlikeItem(item)"
                  class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <HeartIcon class="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            <!-- 内容主体 -->
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-slate-800 mb-2">
                {{ item.title }}
              </h4>
              <p class="text-slate-600 line-clamp-3">{{ item.content }}</p>
            </div>

            <!-- 内容媒体 -->
            <div v-if="item.images && item.images.length > 0" class="mb-4">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <img
                  v-for="(image, index) in item.images.slice(0, 6)"
                  :key="index"
                  :src="image"
                  :alt="`图片 ${index + 1}`"
                  class="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  @click="viewImage(image)"
                />
                <div
                  v-if="item.images.length > 6"
                  class="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-sm"
                >
                  +{{ item.images.length - 6 }}
                </div>
              </div>
            </div>

            <!-- 内容统计 -->
            <div
              class="flex items-center justify-between pt-4 border-t border-slate-200"
            >
              <div class="flex items-center space-x-6 text-sm text-slate-500">
                <span class="flex items-center">
                  <HeartIcon class="w-4 h-4 mr-1" />
                  {{ item.likes }} 点赞
                </span>
                <span class="flex items-center">
                  <MessageCircleIcon class="w-4 h-4 mr-1" />
                  {{ item.comments }} 评论
                </span>
                <span class="flex items-center">
                  <ShareIcon class="w-4 h-4 mr-1" />
                  {{ item.shares }} 分享
                </span>
              </div>
              <button
                @click="viewContent(item)"
                class="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                查看详情
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
          class="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  HeartIcon,
  SearchIcon,
  MessageCircleIcon,
  ShareIcon,
  XIcon,
} from "lucide-vue-next";
import { socialAPI, postAPI } from "@/services/api";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

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
const currentPage = ref(1);
const pageSize = ref(20);
const totalCount = ref(0);
const error = ref("");

// 点赞内容数据
const likedItems = ref([]);

// 加载点赞内容列表
const loadLikedItems = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await socialAPI.getUserLikes({
      page: currentPage.value,
      limit: pageSize.value,
      type: filterType.value === "all" ? undefined : filterType.value,
      sort: sortBy.value,
      search: searchQuery.value,
    });

    // 检查响应数据结构
    if (!response || !response.data || !response.data.likes) {
      console.error("Invalid response structure:", response);
      throw new Error("Invalid response structure");
    }

    // 转换后端数据格式为前端需要的格式
    const formattedLikes = response.data.likes.map((like) => ({
      id: like.id,
      type:
        like.type === "Post"
          ? "post"
          : like.type === "Comment"
            ? "comment"
            : like.type === "Course"
              ? "course"
              : like.type.toLowerCase(),
      targetId: like.target?.id,
      postId: like.target?.id, // 用于评论跳转
      title: like.target?.title || "无标题",
      content: like.target?.content || "无内容",
      images: like.target?.images || [],
      author: {
        name: like.target?.author?.name || "未知用户",
        avatar: like.target?.author?.avatar || "/placeholder-user.jpg",
      },
      publishDate: formatDate(like.target?.createdAt),
      likeDate: formatDate(like.likedAt),
      likes: 0, // 后端没有返回这个字段，设为0
      comments: 0, // 后端没有返回这个字段，设为0
      shares: 0, // 后端没有返回这个字段，设为0
    }));

    if (currentPage.value === 1) {
      likedItems.value = formattedLikes;
    } else {
      likedItems.value.push(...formattedLikes);
    }

    totalCount.value = response.data.pagination.count;
    hasMore.value = currentPage.value < response.data.pagination.total;
  } catch (err) {
    error.value = "加载点赞内容失败";
    console.error("Load liked items error:", err);
  } finally {
    loading.value = false;
  }
};

// 过滤和排序点赞内容（现在主要由后端处理，前端只做展示）
const filteredLikes = computed(() => {
  return likedItems.value;
});

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    artwork: "艺术作品",
    course: "课程内容",
    post: "社区动态",
    comment: "评论",
  };
  return typeMap[type] || "未知类型";
};

// 获取类型颜色
const getTypeColor = (type) => {
  const colorMap = {
    artwork: "text-purple-600",
    course: "text-blue-600",
    post: "text-green-600",
    comment: "text-orange-600",
  };
  return colorMap[type] || "text-slate-600";
};

// 取消点赞
const unlikeItem = async (item) => {
  try {
    // 根据类型调用不同的取消点赞API
    if (item.type === "post") {
      await postAPI.toggleLikePost(item.targetId);
    } else {
      // 其他类型的取消点赞逻辑可以后续添加
      console.warn("暂不支持取消点赞该类型内容:", item.type);
      return;
    }

    // 从列表中移除该项
    const index = likedItems.value.findIndex((i) => i.id === item.id);
    if (index > -1) {
      likedItems.value.splice(index, 1);
      totalCount.value--;
    }
  } catch (err) {
    error.value = "取消点赞失败";
    console.error("Unlike item error:", err);
  }
};

// 查看内容详情
const viewContent = (item) => {
  const routeMap = {
    post: `/community/post/${item.targetId}`,
    course: `/course/${item.targetId}`,
    artwork: `/artwork/${item.targetId}`,
    comment: `/community/post/${item.postId}#comment-${item.targetId}`,
  };
  const route = routeMap[item.type];
  if (route) {
    router.push(route);
  }
};

// 查看图片
const viewImage = (image) => {
  previewImage.value = image;
};

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    currentPage.value++;
    loadLikedItems();
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "未知时间";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? "刚刚" : `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

// 监听筛选和搜索变化
watch(
  [searchQuery, filterType, sortBy],
  () => {
    currentPage.value = 1;
    loadLikedItems();
  },
  { debounce: 300 },
);

onMounted(() => {
  loadLikedItems();
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
