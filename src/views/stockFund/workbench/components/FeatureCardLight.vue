<template>
  <div
    class="feature-card flex items-center gap-16px p-16px bg-white rounded-12px border border-solid border-[#e4e7ed] cursor-pointer transition-all-300 relative overflow-hidden hover:(-translate-y-2px shadow-[0_8px_24px_rgba(0,0,0,0.08)])"
    :style="{ '--accent': color }"
    @click="$emit('click')"
  >
    <div class="card-icon shrink-0 w-48px h-48px flex items-center justify-center rounded-10px shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all-300" :style="{ background: color }">
      <Icon :name="icon" :size="22" color="#fff" />
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="m-0 mb-2px text-14px font-600 color-[#303133]">{{ title }}</h3>
      <p class="m-0 text-12px color-[#909399] leading-[1.4] overflow-hidden text-ellipsis line-clamp-2">{{ desc }}</p>
    </div>
    <div v-if="stat" class="shrink-0 px-8px py-2px text-11px font-600 rounded-12px bg-[rgba(0,0,0,0.02)] border border-solid" :style="{ color: color, borderColor: `${color}30` }">
      {{ stat }}
    </div>
    <div class="shrink-0 color-[#c0c4cc] opacity-0 transition-all-300 card-arrow">
      <el-icon><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import Icon from '@/components/Icon/index.vue'

defineProps<{
  icon: string
  title: string
  desc: string
  color: string
  stat?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.feature-card:hover .card-icon {
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}
.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(4px);
}
.feature-card:hover {
  border-color: var(--accent);
}
</style>
