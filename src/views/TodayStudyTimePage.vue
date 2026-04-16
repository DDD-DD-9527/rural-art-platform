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
          <h1 class="text-lg font-bold text-slate-800">今日学习时长</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 日期选择器 -->
      <div class="glass-card rounded-2xl p-4 mb-6">
        <div class="flex items-center justify-between">
          <button
            @click="prevDay"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon class="w-5 h-5 text-slate-600" />
          </button>
          <div class="text-center">
            <div class="text-lg font-semibold text-slate-800">
              {{ formatDate(selectedDate) }}
            </div>
            <div class="text-sm text-slate-500">
              {{ getDayOfWeek(selectedDate) }}
            </div>
          </div>
          <button
            @click="nextDay"
            :disabled="isToday"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon class="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <!-- 学习统计卡片 -->
      <div class="glass-card rounded-2xl p-6 mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-emerald-50 rounded-xl">
            <div class="text-2xl font-bold text-emerald-600">
              {{ totalMinutes }}
            </div>
            <div class="text-sm text-slate-500">总学习时长(分钟)</div>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-2xl font-bold text-blue-600">
              {{ studySessions.length }}
            </div>
            <div class="text-sm text-slate-500">学习次数</div>
          </div>
          <div class="text-center p-4 bg-violet-50 rounded-xl">
            <div class="text-2xl font-bold text-violet-600">
              {{ completedCourses }}
            </div>
            <div class="text-sm text-slate-500">完成课程</div>
          </div>
          <div class="text-center p-4 bg-amber-50 rounded-xl">
            <div class="text-2xl font-bold text-amber-600">
              {{ earnedPoints }}
            </div>
            <div class="text-sm text-slate-500">获得积分</div>
          </div>
        </div>
      </div>

      <!-- 学习时间轴 -->
      <div class="glass-card rounded-2xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <ClockIcon class="w-5 h-5 mr-2 text-emerald-600" />
          学习时间轴
        </h3>
        <div class="relative">
          <!-- 时间轴线 -->
          <div
            class="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 to-blue-200"
          ></div>

          <div class="space-y-6">
            <div
              v-for="(session, index) in paginatedSessions"
              :key="session.id"
              class="relative flex items-start space-x-4"
            >
              <!-- 时间点 -->
              <div
                class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0 relative z-10"
              >
                <component :is="session.icon" class="w-6 h-6 text-white" />
              </div>

              <!-- 学习内容 -->
              <div
                class="flex-1 bg-white/50 rounded-xl p-4 border border-white/30"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-slate-800">{{
                      session.courseName
                    }}</span>
                    <span
                      class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                      >{{ session.category }}</span
                    >
                  </div>
                  <div class="text-sm text-slate-500">
                    {{ session.startTime }} - {{ session.endTime }}
                  </div>
                </div>
                <p class="text-slate-600 mb-3">{{ session.description }}</p>
                <div class="flex items-center justify-between">
                  <div
                    class="flex items-center space-x-4 text-sm text-slate-500"
                  >
                    <span class="flex items-center">
                      <ClockIcon class="w-4 h-4 mr-1" />
                      {{ session.duration }}分钟
                    </span>
                    <span class="flex items-center">
                      <CheckCircleIcon class="w-4 h-4 mr-1 text-emerald-500" />
                      {{ session.progress }}%
                    </span>
                    <span class="flex items-center">
                      <StarIcon class="w-4 h-4 mr-1 text-amber-500" />
                      +{{ session.points }}积分
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="
                        session.status === 'completed'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      "
                    ></div>
                    <span
                      class="text-sm"
                      :class="
                        session.status === 'completed'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      "
                    >
                      {{ session.status === "completed" ? "已完成" : "进行中" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="glass-card rounded-2xl p-4 mt-6">
        <div class="flex items-center justify-between">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon class="w-4 h-4 mr-1" />
            上一页
          </button>

          <div class="flex items-center space-x-2">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                page === currentPage
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
            <ArrowRightIcon class="w-4 h-4 ml-1" />
          </button>
        </div>

        <div class="text-center mt-4 text-sm text-slate-500">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页，总计
          {{ studySessions.length }} 条记录
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="studySessions.length === 0"
        class="glass-card rounded-2xl p-12 text-center"
      >
        <BookOpenIcon class="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-600 mb-2">
          今日暂无学习记录
        </h3>
        <p class="text-slate-500">开始学习课程，记录你的学习时光吧！</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  PaletteIcon,
  CameraIcon,
} from "lucide-vue-next";

const router = useRouter();

// 日期相关
const selectedDate = ref(new Date());
const isToday = computed(() => {
  const today = new Date();
  return selectedDate.value.toDateString() === today.toDateString();
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);

// 模拟学习记录数据
const allStudySessions = reactive({
  "2024-01-15": [
    {
      id: 1,
      courseName: "传统剪纸基础教程",
      category: "手工艺术",
      description: "学习了基本的剪纸技法，包括对称剪纸和自由剪纸的区别",
      startTime: "09:00",
      endTime: "09:30",
      duration: 30,
      progress: 100,
      points: 15,
      status: "completed",
      icon: PaletteIcon,
    },
    {
      id: 2,
      courseName: "手机摄影技巧",
      category: "数字技能",
      description: "学习了构图法则和光线运用，拍摄了几张练习作品",
      startTime: "14:20",
      endTime: "15:05",
      duration: 45,
      progress: 100,
      points: 20,
      status: "completed",
      icon: CameraIcon,
    },
    {
      id: 3,
      courseName: "民间故事创作",
      category: "文化传承",
      description: "学习了故事结构和人物塑造，开始创作自己的民间故事",
      startTime: "19:30",
      endTime: "20:15",
      duration: 45,
      progress: 80,
      status: "in-progress",
      points: 18,
      icon: BookOpenIcon,
    },
  ],
  "2024-01-14": [
    {
      id: 4,
      courseName: "乡村电商运营",
      category: "数字技能",
      description: "学习了产品拍摄和描述技巧，为自家农产品制作了详情页",
      startTime: "10:00",
      endTime: "11:00",
      duration: 60,
      progress: 100,
      points: 25,
      status: "completed",
      icon: PlayIcon,
    },
    {
      id: 5,
      courseName: "传统织布工艺",
      category: "手工艺术",
      description: "学习了织布机的使用方法和基本织法",
      startTime: "15:00",
      endTime: "16:30",
      duration: 90,
      progress: 100,
      points: 35,
      status: "completed",
      icon: PaletteIcon,
    },
  ],
});

// 计算属性
const studySessions = computed(() => {
  const dateKey = formatDateKey(selectedDate.value);
  return allStudySessions[dateKey] || [];
});

const totalMinutes = computed(() => {
  return studySessions.value.reduce(
    (total, session) => total + session.duration,
    0,
  );
});

const completedCourses = computed(() => {
  return studySessions.value.filter((session) => session.status === "completed")
    .length;
});

const earnedPoints = computed(() => {
  return studySessions.value.reduce(
    (total, session) => total + session.points,
    0,
  );
});

const totalPages = computed(() =>
  Math.ceil(studySessions.value.length / pageSize.value),
);

const paginatedSessions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return studySessions.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("...", total);
    } else if (current >= total - 2) {
      pages.push(1, "...");
      for (let i = total - 3; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, "...");
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push("...", total);
    }
  }

  return pages;
});

// 监听日期变化，重置分页
watch(selectedDate, () => {
  currentPage.value = 1;
});

// 方法
const goBack = () => {
  router.back();
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDayOfWeek = (date) => {
  const days = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return days[date.getDay()];
};

const prevDay = () => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() - 1);
  selectedDate.value = newDate;
};

const nextDay = () => {
  if (!isToday.value) {
    const newDate = new Date(selectedDate.value);
    newDate.setDate(newDate.getDate() + 1);
    selectedDate.value = newDate;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  if (typeof page === "number" && page !== currentPage.value) {
    currentPage.value = page;
  }
};
</script>
