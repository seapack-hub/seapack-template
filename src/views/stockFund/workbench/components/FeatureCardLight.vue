<template>
  <div
    class="feature-card flex items-center gap-14px p-16px bg-[#fafbfc] rounded-12px border border-solid border-[#f0f0f0] cursor-pointer transition-all-250 relative overflow-hidden hover:(-translate-y-1px shadow-[0_8px_24px_rgba(0,0,0,0.06)] border-[#e0e6ed] bg-white)"
    :style="{ '--accent': color }"
    @click="$emit('click')"
  >
    <div class="card-icon shrink-0 w-44px h-44px flex items-center justify-center rounded-10px transition-all-250" :style="{ background: `${color}12` }">
      <Icon :name="icon" :size="20" :color="color" />
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="m-0 mb-3px text-14px font-600 color-[#1d2129]">{{ title }}</h3>
      <p class="m-0 text-12px color-[#86909c] leading-[1.5] overflow-hidden text-ellipsis line-clamp-2">{{ desc }}</p>
    </div>
    <div v-if="stat" class="shrink-0 px-8px py-2px text-11px font-600 rounded-6px bg-white border border-solid" :style="{ color: color, borderColor: `${color}30` }">
      {{ stat }}
    </div>
    <div class="shrink-0 color-[#c9cdd4] opacity-0 transition-all-250 card-arrow">
      <el-icon :size="14"><ArrowRight /></el-icon>
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
  transform: scale(1.05);
}
.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(4px);
}
</style>
