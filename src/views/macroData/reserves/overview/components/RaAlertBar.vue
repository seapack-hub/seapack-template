<template>
  <div v-if="alerts.length" class="flex items-center gap-12px box-border p-x-20 p-y-10 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
    <el-icon :size="18" color="#E6A23C"><WarningFilled /></el-icon>
    <span class="text-13px font-500 color-[var(--el-text-color-secondary)] whitespace-nowrap">预警信号</span>
    <div class="flex-1 overflow-hidden">
      <div class="flex gap-24px animate-scroll">
        <span v-for="(a, i) in alerts" :key="i" class="flex items-center gap-6px whitespace-nowrap text-13px">
          <span class="inline-block w-6px h-6px rounded-full" :style="{ backgroundColor: a.color }" />
          <span class="font-500">{{ a.name }}</span>
          <span class="color-[var(--el-text-color-placeholder)]">{{ a.desc }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue'
import type { RaAlert } from '@/api/macroData/reserves/types'
defineProps<{ alerts: RaAlert[] }>()
</script>

<style scoped>
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-scroll {
  animation: scroll 20s linear infinite;
}
.animate-scroll:hover {
  animation-play-state: paused;
}
</style>
