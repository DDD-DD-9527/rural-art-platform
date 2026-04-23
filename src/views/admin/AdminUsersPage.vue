<template>
  <div class="admin-users-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">用户管理</h1>
          <p class="page-subtitle">管理平台用户账号与权限</p>
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
          <p class="stat-label">总用户</p>
          <p class="stat-value">{{ stats.total }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">活跃</p>
          <p class="stat-value">{{ stats.active }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">封禁</p>
          <p class="stat-value">{{ stats.banned }}</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <p class="stat-label">管理员</p>
          <p class="stat-value">{{ stats.admins }}</p>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="filters-row">
        <div class="search-box">
          <input
            v-model="search"
            type="text"
            placeholder="搜索注册号/用户名/昵称"
            class="search-input"
            @input="handleSearch"
          />
        </div>

        <div class="filter-controls">
          <select
            v-model="status"
            @change="handleFilterChange"
            class="filter-select"
          >
            <option value="">全部状态</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="banned">banned</option>
          </select>

          <select
            v-model="role"
            @change="handleFilterChange"
            class="filter-select"
          >
            <option value="">全部角色</option>
            <option value="user">user</option>
            <option value="creator">creator</option>
            <option value="admin">admin</option>
          </select>

          <select v-model="sortBy" @change="reload" class="filter-select">
            <option value="createdAt">创建时间</option>
            <option value="updatedAt">更新时间</option>
            <option value="userId">注册号</option>
            <option value="username">用户名</option>
            <option value="role">角色</option>
            <option value="status">状态</option>
          </select>
        </div>
      </div>
    </div>

    <div class="users-section">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载用户列表...</p>
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <h3 class="empty-title">暂无用户</h3>
        <p class="empty-description">当前筛选条件下没有数据</p>
      </div>

      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>注册号</th>
              <th>用户名</th>
              <th>昵称</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th class="actions-col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u._id">
              <td class="mono">{{ u.userId }}</td>
              <td>{{ u.username }}</td>
              <td>{{ u.profile?.nickname || "-" }}</td>
              <td>
                <select
                  class="inline-select"
                  :value="u.role"
                  @change="(e) => changeRole(u, e.target.value)"
                  :disabled="updatingIds.has(u._id)"
                >
                  <option value="user">user</option>
                  <option value="creator">creator</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td>
                <span class="badge" :class="statusBadgeClass(u.status)">{{
                  u.status
                }}</span>
              </td>
              <td>{{ formatDate(u.createdAt) }}</td>
              <td class="actions-col">
                <button
                  class="action-btn"
                  @click="setStatus(u, 'active')"
                  :disabled="updatingIds.has(u._id) || u.status === 'active'"
                >
                  激活
                </button>
                <button
                  class="action-btn"
                  @click="setStatus(u, 'inactive')"
                  :disabled="updatingIds.has(u._id) || u.status === 'inactive'"
                >
                  停用
                </button>
                <button
                  class="action-btn danger"
                  @click="setStatus(u, 'banned')"
                  :disabled="updatingIds.has(u._id) || u.status === 'banned'"
                >
                  封禁
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.pages > 1" class="pagination">
        <button
          @click="changePage(pagination.current - 1)"
          :disabled="pagination.current === 1 || loading"
          class="pagination-btn"
        >
          上一页
        </button>
        <div class="pagination-info">
          第 {{ pagination.current }} 页，共 {{ pagination.pages }} 页
        </div>
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

const users = ref([]);
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
  active: 0,
  banned: 0,
  admins: 0,
});

const search = ref("");
const role = ref("");
const status = ref("");
const sortBy = ref("createdAt");
const sortOrder = ref("desc");

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
  if (s === "active") return "badge-green";
  if (s === "banned") return "badge-red";
  if (s === "inactive") return "badge-gray";
  return "badge-gray";
};

const computeStats = (items, total) => {
  stats.total = total;
  stats.active = items.filter((u) => u.status === "active").length;
  stats.banned = items.filter((u) => u.status === "banned").length;
  stats.admins = items.filter((u) => u.role === "admin").length;
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const resp = await adminAPI.getUsers({
      page: pagination.current,
      limit: pagination.pageSize,
      search: search.value,
      role: role.value,
      status: status.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
    });

    if (resp?.success) {
      const list = resp.data?.users || [];
      users.value = list;
      const p = resp.data?.pagination || {};
      pagination.current = p.current || pagination.current;
      pagination.pageSize = p.pageSize || pagination.pageSize;
      pagination.total = p.total || 0;
      pagination.pages = p.pages || 1;
      computeStats(list, pagination.total);
    } else {
      users.value = [];
      computeStats([], 0);
    }
  } catch {
    users.value = [];
    computeStats([], 0);
  } finally {
    loading.value = false;
  }
};

const reload = async () => {
  pagination.current = 1;
  await fetchUsers();
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
  await fetchUsers();
};

const setStatus = async (u, nextStatus) => {
  if (!u?._id) return;
  if (!confirm(`确认将用户 ${u.userId} 状态设置为 ${nextStatus} 吗？`)) return;
  updatingIds.value.add(u._id);
  try {
    const resp = await adminAPI.updateUserStatus(u._id, nextStatus);
    if (resp?.success) {
      const updated = resp.data?.user;
      const idx = users.value.findIndex((x) => x._id === u._id);
      if (idx >= 0 && updated) users.value[idx] = updated;
      computeStats(users.value, pagination.total);
    }
  } finally {
    updatingIds.value.delete(u._id);
  }
};

const changeRole = async (u, nextRole) => {
  if (!u?._id) return;
  if (nextRole === u.role) return;
  if (!confirm(`确认将用户 ${u.userId} 角色设置为 ${nextRole} 吗？`)) return;
  updatingIds.value.add(u._id);
  try {
    const resp = await adminAPI.updateUserRole(u._id, nextRole);
    if (resp?.success) {
      const updated = resp.data?.user;
      const idx = users.value.findIndex((x) => x._id === u._id);
      if (idx >= 0 && updated) users.value[idx] = updated;
      computeStats(users.value, pagination.total);
    }
  } finally {
    updatingIds.value.delete(u._id);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.admin-users-page {
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
}
.filter-select {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}
.users-section {
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
.table-wrap {
  overflow: auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 10px 10px;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
  vertical-align: middle;
  font-size: 14px;
}
th {
  color: #6b7280;
  font-weight: 600;
  background: #fafafa;
}
.mono {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}
.inline-select {
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid transparent;
}
.badge-green {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
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
.actions-col {
  white-space: nowrap;
}
.action-btn {
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  margin-right: 8px;
}
.action-btn.danger {
  border-color: #fecaca;
  color: #b91c1c;
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
