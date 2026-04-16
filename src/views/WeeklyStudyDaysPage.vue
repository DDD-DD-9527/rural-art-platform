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
          <h1 class="text-lg font-bold text-slate-800">
            {{ currentViewTitle }}
          </h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 时间范围选择器 -->
      <div class="glass-card rounded-2xl p-4 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <button
              @click="viewMode = 'week'"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'week'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50',
              ]"
            >
              本周
            </button>
            <button
              @click="viewMode = 'month'"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                viewMode === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50',
              ]"
            >
              本月
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="prevPeriod"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon class="w-5 h-5 text-slate-600" />
            </button>
            <div class="text-center min-w-[120px]">
              <div class="text-sm font-semibold text-slate-800">
                {{ currentPeriodText }}
              </div>
            </div>
            <button
              @click="nextPeriod"
              :disabled="isCurrentPeriod"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon class="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <!-- 学习统计卡片 -->
      <div class="glass-card rounded-2xl p-6 mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-2xl font-bold text-blue-600">
              {{ studyDaysCount }}
            </div>
            <div class="text-sm text-slate-500">学习天数</div>
          </div>
          <div class="text-center p-4 bg-emerald-50 rounded-xl">
            <div class="text-2xl font-bold text-emerald-600">
              {{ totalStudyMinutes }}
            </div>
            <div class="text-sm text-slate-500">总学习时长(分钟)</div>
          </div>
          <div class="text-center p-4 bg-violet-50 rounded-xl">
            <div class="text-2xl font-bold text-violet-600">
              {{ completedCoursesCount }}
            </div>
            <div class="text-sm text-slate-500">完成课程</div>
          </div>
          <div class="text-center p-4 bg-amber-50 rounded-xl">
            <div class="text-2xl font-bold text-amber-600">
              {{ totalEarnedPoints }}
            </div>
            <div class="text-sm text-slate-500">获得积分</div>
          </div>
        </div>
      </div>

      <!-- 学习日历视图 -->
      <div class="glass-card rounded-2xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <CalendarIcon class="w-5 h-5 mr-2 text-blue-600" />
          学习日历
        </h3>
        <div class="grid grid-cols-7 gap-2 mb-4">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-sm font-medium text-slate-500 py-2"
          >
            {{ day }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="date in calendarDates"
            :key="date.key"
            :class="[
              'aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors cursor-pointer',
              date.isCurrentMonth
                ? date.hasStudy
                  ? 'bg-gradient-to-br from-emerald-100 to-blue-100 text-slate-800 hover:from-emerald-200 hover:to-blue-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
                : 'text-slate-300',
              date.isToday ? 'ring-2 ring-blue-500' : '',
            ]"
            @click="selectDate(date)"
          >
            <span class="font-medium">{{ date.day }}</span>
            <div
              v-if="date.hasStudy && date.isCurrentMonth"
              class="flex items-center mt-1"
            >
              <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></div>
              <span class="text-xs text-emerald-600"
                >{{ date.studyMinutes }}分</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 学习记录列表 -->
      <div class="glass-card rounded-2xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-800 flex items-center">
            <BookOpenIcon class="w-5 h-5 mr-2 text-emerald-600" />
            学习记录详情
          </h3>
          <div class="text-sm text-slate-500">
            共 {{ paginatedStudyRecords.length }} 条记录
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="record in paginatedStudyRecords"
            :key="record.id"
            class="bg-white/50 rounded-xl p-4 border border-white/30"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center"
                >
                  <component :is="record.icon" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <div class="font-semibold text-slate-800">
                    {{ record.date }}
                  </div>
                  <div class="text-sm text-slate-500">
                    {{ record.dayOfWeek }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-emerald-600">
                  {{ record.totalMinutes }}分钟
                </div>
                <div class="text-sm text-slate-500">
                  {{ record.sessionsCount }}次学习
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div
                v-for="session in record.sessions"
                :key="session.id"
                class="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
              >
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-slate-700">{{
                    session.courseName
                  }}</span>
                  <span
                    class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >{{ session.category }}</span
                  >
                </div>
                <div class="flex items-center space-x-3 text-sm text-slate-500">
                  <span>{{ session.duration }}分钟</span>
                  <span class="flex items-center">
                    <StarIcon class="w-3 h-3 mr-1 text-amber-500" />
                    +{{ session.points }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页组件 -->
        <div v-if="totalPages > 1" class="mt-6 pt-4 border-t border-slate-200">
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
                    ? 'bg-blue-500 text-white'
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
            {{ studyRecords.length }} 条记录
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="studyRecords.length === 0"
        class="glass-card rounded-2xl p-12 text-center mt-6"
      >
        <CalendarIcon class="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-600 mb-2">
          {{ currentPeriodText }}暂无学习记录
        </h3>
        <p class="text-slate-500">开始学习课程，建立良好的学习习惯吧！</p>
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
  CalendarIcon,
  BookOpenIcon,
  StarIcon,
  PaletteIcon,
  CameraIcon,
  PlayIcon,
} from "lucide-vue-next";

const router = useRouter();

// 视图模式
const viewMode = ref("week"); // 'week' 或 'month'
const currentDate = ref(new Date());
const selectedDate = ref(new Date());

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);

const allStudyData = reactive({});

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

// 计算属性
const currentViewTitle = computed(() => {
  return viewMode.value === "week" ? "本周学习天数" : "本月学习天数";
});

const currentPeriodText = computed(() => {
  if (viewMode.value === "week") {
    const startOfWeek = getStartOfWeek(currentDate.value);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${formatShortDate(startOfWeek)} - ${formatShortDate(endOfWeek)}`;
  } else {
    return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`;
  }
});

const isCurrentPeriod = computed(() => {
  const now = new Date();
  if (viewMode.value === "week") {
    const currentWeekStart = getStartOfWeek(now);
    const selectedWeekStart = getStartOfWeek(currentDate.value);
    return currentWeekStart.getTime() === selectedWeekStart.getTime();
  } else {
    return (
      now.getFullYear() === currentDate.value.getFullYear() &&
      now.getMonth() === currentDate.value.getMonth()
    );
  }
});

const studyRecords = computed(() => {
  const records = [];
  const dateRange = getCurrentPeriodDates();

  dateRange.forEach((date) => {
    const dateKey = formatDateKey(date);
    const studyData = allStudyData[dateKey];

    if (studyData) {
      records.push({
        id: dateKey,
        date: formatDate(date),
        dayOfWeek: getDayOfWeek(date),
        totalMinutes: studyData.totalMinutes,
        sessionsCount: studyData.sessions.length,
        sessions: studyData.sessions,
        icon: getRandomIcon(),
      });
    }
  });

  return records.sort((a, b) => new Date(b.id) - new Date(a.id));
});

const studyDaysCount = computed(() => studyRecords.value.length);

const totalStudyMinutes = computed(() => {
  return studyRecords.value.reduce(
    (total, record) => total + record.totalMinutes,
    0,
  );
});

const completedCoursesCount = computed(() => {
  return studyRecords.value.reduce(
    (total, record) => total + record.sessionsCount,
    0,
  );
});

const totalEarnedPoints = computed(() => {
  return studyRecords.value.reduce((total, record) => {
    return (
      total +
      record.sessions.reduce(
        (sessionTotal, session) => sessionTotal + session.points,
        0,
      )
    );
  }, 0);
});

const calendarDates = computed(() => {
  const dates = [];
  const startDate = getCalendarStartDate();

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dateKey = formatDateKey(date);
    const studyData = allStudyData[dateKey];
    const isCurrentMonth =
      viewMode.value === "week" ||
      date.getMonth() === currentDate.value.getMonth();

    dates.push({
      key: dateKey,
      day: date.getDate(),
      date: date,
      isCurrentMonth,
      isToday: isToday(date),
      hasStudy: !!studyData,
      studyMinutes: studyData?.totalMinutes || 0,
    });
  }

  return dates;
});

const totalPages = computed(() =>
  Math.ceil(studyRecords.value.length / pageSize.value),
);

const paginatedStudyRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return studyRecords.value.slice(start, end);
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

// 监听视图模式变化，重置分页
watch([viewMode, currentDate], () => {
  currentPage.value = 1;
});

// 方法
const goBack = () => {
  router.back();
};

const prevPeriod = () => {
  const newDate = new Date(currentDate.value);
  if (viewMode.value === "week") {
    newDate.setDate(newDate.getDate() - 7);
  } else {
    newDate.setMonth(newDate.getMonth() - 1);
  }
  currentDate.value = newDate;
};

const nextPeriod = () => {
  if (!isCurrentPeriod.value) {
    const newDate = new Date(currentDate.value);
    if (viewMode.value === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    currentDate.value = newDate;
  }
};

const selectDate = (dateObj) => {
  if (dateObj.hasStudy && dateObj.isCurrentMonth) {
    selectedDate.value = dateObj.date;
    // 可以在这里添加显示该日详细学习记录的逻辑
  }
};

const getCurrentPeriodDates = () => {
  const dates = [];

  if (viewMode.value === "week") {
    const startOfWeek = getStartOfWeek(currentDate.value);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
  } else {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }
  }

  return dates;
};

const getStartOfWeek = (date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);
  return startOfWeek;
};

const getCalendarStartDate = () => {
  if (viewMode.value === "week") {
    return getStartOfWeek(currentDate.value);
  } else {
    const firstDayOfMonth = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      1,
    );
    return getStartOfWeek(firstDayOfMonth);
  }
};

const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}月${day}日`;
};

const formatShortDate = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
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

const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const getRandomIcon = () => {
  const icons = [PaletteIcon, CameraIcon, PlayIcon, BookOpenIcon];
  return icons[Math.floor(Math.random() * icons.length)];
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
