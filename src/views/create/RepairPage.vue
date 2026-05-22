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
          <h1 class="text-lg font-semibold text-slate-800">智能修复</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 功能介绍 -->
      <div class="text-center mb-8">
        <div
          class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <WandIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-4">AI智能修复</h1>
        <p class="text-lg text-slate-600">修复老旧艺术品的损坏和缺失部分</p>
      </div>

      <!-- 图片上传 -->
      <div class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">
          上传需要修复的图片
        </h2>

        <div
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer"
          :class="{ 'border-purple-500 bg-purple-50': isDragging }"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="hidden"
          />

          <div v-if="!uploadedImage">
            <UploadIcon class="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-slate-800 mb-2">
              拖拽或点击上传图片
            </h3>
            <p class="text-slate-600 mb-4">
              支持 JPG、PNG、WEBP 格式，最大 10MB
            </p>
            <button
              @click="$refs.fileInput.click()"
              class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              选择文件
            </button>
          </div>

          <div v-else class="relative">
            <img
              :src="uploadedImage"
              alt="上传的图片"
              class="max-w-full max-h-96 mx-auto rounded-xl shadow-lg"
            />
            <button
              @click="removeImage"
              class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- 修复选项 -->
      <div v-if="uploadedImage" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">修复选项</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-slate-800">修复类型</h3>
            <div class="space-y-3">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="repairOptions.cracks"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span class="text-slate-700">裂纹修复</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="repairOptions.stains"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span class="text-slate-700">污渍清除</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="repairOptions.missing"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span class="text-slate-700">缺失补全</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="repairOptions.fading"
                  class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span class="text-slate-700">褪色恢复</span>
              </label>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-slate-800">修复强度</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >修复程度</label
                >
                <input
                  type="range"
                  v-model="repairSettings.intensity"
                  min="1"
                  max="10"
                  class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="flex justify-between text-xs text-slate-500 mt-1">
                  <span>轻微</span>
                  <span>{{ repairSettings.intensity }}</span>
                  <span>完全</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2"
                  >保真度</label
                >
                <select
                  v-model="repairSettings.fidelity"
                  class="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="high">高保真（保持原貌）</option>
                  <option value="medium">中等（适度修复）</option>
                  <option value="creative">创意（艺术化修复）</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <button
            @click="startRepair"
            :disabled="!hasSelectedOptions || isRepairing"
            class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {{ isRepairing ? "修复中..." : "开始修复" }}
          </button>
        </div>
      </div>

      <!-- 修复结果 -->
      <div v-if="repairResult" class="glass-effect rounded-3xl p-8 mb-8">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">修复结果</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 class="text-lg font-semibold text-slate-800 mb-4">修复前</h3>
            <img
              :src="uploadedImage"
              alt="修复前"
              class="w-full rounded-xl shadow-lg"
            />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-slate-800 mb-4">修复后</h3>
            <img
              :src="repairResult.image"
              alt="修复后"
              class="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-4 justify-center">
          <a
            :href="repairResult.image"
            download
            class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            下载修复图片
          </a>
          <button
            class="px-6 py-3 border-2 border-slate-300 text-slate-600 rounded-2xl font-semibold hover:bg-slate-50 transition-all duration-300"
            @click="startRepair"
          >
            重新修复
          </button>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeftIcon, WandIcon, UploadIcon, XIcon } from "lucide-vue-next";
import BottomNavigation from "../../components/BottomNavigation.vue";
import { aiAPI } from "../../services/api";

const router = useRouter();
const activeTab = ref("create");

const uploadedImage = ref("");
const uploadedFile = ref(null);
const isDragging = ref(false);
const isRepairing = ref(false);
const repairResult = ref(null);

const repairOptions = reactive({
  cracks: false,
  stains: false,
  missing: false,
  fading: false,
});

const repairSettings = reactive({
  intensity: 5,
  fidelity: "medium",
});

const hasSelectedOptions = computed(() => {
  return Object.values(repairOptions).some((option) => option);
});

const goBack = () => {
  router.back();
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    handleFile(file);
  }
};

const handleFile = (file) => {
  if (file.type.startsWith("image/")) {
    uploadedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  uploadedImage.value = "";
  uploadedFile.value = null;
  repairResult.value = null;
  Object.keys(repairOptions).forEach((key) => {
    repairOptions[key] = false;
  });
};

const startRepair = async () => {
  if (!uploadedFile.value) return;
  isRepairing.value = true;
  repairResult.value = null;

  const selected = {
    cracks: !!repairOptions.cracks,
    stains: !!repairOptions.stains,
    missing: !!repairOptions.missing,
    fading: !!repairOptions.fading,
  };

  let repairType = "auto";
  if (selected.fading && !selected.cracks && !selected.stains && !selected.missing) {
    repairType = "color_restore";
  } else if (!selected.fading && (selected.cracks || selected.stains || selected.missing)) {
    repairType = "damage_fix";
  }

  const quality = repairSettings.fidelity === "high" ? "high" : "medium";

  try {
    const res = await aiAPI.repairImage(uploadedFile.value, { repairType, quality });
    const data = res?.data?.data || {};
    const url = data.repairedUrl || data.previewUrls?.[0];
    if (url) {
      repairResult.value = { image: url };
    }
  } finally {
    isRepairing.value = false;
  }
};
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
