<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50"
  >
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button
            @click="$router.back()"
            class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">{{ course.title }}</h1>
          <button
            class="p-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ShareIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- Course Hero -->
      <div class="glass-card rounded-3xl overflow-hidden mb-8 shadow-2xl">
        <div class="relative h-80 gradient-primary">
          <img
            :src="course.image"
            :alt="course.title"
            class="w-full h-full object-cover opacity-80"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
          ></div>
          <div class="absolute bottom-8 left-8 right-8 text-white">
            <h1 class="text-4xl font-bold mb-3">{{ course.title }}</h1>
            <p class="text-xl opacity-90 leading-relaxed">
              {{ course.description }}
            </p>
          </div>
          <div
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <button
              @click="startCourse"
              class="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group shadow-2xl"
            >
              <PlayIcon
                class="w-12 h-12 text-white ml-1 group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        </div>

        <div class="p-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-8 text-slate-600">
              <div class="flex items-center text-lg">
                <ClockIcon class="w-5 h-5 mr-2" />
                {{ course.duration }}
              </div>
              <div class="flex items-center text-lg">
                <UsersIcon class="w-5 h-5 mr-2" />
                {{ course.students }} 学员
              </div>
              <div class="flex items-center text-lg">
                <StarIcon class="w-5 h-5 mr-2 text-yellow-400 fill-current" />
                {{ course.rating }}
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span
                class="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-2xl text-lg font-semibold"
              >
                {{ course.difficulty }}
              </span>
            </div>
          </div>

          <div v-if="course.progress > 0" class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-lg font-semibold text-slate-700">学习进度</span>
              <span class="text-lg font-bold text-emerald-600"
                >{{ course.progress }}%</span
              >
            </div>
            <div class="w-full bg-slate-200 rounded-full h-3">
              <div
                class="gradient-primary h-3 rounded-full transition-all duration-500"
                :style="{ width: `${course.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-8">
        <!-- Course Content - Duolingo Style -->
        <div class="glass-card rounded-3xl p-8">
          <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <BookOpenIcon class="w-7 h-7 mr-3 text-emerald-600" />
            课程内容
          </h2>

          <!-- Lesson Path -->
          <div class="relative">
            <!-- Path Line -->
            <div
              class="absolute top-12 left-12 right-12 h-2 bg-gradient-to-r from-emerald-400 via-emerald-400 to-slate-300 rounded-full"
            ></div>

            <!-- Lessons -->
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
            >
              <div
                v-for="(lesson, index) in lessons"
                :key="lesson.id"
                class="flex flex-col items-center cursor-pointer group"
                @click="startLesson(lesson.id)"
              >
                <!-- Lesson Node -->
                <div
                  :class="[
                    'w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl transition-all duration-300 group-hover:scale-110',
                    lesson.status === 'completed'
                      ? 'gradient-primary shadow-emerald-400/50'
                      : lesson.status === 'current'
                        ? 'gradient-secondary shadow-indigo-400/50'
                        : 'bg-slate-200 text-slate-400',
                  ]"
                >
                  <component
                    :is="getLessonIcon(lesson.status)"
                    class="w-10 h-10 text-white"
                  />

                  <!-- Completion Glow -->
                  <div
                    v-if="lesson.status === 'completed'"
                    class="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse"
                  ></div>

                  <!-- Current Pulse -->
                  <div
                    v-if="lesson.status === 'current'"
                    class="absolute -inset-2 rounded-full border-2 border-indigo-400 animate-pulse"
                  ></div>
                </div>

                <!-- Lesson Info -->
                <div class="text-center">
                  <h4
                    class="font-bold text-lg text-slate-800 group-hover:text-emerald-600 transition-colors mb-2"
                  >
                    {{ index + 1 }}. {{ lesson.title }}
                  </h4>
                  <p class="text-slate-600 mb-2">{{ lesson.duration }}</p>
                  <div class="flex items-center justify-center space-x-2">
                    <span
                      v-if="lesson.xp"
                      class="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-semibold"
                    >
                      +{{ lesson.xp }} XP
                    </span>
                    <span
                      :class="[
                        'text-sm px-3 py-1 rounded-full font-semibold',
                        lesson.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : lesson.status === 'current'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-500',
                      ]"
                    >
                      {{ lesson.type }}
                    </span>
                  </div>

                  <button
                    v-if="lesson.status === 'current'"
                    class="mt-3 btn-modern btn-primary text-sm"
                  >
                    开始学习
                  </button>

                  <div
                    v-if="lesson.status === 'locked'"
                    class="text-sm text-slate-500 mt-2"
                  >
                    完成前置课程解锁
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Course Description -->
        <div class="glass-card rounded-3xl p-8">
          <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <InfoIcon class="w-7 h-7 mr-3 text-blue-600" />
            课程介绍
          </h2>
          <div class="prose prose-slate max-w-none text-lg leading-relaxed">
            <p class="text-slate-600 mb-6">
              陕北剪纸是中国传统民间艺术的瑰宝，承载着深厚的文化内涵和艺术价值。本课程将带你从零开始，
              系统学习剪纸的基本技法、图案设计和创作方法。通过理论讲解与实践操作相结合的方式，
              让你在短时间内掌握这门古老而美丽的艺术。
            </p>
            <h3 class="text-xl font-bold text-slate-800 mt-8 mb-4">
              你将学到：
            </h3>
            <ul class="space-y-3 text-slate-600">
              <li class="flex items-start">
                <CheckIcon
                  class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0"
                />
                剪纸工具的选择和使用方法
              </li>
              <li class="flex items-start">
                <CheckIcon
                  class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0"
                />
                基础图案的设计和剪制技巧
              </li>
              <li class="flex items-start">
                <CheckIcon
                  class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0"
                />
                传统花鸟图案的创作方法
              </li>
              <li class="flex items-start">
                <CheckIcon
                  class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0"
                />
                复杂构图的设计原理
              </li>
              <li class="flex items-start">
                <CheckIcon
                  class="w-6 h-6 text-emerald-500 mr-3 mt-0.5 flex-shrink-0"
                />
                独立完成剪纸作品的能力
              </li>
            </ul>
          </div>
        </div>

        <!-- Instructor -->
        <div class="glass-card rounded-3xl p-8">
          <h2 class="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <UserIcon class="w-7 h-7 mr-3 text-violet-600" />
            讲师介绍
          </h2>
          <div class="flex items-start space-x-6">
            <img
              src="/elderly-woman-avatar.png"
              alt="讲师头像"
              class="w-20 h-20 rounded-full object-cover shadow-lg"
            />
            <div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">李师傅</h3>
              <p class="text-lg text-emerald-600 mb-3">陕北剪纸非遗传承人</p>
              <p class="text-slate-600 leading-relaxed">
                从事剪纸艺术30余年，作品多次获得国家级奖项，致力于传统文化的传承与发展。
                擅长将传统技艺与现代教学方法相结合，帮助学员快速掌握剪纸精髓。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeftIcon,
  ShareIcon,
  PlayIcon,
  ClockIcon,
  UsersIcon,
  StarIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  LockIcon,
  CheckIcon,
  BookOpenIcon,
  InfoIcon,
  UserIcon,
} from "lucide-vue-next";
import BottomNavigation from "../components/BottomNavigation.vue";
import { courseAPI } from "../services/api";

const route = useRoute();
const router = useRouter();
const activeTab = ref("learning");
const loading = ref(true);
const error = ref(null);

// 使用响应式数据，初始为空
const course = reactive({
  id: null,
  title: "",
  description: "",
  image: "",
  duration: "",
  students: 0,
  rating: 0,
  progress: 0,
  level: "",
  creator: null,
});

const lessons = reactive([]);

// 加载课程数据
const loadCourseData = async () => {
  try {
    loading.value = true;
    const courseId = route.params.id;

    // 获取课程详情
    const courseResponse = await courseAPI.getCourseById(courseId);
    const courseData = courseResponse.data;

    // 更新课程数据（字段已在API层映射）
    Object.assign(course, {
      id: courseData.id || courseData._id,
      title: courseData.title || "课程标题",
      description: courseData.description || "课程描述",
      image: courseData.image || "/traditional-paper-cutting.png",
      duration: courseData.estimatedDuration || courseData.duration || "45分钟",
      students: courseData.students || 0,
      rating: courseData.rating || 0,
      progress: courseData.progress || 0,
      level: courseData.level || "初级",
      creator: courseData.creator,
    });

    // 更新课程内容（lessons已在API层映射）
    lessons.splice(0, lessons.length, ...courseData.lessons);

    // 课程内容完全依赖API数据
  } catch (err) {
    console.error("加载课程数据失败:", err);
    error.value = err.message || "加载课程数据失败";
  } finally {
    loading.value = false;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadCourseData();
});

const getLessonIcon = (status) => {
  switch (status) {
    case "completed":
      return CheckCircleIcon;
    case "current":
      return PlayCircleIcon;
    case "locked":
      return LockIcon;
    default:
      return PlayCircleIcon;
  }
};

const startCourse = () => {
  const currentLesson = lessons.find((lesson) => lesson.status === "current");
  if (currentLesson) {
    router.push(`/lesson/${currentLesson.id}`);
  } else {
    router.push(`/lesson/${lessons[0].id}`);
  }
};

const startLesson = (lessonId) => {
  const lesson = lessons.find((l) => l.id === lessonId);
  if (lesson && lesson.status !== "locked") {
    router.push(`/lesson/${lessonId}`);
  }
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
};
</script>

<style scoped>
.course-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 80px;
}

.course-hero {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.course-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.course-thumbnail {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.course-info h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.course-info p {
  color: #718096;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.course-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(102, 126, 234, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

.progress-section {
  margin: 30px 0;
  padding: 25px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  color: white;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.progress-title {
  font-size: 18px;
  font-weight: 600;
}

.progress-percentage {
  font-size: 24px;
  font-weight: 700;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.course-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.content-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  border-radius: 10px 10px 0 0;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button.active {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.tab-button.active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.lessons-path {
  position: relative;
  padding: 20px 0;
}

.lesson-item {
  position: relative;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.lesson-item:nth-child(even) {
  flex-direction: row-reverse;
}

.lesson-item:nth-child(even) .lesson-card {
  margin-left: 0;
  margin-right: 40px;
}

.lesson-item:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 80px;
  width: 3px;
  height: 60px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  transform: translateX(-50%);
  z-index: 1;
}

.lesson-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 2;
  position: relative;
}

.lesson-icon.completed {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.lesson-icon.current {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  animation: pulse 2s infinite;
}

.lesson-icon.locked {
  background: linear-gradient(135deg, #a0aec0, #718096);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.lesson-card {
  flex: 1;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.lesson-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.lesson-card.completed {
  border-color: #48bb78;
  background: linear-gradient(
    135deg,
    rgba(72, 187, 120, 0.05),
    rgba(56, 161, 105, 0.05)
  );
}

.lesson-card.current {
  border-color: #ed8936;
  background: linear-gradient(
    135deg,
    rgba(237, 137, 54, 0.05),
    rgba(221, 107, 32, 0.05)
  );
}

.lesson-card.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.lesson-card.locked:hover {
  transform: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.lesson-title {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.lesson-description {
  color: #718096;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.lesson-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #a0aec0;
}

.lesson-duration {
  display: flex;
  align-items: center;
  gap: 5px;
}

.lesson-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
}

.lesson-status.completed {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.lesson-status.current {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.lesson-status.locked {
  background: rgba(160, 174, 192, 0.1);
  color: #a0aec0;
}

.start-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.instructor-section {
  margin-top: 40px;
  padding: 25px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.instructor-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.instructor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
}

.instructor-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
}

.instructor-info p {
  color: #718096;
  font-size: 14px;
}

.instructor-bio {
  color: #4a5568;
  line-height: 1.6;
  font-size: 14px;
}

@media (max-width: 768px) {
  .course-hero,
  .course-content {
    margin: 10px;
    padding: 20px;
  }

  .course-header {
    flex-direction: column;
    text-align: center;
  }

  .course-thumbnail {
    width: 100px;
    height: 100px;
  }

  .lesson-item {
    flex-direction: column !important;
    align-items: center;
  }

  .lesson-item:nth-child(even) .lesson-card {
    margin-right: 0;
  }

  .lesson-card {
    max-width: 100%;
  }

  .lesson-item:not(:last-child)::after {
    left: 50%;
    width: 2px;
    height: 40px;
  }
}
</style>
