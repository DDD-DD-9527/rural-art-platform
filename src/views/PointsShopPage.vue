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
          <h1 class="text-lg font-bold text-slate-800">积分商城</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 积分余额卡片 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="text-center">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center"
          >
            <CurrencyDollarIcon class="w-10 h-10 text-white" />
          </div>
          <div class="text-3xl font-bold text-violet-600 mb-2">
            {{ userPoints }}
          </div>
          <div class="text-slate-500 mb-4">当前积分</div>
          <div class="flex justify-center space-x-4">
            <div class="text-center">
              <div class="text-lg font-semibold text-slate-800">
                {{ monthlyEarned }}
              </div>
              <div class="text-sm text-slate-500">本月获得</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-semibold text-slate-800">
                {{ totalSpent }}
              </div>
              <div class="text-sm text-slate-500">累计消费</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品分类 -->
      <div class="mb-6">
        <div class="flex space-x-2 overflow-x-auto pb-2">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="[
              'px-4 py-2 rounded-full whitespace-nowrap transition-all',
              selectedCategory === category.id
                ? 'bg-violet-500 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-violet-50',
            ]"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- 商品网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="glass-card rounded-2xl p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div
            class="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl mb-4 flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
            <component
              v-else
              :is="item.icon"
              class="w-12 h-12 text-slate-500"
            />
          </div>

          <h3 class="font-semibold text-slate-800 mb-2">{{ item.name }}</h3>
          <p class="text-sm text-slate-600 mb-3 line-clamp-2">
            {{ item.description }}
          </p>

          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-1">
              <CurrencyDollarIcon class="w-4 h-4 text-violet-500" />
              <span class="text-lg font-bold text-violet-600">{{
                item.points
              }}</span>
              <span class="text-sm text-slate-500">积分</span>
            </div>
            <div
              v-if="item.originalPrice"
              class="text-sm text-slate-400 line-through"
            >
              ¥{{ item.originalPrice }}
            </div>
          </div>

          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-1">
              <StarIcon class="w-4 h-4 text-yellow-400" />
              <span class="text-sm text-slate-600">{{ item.rating }}</span>
              <span class="text-sm text-slate-400">({{ item.reviews }})</span>
            </div>
            <div class="text-sm text-slate-500">库存: {{ item.stock }}</div>
          </div>

          <button
            @click="exchangeItem(item)"
            :disabled="userPoints < item.points || item.stock === 0"
            :class="[
              'w-full py-2 px-4 rounded-lg font-medium transition-colors',
              userPoints >= item.points && item.stock > 0
                ? 'bg-violet-500 text-white hover:bg-violet-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            ]"
          >
            {{
              item.stock === 0
                ? "已售罄"
                : userPoints >= item.points
                  ? "立即兑换"
                  : "积分不足"
            }}
          </button>
        </div>
      </div>

      <!-- 兑换记录 -->
      <div class="mt-12">
        <h2 class="text-xl font-bold text-slate-800 mb-6">兑换记录</h2>
        <div class="space-y-4">
          <div
            v-for="record in exchangeHistory"
            :key="record.id"
            class="glass-card rounded-xl p-4 flex items-center justify-between"
          >
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center"
              >
                <ShoppingBagIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="font-medium text-slate-800">
                  {{ record.itemName }}
                </div>
                <div class="text-sm text-slate-500">{{ record.date }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-violet-600 font-semibold">
                -{{ record.points }}积分
              </div>
              <div
                :class="[
                  'text-sm px-2 py-1 rounded-full',
                  record.status === '已发货'
                    ? 'bg-green-100 text-green-600'
                    : record.status === '处理中'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-blue-100 text-blue-600',
                ]"
              >
                {{ record.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { CurrencyDollarIcon, StarIcon } from "@heroicons/vue/24/solid";
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  GiftIcon,
  BookOpenIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const userStore = useUserStore();

const goBack = () => {
  router.go(-1);
};

// 用户积分数据（从userStore获取）
const userPoints = computed(() => userStore.learningStats.totalPoints || 0);
const monthlyEarned = computed(() => {
  // 这里可以根据实际需求计算本月获得的积分
  // 暂时使用总积分的一部分作为示例
  return Math.floor((userStore.learningStats.totalPoints || 0) * 0.3);
});
const totalSpent = computed(() => {
  // 这里可以根据实际需求计算累计消费的积分
  // 暂时使用总积分的一部分作为示例
  return Math.floor((userStore.learningStats.totalPoints || 0) * 0.2);
});

// 商品分类
const categories = ref([
  { id: "all", name: "全部" },
  { id: "courses", name: "课程" },
  { id: "materials", name: "材料" },
  { id: "tools", name: "工具" },
  { id: "gifts", name: "礼品" },
  { id: "vouchers", name: "优惠券" },
]);

const selectedCategory = ref("all");

// 商品数据
const shopItems = ref([
  {
    id: 1,
    name: "传统剪纸入门课程",
    description: "学习传统剪纸技艺，包含基础图案和进阶技巧",
    points: 200,
    originalPrice: 99,
    rating: 4.8,
    reviews: 156,
    stock: 50,
    category: "courses",
    icon: BookOpenIcon,
  },
  {
    id: 2,
    name: "专业剪纸工具套装",
    description: "包含专业剪刀、刻刀、垫板等全套工具",
    points: 150,
    originalPrice: 68,
    rating: 4.9,
    reviews: 89,
    stock: 25,
    category: "tools",
    icon: GiftIcon,
  },
  {
    id: 3,
    name: "彩色手工纸材料包",
    description: "优质彩色纸张，适合各种剪纸创作",
    points: 80,
    originalPrice: 35,
    rating: 4.7,
    reviews: 234,
    stock: 100,
    category: "materials",
    icon: GiftIcon,
  },
  {
    id: 4,
    name: "艺术品展示框",
    description: "精美展示框，让您的作品更加出彩",
    points: 120,
    originalPrice: 58,
    rating: 4.6,
    reviews: 67,
    stock: 30,
    category: "gifts",
    icon: HomeIcon,
  },
  {
    id: 5,
    name: "线上课程优惠券",
    description: "可用于购买任意线上课程，享受8折优惠",
    points: 50,
    originalPrice: 20,
    rating: 4.5,
    reviews: 445,
    stock: 200,
    category: "vouchers",
    icon: DevicePhoneMobileIcon,
  },
  {
    id: 6,
    name: "国画基础课程",
    description: "从零开始学习国画，掌握基本笔法和构图",
    points: 300,
    originalPrice: 149,
    rating: 4.9,
    reviews: 78,
    stock: 20,
    category: "courses",
    icon: BookOpenIcon,
  },
]);

// 兑换记录
const exchangeHistory = ref([
  {
    id: 1,
    itemName: "彩色手工纸材料包",
    points: 80,
    date: "2024-01-15",
    status: "已发货",
  },
  {
    id: 2,
    itemName: "线上课程优惠券",
    points: 50,
    date: "2024-01-10",
    status: "已使用",
  },
  {
    id: 3,
    itemName: "传统剪纸入门课程",
    points: 200,
    date: "2024-01-08",
    status: "处理中",
  },
]);

// 过滤商品
const filteredItems = computed(() => {
  if (selectedCategory.value === "all") {
    return shopItems.value;
  }
  return shopItems.value.filter(
    (item) => item.category === selectedCategory.value,
  );
});

// 兑换商品
const exchangeItem = (item) => {
  if (userPoints.value >= item.points && item.stock > 0) {
    userPoints.value -= item.points;
    item.stock -= 1;
    totalSpent.value += item.points;

    // 添加到兑换记录
    exchangeHistory.value.unshift({
      id: Date.now(),
      itemName: item.name,
      points: item.points,
      date: new Date().toISOString().split("T")[0],
      status: "处理中",
    });

    // 这里可以添加成功提示
    alert(`成功兑换 ${item.name}！`);
  }
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

.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
