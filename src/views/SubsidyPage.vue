<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">政府艺术补贴</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 补贴政策概览 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="text-center mb-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            <LibraryIcon class="w-10 h-10 text-white" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-2">政府艺术技能培训补贴</h2>
          <p class="text-slate-600">传承中华优秀传统文化，政府提供艺术技能培训补贴</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-3xl font-bold text-blue-600 mb-2">最高80%</div>
            <div class="text-sm text-slate-600">补贴比例</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-xl">
            <div class="text-3xl font-bold text-green-600 mb-2">¥3,000</div>
            <div class="text-sm text-slate-600">年度上限</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-xl">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ eligibleCourses.length }}门</div>
            <div class="text-sm text-slate-600">符合条件课程</div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
          <div class="flex items-center mb-3">
            <CheckCircleIcon class="w-5 h-5 text-green-500 mr-2" />
            <span class="font-medium text-slate-800">您已通过资格审核</span>
          </div>
          <p class="text-sm text-slate-600">可申请补贴额度：¥2,400 | 剩余额度：¥2,400</p>
        </div>
      </div>

      <!-- 申请流程 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <h3 class="text-xl font-bold text-slate-800 mb-6">申请流程</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
            <h4 class="font-medium text-slate-800 mb-2">选择课程</h4>
            <p class="text-sm text-slate-600">选择符合条件的艺术课程并报名</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
            <h4 class="font-medium text-slate-800 mb-2">提交材料</h4>
            <p class="text-sm text-slate-600">上传身份证明和学习证明材料</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
            <h4 class="font-medium text-slate-800 mb-2">等待审核</h4>
            <p class="text-sm text-slate-600">3-5个工作日内完成审核</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">4</div>
            <h4 class="font-medium text-slate-800 mb-2">获得补贴</h4>
            <p class="text-sm text-slate-600">补贴金额直接抵扣课程费用</p>
          </div>
        </div>
      </div>

      <!-- 符合条件的课程 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-800">符合补贴条件的课程</h3>
          <div class="flex items-center space-x-2">
            <select v-model="selectedCategory" class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
              <option value="all">全部分类</option>
              <option value="traditional">传统技艺</option>
              <option value="painting">绘画艺术</option>
              <option value="calligraphy">书法艺术</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="course in filteredCourses" 
            :key="course.id"
            class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg mb-4 flex items-center justify-center">
              <BookOpenIcon class="w-8 h-8 text-slate-500" />
            </div>
            
            <div class="mb-4">
              <h4 class="font-semibold text-slate-800 mb-2">{{ course.name }}</h4>
              <p class="text-sm text-slate-600 mb-3">{{ course.description }}</p>
              
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <StarIcon class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm text-slate-600">{{ course.rating }}</span>
                  <span class="text-sm text-slate-400">({{ course.students }}人学习)</span>
                </div>
                <span class="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">可申请补贴</span>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">原价</span>
                  <span class="text-lg font-bold text-slate-400 line-through">¥{{ course.originalPrice }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">补贴后</span>
                  <span class="text-xl font-bold text-green-600">¥{{ course.subsidyPrice }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">节省</span>
                  <span class="text-sm font-medium text-blue-600">¥{{ course.originalPrice - course.subsidyPrice }}</span>
                </div>
              </div>
            </div>
            
            <button 
              @click="applyCourse(course)"
              class="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors font-medium"
            >
              申请补贴并报名
            </button>
          </div>
        </div>
      </div>

      <!-- 申请记录 -->
      <div class="glass-card rounded-3xl p-6">
        <h3 class="text-xl font-bold text-slate-800 mb-6">我的申请记录</h3>
        <div class="space-y-4">
          <div 
            v-for="record in applicationHistory" 
            :key="record.id"
            class="bg-white rounded-xl p-4 flex items-center justify-between"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                <BookOpenIcon class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="font-medium text-slate-800">{{ record.courseName }}</div>
                <div class="text-sm text-slate-500">申请时间：{{ record.applyDate }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-green-600 font-semibold">补贴¥{{ record.subsidyAmount }}</div>
              <div :class="[
                'text-sm px-3 py-1 rounded-full',
                record.status === '已通过' ? 'bg-green-100 text-green-600' :
                record.status === '审核中' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              ]">
                {{ record.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeftIcon, 
  LibraryIcon,
  CheckCircleIcon,
  BookOpenIcon,
  StarIcon
} from 'lucide-vue-next'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

// 分类筛选
const selectedCategory = ref('all')

// 符合条件的课程
const eligibleCourses = ref([
  {
    id: 1,
    name: '传统剪纸技艺培训',
    originalPrice: 800,
    subsidyPrice: 160,
    description: '学习传统剪纸基础技法，包含花鸟、人物、风景等图案设计',
    category: 'traditional',
    rating: 4.8,
    students: 156
  },
  {
    id: 2,
    name: '中国画基础课程',
    originalPrice: 1200,
    subsidyPrice: 240,
    description: '从零开始学习国画，掌握基本笔法、墨法和构图技巧',
    category: 'painting',
    rating: 4.9,
    students: 89
  },
  {
    id: 3,
    name: '书法入门与提高',
    originalPrice: 600,
    subsidyPrice: 120,
    description: '学习楷书、行书基本笔画，培养正确的书写姿势和习惯',
    category: 'calligraphy',
    rating: 4.7,
    students: 234
  },
  {
    id: 4,
    name: '民间工艺制作',
    originalPrice: 900,
    subsidyPrice: 180,
    description: '学习传统民间工艺制作技法，包含陶艺、编织等',
    category: 'traditional',
    rating: 4.6,
    students: 67
  },
  {
    id: 5,
    name: '水墨画进阶课程',
    originalPrice: 1500,
    subsidyPrice: 300,
    description: '深入学习水墨画技法，提升艺术表现力',
    category: 'painting',
    rating: 4.9,
    students: 45
  },
  {
    id: 6,
    name: '硬笔书法专项训练',
    originalPrice: 400,
    subsidyPrice: 80,
    description: '专注硬笔书法训练，提升日常书写美感',
    category: 'calligraphy',
    rating: 4.5,
    students: 198
  }
])

// 申请记录
const applicationHistory = ref([
  {
    id: 1,
    courseName: '传统剪纸技艺培训',
    subsidyAmount: 640,
    applyDate: '2024-01-15',
    status: '已通过'
  },
  {
    id: 2,
    courseName: '书法入门与提高',
    subsidyAmount: 480,
    applyDate: '2024-01-10',
    status: '审核中'
  }
])

// 过滤课程
const filteredCourses = computed(() => {
  if (selectedCategory.value === 'all') {
    return eligibleCourses.value
  }
  return eligibleCourses.value.filter(course => course.category === selectedCategory.value)
})

// 申请课程补贴
const applyCourse = (course) => {
  // 这里可以添加申请逻辑
  alert(`正在申请 ${course.name} 的政府补贴...`)
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-morphism {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
</style>