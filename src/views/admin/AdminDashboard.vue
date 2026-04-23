<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">管理员控制台</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600"
              >欢迎，{{ userStore.user.username }}</span
            >
            <button
              @click="handleLogout"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    总用户数
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalUsers }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    总课程数
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalCourses }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    总帖子数
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalPosts }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    总评论数
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalComments }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            快速操作
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              @click="goToCourseManagement"
              class="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors"
            >
              <div class="flex items-center">
                <svg
                  class="h-6 w-6 text-blue-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">课程管理</h4>
                  <p class="text-sm text-gray-500">管理平台课程内容</p>
                </div>
              </div>
            </button>

            <button
              @click="goToUserManagement"
              class="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors"
            >
              <div class="flex items-center">
                <svg
                  class="h-6 w-6 text-green-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">用户管理</h4>
                  <p class="text-sm text-gray-500">管理平台用户账号</p>
                </div>
              </div>
            </button>

            <button
              @click="goToContentManagement"
              class="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-left transition-colors"
            >
              <div class="flex items-center">
                <svg
                  class="h-6 w-6 text-yellow-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">内容管理</h4>
                  <p class="text-sm text-gray-500">管理帖子和评论</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            最近活动
          </h3>
          <div class="flow-root">
            <ul class="-mb-8">
              <li v-for="(activity, index) in recentActivities" :key="index">
                <div
                  class="relative pb-8"
                  :class="{ 'pb-0': index === recentActivities.length - 1 }"
                >
                  <span
                    v-if="index !== recentActivities.length - 1"
                    class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  ></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                        :class="activity.iconBg"
                      >
                        <component
                          :is="activity.icon"
                          class="h-5 w-5 text-white"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <div
                      class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4"
                    >
                      <div>
                        <p class="text-sm text-gray-500">
                          {{ activity.content }}
                        </p>
                      </div>
                      <div
                        class="text-right text-sm whitespace-nowrap text-gray-500"
                      >
                        <time>{{ activity.time }}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";
import { adminAPI } from "../../services/api";

const router = useRouter();
const userStore = useUserStore();

// 统计数据
const stats = reactive({
  totalUsers: 0,
  totalCourses: 0,
  totalPosts: 0,
  totalComments: 0,
});

// 最近活动数据
const recentActivities = ref([]);

// 加载状态
const loading = ref(true);

// 获取统计数据
const fetchStats = async () => {
  try {
    loading.value = true;
    const response = await adminAPI.getDashboardStats();

    if (response.success) {
      const { stats: apiStats, activities } = response.data;

      // 更新统计数据
      stats.totalUsers = apiStats.users.total;
      stats.totalCourses = apiStats.courses.total;
      stats.totalPosts = apiStats.posts.total;
      stats.totalComments = apiStats.comments.total;

      // 更新最近活动数据
      const allActivities = [];

      // 添加最近用户注册活动
      activities.recentUsers.forEach((user) => {
        allActivities.push({
          content: `${user.name} 注册了账号`,
          time: formatTime(user.time),
          originalTime: user.time,
          icon: "UserPlusIcon",
          iconBg: "bg-green-500",
        });
      });

      // 添加最近课程发布活动
      activities.recentCourses.forEach((course) => {
        allActivities.push({
          content: `${course.creator} 发布了课程《${course.title}》`,
          time: formatTime(course.time),
          originalTime: course.time,
          icon: "BookOpenIcon",
          iconBg: "bg-blue-500",
        });
      });

      // 添加最近帖子发布活动
      activities.recentPosts.forEach((post) => {
        allActivities.push({
          content: `${post.author} 发布了新帖子：${post.content}`,
          time: formatTime(post.time),
          originalTime: post.time,
          icon: "ChatBubbleLeftIcon",
          iconBg: "bg-yellow-500",
        });
      });

      // 按时间排序并取前10条
      recentActivities.value = allActivities
        .sort((a, b) => new Date(b.originalTime) - new Date(a.originalTime))
        .slice(0, 10);
    }
  } catch (error) {
    console.error("获取统计数据失败:", error);
    // 如果API调用失败，使用默认数据
    stats.totalUsers = 0;
    stats.totalCourses = 0;
    stats.totalPosts = 0;
    stats.totalComments = 0;
    recentActivities.value = [];
  } finally {
    loading.value = false;
  }
};

// 格式化时间显示
const formatTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "刚刚";
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
};

// 导航方法
const goToCourseManagement = () => {
  router.push("/admin/courses");
};

const goToUserManagement = () => {
  router.push("/admin/users");
};

const goToContentManagement = () => {
  router.push("/admin/posts");
};

const handleLogout = async () => {
  try {
    await userStore.logout();
    router.push("/login");
  } catch (error) {
    console.error("退出登录失败:", error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
/* 自定义样式 */
</style>
