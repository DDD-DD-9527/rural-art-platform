<template>
  <div
    id="app"
    class="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50"
  >
    <router-view />
    <AIAssistantFloat />
  </div>
</template>

<script setup>
import { provide } from "vue";
import { useUserStore } from "./stores/user";
import AIAssistantFloat from "./components/AIAssistantFloat.vue";

const userStore = useUserStore();
provide("userStore", userStore);
</script>

<style>
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

:root {
  --primary-emerald: #059669;
  --primary-blue: #2563eb;
  --primary-indigo: #4f46e5;
  --primary-violet: #7c3aed;
  --accent-orange: #ea580c;
  --accent-rose: #e11d48;
  --neutral-slate: #475569;
  --surface-white: #ffffff;
  --surface-gray: #f8fafc;
}

/* 现代化玻璃效果 */
.glass-morphism {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* 现代化渐变 */
.gradient-primary {
  background: linear-gradient(135deg, #059669 0%, #2563eb 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.gradient-accent {
  background: linear-gradient(135deg, #ea580c 0%, #e11d48 100%);
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 现代化按钮效果 */
.btn-modern {
  @apply px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg;
}

.btn-primary {
  @apply bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700;
}

.btn-secondary {
  @apply bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700;
}
</style>
