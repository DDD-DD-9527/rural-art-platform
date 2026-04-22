<template>
  <div
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
        >&#8203;</span
      >

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
      >
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <div class="flex items-center justify-between mb-6">
                  <h3
                    class="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    创建新课程
                  </h3>
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>

                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <!-- 基本信息 -->
                  <div class="col-span-2">
                    <h4 class="text-md font-medium text-gray-900 mb-4">
                      基本信息
                    </h4>
                  </div>

                  <div class="col-span-2">
                    <label
                      for="title"
                      class="block text-sm font-medium text-gray-700"
                      >课程标题 *</label
                    >
                    <input
                      id="title"
                      v-model="form.title"
                      type="text"
                      required
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="请输入课程标题"
                    />
                    <p v-if="errors.title" class="mt-1 text-sm text-red-600">
                      {{ errors.title }}
                    </p>
                  </div>

                  <div class="col-span-2">
                    <label
                      for="description"
                      class="block text-sm font-medium text-gray-700"
                      >课程描述 *</label
                    >
                    <textarea
                      id="description"
                      v-model="form.description"
                      rows="4"
                      required
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="请输入课程描述"
                    ></textarea>
                    <p
                      v-if="errors.description"
                      class="mt-1 text-sm text-red-600"
                    >
                      {{ errors.description }}
                    </p>
                  </div>

                  <div>
                    <label
                      for="category"
                      class="block text-sm font-medium text-gray-700"
                      >课程分类 *</label
                    >
                    <select
                      id="category"
                      v-model="form.category"
                      required
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">请选择分类</option>
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
                    <p v-if="errors.category" class="mt-1 text-sm text-red-600">
                      {{ errors.category }}
                    </p>
                  </div>

                  <div>
                    <label
                      for="difficulty"
                      class="block text-sm font-medium text-gray-700"
                      >难度等级 *</label
                    >
                    <select
                      id="difficulty"
                      v-model="form.difficulty"
                      required
                      class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">请选择难度</option>
                      <option value="beginner">初级</option>
                      <option value="intermediate">中级</option>
                      <option value="advanced">高级</option>
                    </select>
                    <p
                      v-if="errors.difficulty"
                      class="mt-1 text-sm text-red-600"
                    >
                      {{ errors.difficulty }}
                    </p>
                  </div>

                  <div>
                    <label
                      for="duration"
                      class="block text-sm font-medium text-gray-700"
                      >课程时长（分钟）</label
                    >
                    <input
                      id="duration"
                      v-model.number="form.duration"
                      type="number"
                      min="1"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="请输入课程时长"
                    />
                  </div>

                  <div>
                    <label
                      for="price"
                      class="block text-sm font-medium text-gray-700"
                      >课程价格（元）</label
                    >
                    <input
                      id="price"
                      v-model.number="form.price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                    <p class="mt-1 text-sm text-gray-500">
                      设置为0表示免费课程
                    </p>
                  </div>

                  <!-- 课程封面 -->
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >课程封面</label
                    >
                    <div class="flex items-center space-x-4">
                      <div class="flex-shrink-0">
                        <img
                          :src="form.thumbnail || '/placeholder-course.jpg'"
                          alt="课程封面预览"
                          class="h-20 w-20 rounded-lg object-cover border border-gray-300"
                        />
                      </div>
                      <div class="flex-1">
                        <input
                          ref="thumbnailInput"
                          type="file"
                          accept="image/*"
                          @change="handleThumbnailChange"
                          class="hidden"
                        />
                        <button
                          type="button"
                          @click="$refs.thumbnailInput.click()"
                          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PhotoIcon class="-ml-1 mr-2 h-5 w-5" />
                          选择图片
                        </button>
                        <p class="mt-1 text-sm text-gray-500">
                          支持 JPG、PNG 格式，建议尺寸 16:9
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- 标签 -->
                  <div class="col-span-2">
                    <label
                      for="tags"
                      class="block text-sm font-medium text-gray-700"
                      >课程标签</label
                    >
                    <div class="mt-1">
                      <input
                        v-model="tagInput"
                        type="text"
                        @keydown.enter.prevent="addTag"
                        @keydown="handleTagKeydown"
                        class="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="输入标签后按回车或逗号添加"
                      />
                      <div
                        v-if="form.tags.length > 0"
                        class="flex flex-wrap gap-2 mt-2"
                      >
                        <span
                          v-for="(tag, index) in form.tags"
                          :key="index"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {{ tag }}
                          <button
                            type="button"
                            @click="removeTag(index)"
                            class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                          >
                            <XMarkIcon class="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 课程视频 -->
                  <div class="col-span-2">
                    <h4 class="text-md font-medium text-gray-900 mb-4 mt-6">
                      课程视频
                    </h4>
                  </div>

                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >上传视频文件</label
                    >
                    <div
                      class="border-2 border-dashed border-gray-300 rounded-lg p-6"
                    >
                      <input
                        ref="videoInput"
                        type="file"
                        accept="video/*"
                        multiple
                        @change="handleVideoChange"
                        class="hidden"
                      />
                      <div class="text-center">
                        <button
                          type="button"
                          @click="$refs.videoInput.click()"
                          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          选择视频文件
                        </button>
                        <p class="mt-2 text-sm text-gray-500">
                          支持 MP4、AVI、MOV 格式
                        </p>
                      </div>
                      <div v-if="form.videos.length > 0" class="mt-4 space-y-2">
                        <div
                          v-for="(video, index) in form.videos"
                          :key="index"
                          class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <span class="text-sm text-gray-900">{{
                            video.name
                          }}</span>
                          <button
                            type="button"
                            @click="removeVideo(index)"
                            class="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon class="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 课程资料 -->
                  <div class="col-span-2">
                    <h4 class="text-md font-medium text-gray-900 mb-4 mt-6">
                      课程资料
                    </h4>
                  </div>

                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >上传资料文件</label
                    >
                    <div
                      class="border-2 border-dashed border-gray-300 rounded-lg p-6"
                    >
                      <input
                        ref="materialInput"
                        type="file"
                        multiple
                        @change="handleMaterialChange"
                        class="hidden"
                      />
                      <div class="text-center">
                        <button
                          type="button"
                          @click="$refs.materialInput.click()"
                          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          选择资料文件
                        </button>
                        <p class="mt-2 text-sm text-gray-500">
                          支持 PDF、DOC、PPT 等格式
                        </p>
                      </div>
                      <div
                        v-if="form.materials.length > 0"
                        class="mt-4 space-y-2"
                      >
                        <div
                          v-for="(material, index) in form.materials"
                          :key="index"
                          class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <span class="text-sm text-gray-900">{{
                            material.name
                          }}</span>
                          <button
                            type="button"
                            @click="removeMaterial(index)"
                            class="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon class="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 课程设置 -->
                  <div class="col-span-2">
                    <h4 class="text-md font-medium text-gray-900 mb-4 mt-6">
                      课程设置
                    </h4>
                  </div>

                  <div class="col-span-2">
                    <div class="space-y-4">
                      <div class="flex items-center">
                        <input
                          id="isFree"
                          v-model="form.settings.isFree"
                          type="checkbox"
                          class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label
                          for="isFree"
                          class="ml-2 block text-sm text-gray-900"
                        >
                          免费课程
                        </label>
                      </div>
                      <div class="flex items-center">
                        <input
                          id="allowComments"
                          v-model="form.settings.allowComments"
                          type="checkbox"
                          class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label
                          for="allowComments"
                          class="ml-2 block text-sm text-gray-900"
                        >
                          允许评论
                        </label>
                      </div>
                      <div class="flex items-center">
                        <input
                          id="isPublished"
                          v-model="form.settings.isPublished"
                          type="checkbox"
                          class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label
                          for="isPublished"
                          class="ml-2 block text-sm text-gray-900"
                        >
                          立即发布
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              {{ loading ? "创建中..." : "创建课程" }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { courseAPI, uploadAPI } from "@/services/api";
import { XMarkIcon, PhotoIcon } from "@heroicons/vue/24/outline";

// 定义事件
const emit = defineEmits(["close", "created"]);

// 响应式数据
const loading = ref(false);
const tagInput = ref("");
const errors = ref({});

// 表单数据
const form = reactive({
  title: "",
  description: "",
  category: "",
  difficulty: "",
  duration: null,
  price: 0,
  thumbnail: "",
  tags: [],
  videos: [],
  materials: [],
  learningObjectives: [],
  requirements: { prerequisites: [] },
  settings: {
    isFree: true,
    allowComments: true,
    isPublished: false,
  },
});

// 处理封面图片上传
const handleThumbnailChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith("image/")) {
    alert("请选择图片文件");
    return;
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert("图片大小不能超过5MB");
    return;
  }

  try {
    const response = await uploadAPI.uploadCourseFiles({ thumbnail: file });
    if (response.success) {
      form.thumbnail = response.data?.thumbnail?.url || "";
    }
  } catch (error) {
    console.error("上传封面失败:", error);
    alert("上传封面失败，请重试");
  }
};

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim().replace(/,/g, "");
  if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
    form.tags.push(tag);
    tagInput.value = "";
  }
};

const handleTagKeydown = (event) => {
  if (event.key === ",") {
    event.preventDefault();
    addTag();
  }
};

// 移除标签
const removeTag = (index) => {
  form.tags.splice(index, 1);
};

// 处理视频文件上传
const handleVideoChange = async (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  for (const file of files) {
    // 验证文件类型
    if (!file.type.startsWith("video/")) {
      alert(`${file.name} 不是有效的视频文件`);
      continue;
    }

    // 验证文件大小（100MB）
    if (file.size > 100 * 1024 * 1024) {
      alert(`${file.name} 文件大小不能超过100MB`);
      continue;
    }

    try {
      const response = await uploadAPI.uploadCourseFiles({ videos: [file] });
      const uploaded = response.data?.videos?.[0];
      if (response.success && uploaded) {
        form.videos.push(uploaded);
      }
    } catch (error) {
      console.error(`上传视频 ${file.name} 失败:`, error);
      alert(`上传视频 ${file.name} 失败，请重试`);
    }
  }
};

// 处理资料文件上传
const handleMaterialChange = async (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  for (const file of files) {
    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert(`${file.name} 文件大小不能超过10MB`);
      continue;
    }

    try {
      const response = await uploadAPI.uploadCourseFiles({ materials: [file] });
      const uploaded = response.data?.materials?.[0];
      if (response.success && uploaded) {
        form.materials.push(uploaded);
      }
    } catch (error) {
      console.error(`上传资料 ${file.name} 失败:`, error);
      alert(`上传资料 ${file.name} 失败，请重试`);
    }
  }
};

// 移除视频
const removeVideo = (index) => {
  form.videos.splice(index, 1);
};

// 移除资料
const removeMaterial = (index) => {
  form.materials.splice(index, 1);
};

// 表单验证
const validateForm = () => {
  errors.value = {};

  if (!form.title.trim()) {
    errors.value.title = "请输入课程标题";
  } else if (form.title.length > 100) {
    errors.value.title = "课程标题不能超过100个字符";
  }

  if (!form.description.trim()) {
    errors.value.description = "请输入课程描述";
  } else if (form.description.length > 1000) {
    errors.value.description = "课程描述不能超过1000个字符";
  }

  if (!form.category) {
    errors.value.category = "请选择课程分类";
  }

  if (!form.difficulty) {
    errors.value.difficulty = "请选择难度等级";
  }

  if (!form.thumbnail) {
    errors.value.thumbnail = "请上传课程封面";
  }

  return Object.keys(errors.value).length === 0;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    loading.value = true;

    // 准备提交数据
    const courseData = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      difficulty: form.difficulty,
      estimatedDuration: form.duration ? Number(form.duration) : undefined,
      thumbnail: form.thumbnail,
      tags: form.tags,
      videos: form.videos || [],
      materials: form.materials || [],
      learningObjectives: form.learningObjectives || [],
      requirements: form.requirements || { prerequisites: [] },
      settings: {
        isFree: form.settings.isFree,
        allowComments: form.settings.allowComments,
        isPublished: form.settings.isPublished,
        price: form.settings.isFree ? 0 : form.price || 0,
      },
    };

    const response = await courseAPI.createCourse(courseData);
    if (response.success) {
      emit("created", response.data?.course);
    }
  } catch (error) {
    console.error("创建课程失败:", error);
    alert(error.message || "创建课程失败，请重试");
  } finally {
    loading.value = false;
  }
};
</script>
