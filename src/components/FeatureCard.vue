<template>
  <div 
    class="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 glass-card rounded-3xl p-8 cursor-pointer transform hover:scale-105"
    @click="$emit('click')"
  >
    <div 
      :class="[
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg',
        bgColor
      ]"
    >
      <component :is="icon" :class="['w-8 h-8', color]" />
    </div>
    <h3 class="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
      {{ title }}
    </h3>
    <p class="text-slate-600 text-base mb-4 leading-relaxed">{{ description }}</p>
    <div class="inline-flex items-center px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-100 to-blue-100 text-sm font-semibold text-emerald-700">
      {{ badge }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  bgColor: {
    type: String,
    required: true
  }
})

defineEmits(['click'])
</script>
