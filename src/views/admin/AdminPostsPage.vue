<template>
  <div class="admin-posts-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">帖子管理</h1>
          <p class="page-subtitle">管理帖子内容、置顶与隐藏</p>
        </div>
        <div class="header-actions">
          <button @click="reload" class="btn-secondary" :disabled="loading">
            刷新
          </button>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">总帖子</p>
          <p class="stat-value">{{ stats.total }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">已发布</p>
          <p class="stat-value">{{ stats.published }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">已隐藏</p>
          <p class="stat-value">{{ stats.hidden }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">被举报</p>
          <p class="stat-value">{{ stats.reported }}</p>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <input
            v-model="search"
            type="text"
            placeholder="搜索帖子内容/标签"
            class="search-input"
            @input="handleSearch"
          />
        </div>

        <div class="filter-controls">
          <select v-model="status" @change="handleFilterChange" class="filter-select">
            <option value="">全部状态</option>
            <option value="published">published</option>
            <option value="hidden">hidden</option>
            <option value="draft">draft</option>
            <option value="deleted">deleted</option>
          </select>

          <select v-model="type" @change="handleFilterChange" class="filter-select">
            <option value="">全部类型</option>
            <option value="share">share</option>
            <option value="question">question</option>
            <option value="showcase">showcase</option>
            <option value="tutorial">tutorial</option>
            <option value="discussion">discussion</option>
          </select>

          <select v-model="visibility" @change="handleFilterChange" class="filter-select">
            <option value="">全部可见性</option>
            <option value="public">public</option>
            <option value="followers">followers</option>
            <option value="private">private</option>
          </select>

          <label class="checkbox">
            <input type="checkbox" v-model="reportedOnly" @change="handleFilterChange" />
            仅举报
          </label>

          <label class="checkbox">
            <input type="checkbox" v-model="pinnedOnly" @change="handleFilterChange" />
            仅置顶
          </label>
        </div>
      </div>
    </div>

    <div class="posts-section">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载帖子列表...</p>
      </div>

      <div v-else-if="posts.length === 0" class="empty-state">
        <h3 class="empty-title">暂无帖子</h3>
        <p class="empty-description">当前筛选条件下没有数据</p>
      </div>

      <div v-else class="posts-list">
        <div v-for="p in posts" :key="p._id" class="post-card">
          <div class="post-top">
            <div class="post-meta">
              <div class="author">
                <img
                  v-if="p.author?.profile?.avatar"
                  :src="p.author.profile.avatar"
                  class="avatar"
                  alt=""
                />
                <div class="author-text">
                  <div class="author-name">
                    {{ p.author?.profile?.nickname || p.author?.username || "-" }}
                    <span class="mono">({{ p.author?.userId || "-" }})</span>
                  </div>
                  <div class="muted">
                    {{ formatDate(p.createdAt) }}
                    · <span class="badge" :class="statusBadgeClass(p.status)">{{ p.status }}</span>
                    · <span class="badge badge-gray">{{ p.visibility }}</span>
                    <span v-if="p.isPinned" class="badge badge-blue">pinned</span>
                    <span v-if="p.reportsCount > 0" class="badge badge-red">
                      reports {{ p.reportsCount }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="post-actions">
              <button
                class="action-btn"
                @click="togglePin(p)"
                :disabled="updatingIds.has(p._id)"
              >
                {{ p.isPinned ? "取消置顶" : "置顶" }}
              </button>

              <button
                class="action-btn"
                @click="toggleHidden(p)"
                :disabled="updatingIds.has(p._id)"
              >
                {{ p.status === "hidden" ? "恢复发布" : "隐藏" }}
              </button>

              <button
                class="action-btn danger"
                @click="removePost(p)"
                :disabled="updatingIds.has(p._id)"
              >
                删除
              </button>
            </div>
          </div>

          <div class="post-content">{{ p.content }}</div>

          <div class="post-bottom">
            <div class="tags">
              <span v-for="t in (p.tags || []).slice(0, 6)" :key="t" class="tag">{{ t }}</span>
              <span v-if="(p.tags || []).length > 6" class="tag-more">
                +{{ (p.tags || []).length - 6 }}
              </span>
            </div>
            <div class="stats">
              <span>👍 {{ p.stats?.likeCount || 0 }}</span>
              <span>💬 {{ p.stats?.commentCount || 0 }}</span>
              <span>👀 {{ p.stats?.viewCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pagination.pages > 1" class="pagination">
        <button
          @click="changePage(pagination.current - 1)"
          :disabled="pagination.current === 1 || loading"
          class="pagination-btn"
        >
          上一页
        </button>
        <div class="pagination-info">第 {{ pagination.current }} 页，共 {{ pagination.pages }} 页</div>
        <button
          @click="changePage(pagination.current + 1)"
          :disabled="pagination.current === pagination.pages || loading"
          class="pagination-btn"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { adminAPI } from "@/services/api";

const posts = ref([]);
const loading = ref(false);
const updatingIds = ref(new Set());

const pagination = reactive({
  current: 1,
  pages: 1,
  pageSize: 20,
  total: 0,
});

const stats = reactive({
  total: 0,
  published: 0,
  hidden: 0,
  reported: 0,
});

const search = ref("");
const status = ref("");
const type = ref("");
const visibility = ref("");
const reportedOnly = ref(false);
const pinnedOnly = ref(false);

let searchTimer = null;

const formatDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("zh-CN");
  } catch {
    return "-";
  }
};

const statusBadgeClass = (s) => {
  if (s === "published") return "badge-green";
  if (s === "hidden") return "badge-yellow";
  if (s === "draft") return "badge-gray";
  if (s === "deleted") return "badge-red";
  return "badge-gray";
};

const computeStats = (items, total) => {
  stats.total = total;
  stats.published = items.filter((p) => p.status === "published").length;
  stats.hidden = items.filter((p) => p.status === "hidden").length;
  stats.reported = items.filter((p) => (p.reportsCount || 0) > 0).length;
};

const fetchPosts = async () => {
  loading.value = true;
  try {
    const resp = await adminAPI.getPosts({
      page: pagination.current,
      limit: pagination.pageSize,
      search: search.value,
      status: status.value,
      type: type.value,
      visibility: visibility.value,
      reportedOnly: reportedOnly.value ? "true" : "false",
      pinned: pinnedOnly.value ? "true" : "",
    });

    if (resp?.success) {
      const list = resp.data?.posts || [];
      posts.value = list;
      const p = resp.data?.pagination || {};
      pagination.current = p.current || pagination.current;
      pagination.pageSize = p.pageSize || pagination.pageSize;
      pagination.total = p.total || 0;
      pagination.pages = p.pages || 1;
      computeStats(list, pagination.total);
    } else {
      posts.value = [];
      computeStats([], 0);
    }
  } catch {
    posts.value = [];
    computeStats([], 0);
  } finally {
    loading.value = false;
  }
};

const reload = async () => {
  pagination.current = 1;
  await fetchPosts();
};

const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    reload();
  }, 300);
};

const handleFilterChange = () => {
  reload();
};

const changePage = async (page) => {
  const next = Math.min(Math.max(page, 1), pagination.pages);
  if (next === pagination.current) return;
  pagination.current = next;
  await fetchPosts();
};

const togglePin = async (p) => {
  if (!p?._id) return;
  updatingIds.value.add(p._id);
  try {
    const resp = await adminAPI.setPostPinned(p._id, !p.isPinned);
    if (resp?.success) {
      const updated = resp.data?.post;
      const idx = posts.value.findIndex((x) => x._id === p._id);
      if (idx >= 0 && updated) posts.value[idx] = updated;
      computeStats(posts.value, pagination.total);
    }
  } finally {
    updatingIds.value.delete(p._id);
  }
};

const toggleHidden = async (p) => {
  if (!p?._id) return;
  const next = p.status === "hidden" ? "published" : "hidden";
  updatingIds.value.add(p._id);
  try {
    const resp = await adminAPI.updatePostStatus(p._id, next);
    if (resp?.success) {
      const updated = resp.data?.post;
      const idx = posts.value.findIndex((x) => x._id === p._id);
      if (idx >= 0 && updated) posts.value[idx] = updated;
      computeStats(posts.value, pagination.total);
    }
  } finally {
    updatingIds.value.delete(p._id);
  }
};

const removePost = async (p) => {
  if (!p?._id) return;
  if (!confirm("确认删除该帖子吗？此操作会将状态标记为 deleted")) return;
  updatingIds.value.add(p._id);
  try {
    const resp = await adminAPI.deletePost(p._id);
    if (resp?.success) {
      const updated = resp.data?.post;
      const idx = posts.value.findIndex((x) => x._id === p._id);
      if (idx >= 0 && updated) posts.value[idx] = updated;
      computeStats(posts.value, pagination.total);
    }
  } finally {
    updatingIds.value.delete(p._id);
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.admin-posts-page {
  padding: 24px;
}
.page-header {
  margin-bottom: 16px;
}
.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.page-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
}
.btn-secondary {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
}
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
}
.stat-label {
  color: #6b7280;
  margin: 0;
  font-size: 12px;
}
.stat-value {
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 700;
}
.filters-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 16px;
}
.filters-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.search-box {
  flex: 1;
  min-width: 240px;
}
.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.filter-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-select {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}
.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #374151;
}
.posts-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}
.loading-state {
  padding: 24px;
  text-align: center;
  color: #6b7280;
}
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #111827;
  border-radius: 50%;
  margin: 0 auto 10px;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.empty-state {
  padding: 24px;
  text-align: center;
}
.empty-title {
  margin: 0;
  font-weight: 700;
}
.empty-description {
  margin: 8px 0 0;
  color: #6b7280;
}
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.post-card {
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 12px;
}
.post-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.author {
  display: flex;
  gap: 10px;
  align-items: center;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}
.author-name {
  font-weight: 600;
}
.muted {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}
.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid transparent;
}
.badge-green {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.badge-yellow {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}
.badge-red {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.badge-gray {
  background: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
}
.badge-blue {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.post-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.action-btn {
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  white-space: nowrap;
}
.action-btn.danger {
  border-color: #fecaca;
  color: #b91c1c;
}
.post-content {
  margin-top: 10px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #111827;
}
.post-bottom {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
}
.tag-more {
  color: #6b7280;
  font-size: 12px;
}
.stats {
  display: flex;
  gap: 12px;
  color: #6b7280;
  font-size: 13px;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 6px 6px;
}
.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
}
.pagination-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pagination-info {
  color: #6b7280;
}
@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

