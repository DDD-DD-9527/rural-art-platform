<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    编辑课程 - {{ course.title }}
                  </h3>
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>

                <!-- 标签页导航 -->
                <div class="border-b border-gray-200 mb-6">
                  <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                      v-for="tab in tabs"
                      :key="tab.id"
                      type="button"
                      @click="activeTab = tab.id"
                      :class="[
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                      ]"
                    >
                      {{ tab.name }}
                    </button>
                  </nav>
                </div>

                <!-- 基本信息标签页 -->
                <div v-show="activeTab === 'basic'" class="space-y-6">
                  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div class="col-span-2">
                      <label for="title" class="block text-sm font-medium text-gray-700">课程标题 *</label>
                      <input
                        id="title"
                        v-model="form.title"
                        type="text"
                        required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="请输入课程标题"
                      />
                      <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
                    </div>

                    <div class="col-span-2">
                      <label for="description" class="block text-sm font-medium text-gray-700">课程描述 *</label>
                      <textarea
                        id="description"
                        v-model="form.description"
                        rows="4"
                        required
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="请输入课程描述"
                      ></textarea>
                      <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
                    </div>

                    <div>
                      <label for="category" class="block text-sm font-medium text-gray-700">课程分类 *</label>
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
                      <p v-if="errors.category" class="mt-1 text-sm text-red-600">{{ errors.category }}</p>
                    </div>

                    <div>
                      <label for="difficulty" class="block text-sm font-medium text-gray-700">难度等级 *</label>
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
                      <p v-if="errors.difficulty" class="mt-1 text-sm text-red-600">{{ errors.difficulty }}</p>
                    </div>

                    <div>
                      <label for="duration" class="block text-sm font-medium text-gray-700">课程时长（分钟）</label>
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
                      <label for="price" class="block text-sm font-medium text-gray-700">课程价格（元）</label>
                      <input
                        id="price"
                        v-model.number="form.price"
                        type="number"
                        min="0"
                        step="0.01"
                        class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                      <p class="mt-1 text-sm text-gray-500">设置为0表示免费课程</p>
                    </div>

                    <!-- 课程封面 -->
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">课程封面</label>
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
                            更换图片
                          </button>
                          <p class="mt-1 text-sm text-gray-500">支持 JPG、PNG 格式，建议尺寸 16:9</p>
                        </div>
                      </div>
                    </div>

                    <!-- 标签 -->
                    <div class="col-span-2">
                      <label for="tags" class="block text-sm font-medium text-gray-700">课程标签</label>
                      <div class="mt-1">
                        <input
                          v-model="tagInput"
                          type="text"
                          @keydown.enter.prevent="addTag"
                          @keydown.comma.prevent="addTag"
                          class="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="输入标签后按回车或逗号添加"
                        />
                        <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
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
                  </div>
                </div>

                <!-- 课程内容标签页 -->
                <div v-show="activeTab === 'content'" class="space-y-6">
                  <div class="flex items-center justify-between">
                    <h4 class="text-md font-medium text-gray-900">课程章节</h4>
                    <button
                      type="button"
                      @click="addLesson"
                      class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlusIcon class="-ml-0.5 mr-2 h-4 w-4" />
                      添加章节
                    </button>
                  </div>

                  <div v-if="form.lessons.length === 0" class="text-center py-12 text-gray-500">
                    <BookOpenIcon class="mx-auto h-12 w-12 text-gray-400" />
                    <h3 class="mt-2 text-sm font-medium text-gray-900">暂无课程章节</h3>
                    <p class="mt-1 text-sm text-gray-500">点击上方按钮添加第一个章节</p>
                  </div>

                  <div v-else class="space-y-4">
                    <div
                      v-for="(lesson, index) in form.lessons"
                      :key="lesson.id || index"
                      class="border border-gray-200 rounded-lg p-4"
                    >
                      <div class="flex items-center justify-between mb-4">
                        <h5 class="text-sm font-medium text-gray-900">章节 {{ index + 1 }}</h5>
                        <button
                          type="button"
                          @click="removeLesson(index)"
                          class="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon class="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div class="col-span-2">
                          <label class="block text-sm font-medium text-gray-700">章节标题</label>
                          <input
                            v-model="lesson.title"
                            type="text"
                            class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="请输入章节标题"
                          />
                        </div>
                        
                        <div class="col-span-2">
                          <label class="block text-sm font-medium text-gray-700">章节描述</label>
                          <textarea
                            v-model="lesson.description"
                            rows="2"
                            class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="请输入章节描述"
                          ></textarea>
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700">章节时长（分钟）</label>
                          <input
                            v-model.number="lesson.duration"
                            type="number"
                            min="1"
                            class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="请输入章节时长"
                          />
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-gray-700">章节类型</label>
                          <select
                            v-model="lesson.type"
                            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="video">视频</option>
                            <option value="text">文本</option>
                            <option value="quiz">测验</option>
                            <option value="assignment">作业</option>
                          </select>
                        </div>
                        
                        <div class="col-span-2" v-if="lesson.type === 'video'">
                          <label class="block text-sm font-medium text-gray-700">视频文件</label>
                          <div class="mt-1 flex items-center space-x-4">
                            <input
                              v-model="lesson.videoUrl"
                              type="url"
                              class="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              placeholder="请输入视频URL或上传视频文件"
                            />
                            <input
                              :ref="`videoInput-${index}`"
                              type="file"
                              accept="video/*"
                              @change="(event) => handleLessonVideoUpload(event, index)"
                              class="hidden"
                            />
                            <button
                              type="button"
                              @click="$refs[`videoInput-${index}`][0].click()"
                              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <CloudArrowUpIcon class="-ml-0.5 mr-2 h-4 w-4" />
                              上传视频
                            </button>
                          </div>
                          <div v-if="lesson.uploadProgress !== undefined" class="mt-2">
                            <div class="bg-gray-200 rounded-full h-2">
                              <div 
                                class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                :style="{ width: lesson.uploadProgress + '%' }"
                              ></div>
                            </div>
                            <p class="text-sm text-gray-500 mt-1">上传进度: {{ lesson.uploadProgress }}%</p>
                          </div>
                        </div>
                        
                        <div class="col-span-2" v-if="lesson.type === 'text'">
                          <label class="block text-sm font-medium text-gray-700">文本内容</label>
                          <textarea
                            v-model="lesson.content"
                            rows="6"
                            class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            placeholder="请输入文本内容"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 课程设置标签页 -->
                <div v-show="activeTab === 'settings'" class="space-y-6">
                  <div class="space-y-4">
                    <div class="flex items-center">
                      <input
                        id="isFree"
                        v-model="form.settings.isFree"
                        type="checkbox"
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <label for="isFree" class="ml-2 block text-sm text-gray-900">
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
                      <label for="allowComments" class="ml-2 block text-sm text-gray-900">
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
                      <label for="isPublished" class="ml-2 block text-sm text-gray-900">
                        发布课程
                      </label>
                    </div>
                  </div>
                  
                  <div class="border-t border-gray-200 pt-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">课程统计</h4>
                    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div class="text-center">
                        <div class="text-2xl font-bold text-gray-900">{{ course.stats?.enrolledCount || 0 }}</div>
                        <div class="text-sm text-gray-500">报名人数</div>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-gray-900">{{ course.stats?.completedCount || 0 }}</div>
                        <div class="text-sm text-gray-500">完成人数</div>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-gray-900">{{ course.stats?.viewCount || 0 }}</div>
                        <div class="text-sm text-gray-500">浏览次数</div>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-gray-900">{{ course.stats?.rating || 0 }}</div>
                        <div class="text-sm text-gray-500">平均评分</div>
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
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? '保存中...' : '保存更改' }}
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
import { ref, reactive, onMounted } from 'vue'
import { courseAPI, uploadAPI } from '@/services/api'
import {
  XMarkIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  BookOpenIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline'

// 定义 props
const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

// 定义事件
const emit = defineEmits(['close', 'updated'])

// 响应式数据
const loading = ref(false)
const tagInput = ref('')
const errors = ref({})
const activeTab = ref('basic')

// 标签页配置
const tabs = [
  { id: 'basic', name: '基本信息' },
  { id: 'content', name: '课程内容' },
  { id: 'settings', name: '课程设置' }
]

// 表单数据
const form = reactive({
  title: '',
  description: '',
  category: '',
  difficulty: '',
  duration: null,
  price: 0,
  thumbnail: '',
  tags: [],
  lessons: [],
  settings: {
    isFree: true,
    allowComments: true,
    isPublished: false
  }
})

// 初始化表单数据
const initializeForm = () => {
  form.title = props.course.title || ''
  form.description = props.course.description || ''
  form.category = props.course.category || ''
  form.difficulty = props.course.difficulty || ''
  form.duration = props.course.duration || null
  form.price = props.course.price || 0
  form.thumbnail = props.course.thumbnail || ''
  form.tags = [...(props.course.tags || [])]
  form.lessons = [...(props.course.lessons || [])]
  form.settings = {
    isFree: props.course.settings?.isFree ?? true,
    allowComments: props.course.settings?.allowComments ?? true,
    isPublished: props.course.settings?.isPublished ?? false
  }
}

// 处理封面图片上传
const handleThumbnailChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'course-thumbnail')

    const response = await uploadAPI.uploadFile(formData)
    if (response.data.success) {
      form.thumbnail = response.data.data.url
    }
  } catch (error) {
    console.error('上传封面失败:', error)
    alert('上传封面失败，请重试')
  }
}

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim().replace(/,/g, '')
  if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

// 移除标签
const removeTag = (index) => {
  form.tags.splice(index, 1)
}

// 处理课时视频上传
const handleLessonVideoUpload = async (event, lessonIndex) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('video/')) {
    alert('请选择视频文件')
    return
  }

  // 验证文件大小（100MB）
  if (file.size > 100 * 1024 * 1024) {
    alert('视频文件大小不能超过100MB')
    return
  }

  try {
    // 初始化上传进度
    form.lessons[lessonIndex].uploadProgress = 0

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'lesson-video')

    const response = await uploadAPI.uploadFile(formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        form.lessons[lessonIndex].uploadProgress = progress
      }
    })

    if (response.data.success) {
      form.lessons[lessonIndex].videoUrl = response.data.data.url
      // 清除上传进度
      delete form.lessons[lessonIndex].uploadProgress
    }
  } catch (error) {
    console.error('上传视频失败:', error)
    alert('上传视频失败，请重试')
    // 清除上传进度
    delete form.lessons[lessonIndex].uploadProgress
  }
}

// 添加课程章节
const addLesson = () => {
  form.lessons.push({
    id: Date.now().toString(),
    title: '',
    description: '',
    duration: null,
    type: 'video',
    videoUrl: '',
    content: '',
    order: form.lessons.length + 1
  })
}

// 移除课程章节
const removeLesson = (index) => {
  form.lessons.splice(index, 1)
  // 重新排序
  form.lessons.forEach((lesson, idx) => {
    lesson.order = idx + 1
  })
}

// 表单验证
const validateForm = () => {
  errors.value = {}

  if (!form.title.trim()) {
    errors.value.title = '请输入课程标题'
  } else if (form.title.length > 100) {
    errors.value.title = '课程标题不能超过100个字符'
  }

  if (!form.description.trim()) {
    errors.value.description = '请输入课程描述'
  } else if (form.description.length > 1000) {
    errors.value.description = '课程描述不能超过1000个字符'
  }

  if (!form.category) {
    errors.value.category = '请选择课程分类'
  }

  if (!form.difficulty) {
    errors.value.difficulty = '请选择难度等级'
  }

  return Object.keys(errors.value).length === 0
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    activeTab.value = 'basic'
    return
  }

  try {
    loading.value = true

    // 准备提交数据
    const courseData = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      difficulty: form.difficulty,
      duration: form.duration || 0,
      price: form.settings.isFree ? 0 : (form.price || 0),
      thumbnail: form.thumbnail,
      tags: form.tags,
      lessons: form.lessons,
      settings: {
        isFree: form.settings.isFree,
        allowComments: form.settings.allowComments,
        isPublished: form.settings.isPublished
      }
    }

    const response = await courseAPI.updateCourse(props.course._id, courseData)
    if (response.data.success) {
      emit('updated', response.data.data)
    }
  } catch (error) {
    console.error('更新课程失败:', error)
    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('更新课程失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时初始化表单
onMounted(() => {
  initializeForm()
})
</script>