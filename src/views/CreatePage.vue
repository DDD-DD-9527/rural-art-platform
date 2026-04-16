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
          <h1 class="text-lg font-semibold text-slate-800">AI艺术创作</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <div class="text-center mb-8">
        <div
          class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <SparklesIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-4">AI艺术创作助手</h1>
        <p class="text-lg text-slate-600">让AI帮你完善艺术创作，释放无限创意</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div
          v-for="(tool, index) in creationTools"
          :key="index"
          class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 glass-effect rounded-3xl overflow-hidden cursor-pointer"
          @click="openTool(tool.id)"
        >
          <div class="p-6">
            <div
              :class="[
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300',
                tool.gradient,
              ]"
            >
              <component :is="tool.icon" class="w-8 h-8 text-white" />
            </div>

            <h3
              class="text-lg font-semibold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300"
            >
              {{ tool.title }}
            </h3>

            <p class="text-slate-600 text-sm mb-4 leading-relaxed">
              {{ tool.description }}
            </p>

            <div class="flex flex-wrap gap-1 mb-4">
              <span
                v-for="feature in tool.features"
                :key="feature"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700"
              >
                {{ feature }}
              </span>
            </div>

            <button
              :class="[
                'w-full py-3 rounded-2xl font-semibold text-white hover:shadow-lg transition-all duration-300',
                tool.gradient,
              ]"
            >
              开始创作
            </button>
          </div>
        </div>
      </div>

      <div class="glass-effect rounded-3xl p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-800">最近创作</h2>
          <button
            @click="goToMyWorks"
            class="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            查看全部
          </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="creation in recentCreations"
            :key="creation.id"
            class="group relative overflow-hidden rounded-2xl cursor-pointer"
          >
            <img
              :src="creation.image || '/placeholder.svg?height=200&width=200'"
              :alt="creation.title"
              class="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"
            ></div>
            <div
              class="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <h4 class="text-white font-semibold text-sm mb-1">
                {{ creation.title }}
              </h4>
              <p class="text-white/80 text-xs mb-2">{{ creation.type }}</p>
              <div class="flex items-center justify-between">
                <span class="text-white/60 text-xs">{{
                  creation.createdAt
                }}</span>
                <div class="flex space-x-1">
                  <button
                    class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <DownloadIcon class="w-4 h-4 text-white" />
                  </button>
                  <button
                    class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <ShareIcon class="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-effect rounded-3xl p-6">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">AI创作工具演示</h2>

        <div class="space-y-4">
          <div
            v-for="tutorial in tutorials"
            :key="tutorial.id"
            class="flex items-center space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group"
          >
            <div class="relative flex-shrink-0">
              <img
                :src="
                  tutorial.thumbnail || '/placeholder.svg?height=80&width=120'
                "
                :alt="tutorial.title"
                class="w-30 h-20 object-cover rounded-xl"
              />
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl group-hover:bg-black/10 transition-colors duration-200"
              >
                <div
                  class="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center"
                >
                  <PlayIcon class="w-4 h-4 text-emerald-600 ml-0.5" />
                </div>
              </div>
            </div>

            <div class="flex-1">
              <h3
                class="font-semibold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors duration-200"
              >
                {{ tutorial.title }}
              </h3>
              <p class="text-slate-600 text-sm mb-2">
                {{ tutorial.description }}
              </p>
              <div class="flex items-center space-x-4 text-xs text-slate-500">
                <span>{{ tutorial.duration }}</span>
                <span>{{ tutorial.views }}观看</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  SparklesIcon,
  ImageIcon,
  PaletteIcon,
  LayersIcon,
  WrenchIcon,
  DownloadIcon,
  ShareIcon,
  PlayIcon,
} from "lucide-vue-next";
import BottomNavigation from "../components/BottomNavigation.vue";

const router = useRouter();
const activeTab = ref("create");

const creationTools = reactive([
  {
    id: "enhance",
    icon: ImageIcon,
    title: "图片增强",
    description: "上传手绘作品，AI自动补全色彩和优化构图",
    features: ["色彩补全", "构图优化", "风格转换"],
    gradient: "bg-gradient-to-br from-emerald-500 to-blue-600",
  },
  {
    id: "style",
    icon: PaletteIcon,
    title: "风格转换",
    description: "将你的作品转换为不同的艺术风格",
    features: ["水墨风", "卡通风", "油画风"],
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
  },
  {
    id: "generate",
    icon: LayersIcon,
    title: "图案生成",
    description: "基于传统元素生成新的艺术图案",
    features: ["传统元素", "创新设计", "可编辑"],
    gradient: "bg-gradient-to-br from-orange-500 to-red-600",
  },
  {
    id: "repair",
    icon: WrenchIcon,
    title: "智能修复",
    description: "修复破损的传统艺术作品图片",
    features: ["破损修复", "清晰度提升", "色彩还原"],
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-600",
  },
]);

const recentCreations = reactive([
  {
    id: 1,
    title: "春花剪纸",
    type: "图片增强",
    image: "/original-works-placeholder.png",
    createdAt: "2小时前",
  },
  {
    id: 2,
    title: "乡村风景",
    type: "风格转换",
    image: "/original-works-placeholder.png",
    createdAt: "1天前",
  },
  {
    id: 3,
    title: "传统花纹",
    type: "图案生成",
    image: "/original-works-placeholder.png",
    createdAt: "3天前",
  },
  {
    id: 4,
    title: "古画修复",
    type: "智能修复",
    image: "/original-works-placeholder.png",
    createdAt: "1周前",
  },
]);

const tutorials = reactive([
  {
    id: 1,
    title: "图片增强工具操作演示",
    description: "观看AI图片增强工具的完整操作流程和效果展示",
    thumbnail: "/creative-course-placeholder.png",
    duration: "3分钟",
    views: "2.1k",
  },
  {
    id: 2,
    title: "风格转换工具使用指南",
    description: "学习如何使用AI风格转换工具创作不同风格的艺术作品",
    thumbnail: "/creative-course-placeholder.png",
    duration: "4分钟",
    views: "1.8k",
  },
  {
    id: 3,
    title: "图案生成工具演示",
    description: "了解AI图案生成工具如何基于传统元素创作新图案",
    thumbnail: "/creative-course-placeholder.png",
    duration: "5分钟",
    views: "1.5k",
  },
  {
    id: 4,
    title: "智能修复工具实操",
    description: "观看AI智能修复工具修复传统艺术作品的完整过程",
    thumbnail: "/creative-course-placeholder.png",
    duration: "6分钟",
    views: "1.3k",
  },
]);

const openTool = (toolId) => {
  router.push(`/create/${toolId}`);
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const goBack = () => {
  router.back();
};

const goToMyWorks = () => {
  router.push("/my-works");
};
</script>
