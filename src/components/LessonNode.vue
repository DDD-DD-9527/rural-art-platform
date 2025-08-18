<template>
  <div class="flex flex-col items-center min-w-0 flex-shrink-0">
    <!-- Node Circle -->
    <div 
      :class="[
        'relative w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl transition-all duration-300 hover:scale-110',
        nodeClasses
      ]"
    >
      <component :is="nodeIcon" class="w-10 h-10 text-white relative z-10" />
      
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
    <div class="text-center min-w-[140px]">
      <h4 class="font-bold text-lg mb-2 text-white">{{ lesson.title }}</h4>
      <div class="text-sm opacity-80 mb-2">
        <div class="bg-white/20 px-3 py-1 rounded-full inline-block mb-2 font-medium">{{ lesson.type }}</div>
        <div class="font-medium">{{ lesson.duration }}</div>
      </div>
      
      <div v-if="lesson.status !== 'locked'" class="flex items-center justify-center text-sm text-yellow-300 mb-3">
        <StarIcon class="w-4 h-4 mr-1" />
        <span class="font-bold">+{{ lesson.xp }} XP</span>
      </div>
      
      <button 
        v-if="lesson.status === 'current'"
        @click="$emit('start-lesson', lesson.id)"
        class="px-6 py-3 bg-white text-indigo-600 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        开始学习
      </button>
      
      <div v-if="lesson.status === 'locked'" class="text-sm text-white/60 text-center mt-2 font-medium">
        完成前置课程解锁
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircleIcon, PlayIcon, LockIcon, StarIcon } from 'lucide-vue-next'

const props = defineProps({
  lesson: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

defineEmits(['start-lesson'])

const nodeClasses = computed(() => {
  switch (props.lesson.status) {
    case 'completed':
      return 'gradient-primary shadow-emerald-400/50'
    case 'current':
      return 'gradient-secondary shadow-indigo-400/50'
    case 'locked':
      return 'bg-white/20 border-2 border-white/30'
    default:
      return 'bg-white/20 border-2 border-white/30'
  }
})

const nodeIcon = computed(() => {
  switch (props.lesson.status) {
    case 'completed':
      return CheckCircleIcon
    case 'current':
      return PlayIcon
    case 'locked':
      return LockIcon
    default:
      return LockIcon
  }
})
</script>
