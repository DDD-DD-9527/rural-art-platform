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
          <h1 class="text-lg font-bold text-slate-800">学习平台</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- Search and Filter -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-6">
          <div class="flex-1 relative">
            <SearchIcon
              class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
            />
            <input
              v-model="searchQuery"
              placeholder="搜索你感兴趣的课程..."
              class="w-full pl-12 pr-12 py-4 glass-card border-0 shadow-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700 text-lg"
            />
            <button
              class="absolute right-4 top-1/2 transform -translate-y-1/2 p-1"
            >
              <MicIcon class="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <!-- Updated Filter Tabs - 只有2个分类标签 -->
        <div class="flex justify-center space-x-4 overflow-x-auto pb-2">
          <button
            v-for="tab in filterTabs"
            :key="tab"
            @click="activeFilter = tab"
            :class="[
              'whitespace-nowrap px-8 py-4 rounded-2xl font-bold transition-all duration-300 text-lg shadow-lg',
              activeFilter === tab
                ? 'gradient-primary text-white shadow-xl transform scale-105'
                : 'glass-card text-slate-700 hover:shadow-xl hover:scale-102',
            ]"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- 我正在学习的课程 -->
      <div class="glass-card rounded-3xl p-8 mb-8 shadow-xl">
        <h3 class="text-2xl font-bold mb-6 text-slate-800 flex items-center">
          <BookOpenIcon class="w-6 h-6 mr-3 text-emerald-600" />
          我正在学习的课程
        </h3>
        <div
          v-if="false"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <!-- 瑶绣制作特色课程卡片 -->
          <div
            @click="navigateToYaoEmbroidery"
            class="relative glass-card rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200"
          >
            <div
              class="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold"
            >
              特色课程
            </div>
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-bold text-lg text-slate-800 truncate">
                瑶绣制作艺术之旅
              </h4>
              <span class="text-sm text-emerald-600 font-medium">0%</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div
                class="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style="width: 0%"
              ></div>
            </div>
            <p class="text-slate-600 text-sm line-clamp-2">
              传承千年瑶族文化，掌握传统刺绣技艺，获得政府补贴支持
            </p>
            <div class="flex items-center justify-between mt-4">
              <span
                class="text-xs text-slate-500 bg-emerald-100 px-2 py-1 rounded-full"
                >传统工艺</span
              >
              <button
                class="text-emerald-600 text-sm font-medium hover:text-emerald-700"
              >
                继续学习 →
              </button>
            </div>
          </div>

          <!-- 原有课程卡片 -->
          <div
            v-for="course in enrolledCourses"
            :key="course.id"
            @click="navigateToCourse(course.id)"
            class="glass-card rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-bold text-lg text-slate-800 truncate">
                {{ course.title }}
              </h4>
              <span class="text-sm text-emerald-600 font-medium"
                >{{ course.progress || 0 }}%</span
              >
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div
                class="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: (course.progress || 0) + '%' }"
              ></div>
            </div>
            <p class="text-slate-600 text-sm line-clamp-2">
              {{ course.description }}
            </p>
            <div class="flex items-center justify-between mt-4">
              <span class="text-xs text-slate-500">{{ course.category }}</span>
              <button
                class="text-emerald-600 text-sm font-medium hover:text-emerald-700"
              >
                继续学习 →
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <BookOpenIcon class="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p class="text-slate-500 text-lg mb-4">还没有正在学习的课程</p>
          <p class="text-slate-400">从下方课程中选择一门开始学习吧！</p>
        </div>
      </div>

      <!-- 游戏化学习路径 -->
      <GamifiedLearningPath
        v-if="currentUserId"
        :user-id="currentUserId"
        class="mb-8"
        @lesson-start="navigateToCourse"
        @lesson-complete="handleLessonCompleted"
        @certificate-claim="handleCertificateClaim"
      />

      <!-- Course Categories -->
      <div v-if="activeFilter === '全部'" class="space-y-12">
        <!-- Art Education Courses -->
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-8 flex items-center">
            <PaletteIcon class="w-8 h-8 mr-3 text-emerald-600" />
            艺术教育课程
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CourseCard
              v-for="course in artCourses"
              :key="course.id"
              :course="course"
              @click="navigateToCourse(course.id)"
            />
          </div>
        </div>

        <!-- Digital Skills Courses -->
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-8 flex items-center">
            <SmartphoneIcon class="w-8 h-8 mr-3 text-blue-600" />
            数字技能课程
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CourseCard
              v-for="course in digitalCourses"
              :key="course.id"
              :course="course"
              @click="navigateToCourse(course.id)"
            />
          </div>
        </div>
      </div>

      <!-- Filtered Courses -->
      <div v-else>
        <h2 class="text-3xl font-bold text-slate-800 mb-8 flex items-center">
          <PaletteIcon
            v-if="activeFilter === '艺术教育'"
            class="w-8 h-8 mr-3 text-emerald-600"
          />
          <SmartphoneIcon
            v-if="activeFilter === '数字技能'"
            class="w-8 h-8 mr-3 text-blue-600"
          />
          {{ activeFilter }}课程
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.id"
            :course="course"
            @click="navigateToCourse(course.id)"
          />
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { courseAPI, gamificationApi } from "../services/api";
import {
  ArrowLeftIcon,
  SearchIcon,
  MicIcon,
  PaletteIcon,
  SmartphoneIcon,
  BookOpenIcon,
} from "lucide-vue-next";

import CourseCard from "../components/CourseCard.vue";
import BottomNavigation from "../components/BottomNavigation.vue";
import GamifiedLearningPath from "../components/GamifiedLearningPath.vue";

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref("learning");
const searchQuery = ref("");
const activeFilter = ref("全部");

// 筛选标签
const filterTabs = ["全部", "艺术教育", "数字技能"];

// 当前用户ID
const currentUserId = computed(() => userStore.user?.id || userStore.user?._id);

// 我正在学习的课程
const enrolledCourses = reactive([]);

// 艺术教育课程
const artCourses = reactive([]);

// 数字技能课程（包含原生活技能）
const digitalCourses = reactive([]);

const allCourses = computed(() => [...artCourses, ...digitalCourses]);

const filteredCourses = computed(() => {
  let courses = [];

  if (activeFilter.value === "全部") {
    courses = allCourses.value;
  } else if (activeFilter.value === "艺术教育") {
    // 艺术教育课程的category包括: paper-art, painting, textile, pottery, calligraphy, folk-art
    const artCategories = [
      "paper-art",
      "painting",
      "textile",
      "pottery",
      "calligraphy",
      "folk-art",
    ];
    courses = allCourses.value.filter((course) =>
      artCategories.includes(course.category),
    );
  } else if (activeFilter.value === "数字技能") {
    // 数字技能课程的category是: other
    courses = allCourses.value.filter((course) => course.category === "other");
  }

  if (searchQuery.value) {
    courses = courses.filter(
      (course) =>
        course.title.includes(searchQuery.value) ||
        course.description.includes(searchQuery.value),
    );
  }

  return courses;
});

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const goBack = () => {
  router.back();
};

const navigateToCourse = async (courseId) => {
  try {
    // 检查用户是否已经报名该课程
    const isEnrolled = enrolledCourses.some(
      (course) =>
        course.id === courseId ||
        course._id === courseId ||
        course.course?.id === courseId ||
        course.course?._id === courseId,
    );

    if (!isEnrolled && currentUserId.value) {
      // 用户未报名，先进行报名
      const response = await courseAPI.enrollCourse(courseId);
      if (response.success) {
        console.log("课程报名成功:", response.message);
        // 刷新已报名课程列表
        await fetchEnrolledCourses();
      } else {
        console.error("课程报名失败:", response.message);
        alert(response.message || "课程报名失败，请重试");
        return;
      }
    }

    // 导航到课程详情页面
    router.push(`/course/${courseId}`);
  } catch (error) {
    console.error("处理课程访问失败:", error);
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert("操作失败，请重试");
    }
  }
};

// 导航到瑶绣制作专门课程页面
const navigateToYaoEmbroidery = () => {
  router.push("/yao-embroidery");
};

const loadWeeklyStats = async () => {
  await fetchEnrolledCourses();
};

// 游戏化相关方法
const handleLessonCompleted = async (lessonData) => {
  try {
    // 调用后端API记录课程完成
    await gamificationApi.completeLessonTime({
      userId: currentUserId.value,
      courseId: lessonData.courseId,
      lessonId: lessonData.lessonId,
      completedAt: new Date().toISOString(),
    });

    // 刷新学习统计
    await loadWeeklyStats();
  } catch (error) {
    console.error("记录课程完成失败:", error);
  }
};

const handleCertificateClaim = async (certificate) => {
  try {
    console.log("领取证书:", certificate);
    // 这里可以添加证书领取的API调用
  } catch (error) {
    console.error("领取证书失败:", error);
  }
};

// 获取用户已注册的课程
const fetchEnrolledCourses = async () => {
  try {
    if (currentUserId.value) {
      console.log("正在获取用户已报名课程，用户ID:", currentUserId.value);
      const response = await courseAPI.getUserEnrolledCourses(
        currentUserId.value,
      );
      console.log("获取已报名课程响应:", response);
      if (response.success && response.data) {
        enrolledCourses.splice(0, enrolledCourses.length, ...response.data);
        console.log("已报名课程更新完成，课程数量:", response.data.length);
      } else {
        console.log("响应格式不正确或无数据");
        enrolledCourses.splice(0, enrolledCourses.length);
      }
    } else {
      console.log("用户未登录，清空已报名课程列表");
      enrolledCourses.splice(0, enrolledCourses.length);
    }
  } catch (error) {
    console.error("获取已注册课程失败:", error);
    // 初始化为空数组，没有正在学习的课程
    enrolledCourses.splice(0, enrolledCourses.length);
  }
};

// API 获取数据的函数
const fetchCourses = async () => {
  try {
    // 获取艺术类课程（传统工艺、绘画、雕塑等）
    const artCategories = [
      "traditional-crafts",
      "painting",
      "sculpture",
      "textile",
      "pottery",
      "woodwork",
      "paper-art",
      "folk-art",
      "calligraphy",
    ];

    // 分别获取每个艺术分类的课程，只获取已发布的课程
    const artCoursesData = [];
    for (const category of artCategories) {
      const response = await courseAPI.getCourses({
        category,
        isPublished: true, // 只获取已发布的课程
      });
      artCoursesData.push(...(response.data?.courses || []));
    }
    artCourses.splice(0, artCourses.length, ...artCoursesData);

    // 获取数字技能课程（其他类别），只获取已发布的课程
    const digitalResponse = await courseAPI.getCourses({
      category: "other",
      isPublished: true, // 只获取已发布的课程
    });
    digitalCourses.splice(
      0,
      digitalCourses.length,
      ...(digitalResponse.data?.courses || []),
    );
  } catch (error) {
    console.error("获取课程数据失败:", error);
  }
};

onMounted(async () => {
  // 先检查用户认证状态
  if (userStore.token && !userStore.user.id) {
    try {
      await userStore.checkAuth();
    } catch (error) {
      console.error("认证检查失败:", error);
    }
  }

  // 然后获取课程数据
  await fetchEnrolledCourses();
  await fetchCourses();
});
</script>
