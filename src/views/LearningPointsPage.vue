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
          <h1 class="text-lg font-bold text-slate-800">学习积分</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 积分统计卡片 -->
      <div class="glass-card rounded-3xl p-6 mb-6">
        <div class="text-center mb-6">
          <div class="text-4xl font-bold text-blue-600 mb-2">
            {{ currentPoints }}
          </div>
          <div class="text-slate-600">当前积分余额</div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-xl font-bold text-emerald-600 mb-1">
              {{ totalEarned }}
            </div>
            <div class="text-sm text-slate-500">累计获得</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-rose-600 mb-1">
              {{ totalSpent }}
            </div>
            <div class="text-sm text-slate-500">累计消费</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-violet-600 mb-1">
              {{ thisMonthEarned }}
            </div>
            <div class="text-sm text-slate-500">本月获得</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-amber-600 mb-1">
              {{ currentLevel }}
            </div>
            <div class="text-sm text-slate-500">当前等级</div>
          </div>
        </div>
      </div>

      <!-- 积分等级进度 -->
      <div class="glass-card rounded-2xl p-6 mb-6">
        <h3 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <TrophyIcon class="w-5 h-5 mr-2 text-amber-600" />
          积分等级
        </h3>
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-slate-600">{{
            currentLevel
          }}</span>
          <span class="text-sm font-medium text-slate-600">{{
            nextLevel
          }}</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-3 mb-2">
          <div
            class="bg-gradient-to-r from-blue-500 to-violet-500 h-3 rounded-full transition-all duration-300"
            :style="{ width: levelProgress + '%' }"
          ></div>
        </div>
        <div class="text-center text-sm text-slate-600">
          还需 {{ pointsToNextLevel }} 积分升级到 {{ nextLevel }}
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="glass-card rounded-2xl p-4 mb-6">
        <div class="flex flex-wrap gap-3">
          <button
            v-for="filter in filters"
            :key="filter.id"
            @click="selectedFilter = filter.id"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              selectedFilter === filter.id
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ]"
          >
            {{ filter.name }}
          </button>
        </div>
      </div>

      <!-- 积分记录列表 -->
      <div class="space-y-4 mb-8">
        <div
          v-for="record in paginatedRecords"
          :key="record.id"
          class="glass-card rounded-2xl p-4 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  record.type === 'earn' ? 'bg-emerald-100' : 'bg-rose-100',
                ]"
              >
                <component
                  :is="record.icon"
                  :class="[
                    'w-6 h-6',
                    record.type === 'earn'
                      ? 'text-emerald-600'
                      : 'text-rose-600',
                  ]"
                />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-800">{{ record.title }}</h4>
                <p class="text-sm text-slate-600">{{ record.description }}</p>
                <div
                  class="flex items-center space-x-4 mt-1 text-xs text-slate-500"
                >
                  <span class="flex items-center">
                    <CalendarIcon class="w-3 h-3 mr-1" />
                    {{ record.date }}
                  </span>
                  <span class="flex items-center">
                    <ClockIcon class="w-3 h-3 mr-1" />
                    {{ record.time }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div
                :class="[
                  'text-lg font-bold',
                  record.type === 'earn' ? 'text-emerald-600' : 'text-rose-600',
                ]"
              >
                {{ record.type === "earn" ? "+" : "-" }}{{ record.points }}
              </div>
              <div class="text-xs text-slate-500">积分</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="glass-card rounded-2xl p-4">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-600">
            显示 {{ (currentPage - 1) * pageSize + 1 }} -
            {{ Math.min(currentPage * pageSize, filteredRecords.length) }}
            条，共 {{ filteredRecords.length }} 条记录
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <div class="flex items-center space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100',
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  TrophyIcon,
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  GiftIcon,
  ShoppingBagIcon,
  StarIcon,
  AwardIcon,
  CheckCircleIcon,
  PlusIcon,
} from "lucide-vue-next";
import BottomNavigation from "../components/BottomNavigation.vue";

const router = useRouter();
const activeTab = ref("profile");

// 积分统计数据
const currentPoints = ref(1280);
const totalEarned = ref(2450);
const totalSpent = ref(1170);
const thisMonthEarned = ref(320);
const currentLevel = ref("黄金会员");
const nextLevel = ref("钻石会员");
const levelProgress = ref(65);
const pointsToNextLevel = ref(720);

// 分页设置
const currentPage = ref(1);
const pageSize = ref(8);
const selectedFilter = ref("all");

// 筛选器
const filters = reactive([
  { id: "all", name: "全部记录" },
  { id: "earn", name: "获得积分" },
  { id: "spend", name: "消费积分" },
  { id: "course", name: "课程学习" },
  { id: "activity", name: "活动奖励" },
]);

// 积分记录数据
const pointsRecords = reactive([
  {
    id: 1,
    type: "earn",
    category: "course",
    title: "完成课程学习",
    description: "完成《传统剪纸艺术入门》课程",
    points: 120,
    date: "2024-03-25",
    time: "14:30",
    icon: BookOpenIcon,
  },
  {
    id: 2,
    type: "spend",
    category: "shop",
    title: "积分商城兑换",
    description: "兑换精美剪纸工具套装",
    points: 200,
    date: "2024-03-24",
    time: "10:15",
    icon: ShoppingBagIcon,
  },
  {
    id: 3,
    type: "earn",
    category: "activity",
    title: "每日签到奖励",
    description: "连续签到7天获得奖励",
    points: 50,
    date: "2024-03-23",
    time: "09:00",
    icon: GiftIcon,
  },
  {
    id: 4,
    type: "earn",
    category: "course",
    title: "课程评价奖励",
    description: "为《手机摄影技巧提升》课程评价",
    points: 20,
    date: "2024-03-22",
    time: "16:45",
    icon: StarIcon,
  },
  {
    id: 5,
    type: "earn",
    category: "course",
    title: "完成课程学习",
    description: "完成《水墨画基础教程》课程",
    points: 150,
    date: "2024-03-21",
    time: "11:20",
    icon: BookOpenIcon,
  },
  {
    id: 6,
    type: "spend",
    category: "shop",
    title: "积分商城兑换",
    description: "兑换乡村艺术明信片套装",
    points: 80,
    date: "2024-03-20",
    time: "15:30",
    icon: ShoppingBagIcon,
  },
  {
    id: 7,
    type: "earn",
    category: "activity",
    title: "成就徽章奖励",
    description: '获得"学习达人"徽章',
    points: 100,
    date: "2024-03-19",
    time: "13:15",
    icon: AwardIcon,
  },
  {
    id: 8,
    type: "earn",
    category: "course",
    title: "完成课程学习",
    description: "完成《微信小程序运营》课程",
    points: 130,
    date: "2024-03-18",
    time: "17:00",
    icon: BookOpenIcon,
  },
  {
    id: 9,
    type: "earn",
    category: "activity",
    title: "推荐好友奖励",
    description: "成功推荐好友注册学习",
    points: 80,
    date: "2024-03-17",
    time: "12:30",
    icon: PlusIcon,
  },
  {
    id: 10,
    type: "spend",
    category: "shop",
    title: "积分商城兑换",
    description: "兑换传统文化书籍",
    points: 150,
    date: "2024-03-16",
    time: "14:45",
    icon: ShoppingBagIcon,
  },
  {
    id: 11,
    type: "earn",
    category: "course",
    title: "完成课程学习",
    description: "完成《书法艺术欣赏与实践》课程",
    points: 120,
    date: "2024-03-15",
    time: "10:30",
    icon: BookOpenIcon,
  },
  {
    id: 12,
    type: "earn",
    category: "activity",
    title: "社区互动奖励",
    description: "发布优质学习心得",
    points: 30,
    date: "2024-03-14",
    time: "16:20",
    icon: CheckCircleIcon,
  },
  {
    id: 13,
    type: "earn",
    category: "course",
    title: "完成课程学习",
    description: "完成《短视频制作入门》课程",
    points: 110,
    date: "2024-03-13",
    time: "19:15",
    icon: BookOpenIcon,
  },
  {
    id: 14,
    type: "spend",
    category: "shop",
    title: "积分商城兑换",
    description: "兑换手工制作材料包",
    points: 120,
    date: "2024-03-12",
    time: "11:00",
    icon: ShoppingBagIcon,
  },
  {
    id: 15,
    type: "earn",
    category: "activity",
    title: "每日签到奖励",
    description: "连续签到14天获得奖励",
    points: 100,
    date: "2024-03-11",
    time: "08:30",
    icon: GiftIcon,
  },
  {
    id: 16,
    type: "earn",
    category: "course",
    title: "完成课程学习",
    description: "完成《陶艺制作基础》课程",
    points: 140,
    date: "2024-03-10",
    time: "15:45",
    icon: BookOpenIcon,
  },
  {
    id: 17,
    type: "earn",
    category: "course",
    title: "完成课程学习",
    description: "完成《风景摄影技巧》课程",
    points: 125,
    date: "2024-03-09",
    time: "13:20",
    icon: BookOpenIcon,
  },
  {
    id: 18,
    type: "spend",
    category: "shop",
    title: "积分商城兑换",
    description: "兑换摄影器材优惠券",
    points: 100,
    date: "2024-03-08",
    time: "16:10",
    icon: ShoppingBagIcon,
  },
]);

// 计算属性
const filteredRecords = computed(() => {
  if (selectedFilter.value === "all") {
    return pointsRecords;
  }
  if (selectedFilter.value === "earn" || selectedFilter.value === "spend") {
    return pointsRecords.filter(
      (record) => record.type === selectedFilter.value,
    );
  }
  return pointsRecords.filter(
    (record) => record.category === selectedFilter.value,
  );
});

const totalPages = computed(() => {
  return Math.ceil(filteredRecords.value.length / pageSize.value);
});

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("...", total);
    } else if (current >= total - 3) {
      pages.push(1, "...");
      for (let i = total - 4; i <= total; i++) {
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

  return pages.filter((page) => page !== "...");
});

const goBack = () => {
  router.back();
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
};
</script>
