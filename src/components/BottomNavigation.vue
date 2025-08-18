<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50">
    <div class="flex justify-around items-center py-2">
      <router-link
        v-for="item in navItems"
        :key="item.id"
        :to="item.href"
        @click="$emit('tab-change', item.id)"
        :class="[
          'flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200',
          activeTab === item.id
            ? 'text-green-600 bg-green-50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        ]"
      >
        <component 
          :is="item.icon" 
          :class="[
            'w-5 h-5 mb-1',
            activeTab === item.id ? 'text-green-600' : 'text-gray-500'
          ]" 
        />
        <span class="text-xs font-medium">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { HomeIcon, BookOpenIcon, UsersIcon, PaletteIcon, UserIcon } from 'lucide-vue-next'

defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

defineEmits(['tab-change'])

const navItems = [
  { id: 'home', label: '首页', icon: HomeIcon, href: '/' },
  { id: 'learning', label: '学习', icon: BookOpenIcon, href: '/learning' },
  { id: 'community', label: '社区', icon: UsersIcon, href: '/community' },
  { id: 'create', label: '创作', icon: PaletteIcon, href: '/create' },
  { id: 'profile', label: '我的', icon: UserIcon, href: '/profile' }
]
</script>
