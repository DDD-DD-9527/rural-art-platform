<template>
  <div 
    class="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden border-0 glass-card rounded-3xl cursor-pointer transform hover:scale-105"
    @click="$emit('click')"
  >
    <div class="relative">
      <img 
        :src="course.image || '/placeholder.svg?height=200&width=300'"
        :alt="course.title"
        class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
      
      <!-- Play Button -->
      <div class="absolute top-4 right-4">
        <div class="w-12 h-12 glass-morphism rounded-full flex items-center justify-center shadow-lg">
          <PlayIcon class="w-6 h-6 text-emerald-600" />
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div v-if="course.progress > 0" class="absolute bottom-4 left-4 right-4">
        <div class="glass-morphism rounded-2xl p-3">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-slate-700 font-medium">学习进度</span>
            <span class="font-bold text-emerald-600">{{ course.progress }}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div 
              class="gradient-primary h-2 rounded-full transition-all duration-500"
              :style="{ width: `${course.progress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="p-6">
      <h3 class="text-xl font-bold mb-3 group-hover:text-emerald-600 transition-colors duration-300">
        {{ course.title }}
      </h3>
      <p class="text-slate-600 text-base mb-4 leading-relaxed">{{ course.description }}</p>

      <div class="flex items-center justify-between text-sm text-slate-500 mb-6">
        <div class="flex items-center space-x-4">
          <div v-if="course.rating" class="flex items-center space-x-1">
            <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
            <span class="font-medium">{{ course.rating }}</span>
          </div>
          <div v-if="course.students" class="flex items-center space-x-1">
            <UsersIcon class="w-4 h-4" />
            <span class="font-medium">{{ course.students }}</span>
          </div>
          <div v-if="course.duration" class="flex items-center space-x-1">
            <ClockIcon class="w-4 h-4" />
            <span class="font-medium">{{ course.duration }}</span>
          </div>
        </div>
      </div>

      <button class="w-full py-4 gradient-primary hover:shadow-lg text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105">
        {{ course.progress > 0 ? '继续学习' : '开始学习' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { PlayIcon, StarIcon, UsersIcon, ClockIcon } from 'lucide-vue-next'

defineProps({
  course: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])
</script>
