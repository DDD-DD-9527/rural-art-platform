<template>
  <div class="points-display">
    <!-- 积分概览卡片 -->
    <div class="points-overview glass-card rounded-3xl p-8 mb-8 shadow-xl">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-slate-800">我的积分</h2>
        <button
          @click="refreshData"
          :disabled="loading"
          class="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <RefreshCwIcon
            :class="['w-5 h-5 text-slate-600', { 'animate-spin': loading }]"
          />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- 总积分 -->
        <div class="text-center">
          <div class="relative inline-block">
            <div
              class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl"
            >
              <StarIcon class="w-12 h-12 text-white" />
            </div>
            <div
              class="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full px-2 py-1 text-xs font-bold"
            >
              +{{ recentPoints }}
            </div>
          </div>
          <div class="text-4xl font-bold text-yellow-600 mb-2">
            {{ formatNumber(totalPoints) }}
          </div>
          <div class="text-lg text-slate-600">总积分</div>
          <div class="text-sm text-emerald-600 mt-1">
            今日 +{{ todayPoints }}
          </div>
        </div>

        <!-- 当前等级 -->
        <div class="text-center">
          <div
            class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl relative"
          >
            <TrophyIcon class="w-12 h-12 text-white" />
            <div
              class="absolute -bottom-2 bg-white text-purple-600 rounded-full px-3 py-1 text-sm font-bold shadow-lg"
            >
              Lv.{{ currentLevel }}
            </div>
          </div>
          <div class="text-2xl font-bold text-purple-600 mb-2">
            {{ levelName }}
          </div>
          <div class="text-lg text-slate-600">当前等级</div>

          <!-- 升级进度条 -->
          <div class="mt-4">
            <div class="flex justify-between text-sm text-slate-600 mb-2">
              <span>距离下一级</span>
              <span>{{ pointsToNextLevel }} 积分</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-3">
              <div
                class="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                :style="{ width: `${levelProgress}%` }"
              ></div>
            </div>
            <div class="text-xs text-slate-500 mt-1">
              {{ levelProgress }}% 完成
            </div>
          </div>
        </div>

        <!-- 学习天数 -->
        <div class="text-center">
          <div
            class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl"
          >
            <CalendarIcon class="w-12 h-12 text-white" />
          </div>
          <div class="text-4xl font-bold text-emerald-600 mb-2">
            {{ studyDays }}
          </div>
          <div class="text-lg text-slate-600">学习天数</div>
          <div class="text-sm text-emerald-600 mt-1">
            连续 {{ streakDays }} 天
          </div>
        </div>
      </div>
    </div>

    <!-- 积分获取方式 -->
    <div class="points-sources glass-card rounded-3xl p-8 mb-8 shadow-xl">
      <h3 class="text-2xl font-bold text-slate-800 mb-6">积分获取方式</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="source in pointsSources"
          :key="source.type"
          class="text-center p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
        >
          <div
            :class="[
              'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
              source.bgClass,
            ]"
          >
            <component
              :is="source.icon"
              :class="['w-8 h-8', source.iconClass]"
            />
          </div>
          <div class="text-lg font-bold text-slate-800 mb-2">
            {{ source.title }}
          </div>
          <div class="text-2xl font-bold mb-2" :class="source.pointsClass">
            +{{ source.points }}
          </div>
          <div class="text-sm text-slate-600">{{ source.description }}</div>
        </div>
      </div>
    </div>

    <!-- 积分历史 -->
    <div class="points-history glass-card rounded-3xl p-8 shadow-xl">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-2xl font-bold text-slate-800">积分历史</h3>
        <div class="flex space-x-2">
          <button
            v-for="period in timePeriods"
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              selectedPeriod === period.value
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- 积分历史列表 -->
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div
          v-for="record in filteredHistory"
          :key="record.id"
          class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center',
                getRecordIconBg(record.type),
              ]"
            >
              <component
                :is="getRecordIcon(record.type)"
                :class="['w-6 h-6', getRecordIconColor(record.type)]"
              />
            </div>
            <div>
              <div class="font-semibold text-slate-800">
                {{ record.reason }}
              </div>
              <div class="text-sm text-slate-600">
                {{ formatDate(record.createdAt) }}
              </div>
              <div v-if="record.courseTitle" class="text-xs text-slate-500">
                {{ record.courseTitle }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div
              :class="[
                'text-xl font-bold',
                record.points > 0 ? 'text-emerald-600' : 'text-red-500',
              ]"
            >
              {{ record.points > 0 ? "+" : "" }}{{ record.points }}
            </div>
            <div class="text-sm text-slate-500">积分</div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredHistory.length === 0" class="text-center py-12">
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <HistoryIcon class="w-8 h-8 text-slate-400" />
          </div>
          <div class="text-lg text-slate-600 mb-2">暂无积分记录</div>
          <div class="text-sm text-slate-500">完成课程学习来获取积分吧！</div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMoreHistory" class="text-center mt-6">
        <button
          @click="loadMoreHistory"
          :disabled="loadingHistory"
          class="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <span v-if="loadingHistory">加载中...</span>
          <span v-else>加载更多</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  StarIcon,
  TrophyIcon,
  CalendarIcon,
  RefreshCwIcon,
  BookOpenIcon,
  PlayIcon,
  CheckCircleIcon,
  GiftIcon,
  HistoryIcon,
  ClockIcon,
  AwardIcon,
} from "lucide-vue-next";
import { gamificationApi } from "../services/api.js";

const props = defineProps({
  userId: {
    type: String,
    default: null,
  },
});

// 响应式数据
const loading = ref(false);
const loadingHistory = ref(false);
const error = ref(null);

// 积分统计数据
const pointsStats = ref({
  totalPoints: 0,
  todayPoints: 0,
  recentPoints: 0,
  currentLevel: 1,
  levelName: "新手",
  pointsToNextLevel: 100,
  levelProgress: 0,
  studyDays: 0,
  streakDays: 0,
});

// 积分历史数据
const pointsHistory = ref([]);
const selectedPeriod = ref("week");
const currentPage = ref(1);
const hasMoreHistory = ref(true);

// 计算属性
const totalPoints = computed(() => pointsStats.value.totalPoints);
const todayPoints = computed(() => pointsStats.value.todayPoints);
const recentPoints = computed(() => pointsStats.value.recentPoints);
const currentLevel = computed(() => pointsStats.value.currentLevel);
const levelName = computed(() => pointsStats.value.levelName);
const pointsToNextLevel = computed(() => pointsStats.value.pointsToNextLevel);
const levelProgress = computed(() => pointsStats.value.levelProgress);
const studyDays = computed(() => pointsStats.value.studyDays);
const streakDays = computed(() => pointsStats.value.streakDays);

// 时间周期选项
const timePeriods = [
  { label: "本周", value: "week" },
  { label: "本月", value: "month" },
  { label: "全部", value: "all" },
];

// 积分获取方式
const pointsSources = [
  {
    type: "lesson_complete",
    title: "完成课程",
    points: 50,
    description: "每完成一节课程",
    icon: BookOpenIcon,
    bgClass: "bg-emerald-100",
    iconClass: "text-emerald-600",
    pointsClass: "text-emerald-600",
  },
  {
    type: "daily_login",
    title: "每日签到",
    points: 10,
    description: "每天首次登录",
    icon: CalendarIcon,
    bgClass: "bg-blue-100",
    iconClass: "text-blue-600",
    pointsClass: "text-blue-600",
  },
  {
    type: "streak_bonus",
    title: "连续学习",
    points: 20,
    description: "连续学习奖励",
    icon: ClockIcon,
    bgClass: "bg-purple-100",
    iconClass: "text-purple-600",
    pointsClass: "text-purple-600",
  },
  {
    type: "achievement",
    title: "成就奖励",
    points: 100,
    description: "解锁特殊成就",
    icon: AwardIcon,
    bgClass: "bg-yellow-100",
    iconClass: "text-yellow-600",
    pointsClass: "text-yellow-600",
  },
];

// 过滤后的积分历史
const filteredHistory = computed(() => {
  if (selectedPeriod.value === "all") {
    return pointsHistory.value;
  }

  const now = new Date();
  const filterDate = new Date();

  if (selectedPeriod.value === "week") {
    filterDate.setDate(now.getDate() - 7);
  } else if (selectedPeriod.value === "month") {
    filterDate.setMonth(now.getMonth() - 1);
  }

  return pointsHistory.value.filter(
    (record) => new Date(record.createdAt) >= filterDate,
  );
});

// 方法
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "今天";
  } else if (diffDays === 2) {
    return "昨天";
  } else if (diffDays <= 7) {
    return `${diffDays - 1}天前`;
  } else {
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  }
};

const getRecordIcon = (type) => {
  const iconMap = {
    lesson_complete: BookOpenIcon,
    daily_login: CalendarIcon,
    streak_bonus: ClockIcon,
    achievement: AwardIcon,
    certificate: GiftIcon,
    default: StarIcon,
  };
  return iconMap[type] || iconMap.default;
};

const getRecordIconBg = (type) => {
  const bgMap = {
    lesson_complete: "bg-emerald-100",
    daily_login: "bg-blue-100",
    streak_bonus: "bg-purple-100",
    achievement: "bg-yellow-100",
    certificate: "bg-orange-100",
    default: "bg-slate-100",
  };
  return bgMap[type] || bgMap.default;
};

const getRecordIconColor = (type) => {
  const colorMap = {
    lesson_complete: "text-emerald-600",
    daily_login: "text-blue-600",
    streak_bonus: "text-purple-600",
    achievement: "text-yellow-600",
    certificate: "text-orange-600",
    default: "text-slate-600",
  };
  return colorMap[type] || colorMap.default;
};

// 加载积分统计
const loadPointsStats = async () => {
  try {
    const response = await gamificationApi.getPointsStats(props.userId);
    if (response.success) {
      pointsStats.value = {
        ...pointsStats.value,
        ...response.stats,
      };
    }
  } catch (err) {
    console.error("加载积分统计失败:", err);
    error.value = "加载积分统计失败";
  }
};

// 加载积分历史
const loadPointsHistory = async (page = 1, append = false) => {
  try {
    loadingHistory.value = true;

    const response = await gamificationApi.getPointsHistory({
      userId: props.userId,
      page,
      limit: 20,
    });

    if (response.success) {
      if (append) {
        pointsHistory.value.push(...response.history);
      } else {
        pointsHistory.value = response.history;
      }

      hasMoreHistory.value = response.hasMore;
      currentPage.value = page;
    }
  } catch (err) {
    console.error("加载积分历史失败:", err);
    error.value = "加载积分历史失败";
  } finally {
    loadingHistory.value = false;
  }
};

// 加载更多历史记录
const loadMoreHistory = () => {
  if (!loadingHistory.value && hasMoreHistory.value) {
    loadPointsHistory(currentPage.value + 1, true);
  }
};

// 刷新数据
const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([loadPointsStats(), loadPointsHistory(1, false)]);
  } finally {
    loading.value = false;
  }
};

// 监听时间周期变化
watch(selectedPeriod, () => {
  // 时间周期变化时不需要重新加载数据，只需要重新过滤
});

// 生命周期
onMounted(() => {
  refreshData();
});

// 暴露方法给父组件
defineExpose({
  refresh: refreshData,
  loadStats: loadPointsStats,
  loadHistory: loadPointsHistory,
});
</script>

<style scoped>
.points-display {
  @apply w-full;
}

.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 自定义滚动条 */
.points-history .space-y-4 {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

.points-history .space-y-4::-webkit-scrollbar {
  width: 6px;
}

.points-history .space-y-4::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
}

.points-history .space-y-4::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.points-history .space-y-4::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* 动画效果 */
@keyframes countUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.points-overview .text-4xl {
  animation: countUp 0.6s ease-out;
}
</style>
