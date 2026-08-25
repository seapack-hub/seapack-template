<template>
  <div class="macro-kpi-card">
    <div class="flex flex-col gap-2px min-w-0">
      <span class="text-13px color-[var(--el-text-color-secondary)]">{{ label }}</span>
      <span class="text-22px font-bold color-[var(--el-text-color-primary)] font-['DIN_Alternate',monospace] tabular-nums">{{ value }}</span>
      <span v-if="change !== undefined" class="text-13px font-600 font-['DIN_Alternate',monospace] tabular-nums" :class="change >= 0 ? 'color-[var(--el-color-danger)]' : 'color-[var(--el-color-success)]'">
        {{ change >= 0 ? '+' : '' }}{{ change }}{{ unit }}
      </span>
    </div>
    <div class="w-48px h-48px rounded-12px flex items-center justify-center flex-shrink-0" :style="{ background: `${color}12`, color }">
      <el-icon :size="22"><component :is="icon" /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  change?: number
  unit?: string
  icon: string
  color?: string
}>()
</script>

<style scoped>
.macro-kpi-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: box-shadow 0.25s, transform 0.25s;
}
.macro-kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
