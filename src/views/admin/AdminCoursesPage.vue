<template>
  <div class="admin-courses-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">课程管理</h1>
          <p class="page-subtitle">管理平台上的所有课程内容</p>
        </div>
        <div class="header-actions">
          <button @click="showUploadForm = true" class="btn-primary">
            <PlusIcon class="w-4 h-4" />
            新建课程
          </button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100 text-blue-600">
          <BookOpenIcon class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <p class="stat-label">总课程数</p>
          <p class="stat-value">{{ stats.totalCourses }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green-100 text-green-600">
          <CheckCircleIcon class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <p class="stat-label">已发布</p>
          <p class="stat-value">{{ stats.publishedCourses }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-yellow-100 text-yellow-600">
          <ClockIcon class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <p class="stat-label">草稿</p>
          <p class="stat-value">{{ stats.draftCourses }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-purple-100 text-purple-600">
          <UsersIcon class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <p class="stat-label">总学员</p>
          <p class="stat-value">{{ stats.totalStudents }}</p>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <SearchIcon class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索课程标题、分类..."
            class="search-input"
            @input="handleSearch"
          />
        </div>

        <div class="filter-controls">
          <select
            v-model="statusFilter"
            @change="handleFilterChange"
            class="filter-select"
          >
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="archived">已归档</option>
          </select>

          <select
            v-model="categoryFilter"
            @change="handleFilterChange"
            class="filter-select"
          >
            <option value="">全部分类</option>
            <option value="painting">绘画</option>
            <option value="calligraphy">书法</option>
            <option value="handicraft">手工艺</option>
            <option value="sculpture">雕塑</option>
            <option value="photography">摄影</option>
            <option value="music">音乐</option>
            <option value="dance">舞蹈</option>
            <option value="other">其他</option>
          </select>

          <select v-model="sortBy" @change="loadCourses" class="filter-select">
            <option value="createdAt">创建时间</option>
            <option value="updatedAt">更新时间</option>
            <option value="title">标题</option>
            <option value="enrollmentCount">报名人数</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 课程列表 -->
    <div class="courses-section">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载课程列表...</p>
      </div>

      <div v-else-if="courses.length === 0" class="empty-state">
        <BookOpenIcon class="w-16 h-16 text-gray-300" />
        <h3 class="empty-title">暂无课程</h3>
        <p class="empty-description">开始创建您的第一个课程吧</p>
        <button @click="showUploadForm = true" class="btn-primary">
          <PlusIcon class="w-4 h-4" />
          新建课程
        </button>
      </div>

      <div v-else class="courses-grid">
        <div v-for="course in courses" :key="course._id" class="course-card">
          <!-- 课程封面 -->
          <div class="course-thumbnail">
            <img
              v-if="course.thumbnail"
              :src="course.thumbnail.url"
              :alt="course.title"
              class="thumbnail-image"
            />
            <div v-else class="thumbnail-placeholder">
              <ImageIcon class="w-8 h-8 text-gray-400" />
            </div>

            <!-- 状态标签 -->
            <div
              class="status-badge"
              :class="getStatusClass(course.settings?.isPublished)"
            >
              {{ getStatusText(course.settings?.isPublished) }}
            </div>
          </div>

          <!-- 课程信息 -->
          <div class="course-content">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-description">
              {{ truncateText(course.description, 100) }}
            </p>

            <div class="course-meta">
              <div class="meta-item">
                <TagIcon class="w-4 h-4" />
                <span>{{ getCategoryText(course.category) }}</span>
              </div>
              <div class="meta-item">
                <ClockIcon class="w-4 h-4" />
                <span>{{ course.duration || 0 }}分钟</span>
              </div>
              <div class="meta-item">
                <UsersIcon class="w-4 h-4" />
                <span>{{ course.enrollmentCount || 0 }}人报名</span>
              </div>
            </div>

            <div class="course-tags">
              <span
                v-for="tag in course.tags?.slice(0, 3)"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="course.tags?.length > 3" class="tag-more">
                +{{ course.tags.length - 3 }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="course-actions">
            <button @click="editCourse(course)" class="action-btn edit-btn">
              <EditIcon class="w-4 h-4" />
              编辑
            </button>
            <button @click="viewCourse(course)" class="action-btn view-btn">
              <EyeIcon class="w-4 h-4" />
              查看
            </button>
            <button @click="deleteCourse(course)" class="action-btn delete-btn">
              <TrashIcon class="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <ChevronLeftIcon class="w-4 h-4" />
          上一页
        </button>

        <div class="pagination-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </div>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          下一页
          <ChevronRightIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 课程上传表单模态框 -->
    <div v-if="showUploadForm" class="modal-overlay" @click="closeUploadForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            {{ editingCourse ? "编辑课程" : "新建课程" }}
          </h2>
          <button @click="closeUploadForm" class="modal-close">
            <XIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="modal-body">
          <CourseUploadForm
            :course="editingCourse"
            @success="handleUploadSuccess"
            @cancel="closeUploadForm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  PlusIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  SearchIcon,
  ImageIcon,
  TagIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-vue-next";
import CourseUploadForm from "../../components/admin/CourseUploadForm.vue";
import { courseAPI } from "../../services/api";

const router = useRouter();

// 响应式数据
const loading = ref(false);
const courses = ref([]);
const showUploadForm = ref(false);
const editingCourse = ref(null);

// 搜索和筛选
const searchQuery = ref("");
const statusFilter = ref("");
const categoryFilter = ref("");
const sortBy = ref("createdAt");

// 分页
const currentPage = ref(1);
const pageSize = ref(12);
const totalCourses = ref(0);

// 统计数据
const stats = reactive({
  totalCourses: 0,
  publishedCourses: 0,
  draftCourses: 0,
  totalStudents: 0,
});

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(totalCourses.value / pageSize.value);
});

// 加载课程列表
const loadCourses = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
      category: categoryFilter.value,
      sortBy: sortBy.value,
      sortOrder: "desc",
    };

    const response = await courseAPI.getCourses(params);
    courses.value = response.data.courses || [];
    totalCourses.value =
      response.data.pagination?.total || response.data.total || 0;

    // 更新统计数据
    await updateStats();
  } catch (error) {
    console.error("加载课程列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 更新统计数据
const updateStats = async () => {
  try {
    // 获取所有课程统计
    const allCoursesResponse = await courseAPI.getCourses({
      status: "",
      limit: 1,
    });
    if (allCoursesResponse.data) {
      stats.totalCourses =
        allCoursesResponse.data.pagination?.total ||
        allCoursesResponse.data.total ||
        0;
    }

    // 获取已发布课程统计
    const publishedResponse = await courseAPI.getCourses({
      status: "published",
      limit: 1,
    });
    if (publishedResponse.data) {
      stats.publishedCourses =
        publishedResponse.data.pagination?.total ||
        publishedResponse.data.total ||
        0;
    }

    // 获取草稿课程统计
    const draftResponse = await courseAPI.getCourses({
      status: "draft",
      limit: 1,
    });
    if (draftResponse.data) {
      stats.draftCourses =
        draftResponse.data.pagination?.total || draftResponse.data.total || 0;
    }

    // 计算总学员数（基于当前页面的课程）
    stats.totalStudents = courses.value.reduce(
      (sum, c) =>
        sum + (c.students || c.enrollmentCount || c.stats?.enrolledCount || 0),
      0,
    );
  } catch (error) {
    console.error("更新统计数据失败:", error);
    // 如果API调用失败，使用当前页面数据作为备选
    stats.totalCourses = totalCourses.value;
    stats.publishedCourses = courses.value.filter(
      (c) => c.settings?.isPublished === true,
    ).length;
    stats.draftCourses = courses.value.filter(
      (c) =>
        c.settings?.isPublished === false ||
        c.settings?.isPublished === undefined,
    ).length;
    stats.totalStudents = courses.value.reduce(
      (sum, c) =>
        sum + (c.students || c.enrollmentCount || c.stats?.enrolledCount || 0),
      0,
    );
  }
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  loadCourses();
};

// 分页处理
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadCourses();
  }
};

// 课程操作
const editCourse = (course) => {
  editingCourse.value = course;
  showUploadForm.value = true;
};

const viewCourse = (course) => {
  const courseId = course.id || course._id;
  router.push(`/courses/${courseId}`);
};

const deleteCourse = async (course) => {
  if (!confirm(`确定要删除课程「${course.title}」吗？此操作不可恢复。`)) {
    return;
  }

  try {
    const courseId = course.id || course._id;
    await courseAPI.deleteCourse(courseId);
    loadCourses();
    alert("课程删除成功");
  } catch (error) {
    console.error("删除课程失败:", error);
    alert("删除课程失败，请重试");
  }
};

// 表单处理
const closeUploadForm = () => {
  showUploadForm.value = false;
  editingCourse.value = null;
};

const handleUploadSuccess = () => {
  closeUploadForm();
  loadCourses();
};

// 工具函数
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const getStatusClass = (isPublished) => {
  if (isPublished === true) {
    return "status-published";
  } else if (isPublished === false) {
    return "status-draft";
  } else {
    return "status-draft";
  }
};

const getStatusText = (isPublished) => {
  if (isPublished === true) {
    return "已发布";
  } else if (isPublished === false) {
    return "草稿";
  } else {
    return "草稿";
  }
};

const getCategoryText = (category) => {
  const categories = {
    painting: "绘画",
    calligraphy: "书法",
    handicraft: "手工艺",
    sculpture: "雕塑",
    photography: "摄影",
    music: "音乐",
    dance: "舞蹈",
    other: "其他",
  };
  return categories[category] || category;
};

// 监听筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1; // 重置到第一页
  loadCourses();
};

// 组件挂载
onMounted(() => {
  loadCourses();
});
</script>

<style scoped>
.admin-courses-page {
  @apply min-h-screen bg-gray-50 p-6;
}

.page-header {
  @apply mb-8;
}

.header-content {
  @apply flex items-center justify-between;
}

.header-info {
  @apply space-y-1;
}

.page-title {
  @apply text-3xl font-bold text-gray-900;
}

.page-subtitle {
  @apply text-gray-600;
}

.header-actions {
  @apply flex gap-3;
}

.btn-primary {
  @apply flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8;
}

.stat-card {
  @apply bg-white p-6 rounded-lg shadow-sm flex items-center gap-4;
}

.stat-icon {
  @apply p-3 rounded-lg;
}

.stat-content {
  @apply space-y-1;
}

.stat-label {
  @apply text-sm text-gray-600;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900;
}

.filters-section {
  @apply bg-white p-6 rounded-lg shadow-sm mb-8;
}

.filters-row {
  @apply flex flex-col md:flex-row gap-4 items-center;
}

.search-box {
  @apply relative flex-1 max-w-md;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400;
}

.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.filter-controls {
  @apply flex gap-3;
}

.filter-select {
  @apply px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.courses-section {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-12 space-y-4;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-12 space-y-4;
}

.empty-title {
  @apply text-xl font-semibold text-gray-900;
}

.empty-description {
  @apply text-gray-600;
}

.courses-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

.course-card {
  @apply bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow;
}

.course-thumbnail {
  @apply relative h-48;
}

.thumbnail-image {
  @apply w-full h-full object-cover;
}

.thumbnail-placeholder {
  @apply w-full h-full bg-gray-100 flex items-center justify-center;
}

.status-badge {
  @apply absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full;
}

.status-published {
  @apply bg-green-100 text-green-800;
}

.status-draft {
  @apply bg-yellow-100 text-yellow-800;
}

.status-archived {
  @apply bg-gray-100 text-gray-800;
}

.course-content {
  @apply p-4 space-y-3;
}

.course-title {
  @apply font-semibold text-gray-900 line-clamp-2;
}

.course-description {
  @apply text-sm text-gray-600 line-clamp-3;
}

.course-meta {
  @apply space-y-2;
}

.meta-item {
  @apply flex items-center gap-2 text-xs text-gray-500;
}

.course-tags {
  @apply flex flex-wrap gap-1;
}

.tag {
  @apply px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full;
}

.tag-more {
  @apply px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full;
}

.course-actions {
  @apply flex border-t border-gray-200;
}

.action-btn {
  @apply flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors;
}

.edit-btn {
  @apply text-blue-600 hover:bg-blue-50;
}

.view-btn {
  @apply text-green-600 hover:bg-green-50 border-x border-gray-200;
}

.delete-btn {
  @apply text-red-600 hover:bg-red-50;
}

.pagination {
  @apply flex items-center justify-between mt-8 pt-6 border-t border-gray-200;
}

.pagination-btn {
  @apply flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.pagination-info {
  @apply text-sm text-gray-600;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.modal-close {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply overflow-y-auto max-h-[calc(90vh-80px)];
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
