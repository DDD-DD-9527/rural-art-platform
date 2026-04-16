<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面头部 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">课程管理</h1>
            <p class="mt-1 text-sm text-gray-500">管理平台上的所有课程内容</p>
          </div>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
            创建课程
          </button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <BookOpenIcon class="h-6 w-6 text-gray-400" />
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
                <CheckCircleIcon class="h-6 w-6 text-green-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    已发布
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.publishedCourses }}
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
                <ClockIcon class="h-6 w-6 text-yellow-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    草稿
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.draftCourses }}
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
                <UsersIcon class="h-6 w-6 text-blue-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    总报名数
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalEnrollments }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
          >
            <div class="flex-1 min-w-0">
              <div class="relative rounded-md shadow-sm">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索课程标题、创作者..."
                  class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  @input="debouncedSearch"
                />
              </div>
            </div>
            <div class="flex space-x-4">
              <select
                v-model="filters.category"
                @change="loadCourses"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">所有分类</option>
                <option value="traditional-crafts">传统工艺</option>
                <option value="painting">绘画艺术</option>
                <option value="sculpture">雕塑艺术</option>
                <option value="textile">纺织艺术</option>
                <option value="pottery">陶艺</option>
                <option value="woodwork">木工艺</option>
                <option value="paper-art">纸艺</option>
                <option value="folk-art">民间艺术</option>
                <option value="calligraphy">书法</option>
                <option value="other">其他</option>
              </select>
              <select
                v-model="filters.status"
                @change="loadCourses"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">所有状态</option>
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 课程列表 -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div v-if="loading" class="p-6 text-center">
          <div
            class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white"
          >
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            加载中...
          </div>
        </div>

        <ul v-else-if="courses.length > 0" class="divide-y divide-gray-200">
          <li v-for="course in courses" :key="course._id" class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <img
                    :src="course.thumbnail || '/placeholder-course.jpg'"
                    :alt="course.title"
                    class="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <h3 class="text-lg font-medium text-gray-900 truncate">
                      {{ course.title }}
                    </h3>
                    <span
                      :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        course.settings?.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{ course.settings?.isPublished ? "已发布" : "草稿" }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ course.description }}
                  </p>
                  <div
                    class="flex items-center space-x-4 mt-2 text-sm text-gray-500"
                  >
                    <span
                      >创作者:
                      {{
                        course.creator?.profile?.nickname ||
                        course.creator?.username
                      }}</span
                    >
                    <span>分类: {{ getCategoryName(course.category) }}</span>
                    <span
                      >难度: {{ getDifficultyName(course.difficulty) }}</span
                    >
                    <span>报名: {{ course.stats?.enrolledCount || 0 }}人</span>
                    <span>创建: {{ formatDate(course.createdAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="viewCourse(course)"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <EyeIcon class="-ml-0.5 mr-2 h-4 w-4" />
                  查看
                </button>
                <button
                  @click="editCourse(course)"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PencilIcon class="-ml-0.5 mr-2 h-4 w-4" />
                  编辑
                </button>
                <button
                  v-if="course.settings?.isPublished"
                  @click="unpublishCourse(course)"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <XMarkIcon class="-ml-0.5 mr-2 h-4 w-4" />
                  下架
                </button>
                <button
                  v-else
                  @click="publishCourse(course)"
                  class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckIcon class="-ml-0.5 mr-2 h-4 w-4" />
                  发布
                </button>
                <button
                  @click="deleteCourse(course)"
                  class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon class="-ml-0.5 mr-2 h-4 w-4" />
                  删除
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div v-else class="p-6 text-center text-gray-500">
          <BookOpenIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">暂无课程</h3>
          <p class="mt-1 text-sm text-gray-500">开始创建您的第一个课程吧</p>
        </div>
      </div>

      <!-- 分页 -->
      <div
        v-if="pagination.pages > 1"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="changePage(pagination.current - 1)"
            :disabled="pagination.current <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button
            @click="changePage(pagination.current + 1)"
            :disabled="pagination.current >= pagination.pages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
        <div
          class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm text-gray-700">
              显示第
              <span class="font-medium">{{
                (pagination.current - 1) * pagination.pageSize + 1
              }}</span>
              到
              <span class="font-medium">{{
                Math.min(
                  pagination.current * pagination.pageSize,
                  pagination.total,
                )
              }}</span>
              条， 共
              <span class="font-medium">{{ pagination.total }}</span> 条记录
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                @click="changePage(pagination.current - 1)"
                :disabled="pagination.current <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="h-5 w-5" />
              </button>
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === pagination.current
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="changePage(pagination.current + 1)"
                :disabled="pagination.current >= pagination.pages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建课程模态框 -->
    <CourseCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCourseCreated"
    />

    <!-- 编辑课程模态框 -->
    <CourseEditModal
      v-if="showEditModal && selectedCourse"
      :course="selectedCourse"
      @close="showEditModal = false"
      @updated="handleCourseUpdated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { courseAPI } from "@/services/api";
import { debounce } from "lodash-es";
import {
  PlusIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import CourseCreateModal from "@/components/admin/CourseCreateModal.vue";
import CourseEditModal from "@/components/admin/CourseEditModal.vue";

const router = useRouter();

// 响应式数据
const loading = ref(false);
const courses = ref([]);
const searchQuery = ref("");
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedCourse = ref(null);

// 统计数据
const stats = reactive({
  totalCourses: 0,
  publishedCourses: 0,
  draftCourses: 0,
  totalEnrollments: 0,
});

// 筛选条件
const filters = reactive({
  category: "",
  status: "",
});

// 分页数据
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  pages: 0,
});

// 防抖搜索
const debouncedSearch = debounce(() => {
  pagination.current = 1;
  loadCourses();
}, 500);

// 加载课程列表
const loadCourses = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      search: searchQuery.value,
      category: filters.category,
      isPublished:
        filters.status === "published"
          ? true
          : filters.status === "draft"
            ? false
            : undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    };

    const response = await courseAPI.getCourses(params);
    if (response.data.success) {
      courses.value = response.data.data.courses;
      Object.assign(pagination, response.data.data.pagination);
    }
  } catch (error) {
    console.error("加载课程列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const loadStats = async () => {
  try {
    // 获取所有课程统计
    const allCoursesResponse = await courseAPI.getCourses({ limit: 1 });
    if (allCoursesResponse.data.success) {
      stats.totalCourses = allCoursesResponse.data.data.pagination.total;
    }

    // 获取已发布课程统计
    const publishedResponse = await courseAPI.getCourses({
      isPublished: true,
      limit: 1,
    });
    if (publishedResponse.data.success) {
      stats.publishedCourses = publishedResponse.data.data.pagination.total;
    }

    // 获取草稿课程统计
    const draftResponse = await courseAPI.getCourses({
      isPublished: false,
      limit: 1,
    });
    if (draftResponse.data.success) {
      stats.draftCourses = draftResponse.data.data.pagination.total;
    }

    // 计算总报名数
    stats.totalEnrollments = courses.value.reduce((total, course) => {
      return total + (course.stats?.enrolledCount || 0);
    }, 0);
  } catch (error) {
    console.error("加载统计数据失败:", error);
  }
};

// 查看课程
const viewCourse = (course) => {
  router.push(`/course/${course._id}`);
};

// 编辑课程
const editCourse = (course) => {
  selectedCourse.value = course;
  showEditModal.value = true;
};

// 发布课程
const publishCourse = async (course) => {
  try {
    const response = await courseAPI.publishCourse(course._id);
    if (response.data.success) {
      course.settings.isPublished = true;
      loadStats();
    }
  } catch (error) {
    console.error("发布课程失败:", error);
  }
};

// 下架课程
const unpublishCourse = async (course) => {
  try {
    const response = await courseAPI.unpublishCourse(course._id);
    if (response.data.success) {
      course.settings.isPublished = false;
      loadStats();
    }
  } catch (error) {
    console.error("下架课程失败:", error);
  }
};

// 删除课程
const deleteCourse = async (course) => {
  if (!confirm(`确定要删除课程「${course.title}」吗？此操作不可恢复。`)) {
    return;
  }

  try {
    const response = await courseAPI.deleteCourse(course._id);
    if (response.data.success) {
      await loadCourses();
      await loadStats();
    }
  } catch (error) {
    console.error("删除课程失败:", error);
  }
};

// 切换页码
const changePage = (page) => {
  if (page >= 1 && page <= pagination.pages) {
    pagination.current = page;
    loadCourses();
  }
};

// 获取页码数组
const getPageNumbers = () => {
  const pages = [];
  const total = pagination.pages;
  const current = pagination.current;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(total);
    }
  }

  return pages.filter(
    (page) => page !== "..." || pages.indexOf(page) === pages.lastIndexOf(page),
  );
};

// 处理课程创建成功
const handleCourseCreated = () => {
  showCreateModal.value = false;
  loadCourses();
  loadStats();
};

// 处理课程更新成功
const handleCourseUpdated = () => {
  showEditModal.value = false;
  selectedCourse.value = null;
  loadCourses();
  loadStats();
};

// 获取分类名称
const getCategoryName = (category) => {
  const categoryMap = {
    "traditional-crafts": "传统工艺",
    painting: "绘画艺术",
    sculpture: "雕塑艺术",
    textile: "纺织艺术",
    pottery: "陶艺",
    woodwork: "木工艺",
    "paper-art": "纸艺",
    "folk-art": "民间艺术",
    calligraphy: "书法",
    other: "其他",
  };
  return categoryMap[category] || category;
};

// 获取难度名称
const getDifficultyName = (difficulty) => {
  const difficultyMap = {
    beginner: "初级",
    intermediate: "中级",
    advanced: "高级",
  };
  return difficultyMap[difficulty] || difficulty;
};

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("zh-CN");
};

// 组件挂载时加载数据
onMounted(() => {
  loadCourses();
  loadStats();
});
</script>
