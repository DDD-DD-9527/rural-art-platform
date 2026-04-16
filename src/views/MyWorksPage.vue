<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
  >
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button
            @click="goBack"
            class="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-semibold text-slate-800">我的作品</h1>
          <button @click="showSortMenu = !showSortMenu" class="relative">
            <SlidersHorizontalIcon
              class="w-5 h-5 text-slate-600 hover:text-slate-900 transition-colors"
            />
            <!-- 排序菜单 -->
            <div
              v-if="showSortMenu"
              class="absolute right-0 top-8 w-48 glass-effect rounded-2xl shadow-lg border border-white/20 py-2 z-50"
            >
              <button
                v-for="option in sortOptions"
                :key="option.value"
                @click="changeSortBy(option.value)"
                :class="[
                  'w-full text-left px-4 py-2 text-sm transition-colors',
                  currentSort === option.value
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-slate-700 hover:bg-slate-50',
                ]"
              >
                {{ option.label }}
              </button>
            </div>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 统计信息 -->
      <div class="glass-effect rounded-3xl p-6 mb-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-emerald-600 mb-1">
              {{ statistics.total }}
            </div>
            <div class="text-sm text-slate-600">总作品数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 mb-1">
              {{ statistics.thisMonth }}
            </div>
            <div class="text-sm text-slate-600">本月创作</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 mb-1">
              {{ statistics.totalLikes }}
            </div>
            <div class="text-sm text-slate-600">获得点赞</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600 mb-1">
              {{ statistics.totalViews }}
            </div>
            <div class="text-sm text-slate-600">总浏览量</div>
          </div>
        </div>
      </div>

      <!-- 筛选标签 -->
      <div class="flex flex-wrap gap-3 mb-6">
        <button
          v-for="filter in filterOptions"
          :key="filter.value"
          @click="changeFilter(filter.value)"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
            currentFilter === filter.value
              ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg'
              : 'bg-white/70 text-slate-700 hover:bg-white/90 border border-slate-200',
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- 作品网格 -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="work in filteredWorks"
          :key="work.id"
          class="group relative overflow-hidden rounded-3xl cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          @click="openWork(work)"
        >
          <div class="aspect-square relative">
            <img
              :src="work.image || '/placeholder.svg?height=300&width=300'"
              :alt="work.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"
            ></div>

            <!-- 作品类型标签 -->
            <div class="absolute top-3 left-3">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm',
                  getTypeColor(work.type),
                ]"
              >
                {{ work.type }}
              </span>
            </div>

            <!-- 悬浮操作按钮 -->
            <div
              class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div class="flex space-x-2">
                <button
                  @click.stop="downloadWork(work)"
                  class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <DownloadIcon class="w-4 h-4 text-white" />
                </button>
                <button
                  @click.stop="shareWork(work)"
                  class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <ShareIcon class="w-4 h-4 text-white" />
                </button>
                <button
                  @click.stop="deleteWork(work)"
                  class="w-8 h-8 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors"
                >
                  <TrashIcon class="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <!-- 底部信息 -->
            <div
              class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h3 class="text-white font-semibold text-sm mb-1">
                {{ work.title }}
              </h3>
              <div
                class="flex items-center justify-between text-white/80 text-xs"
              >
                <span>{{ work.createdAt }}</span>
                <div class="flex items-center space-x-3">
                  <div class="flex items-center space-x-1">
                    <HeartIcon class="w-3 h-3" />
                    <span>{{ work.likes }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <EyeIcon class="w-3 h-3" />
                    <span>{{ work.views }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredWorks.length === 0" class="text-center py-16">
        <div
          class="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <ImageIcon class="w-12 h-12 text-slate-500" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">暂无作品</h3>
        <p class="text-slate-600 mb-6">开始你的第一个AI艺术创作吧</p>
        <button
          @click="$router.push('/create')"
          class="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
        >
          开始创作
        </button>
      </div>
    </main>

    <!-- 作品详情模态框 -->
    <div
      v-if="selectedWork"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="closeWorkDetail"
    >
      <div
        class="glass-effect rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-800">
              {{ selectedWork.title }}
            </h2>
            <button
              @click="closeWorkDetail"
              class="text-slate-500 hover:text-slate-700"
            >
              <XIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <img
                :src="
                  selectedWork.image || '/placeholder.svg?height=400&width=400'
                "
                :alt="selectedWork.title"
                class="w-full rounded-2xl"
              />
            </div>

            <div class="space-y-4">
              <div>
                <h3 class="font-semibold text-slate-800 mb-2">作品信息</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-600">创作类型：</span>
                    <span class="text-slate-800">{{ selectedWork.type }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">创作时间：</span>
                    <span class="text-slate-800">{{
                      selectedWork.createdAt
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">点赞数：</span>
                    <span class="text-slate-800">{{ selectedWork.likes }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">浏览量：</span>
                    <span class="text-slate-800">{{ selectedWork.views }}</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedWork.description">
                <h3 class="font-semibold text-slate-800 mb-2">作品描述</h3>
                <p class="text-sm text-slate-600">
                  {{ selectedWork.description }}
                </p>
              </div>

              <div class="flex space-x-3">
                <button
                  @click="downloadWork(selectedWork)"
                  class="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  下载作品
                </button>
                <button
                  @click="shareWork(selectedWork)"
                  class="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  分享作品
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  SlidersHorizontalIcon,
  ImageIcon,
  DownloadIcon,
  ShareIcon,
  TrashIcon,
  HeartIcon,
  EyeIcon,
  XIcon,
} from "lucide-vue-next";
import BottomNavigation from "../components/BottomNavigation.vue";

const router = useRouter();
const activeTab = ref("profile");
const showSortMenu = ref(false);
const currentSort = ref("newest");
const currentFilter = ref("all");
const selectedWork = ref(null);

// 统计信息
const statistics = reactive({
  total: 24,
  thisMonth: 8,
  totalLikes: 156,
  totalViews: 1240,
});

// 排序选项
const sortOptions = reactive([
  { label: "最新创作", value: "newest" },
  { label: "最多点赞", value: "likes" },
  { label: "最多浏览", value: "views" },
  { label: "创作时间", value: "oldest" },
]);

// 筛选选项
const filterOptions = reactive([
  { label: "全部", value: "all" },
  { label: "图片增强", value: "图片增强" },
  { label: "风格转换", value: "风格转换" },
  { label: "图案生成", value: "图案生成" },
  { label: "智能修复", value: "智能修复" },
]);

// 作品数据
const allWorks = reactive([
  {
    id: 1,
    title: "春花剪纸",
    type: "图片增强",
    image: "/original-works-placeholder.png",
    createdAt: "2小时前",
    likes: 24,
    views: 156,
    description:
      "传统剪纸艺术与现代AI技术的完美结合，展现了春天花朵的美丽与生机。",
  },
  {
    id: 2,
    title: "乡村风景",
    type: "风格转换",
    image: "/original-works-placeholder.png",
    createdAt: "1天前",
    likes: 18,
    views: 89,
    description: "将现代摄影作品转换为传统水墨画风格，展现乡村的宁静与美好。",
  },
  {
    id: 3,
    title: "传统花纹",
    type: "图案生成",
    image: "/original-works-placeholder.png",
    createdAt: "3天前",
    likes: 32,
    views: 201,
    description: "AI生成的传统花纹图案，融合了多种民族艺术元素。",
  },
  {
    id: 4,
    title: "古画修复",
    type: "智能修复",
    image: "/original-works-placeholder.png",
    createdAt: "1周前",
    likes: 45,
    views: 312,
    description: "使用AI技术修复的古代绘画作品，重现了历史的艺术魅力。",
  },
  {
    id: 5,
    title: "现代山水",
    type: "风格转换",
    image: "/original-works-placeholder.png",
    createdAt: "1周前",
    likes: 28,
    views: 167,
    description: "现代摄影与传统山水画的艺术融合。",
  },
  {
    id: 6,
    title: "民族图腾",
    type: "图案生成",
    image: "/original-works-placeholder.png",
    createdAt: "2周前",
    likes: 37,
    views: 234,
    description: "基于传统民族图腾元素生成的现代艺术作品。",
  },
]);

// 筛选后的作品
const filteredWorks = computed(() => {
  let works = allWorks;

  // 按类型筛选
  if (currentFilter.value !== "all") {
    works = works.filter((work) => work.type === currentFilter.value);
  }

  // 排序
  switch (currentSort.value) {
    case "likes":
      return [...works].sort((a, b) => b.likes - a.likes);
    case "views":
      return [...works].sort((a, b) => b.views - a.views);
    case "oldest":
      return [...works].reverse();
    default: // newest
      return works;
  }
});

const changeSortBy = (sortBy) => {
  currentSort.value = sortBy;
  showSortMenu.value = false;
};

const changeFilter = (filter) => {
  currentFilter.value = filter;
};

const getTypeColor = (type) => {
  const colors = {
    图片增强: "bg-emerald-500/20 text-emerald-700",
    风格转换: "bg-purple-500/20 text-purple-700",
    图案生成: "bg-orange-500/20 text-orange-700",
    智能修复: "bg-blue-500/20 text-blue-700",
  };
  return colors[type] || "bg-slate-500/20 text-slate-700";
};

const openWork = (work) => {
  selectedWork.value = work;
};

const closeWorkDetail = () => {
  selectedWork.value = null;
};

const downloadWork = (work) => {
  console.log("下载作品:", work.title);
  // 这里添加下载逻辑
};

const shareWork = (work) => {
  console.log("分享作品:", work.title);
  // 这里添加分享逻辑
};

const deleteWork = (work) => {
  if (confirm(`确定要删除作品"${work.title}"吗？`)) {
    const index = allWorks.findIndex((w) => w.id === work.id);
    if (index > -1) {
      allWorks.splice(index, 1);
      statistics.total--;
    }
  }
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.glass-morphism {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
