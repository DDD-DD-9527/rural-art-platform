<template>
  <div class="course-upload-form">
    <!-- 表单头部 -->
    <div class="form-header">
      <h2 class="form-title">上传新课程</h2>
      <p class="form-subtitle">创建并发布新的艺术课程</p>
    </div>

    <!-- 课程基本信息 -->
    <div class="form-section">
      <h3 class="section-title">
        <BookOpenIcon class="w-5 h-5" />
        基本信息
      </h3>
      
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">课程标题 *</label>
          <input 
            v-model="courseData.title"
            type="text" 
            class="form-input"
            placeholder="请输入课程标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">课程分类 *</label>
          <select v-model="courseData.category" class="form-select" required>
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
        </div>
        
        <div class="form-group">
          <label class="form-label">难度等级 *</label>
          <select v-model="courseData.level" class="form-select" required>
            <option value="">请选择难度</option>
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">课程时长（分钟）</label>
          <input 
            v-model.number="courseData.duration"
            type="number" 
            class="form-input"
            placeholder="预计学习时长"
            min="1"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">课程描述 *</label>
        <textarea 
          v-model="courseData.description"
          class="form-textarea"
          rows="4"
          placeholder="请详细描述课程内容、学习目标等"
          required
        ></textarea>
      </div>
    </div>

    <!-- 课程封面 -->
    <div class="form-section">
      <h3 class="section-title">
        <ImageIcon class="w-5 h-5" />
        课程封面
      </h3>
      
      <div class="upload-area" @click="triggerThumbnailUpload">
        <div v-if="!courseData.thumbnail" class="upload-placeholder">
          <UploadIcon class="w-12 h-12 text-gray-400" />
          <p class="upload-text">点击上传课程封面</p>
          <p class="upload-hint">支持 JPG、PNG 格式，建议尺寸 800x600</p>
        </div>
        <div v-else class="uploaded-thumbnail">
          <img :src="courseData.thumbnail.url" :alt="courseData.title" class="thumbnail-preview" />
          <div class="thumbnail-overlay">
            <button @click.stop="removeThumbnail" class="remove-btn">
              <XIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <input 
        ref="thumbnailInput"
        type="file" 
        accept="image/*"
        @change="handleThumbnailUpload"
        class="hidden"
      />
    </div>

    <!-- 课程视频 -->
    <div class="form-section">
      <h3 class="section-title">
        <PlayIcon class="w-5 h-5" />
        课程视频
      </h3>
      
      <div class="video-upload-area">
        <div class="upload-header">
          <button @click="triggerVideoUpload" class="upload-btn">
            <PlusIcon class="w-4 h-4" />
            添加视频
          </button>
          <p class="upload-info">支持 MP4、AVI、MOV 格式，单个文件不超过 100MB</p>
        </div>
        
        <div v-if="courseData.videos.length > 0" class="video-list">
          <div v-for="(video, index) in courseData.videos" :key="index" class="video-item">
            <div class="video-info">
              <PlayIcon class="w-5 h-5 text-blue-500" />
              <div class="video-details">
                <p class="video-name">{{ video.originalName }}</p>
                <p class="video-size">{{ formatFileSize(video.size) }}</p>
              </div>
            </div>
            <button @click="removeVideo(index)" class="remove-video-btn">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <input 
        ref="videoInput"
        type="file" 
        accept="video/*"
        multiple
        @change="handleVideoUpload"
        class="hidden"
      />
    </div>

    <!-- 课程材料 -->
    <div class="form-section">
      <h3 class="section-title">
        <FileTextIcon class="w-5 h-5" />
        课程材料
      </h3>
      
      <div class="materials-upload-area">
        <div class="upload-header">
          <button @click="triggerMaterialUpload" class="upload-btn">
            <PlusIcon class="w-4 h-4" />
            添加材料
          </button>
          <p class="upload-info">支持 PDF、DOC、DOCX 格式的教学材料</p>
        </div>
        
        <div v-if="courseData.materials.length > 0" class="materials-list">
          <div v-for="(material, index) in courseData.materials" :key="index" class="material-item">
            <div class="material-info">
              <FileTextIcon class="w-5 h-5 text-green-500" />
              <div class="material-details">
                <p class="material-name">{{ material.originalName }}</p>
                <p class="material-size">{{ formatFileSize(material.size) }}</p>
              </div>
            </div>
            <button @click="removeMaterial(index)" class="remove-material-btn">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <input 
        ref="materialInput"
        type="file" 
        accept=".pdf,.doc,.docx"
        multiple
        @change="handleMaterialUpload"
        class="hidden"
      />
    </div>

    <!-- 学习目标 -->
    <div class="form-section">
      <h3 class="section-title">
        <BookOpenIcon class="w-5 h-5" />
        学习目标
      </h3>
      
      <div class="objectives-area">
        <div class="objectives-header">
          <button @click="addObjective" type="button" class="upload-btn">
            <PlusIcon class="w-4 h-4" />
            添加学习目标
          </button>
          <p class="upload-info">描述学员完成课程后将掌握的技能或知识</p>
        </div>
        
        <div v-if="courseData.learningObjectives.length > 0" class="objectives-list">
          <div v-for="(objective, index) in courseData.learningObjectives" :key="index" class="objective-item">
            <textarea 
              v-model="courseData.learningObjectives[index]"
              class="objective-input"
              placeholder="输入学习目标"
              rows="2"
              maxlength="200"
            ></textarea>
            <button @click="removeObjective(index)" type="button" class="remove-objective-btn">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 课程要求 -->
    <div class="form-section">
      <h3 class="section-title">
        <FileTextIcon class="w-5 h-5" />
        课程要求
      </h3>
      
      <div class="form-group">
        <label class="form-label">前置技能或课程</label>
        <div class="prerequisites-input">
          <div class="prerequisites-list">
            <span v-for="(prerequisite, index) in courseData.requirements.prerequisites" :key="index" class="tag">
              {{ prerequisite }}
              <button @click="removePrerequisite(index)" type="button" class="tag-remove">
                <XIcon class="w-3 h-3" />
              </button>
            </span>
          </div>
          <input 
            v-model="newPrerequisite"
            @keyup.enter="addPrerequisite"
            type="text" 
            class="tag-input"
            placeholder="输入前置要求后按回车"
          />
        </div>
      </div>
    </div>

    <!-- 课程设置 -->
    <div class="form-section">
      <h3 class="section-title">
        <SettingsIcon class="w-5 h-5" />
        课程设置
      </h3>
      
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">课程标签</label>
          <div class="tags-input">
            <div class="tags-list">
              <span v-for="(tag, index) in courseData.tags" :key="index" class="tag">
                {{ tag }}
                <button @click="removeTag(index)" class="tag-remove">
                  <XIcon class="w-3 h-3" />
                </button>
              </span>
            </div>
            <input 
              v-model="newTag"
              @keyup.enter="addTag"
              type="text" 
              class="tag-input"
              placeholder="输入标签后按回车"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">课程状态</label>
          <select v-model="courseData.status" class="form-select">
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            v-model="courseData.isFree"
            type="checkbox" 
            class="checkbox"
          />
          <span class="checkbox-text">免费课程</span>
        </label>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="form-actions">
      <button @click="saveDraft" class="btn-secondary" :disabled="uploading">
        <SaveIcon class="w-4 h-4" />
        保存草稿
      </button>
      <button @click="publishCourse" class="btn-primary" :disabled="uploading || !isFormValid">
        <template v-if="uploading">
          <div class="loading-spinner"></div>
          上传中...
        </template>
        <template v-else>
          <CheckIcon class="w-4 h-4" />
          发布课程
        </template>
      </button>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploadProgress > 0" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <p class="progress-text">上传进度: {{ uploadProgress }}%</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  BookOpenIcon, 
  ImageIcon, 
  PlayIcon, 
  FileTextIcon, 
  SettingsIcon,
  UploadIcon,
  PlusIcon,
  XIcon,
  TrashIcon,
  SaveIcon,
  CheckIcon
} from 'lucide-vue-next'
import { uploadAPI } from '../../services/api'
import { courseAPI } from '../../services/api'

const router = useRouter()

// 表单数据
const courseData = ref({
  title: '',
  description: '',
  category: '',
  level: '', // 前端使用level，提交时映射为difficulty
  duration: null,
  thumbnail: null,
  videos: [],
  materials: [],
  tags: [],
  learningObjectives: [],
  requirements: {
    prerequisites: []
  },
  status: 'draft',
  isFree: true
})

// 表单状态
const uploading = ref(false)
const uploadProgress = ref(0)
const newTag = ref('')
const newPrerequisite = ref('')

// 文件输入引用
const thumbnailInput = ref(null)
const videoInput = ref(null)
const materialInput = ref(null)

// 计算属性
const isFormValid = computed(() => {
  return courseData.value.title && 
         courseData.value.description && 
         courseData.value.category && 
         courseData.value.level &&
         courseData.value.thumbnail
})

// 文件上传方法
const triggerThumbnailUpload = () => {
  thumbnailInput.value?.click()
}

const triggerVideoUpload = () => {
  videoInput.value?.click()
}

const triggerMaterialUpload = () => {
  materialInput.value?.click()
}

// 处理缩略图上传
const handleThumbnailUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    uploading.value = true
    const response = await uploadAPI.uploadImage(file, 'course')
    courseData.value.thumbnail = response.data
  } catch (error) {
    console.error('上传缩略图失败:', error)
    alert('上传缩略图失败，请重试')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

// 处理视频上传
const handleVideoUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  
  try {
    uploading.value = true
    
    for (const file of files) {
      const response = await uploadAPI.uploadImage(file, 'course')
      courseData.value.videos.push(response.data)
    }
  } catch (error) {
    console.error('上传视频失败:', error)
    alert('上传视频失败，请重试')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

// 处理材料上传
const handleMaterialUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  
  try {
    uploading.value = true
    
    for (const file of files) {
      const response = await uploadAPI.uploadImage(file, 'course')
      courseData.value.materials.push(response.data)
    }
  } catch (error) {
    console.error('上传材料失败:', error)
    alert('上传材料失败，请重试')
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

// 移除文件方法
const removeThumbnail = () => {
  courseData.value.thumbnail = null
}

const removeVideo = (index) => {
  courseData.value.videos.splice(index, 1)
}

const removeMaterial = (index) => {
  courseData.value.materials.splice(index, 1)
}

// 标签管理
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !courseData.value.tags.includes(tag)) {
    courseData.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index) => {
  courseData.value.tags.splice(index, 1)
}

// 学习目标管理
const addObjective = () => {
  courseData.value.learningObjectives.push('')
}

const removeObjective = (index) => {
  courseData.value.learningObjectives.splice(index, 1)
}

// 前置要求管理
const addPrerequisite = () => {
  const prerequisite = newPrerequisite.value.trim()
  if (prerequisite && !courseData.value.requirements.prerequisites.includes(prerequisite)) {
    courseData.value.requirements.prerequisites.push(prerequisite)
    newPrerequisite.value = ''
  }
}

const removePrerequisite = (index) => {
  courseData.value.requirements.prerequisites.splice(index, 1)
}

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 数据字段映射函数
const mapCourseDataForSubmit = (data) => {
  // 验证必填字段
  if (!data.title || !data.description || !data.category || !data.level || !data.thumbnail) {
    throw new Error('请填写所有必填字段：标题、描述、分类、难度等级和封面图片')
  }
  
  return {
    ...data,
    // 字段映射：前端level -> 后端difficulty
    difficulty: data.level,
    // 修复thumbnail字段：确保使用正确的字段名
    thumbnail: typeof data.thumbnail === 'object' ? data.thumbnail.url : data.thumbnail,
    // 设置预计时长：后端使用estimatedDuration而非duration
    estimatedDuration: data.duration,
    // 设置发布状态到settings对象中
    settings: {
      ...data.settings,
      isPublished: data.status === 'published',
      isFree: data.isFree
    },
    // 移除前端特有字段
    level: undefined,
    status: undefined,
    isFree: undefined,
    duration: undefined
  }
}

// 保存草稿
const saveDraft = async () => {
  try {
    uploading.value = true
    const draftData = mapCourseDataForSubmit({ ...courseData.value, status: 'draft' })
    await courseAPI.createCourse(draftData)
    alert('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
    alert('保存草稿失败，请重试')
  } finally {
    uploading.value = false
  }
}

// 发布课程
const publishCourse = async () => {
  if (!isFormValid.value) {
    alert('请填写必填字段')
    return
  }
  
  try {
    uploading.value = true
    const publishData = mapCourseDataForSubmit({ ...courseData.value, status: 'published' })
    console.log('发布课程数据:', publishData) // 调试日志
    await courseAPI.createCourse(publishData)
    alert('课程发布成功')
    router.push('/admin/courses')
  } catch (error) {
    console.error('发布课程失败:', error)
    // 显示更具体的错误信息
    const errorMessage = error.message || '发布课程失败，请重试'
    alert(errorMessage)
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  // 组件挂载时的初始化逻辑
})
</script>

<style scoped>
.course-upload-form {
  @apply max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm;
}

.form-header {
  @apply mb-8 text-center;
}

.form-title {
  @apply text-2xl font-bold text-gray-900 mb-2;
}

.form-subtitle {
  @apply text-gray-600;
}

.form-section {
  @apply mb-8 p-6 border border-gray-200 rounded-lg;
}

.section-title {
  @apply flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4;
}

.form-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4 mb-4;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-input, .form-select, .form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-textarea {
  @apply resize-y;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors;
}

.upload-placeholder {
  @apply space-y-2;
}

.upload-text {
  @apply text-lg font-medium text-gray-700;
}

.upload-hint {
  @apply text-sm text-gray-500;
}

.uploaded-thumbnail {
  @apply relative inline-block;
}

.thumbnail-preview {
  @apply w-48 h-36 object-cover rounded-lg;
}

.thumbnail-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center;
}

.remove-btn {
  @apply p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors;
}

.video-upload-area, .materials-upload-area {
  @apply space-y-4;
}

.upload-header {
  @apply flex items-center justify-between;
}

.upload-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors;
}

.upload-info {
  @apply text-sm text-gray-500;
}

.video-list, .materials-list {
  @apply space-y-2;
}

.video-item, .material-item {
  @apply flex items-center justify-between p-3 bg-gray-50 rounded-md;
}

.video-info, .material-info {
  @apply flex items-center gap-3;
}

.video-details, .material-details {
  @apply space-y-1;
}

.objectives-area, .prerequisites-input {
  @apply space-y-4;
}

.objectives-header {
  @apply flex items-center justify-between;
}

.objectives-list {
  @apply space-y-3;
}

.objective-item {
  @apply flex items-start gap-3 p-3 bg-gray-50 rounded-md;
}

.objective-input {
  @apply flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y;
}

.remove-objective-btn {
  @apply p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors;
}

.prerequisites-input {
  @apply border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent;
}

.prerequisites-list {
  @apply flex flex-wrap gap-2 mb-2;
}

.video-name, .material-name {
  @apply font-medium text-gray-900;
}

.video-size, .material-size {
  @apply text-sm text-gray-500;
}

.remove-video-btn, .remove-material-btn {
  @apply p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors;
}

.tags-input {
  @apply border border-gray-300 rounded-md p-2 min-h-[42px];
}

.tags-list {
  @apply flex flex-wrap gap-2 mb-2;
}

.tag {
  @apply inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md;
}

.tag-remove {
  @apply text-blue-600 hover:text-blue-800;
}

.tag-input {
  @apply border-none outline-none flex-1 min-w-[120px];
}

.checkbox-label {
  @apply flex items-center gap-2 cursor-pointer;
}

.checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.checkbox-text {
  @apply text-sm font-medium text-gray-700;
}

.form-actions {
  @apply flex justify-end gap-4 pt-6 border-t border-gray-200;
}

.btn-secondary {
  @apply flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.loading-spinner {
  @apply w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin;
}

.upload-progress {
  @apply mt-4 p-4 bg-blue-50 rounded-lg;
}

.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2 mb-2;
}

.progress-fill {
  @apply bg-blue-500 h-2 rounded-full transition-all duration-300;
}

.progress-text {
  @apply text-sm text-blue-700 text-center;
}

.hidden {
  @apply sr-only;
}
</style>