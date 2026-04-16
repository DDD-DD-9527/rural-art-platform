<template>
  <div class="relative flex items-center justify-center">
    <svg :width="size" :height="size" class="transform -rotate-90">
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        stroke="currentColor"
        stroke-width="4"
        fill="none"
        :class="trackColor"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        stroke="currentColor"
        stroke-width="4"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :class="progressColor"
        stroke-linecap="round"
        class="transition-all duration-500 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center">
      <span :class="['font-bold', textColor]">{{ progress }}%</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  size: {
    type: Number,
    default: 64,
  },
  color: {
    type: String,
    default: "green",
  },
});

const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - 8) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const strokeDashoffset = computed(
  () => circumference.value * (1 - props.progress / 100),
);

const trackColor = computed(() => {
  return props.color === "white" ? "text-white/20" : "text-gray-200";
});

const progressColor = computed(() => {
  return props.color === "white" ? "text-white" : "text-green-500";
});

const textColor = computed(() => {
  return props.color === "white" ? "text-white" : "text-green-600";
});
</script>
