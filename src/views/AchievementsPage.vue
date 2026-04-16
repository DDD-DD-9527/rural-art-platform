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
          <h1 class="text-lg font-bold text-slate-800">成就徽章</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 成就统计 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="text-center mb-6">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
          >
            <AwardIcon class="w-10 h-10 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">我的成就</h2>
          <p class="text-slate-600">记录您在学习路上的每一个里程碑</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-4 bg-amber-50 rounded-xl">
            <div class="text-3xl font-bold text-amber-600 mb-2">
              {{ earnedAchievements.length }}
            </div>
            <div class="text-sm text-slate-600">已获得徽章</div>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ allAchievements.length }}
            </div>
            <div class="text-sm text-slate-600">全部徽章</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-xl">
            <div class="text-3xl font-bold text-green-600 mb-2">
              {{
                allAchievements.length > 0
                  ? Math.round(
                      (earnedAchievements.length / allAchievements.length) *
                        100,
                    )
                  : 0
              }}%
            </div>
            <div class="text-sm text-slate-600">完成度</div>
          </div>
        </div>
      </div>

      <!-- 成就分类 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-800">成就分类</h3>
          <div class="flex items-center space-x-2">
            <select
              v-model="selectedCategory"
              class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">全部分类</option>
              <option value="learning">学习成就</option>
              <option value="social">社交成就</option>
              <option value="creative">创作成就</option>
              <option value="special">特殊成就</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="achievement in filteredAchievements"
            :key="achievement.id"
            :class="[
              'relative p-6 rounded-xl text-center transition-all duration-300 cursor-pointer',
              achievement.earned
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 shadow-md'
                : 'bg-gradient-to-br from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 opacity-60',
            ]"
            @click="showAchievementDetail(achievement)"
          >
            <!-- 徽章图标 -->
            <div
              :class="[
                'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
                achievement.earned ? achievement.bgColor : 'bg-slate-300',
              ]"
            >
              <component
                :is="achievement.icon"
                :class="[
                  'w-8 h-8',
                  achievement.earned ? achievement.iconColor : 'text-slate-500',
                ]"
              />
            </div>

            <!-- 徽章信息 -->
            <div class="mb-4">
              <h4
                :class="[
                  'font-semibold mb-2',
                  achievement.earned ? 'text-slate-800' : 'text-slate-500',
                ]"
              >
                {{ achievement.name }}
              </h4>
              <p
                :class="[
                  'text-sm',
                  achievement.earned ? 'text-slate-600' : 'text-slate-400',
                ]"
              >
                {{ achievement.description }}
              </p>
            </div>

            <!-- 获得时间或进度 -->
            <div class="text-xs">
              <div v-if="achievement.earned" class="text-green-600 font-medium">
                {{ achievement.earnedDate }}
              </div>
              <div v-else class="text-slate-400">
                进度: {{ achievement.progress }}/{{ achievement.target }}
              </div>
            </div>

            <!-- 稀有度标识 -->
            <div
              v-if="achievement.rarity"
              :class="[
                'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium',
                achievement.rarity === 'legendary'
                  ? 'bg-purple-100 text-purple-600'
                  : achievement.rarity === 'epic'
                    ? 'bg-blue-100 text-blue-600'
                    : achievement.rarity === 'rare'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600',
              ]"
            >
              {{ getRarityText(achievement.rarity) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 最近获得的成就 -->
      <div class="glass-card rounded-3xl p-6">
        <h3 class="text-xl font-bold text-slate-800 mb-6">最近获得</h3>
        <div class="space-y-4">
          <div
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            class="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl"
          >
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center',
                achievement.bgColor,
              ]"
            >
              <component
                :is="achievement.icon"
                :class="['w-6 h-6', achievement.iconColor]"
              />
            </div>
            <div class="flex-1">
              <div class="font-medium text-slate-800">
                {{ achievement.name }}
              </div>
              <div class="text-sm text-slate-600">
                {{ achievement.description }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-amber-600">
                {{ achievement.earnedDate }}
              </div>
              <div class="text-xs text-slate-500">
                +{{ achievement.points }}积分
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 成就详情模态框 -->
    <div
      v-if="selectedAchievement"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="glass-card rounded-3xl p-6 w-full max-w-md">
        <div class="text-center mb-6">
          <div
            :class="[
              'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center',
              selectedAchievement.earned
                ? selectedAchievement.bgColor
                : 'bg-slate-300',
            ]"
          >
            <component
              :is="selectedAchievement.icon"
              :class="[
                'w-10 h-10',
                selectedAchievement.earned
                  ? selectedAchievement.iconColor
                  : 'text-slate-500',
              ]"
            />
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">
            {{ selectedAchievement.name }}
          </h3>
          <p class="text-slate-600 mb-4">
            {{ selectedAchievement.description }}
          </p>

          <div v-if="selectedAchievement.earned" class="space-y-2">
            <div class="text-green-600 font-medium">已获得</div>
            <div class="text-sm text-slate-500">
              获得时间: {{ selectedAchievement.earnedDate }}
            </div>
            <div class="text-sm text-slate-500">
              奖励积分: +{{ selectedAchievement.points }}
            </div>
          </div>
          <div v-else class="space-y-2">
            <div class="text-slate-500">未获得</div>
            <div class="text-sm text-slate-500">
              进度: {{ selectedAchievement.progress }}/{{
                selectedAchievement.target
              }}
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div
                class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                :style="{
                  width:
                    (selectedAchievement.progress /
                      selectedAchievement.target) *
                      100 +
                    '%',
                }"
              ></div>
            </div>
          </div>
        </div>

        <button
          @click="selectedAchievement = null"
          class="w-full py-3 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-colors font-medium"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import {
  ArrowLeftIcon,
  AwardIcon,
  StarIcon,
  BookOpenIcon,
  HeartIcon,
  UsersIcon,
  PaletteIcon,
  TrophyIcon,
  Zap,
  SparklesIcon,
} from "lucide-vue-next";

const router = useRouter();
const userStore = useUserStore();

const goBack = () => {
  router.go(-1);
};

// 分类筛选
const selectedCategory = ref("all");
const selectedAchievement = ref(null);

// 预定义的成就模板
const achievementTemplates = [
  {
    id: 1,
    name: "初学者",
    description: "完成第一门课程",
    category: "learning",
    icon: BookOpenIcon,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    points: 50,
    rarity: "common",
    target: 1,
  },
  {
    id: 2,
    name: "勤奋学习者",
    description: "连续学习7天",
    category: "learning",
    icon: Zap,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100",
    points: 100,
    rarity: "rare",
    target: 7,
  },
  {
    id: 3,
    name: "社交达人",
    description: "获得100个点赞",
    category: "social",
    icon: HeartIcon,
    iconColor: "text-rose-600",
    bgColor: "bg-rose-100",
    points: 150,
    rarity: "rare",
    target: 100,
  },
  {
    id: 4,
    name: "创作新星",
    description: "发布第一个作品",
    category: "creative",
    icon: PaletteIcon,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-100",
    points: 80,
    rarity: "common",
    target: 1,
  },
  {
    id: 5,
    name: "人气王",
    description: "获得50个粉丝",
    category: "social",
    icon: UsersIcon,
    iconColor: "text-green-600",
    bgColor: "bg-green-100",
    points: 200,
    rarity: "epic",
    target: 50,
  },
  {
    id: 6,
    name: "学霸",
    description: "完成10门课程",
    category: "learning",
    icon: TrophyIcon,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
    points: 300,
    rarity: "epic",
    target: 10,
  },
  {
    id: 7,
    name: "传奇大师",
    description: "获得1000积分",
    category: "special",
    icon: SparklesIcon,
    iconColor: "text-indigo-600",
    bgColor: "bg-indigo-100",
    points: 500,
    rarity: "legendary",
    target: 1000,
  },
  {
    id: 8,
    name: "艺术家",
    description: "创作5个优秀作品",
    category: "creative",
    icon: StarIcon,
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-100",
    points: 250,
    rarity: "epic",
    target: 5,
  },
];

// 所有成就数据（结合模板和用户数据）
const allAchievements = computed(() => {
  return achievementTemplates.map((template) => {
    const userAchievement = userStore.achievements.find(
      (a) => a.id === template.id,
    );
    const earned = !!userAchievement?.earned;

    // 根据成就类型计算进度
    let progress = 0;
    switch (template.id) {
      case 1: // 完成第一门课程
        progress = userStore.learningStats.completedCourses >= 1 ? 1 : 0;
        break;
      case 2: // 连续学习7天
        progress = userStore.learningStats.currentStreak || 0;
        break;
      case 3: // 获得100个点赞
        progress = userStore.learningStats.followers || 0;
        break;
      case 4: // 发布第一个作品
        progress = 0; // 需要作品数据
        break;
      case 5: // 获得50个粉丝
        progress = userStore.learningStats.followers || 0;
        break;
      case 6: // 完成10门课程
        progress = userStore.learningStats.completedCourses || 0;
        break;
      case 7: // 获得1000积分
        progress = userStore.learningStats.totalPoints || 0;
        break;
      case 8: // 创作5个优秀作品
        progress = 0; // 需要作品数据
        break;
    }

    return {
      ...template,
      earned,
      earnedDate: userAchievement?.earnedDate,
      progress: Math.min(progress, template.target),
    };
  });
});

// 已获得的成就
const earnedAchievements = computed(() => {
  return allAchievements.value.filter((achievement) => achievement.earned);
});

// 最近获得的成就
const recentAchievements = computed(() => {
  return earnedAchievements.value
    .filter((a) => a.earnedDate)
    .sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate))
    .slice(0, 3);
});

// 过滤成就
const filteredAchievements = computed(() => {
  if (selectedCategory.value === "all") {
    return allAchievements.value;
  }
  return allAchievements.value.filter(
    (achievement) => achievement.category === selectedCategory.value,
  );
});

// 显示成就详情
const showAchievementDetail = (achievement) => {
  selectedAchievement.value = achievement;
};

// 获取稀有度文本
const getRarityText = (rarity) => {
  const rarityMap = {
    common: "普通",
    rare: "稀有",
    epic: "史诗",
    legendary: "传奇",
  };
  return rarityMap[rarity] || "普通";
};
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
</style>
