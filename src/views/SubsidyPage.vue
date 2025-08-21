<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button @click="goBack" class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">广东省瑶绣制作技能补贴</h1>
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
          <h2 class="text-2xl font-bold text-slate-800 mb-2">广东省瑶绣制作专项职业能力补贴</h2>
          <p class="text-slate-600">传承瑶族非物质文化遗产，支持瑶绣制作技能培训与就业创业</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <div class="text-3xl font-bold text-blue-600 mb-2">¥800</div>
            <div class="text-sm text-slate-600">补贴标准</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-xl">
            <div class="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div class="text-sm text-slate-600">补贴比例</div>
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
          <p class="text-sm text-slate-600">瑶绣制作专项职业能力补贴：¥800 | 非遗传承补助：最高¥2,000</p>
        </div>
      </div>

      <!-- 申请流程 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <h3 class="text-xl font-bold text-slate-800 mb-6">申请流程</h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
            <h4 class="font-medium text-slate-800 mb-2">培训报名</h4>
            <p class="text-sm text-slate-600">报名瑶绣制作技能培训课程</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
            <h4 class="font-medium text-slate-800 mb-2">参加培训</h4>
            <p class="text-sm text-slate-600">完成规定课时的培训学习</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
            <h4 class="font-medium text-slate-800 mb-2">考核鉴定</h4>
            <p class="text-sm text-slate-600">参加专项职业能力考核</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">4</div>
            <h4 class="font-medium text-slate-800 mb-2">申请补贴</h4>
            <p class="text-sm text-slate-600">提交补贴申请材料</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">5</div>
            <h4 class="font-medium text-slate-800 mb-2">审核拨付</h4>
            <p class="text-sm text-slate-600">审核通过后发放补贴</p>
          </div>
        </div>
      </div>

      <!-- 符合条件的课程 -->
      <div class="glass-card rounded-3xl p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-slate-800">符合瑶绣制作补贴条件的课程</h3>
          <div class="flex items-center space-x-2">
            <select v-model="selectedCategory" class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
              <option value="all">全部分类</option>
              <option value="yao-embroidery">瑶绣制作</option>
              <option value="traditional">传统工艺</option>
              <option value="cultural-heritage">非遗传承</option>
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
    name: '瑶绣制作技艺培训',
    originalPrice: 1200,
    subsidyPrice: 800,
    description: '深入学习瑶族传统刺绣技艺，掌握瑶绣的历史文化、制作工艺和现代应用。符合广东省专项职业能力补贴条件。',
    category: 'yao-embroidery',
    rating: 4.9,
    students: 89,
    subsidyType: '专项职业能力补贴',
    certificationName: '广东省瑶绣制作专项职业能力证书'
  },
  {
    id: 2,
    name: '瑶族传统工艺基础',
    originalPrice: 800,
    subsidyPrice: 600,
    description: '学习瑶族传统工艺基础知识，包括工具使用、材料选择和基础技法',
    category: 'traditional',
    rating: 4.7,
    students: 156,
    subsidyType: '非遗传承补助',
    certificationName: '瑶族传统工艺基础证书'
  },
  {
    id: 3,
    name: '瑶绣图案设计与创新',
    originalPrice: 1000,
    subsidyPrice: 750,
    description: '掌握传统瑶绣图案设计原理，学习现代设计思路和创新应用',
    category: 'yao-embroidery',
    rating: 4.8,
    students: 67,
    subsidyType: '文创产品奖励',
    certificationName: '瑶绣图案设计师证书'
  },
  {
    id: 4,
    name: '瑶族文化与非遗传承',
    originalPrice: 600,
    subsidyPrice: 480,
    description: '深入了解瑶族文化背景，学习非遗传承的理论知识和实践方法',
    category: 'cultural-heritage',
    rating: 4.6,
    students: 234,
    subsidyType: '非遗传承补助',
    certificationName: '非遗传承人培训证书'
  },
  {
    id: 5,
    name: '瑶绣产品开发与营销',
    originalPrice: 1500,
    subsidyPrice: 1200,
    description: '学习瑶绣产品的商业化开发，掌握市场营销和品牌推广技巧',
    category: 'yao-embroidery',
    rating: 4.9,
    students: 45,
    subsidyType: '创业扶持补贴',
    certificationName: '瑶绣产品开发师证书'
  },
  {
    id: 6,
    name: '传统手工艺保护与传承',
    originalPrice: 900,
    subsidyPrice: 720,
    description: '学习传统手工艺的保护方法和传承技巧，培养非遗传承意识',
    category: 'cultural-heritage',
    rating: 4.5,
    students: 198,
    subsidyType: '非遗传承补助',
    certificationName: '传统手工艺保护证书'
  }
])

// 申请记录
const applicationHistory = ref([
  {
    id: 1,
    courseName: '瑶绣制作技艺培训',
    subsidyAmount: 800,
    subsidyType: '专项职业能力补贴',
    applyDate: '2024-02-01',
    status: '已通过',
    certificationName: '广东省瑶绣制作专项职业能力证书'
  },
  {
    id: 2,
    courseName: '瑶族传统工艺基础',
    subsidyAmount: 600,
    subsidyType: '非遗传承补助',
    applyDate: '2024-01-20',
    status: '已通过',
    certificationName: '瑶族传统工艺基础证书'
  },
  {
    id: 3,
    courseName: '瑶绣图案设计与创新',
    subsidyAmount: 750,
    subsidyType: '文创产品奖励',
    applyDate: '2024-02-10',
    status: '审核中',
    certificationName: '瑶绣图案设计师证书'
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