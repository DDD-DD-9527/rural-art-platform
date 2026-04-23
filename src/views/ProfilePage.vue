<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50"
  >
    <header class="glass-morphism border-b border-white/30 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button
            @click="goBack"
            class="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            返回
          </button>
          <h1 class="text-lg font-bold text-slate-800">个人中心</h1>
          <div class="w-16"></div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <!-- 未登录状态 -->
      <div v-if="!userStore.isAuthenticated" class="text-center py-16">
        <div class="glass-card rounded-3xl p-8 mb-8 max-w-md mx-auto">
          <div
            class="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mx-auto mb-6"
          >
            <UserIcon class="w-10 h-10 text-slate-500" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800 mb-4">
            欢迎来到乡艺未来
          </h2>
          <p class="text-slate-600 mb-8">
            登录后可以查看学习记录、管理个人信息、参与社区互动
          </p>

          <div class="space-y-4">
            <button
              @click="goToLogin"
              class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              立即登录
            </button>
            <button
              @click="goToRegister"
              class="w-full border-2 border-emerald-500 text-emerald-600 font-semibold py-3 px-6 rounded-xl hover:bg-emerald-50 transition-all duration-200"
            >
              注册账号
            </button>
            <button
              @click="handleGuestMode"
              class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
            >
              游客体验
            </button>
          </div>
        </div>
      </div>

      <!-- 已登录状态 -->
      <div v-else>
        <!-- 用户信息卡片 -->
        <div class="glass-card rounded-3xl p-8 mb-8">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 rounded-full overflow-hidden">
              <img
                v-if="userStore.user.avatar"
                :src="userStore.user.avatar"
                :alt="userStore.user.name || '用户头像'"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div
                v-else
                class="w-full h-full gradient-primary flex items-center justify-center"
              >
                <UserIcon class="w-10 h-10 text-white" />
              </div>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-slate-800 mb-2">
                {{ userStore.user.name || userStore.user.username || "用户" }}
              </h2>
              <p class="text-slate-600 mb-3">
                {{ userStore.user.location || "未设置地区" }} ·
                {{ userStore.user.bio || "暂无简介" }}
              </p>
              <div class="flex items-center space-x-4">
                <button
                  @click="goToCompletedCourses"
                  class="text-center p-2 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  <div class="text-xl font-bold text-emerald-600">
                    {{ userStore.learningStats.completedCourses || 0 }}
                  </div>
                  <div class="text-sm text-slate-500">已完成课程</div>
                </button>
                <button
                  @click="goToLearningPoints"
                  class="text-center p-2 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <div class="text-xl font-bold text-blue-600">
                    {{ userStore.learningStats.learningPoints || 0 }}
                  </div>
                  <div class="text-sm text-slate-500">学习积分</div>
                </button>
                <button
                  @click="goToLearningDays"
                  class="text-center p-2 rounded-xl hover:bg-violet-50 transition-colors"
                >
                  <div class="text-xl font-bold text-violet-600">
                    {{ userStore.learningStats.studyDays || 0 }}
                  </div>
                  <div class="text-sm text-slate-500">学习天数</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 社交关系统计 -->
        <div class="glass-card rounded-2xl p-6 mb-6">
          <h3 class="text-lg font-semibold text-slate-800 mb-4">社交关系</h3>
          <div class="grid grid-cols-3 gap-4">
            <button
              @click="goToFollowing"
              class="text-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div class="text-xl font-bold text-blue-600">
                {{ userStore.learningStats.following || 0 }}
              </div>
              <div class="text-sm text-slate-500">关注</div>
            </button>
            <button
              @click="goToFans"
              class="text-center p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <div class="text-xl font-bold text-emerald-600">
                {{ userStore.learningStats.followers || 0 }}
              </div>
              <div class="text-sm text-slate-500">粉丝</div>
            </button>
            <button
              @click="goToLikesReceived"
              class="text-center p-3 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
            >
              <div class="text-xl font-bold text-violet-600">
                {{ socialStats.likesReceived }}
              </div>
              <div class="text-sm text-slate-500">获赞</div>
            </button>
          </div>
        </div>

        <!-- 功能菜单网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <!-- 学习记录 -->
          <div class="glass-card rounded-2xl p-6">
            <h3
              class="text-lg font-semibold text-slate-800 mb-4 flex items-center"
            >
              <BookOpenIcon class="w-5 h-5 mr-2 text-emerald-600" />
              学习记录
            </h3>
            <div class="space-y-3">
              <button
                @click="goToTodayStudyTime"
                class="w-full flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <span class="text-slate-700">今日学习时长</span>
                <span class="font-semibold text-emerald-600"
                  >{{ userStore.learningStats.todayStudyTime || 0 }}分钟</span
                >
              </button>
              <button
                @click="goToWeeklyStudyDays"
                class="w-full flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <span class="text-slate-700">本周学习天数</span>
                <span class="font-semibold text-blue-600"
                  >{{ userStore.learningStats.weeklyStudyDays || 0 }}天</span
                >
              </button>
            </div>
          </div>

          <!-- 互动记录 -->
          <div class="glass-card rounded-2xl p-6">
            <h3
              class="text-lg font-semibold text-slate-800 mb-4 flex items-center"
            >
              <HeartIcon class="w-5 h-5 mr-2 text-rose-600" />
              互动记录
            </h3>
            <div class="space-y-3">
              <button
                @click="goToLikes"
                class="w-full flex items-center justify-between p-3 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
              >
                <span class="text-slate-700">我的点赞</span>
                <span class="font-semibold text-rose-600">{{
                  socialStats.myLikes
                }}</span>
              </button>
              <button
                @click="goToComments"
                class="w-full flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <span class="text-slate-700">我的评论</span>
                <span class="font-semibold text-blue-600">{{
                  socialStats.myComments
                }}</span>
              </button>
            </div>
          </div>

          <!-- 成就系统 -->
          <div class="glass-card rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3
                class="text-lg font-semibold text-slate-800 flex items-center"
              >
                <AwardIcon class="w-5 h-5 mr-2 text-amber-600" />
                我的成就
              </h3>
              <button
                @click="goToAchievements"
                class="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                查看全部
              </button>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div
                class="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center"
              >
                <AwardIcon class="w-6 h-6 text-amber-600" />
              </div>
              <div
                class="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center"
              >
                <StarIcon class="w-6 h-6 text-emerald-600" />
              </div>
              <button
                @click="goToAchievements"
                class="aspect-square bg-gradient-to-br from-slate-100 to-gray-100 rounded-xl flex items-center justify-center hover:from-slate-200 hover:to-gray-200 transition-colors"
              >
                <PlusIcon class="w-6 h-6 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- 积分商城 -->
        <div class="glass-card rounded-2xl p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800 flex items-center">
              <ShoppingBagIcon class="w-5 h-5 mr-2 text-violet-500" />
              积分商城
            </h3>
            <button
              @click="goToPointsShop"
              class="text-violet-600 hover:text-violet-700 text-sm font-medium"
            >
              进入商城
            </button>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-violet-50 rounded-xl text-center">
              <div class="text-2xl font-bold text-violet-600 mb-1">
                {{ userStore.learningStats.totalPoints?.toLocaleString() || 0 }}
              </div>
              <div class="text-sm text-slate-500">当前积分</div>
            </div>
            <div class="p-4 bg-emerald-50 rounded-xl text-center">
              <div class="text-2xl font-bold text-emerald-600 mb-1">
                {{ availableProducts }}
              </div>
              <div class="text-sm text-slate-500">可兑换商品</div>
            </div>
          </div>
        </div>

        <!-- 瑶绣制作专项职业能力补贴 -->
        <div class="glass-card rounded-2xl p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800 flex items-center">
              <LibraryIcon class="w-5 h-5 mr-2 text-emerald-500" />
              {{ subsidyCard?.title || "技能补贴" }}
            </h3>
            <button
              @click="goToSubsidy"
              class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              查看详情
            </button>
          </div>
          <div
            class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div>
                <div class="text-lg font-bold text-emerald-600">
                  ¥{{ subsidyCard?.leftAmount ?? "-" }}
                </div>
                <div class="text-sm text-slate-600">
                  {{ subsidyCard?.leftLabel || "" }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-green-600">
                  {{ subsidyCard?.rightCount ?? 0 }}门
                </div>
                <div class="text-sm text-slate-600">
                  {{ subsidyCard?.rightLabel || "" }}
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <div
                v-for="(line, idx) in subsidyCard?.bullets || []"
                :key="idx"
                class="flex items-center text-sm text-slate-600"
              >
                <CheckCircleIcon class="w-4 h-4 mr-1 text-green-500" />
                {{ line }}
              </div>
            </div>
          </div>
        </div>

        <!-- 会员中心 -->
        <div class="glass-card rounded-2xl p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800 flex items-center">
              <CrownIcon class="w-5 h-5 mr-2 text-yellow-500" />
              会员中心
            </h3>
            <button
              @click="goToMembership"
              class="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
            >
              升级会员
            </button>
          </div>
          <div
            class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                >
                  <CrownIcon class="w-6 h-6 text-white" />
                </div>
                <div>
                  <div class="font-semibold text-slate-800">
                    {{ membershipLevel }}
                  </div>
                  <div class="text-sm text-slate-600">
                    {{ membershipExpiry }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-orange-600">
                  {{ membershipDiscount }}
                </div>
                <div class="text-sm text-slate-600">课程折扣</div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="bg-white/50 rounded-lg p-2 text-center">
                <div class="font-medium text-slate-700">高清视频</div>
              </div>
              <div class="bg-white/50 rounded-lg p-2 text-center">
                <div class="font-medium text-slate-700">专属客服</div>
              </div>
              <div class="bg-white/50 rounded-lg p-2 text-center">
                <div class="font-medium text-slate-700">优先报名</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我的作品 -->
        <div class="glass-card rounded-2xl p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800 flex items-center">
              <PaletteIcon class="w-5 h-5 mr-2 text-indigo-600" />
              我的作品
            </h3>
            <button
              @click="goToMyWorks"
              class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              查看全部
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div
              class="aspect-square bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              @click="goToMyWorks"
            >
              <PaletteIcon class="w-8 h-8 text-emerald-600" />
            </div>
            <div
              class="aspect-square bg-gradient-to-br from-violet-100 to-rose-100 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              @click="goToMyWorks"
            >
              <PaletteIcon class="w-8 h-8 text-violet-600" />
            </div>
          </div>
        </div>

        <!-- 账户设置 -->
        <div class="glass-card rounded-2xl p-6 mb-6">
          <h3
            class="text-lg font-semibold text-slate-800 mb-4 flex items-center"
          >
            <CogIcon class="w-5 h-5 mr-2 text-slate-600" />
            账户设置
          </h3>
          <div class="space-y-3">
            <button
              class="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <span class="text-slate-700">个人信息</span>
              <ChevronRightIcon class="w-4 h-4 text-slate-400" />
            </button>
            <button
              class="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <span class="text-slate-700">隐私设置</span>
              <ChevronRightIcon class="w-4 h-4 text-slate-400" />
            </button>
            <button
              @click="handleLogout"
              class="w-full flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            >
              <ArrowRightOnRectangleIcon class="w-4 h-4 mr-2" />
              退出登录
            </button>
          </div>
        </div>
      </div>
    </main>

    <BottomNavigation :active-tab="activeTab" @tab-change="handleTabChange" />
  </div>

  <!-- 关注列表模态框 -->
  <div
    v-if="showFollowingModal"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div
      class="glass-card rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-slate-800">我的关注</h3>
        <button
          @click="showFollowingModal = false"
          class="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <XIcon class="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="user in followingList"
          :key="user.id"
          class="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
            >
              <UserIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <div class="font-medium text-slate-800">{{ user.name }}</div>
              <div class="text-sm text-slate-500">{{ user.location }}</div>
            </div>
          </div>
          <button
            class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm"
          >
            已关注
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 粉丝列表模态框 -->
  <div
    v-if="showFollowersModal"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div
      class="glass-card rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-slate-800">我的粉丝</h3>
        <button
          @click="showFollowersModal = false"
          class="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <XIcon class="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="user in followersList"
          :key="user.id"
          class="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center"
            >
              <UserIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <div class="font-medium text-slate-800">{{ user.name }}</div>
              <div class="text-sm text-slate-500">{{ user.location }}</div>
            </div>
          </div>
          <button
            class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm"
          >
            回关
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 我的点赞模态框 -->
  <div
    v-if="showMyLikesModal"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div
      class="glass-card rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-slate-800">我的点赞</h3>
        <button
          @click="showMyLikesModal = false"
          class="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <XIcon class="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="post in myLikedPosts"
          :key="post.id"
          class="p-4 bg-slate-50 rounded-xl"
        >
          <div class="flex items-center space-x-3 mb-3">
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center"
            >
              <UserIcon class="w-4 h-4 text-white" />
            </div>
            <div>
              <div class="font-medium text-slate-800 text-sm">
                {{ post.author }}
              </div>
              <div class="text-xs text-slate-500">{{ post.time }}</div>
            </div>
          </div>
          <p class="text-slate-700 text-sm">{{ post.content }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 会员中心模态框 -->
  <div
    v-if="showMembershipModal"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div
      class="glass-card rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-slate-800">会员中心</h3>
        <button
          @click="showMembershipModal = false"
          class="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <XIcon class="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <!-- 当前会员状态 -->
      <div
        class="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl"
      >
        <div class="flex items-center space-x-4 mb-4">
          <div
            class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
          >
            <CrownIcon class="w-8 h-8 text-white" />
          </div>
          <div>
            <div class="text-lg font-bold text-slate-800">
              {{ membershipLevel }}
            </div>
            <div class="text-sm text-slate-600">{{ membershipExpiry }}</div>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-2 text-xs">
          <div class="bg-white/50 rounded-lg p-2 text-center">
            <div class="font-medium text-slate-700">高清视频</div>
          </div>
          <div class="bg-white/50 rounded-lg p-2 text-center">
            <div class="font-medium text-slate-700">专属客服</div>
          </div>
          <div class="bg-white/50 rounded-lg p-2 text-center">
            <div class="font-medium text-slate-700">优先报名</div>
          </div>
          <div class="bg-white/50 rounded-lg p-2 text-center">
            <div class="font-medium text-slate-700">
              {{ membershipDiscount }}
            </div>
          </div>
        </div>
      </div>

      <!-- 会员等级 -->
      <div class="mb-6">
        <h4 class="font-semibold text-slate-800 mb-4">会员等级</h4>
        <div class="space-y-3">
          <div
            v-for="level in membershipLevels"
            :key="level.id"
            class="p-4 rounded-xl border-2"
            :class="
              level.current
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-slate-200 bg-slate-50'
            "
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <component
                  :is="level.icon"
                  class="w-6 h-6"
                  :class="level.iconColor"
                />
                <div>
                  <div class="font-medium text-slate-800">{{ level.name }}</div>
                  <div class="text-sm text-slate-600">{{ level.price }}</div>
                </div>
              </div>
              <div
                v-if="level.current"
                class="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full"
              >
                当前
              </div>
            </div>
            <div class="text-sm text-slate-600 mb-3">
              {{ level.description }}
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div
                v-for="benefit in level.benefits"
                :key="benefit"
                class="flex items-center space-x-1"
              >
                <CheckCircleIcon class="w-3 h-3 text-green-500" />
                <span class="text-slate-600">{{ benefit }}</span>
              </div>
            </div>
            <button
              v-if="!level.current"
              class="w-full mt-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors text-sm font-medium"
            >
              升级到{{ level.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { socialAPI, commentAPI, subsidyAPI } from "../services/api";
import {
  ArrowLeft as ArrowLeftIcon,
  User as UserIcon,
  Palette as PaletteIcon,
  BookOpen as BookOpenIcon,
  Heart as HeartIcon,
  Award as AwardIcon,
  Star as StarIcon,
  Plus as PlusIcon,
  X as XIcon,
  Library as LibraryIcon,
  CheckCircle as CheckCircleIcon,
  Crown as CrownIcon,
  ShoppingBag as ShoppingBagIcon,
  Settings as CogIcon,
  ChevronRight as ChevronRightIcon,
  LogOut as ArrowRightOnRectangleIcon,
} from "lucide-vue-next";
import BottomNavigation from "../components/BottomNavigation.vue";
import { DEFAULT_ASSETS } from "@/config/constants";

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref("profile");

const subsidyConfig = ref(null);
const subsidyCard = computed(() => subsidyConfig.value?.profileCard || null);

// 当前用户ID
const currentUserId = computed(() => userStore.user?.id || userStore.user?._id);

// 模态框状态
const showFollowingModal = ref(false);
const showFollowersModal = ref(false);
const showInteractionModal = ref(false);
const showMyLikesModal = ref(false);
const showMyCommentsModal = ref(false);
const showAchievementsModal = ref(false);

const showMembershipModal = ref(false);

// 统计数据
const socialStats = reactive({
  myLikes: 0,
  myComments: 0,
  likesReceived: 0,
});

// 加载统计数据
const loadStats = async () => {
  if (!userStore.isAuthenticated) return;

  try {
    // 获取点赞统计
    const likeStatsResponse = await socialAPI.getLikeStats();
    if (likeStatsResponse.success) {
      socialStats.myLikes = likeStatsResponse.data.given || 0;
      socialStats.likesReceived = likeStatsResponse.data.total || 0;
    }

    // 获取评论统计 - 通过获取第一页评论数据来计算总数
    const commentsResponse = await commentAPI.getMyComments({
      page: 1,
      limit: 1,
    });
    if (commentsResponse.success && commentsResponse.data.pagination) {
      socialStats.myComments = commentsResponse.data.pagination.total || 0;
    }

    // 获取关注统计
    const followStatsResponse = await socialAPI.getFollowStats();
    if (followStatsResponse.success) {
      // 更新用户store中的关注和粉丝数据
      userStore.updateSocialStats({
        following: followStatsResponse.data.following || 0,
        followers: followStatsResponse.data.followers || 0,
      });
    }
  } catch (error) {
    console.error("加载统计数据失败:", error);
  }
};

// 刷新所有数据
const refreshAllData = async () => {
  await Promise.all([
    loadStats(),
    loadFollowingList(),
    loadMyLikedPosts(),
    loadFollowersList(),
    loadSubsidyConfig(),
  ]);
};

const loadSubsidyConfig = async () => {
  try {
    const resp = await subsidyAPI.getConfig();
    if (resp?.success) {
      subsidyConfig.value = resp.data?.config || null;
    }
  } catch (error) {
    void error;
  }
};

// 组件挂载时加载数据
onMounted(() => {
  refreshAllData();
});

// 监听用户store的变化，当关注数据更新时刷新页面数据
watch(
  () => userStore.socialStats,
  () => {
    // 延迟刷新，避免频繁调用
    setTimeout(() => {
      refreshAllData();
    }, 1000);
  },
  { deep: true },
);

// 关注列表数据
const followingList = reactive([]);
const followingLoading = ref(false);

// 粉丝列表数据
const followersList = reactive([]);
const followersLoading = ref(false);

// 加载关注列表
const loadFollowingList = async () => {
  if (!userStore.isAuthenticated) return;

  try {
    followingLoading.value = true;
    const response = await socialAPI.getFollowing({ page: 1, limit: 10 });
    if (response.success && response.data) {
      // 处理新的数据格式：data.list 或 data.users
      const users = response.data.list || response.data.users || [];
      if (Array.isArray(users)) {
        followingList.splice(0, followingList.length, ...users);
      } else {
        console.warn("关注列表数据格式不正确:", response);
        followingList.splice(0, followingList.length);
      }
    } else {
      console.warn("关注列表数据格式不正确:", response);
      followingList.splice(0, followingList.length);
    }
  } catch (error) {
    console.error("加载关注列表失败:", error);
    followingList.splice(0, followingList.length);
  } finally {
    followingLoading.value = false;
  }
};

// 加载粉丝列表
const loadFollowersList = async () => {
  if (!userStore.isAuthenticated) return;

  try {
    followersLoading.value = true;
    const response = await socialAPI.getFollowers({ page: 1, limit: 10 });
    if (response.success && response.data) {
      // 处理新的数据格式：data.list 或 data.users
      const users = response.data.list || response.data.users || [];
      if (Array.isArray(users)) {
        followersList.splice(0, followersList.length, ...users);
      } else {
        console.warn("粉丝列表数据格式不正确:", response);
        followersList.splice(0, followersList.length);
      }
    } else {
      console.warn("粉丝列表数据格式不正确:", response);
      followersList.splice(0, followersList.length);
    }
  } catch (error) {
    console.error("加载粉丝列表失败:", error);
    followersList.splice(0, followersList.length);
  } finally {
    followersLoading.value = false;
  }
};

// 我点赞的内容
const myLikedPosts = ref([]);
const myLikedPostsLoading = ref(false);

// 加载我的点赞内容
const loadMyLikedPosts = async () => {
  if (!userStore.isAuthenticated) return;

  try {
    myLikedPostsLoading.value = true;
    const response = await socialAPI.getUserLikes({
      page: 1,
      limit: 10,
      sort: "recent",
    });

    if (response.success && response.data && response.data.likes) {
      // 转换数据格式
      myLikedPosts.value = response.data.likes.map((like) => ({
        id: like.id,
        author: like.target?.author?.name || "未知用户",
        time: formatTimeAgo(like.likedAt),
        content: like.target?.content || like.target?.title || "无内容",
      }));
    } else {
      myLikedPosts.value = [];
    }
  } catch (error) {
    console.error("加载点赞内容失败:", error);
    myLikedPosts.value = [];
  } finally {
    myLikedPostsLoading.value = false;
  }
};

// 格式化时间
const formatTimeAgo = (dateString) => {
  if (!dateString) return "未知时间";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
};

// 会员信息（基于用户数据动态计算）
const membershipLevel = computed(() => {
  // 根据积分和学习进度确定会员等级
  // 新用户默认为普通会员，需要达到更高的门槛才能升级
  let level = "普通会员";
  const totalPoints = userStore.learningStats.totalPoints || 0;
  const completedCourses = userStore.learningStats.completedCourses || 0;

  // 钻石会员：积分>=2000且完成课程>=20
  if (totalPoints >= 2000 && completedCourses >= 20) {
    level = "钻石会员";
  }
  // 黄金会员：积分>=1000且完成课程>=10
  else if (totalPoints >= 1000 && completedCourses >= 10) {
    level = "黄金会员";
  }

  return level;
});

const membershipExpiry = computed(() => {
  // 普通会员没有到期时间
  if (membershipLevel.value === "普通会员") {
    return "永久有效";
  }
  // 付费会员显示到期时间（这里可以根据实际业务逻辑调整）
  return "2024年12月31日到期";
});

const membershipDiscount = computed(() => {
  switch (membershipLevel.value) {
    case "钻石会员":
      return "7折";
    case "黄金会员":
      return "8.5折";
    default:
      return "无折扣";
  }
});

// 会员等级数据
const membershipLevels = ref([
  {
    id: 1,
    name: "普通会员",
    price: "免费",
    description: "基础功能，适合初学者体验",
    current: false,
    icon: UserIcon,
    iconColor: "text-slate-500",
    benefits: ["标清视频", "基础课程", "社区互动", "积分奖励"],
  },
  {
    id: 2,
    name: "黄金会员",
    price: "¥99/月",
    description: "享受更多优质内容和专属服务",
    current: true,
    icon: CrownIcon,
    iconColor: "text-yellow-500",
    benefits: [
      "高清视频",
      "全部课程",
      "专属客服",
      "8.5折优惠",
      "优先报名",
      "无广告",
    ],
  },
  {
    id: 3,
    name: "钻石会员",
    price: "¥199/月",
    description: "顶级会员体验，包含所有特权",
    current: false,
    icon: StarIcon,
    iconColor: "text-blue-500",
    benefits: [
      "4K超清视频",
      "独家课程",
      "一对一指导",
      "7折优惠",
      "线下活动",
      "定制服务",
    ],
  },
]);

// 计算可兑换商品数量（基于用户积分）
const availableProducts = computed(() => {
  const totalPoints = userStore.learningStats.totalPoints || 0;
  // 假设每100积分可以兑换1个商品
  return Math.floor(totalPoints / 100);
});

const goBack = () => {
  router.back();
};

const handleTabChange = (tab) => {
  activeTab.value = tab;
};

const goToPointsShop = () => {
  router.push("/points-shop");
};

const goToSubsidy = () => {
  router.push("/subsidy");
};

const goToAchievements = () => {
  router.push("/achievements");
};

const goToFans = () => {
  router.push("/fans");
};

const goToFollowing = () => {
  router.push("/following");
};

const goToLikes = () => {
  router.push("/likes");
};

const goToComments = () => {
  router.push("/comments");
};

const goToMembership = () => {
  router.push("/membership");
};

const goToMyWorks = () => {
  router.push("/my-works");
};

const goToLikesReceived = () => {
  router.push("/likes-received");
};

const goToTodayStudyTime = () => {
  router.push("/today-study-time");
};

const goToWeeklyStudyDays = () => {
  router.push("/weekly-study-days");
};

const goToCompletedCourses = () => {
  router.push("/completed-courses");
};

const goToLearningPoints = () => {
  router.push("/learning-points");
};

const goToLearningDays = () => {
  router.push("/learning-days");
};

// 用户认证相关方法
const goToLogin = () => {
  router.push("/login");
};

const goToRegister = () => {
  router.push("/register");
};

const handleGuestMode = () => {
  userStore.setGuestMode();
  // 刷新页面状态
};

const handleLogout = () => {
  userStore.logout();
  // 可以选择跳转到首页或刷新当前页面
  router.push("/");
};

// 处理图片加载错误
const handleImageError = (event) => {
  // 图片加载失败时显示默认头像
  event.target.src = DEFAULT_ASSETS.AVATAR;
  event.target.onerror = null; // 防止无限循环
};
</script>
