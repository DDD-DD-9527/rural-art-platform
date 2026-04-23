<template>
  <div class="admin-subsidy-config-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">技能补贴配置</h1>
          <p class="page-subtitle">
            配置补贴政策展示、课程清单与示例记录（JSON）
          </p>
        </div>
        <div class="header-actions">
          <button @click="reload" class="btn-secondary" :disabled="loading">
            刷新
          </button>
          <button
            @click="save"
            class="btn-primary"
            :disabled="loading || saving"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <div v-if="errorText" class="alert alert-error">{{ errorText }}</div>
    <div v-if="successText" class="alert alert-success">{{ successText }}</div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">配置 JSON</div>
        <div class="card-desc">
          保存后前台 /subsidy 与个人中心补贴卡片会实时按配置展示
        </div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
      <textarea
        v-else
        v-model="editorText"
        class="editor"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { adminAPI } from "@/services/api";

const loading = ref(false);
const saving = ref(false);
const editorText = ref("");
const errorText = ref("");
const successText = ref("");

const loadConfig = async () => {
  loading.value = true;
  errorText.value = "";
  successText.value = "";
  try {
    const resp = await adminAPI.getSubsidyConfig();
    if (resp?.success) {
      const cfg = resp.data?.config || {};
      editorText.value = JSON.stringify(cfg, null, 2);
    } else {
      editorText.value = "{}";
    }
  } catch (e) {
    errorText.value = e?.message || "加载失败";
    editorText.value = "{}";
  } finally {
    loading.value = false;
  }
};

const reload = async () => {
  await loadConfig();
};

const save = async () => {
  saving.value = true;
  errorText.value = "";
  successText.value = "";
  try {
    const parsed = JSON.parse(editorText.value || "{}");
    const resp = await adminAPI.updateSubsidyConfig(parsed);
    if (resp?.success) {
      const cfg = resp.data?.config || parsed;
      editorText.value = JSON.stringify(cfg, null, 2);
      successText.value = "保存成功";
    }
  } catch (e) {
    errorText.value = e?.message || "保存失败";
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.admin-subsidy-config-page {
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
.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.btn-secondary {
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
}
.btn-primary {
  padding: 10px 14px;
  border: 1px solid #1d4ed8;
  background: #2563eb;
  color: #fff;
  border-radius: 10px;
}
.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.alert {
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid transparent;
}
.alert-error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}
.alert-success {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #065f46;
}
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}
.card-header {
  padding: 12px 12px 0;
}
.card-title {
  font-weight: 700;
  color: #111827;
}
.card-desc {
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
}
.loading {
  padding: 14px 12px;
  color: #6b7280;
}
.editor {
  width: 100%;
  min-height: 560px;
  padding: 12px;
  border: 0;
  border-top: 1px solid #f3f4f6;
  outline: none;
  resize: vertical;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
