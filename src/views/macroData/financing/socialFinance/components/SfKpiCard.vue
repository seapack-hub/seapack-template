<template>
  <div class="box-border p-x-20 p-y-16 rounded-12px bg-white shadow-sm hover:shadow-md transition-shadow" :style="{ borderTop: `3px solid ${borderColor}` }">
    <!-- 标题行 -->
    <div class="flex items-center gap-8px">
      <div class="w-32px h-32px rounded-8px flex items-center justify-center" :style="{ backgroundColor: iconBgColor }">
        <el-icon :size="18" :color="iconColor"><component :is="icon" /></el-icon>
      </div>
      <span class="text-14px font-700 color-[var(--el-text-color-primary)]">{{ label }}</span>
    </div>
    <!-- 数值 -->
    <div class="m-t-14px flex items-baseline gap-4px">
      <span class="text-28px font-800" :style="{ color: valueColor }">{{ displayValue }}</span>
      <span class="text-13px font-400 color-[var(--el-text-color-secondary)]">{{ unit }}</span>
    </div>
    <!-- 描述行：change 或 badge 或 dateLabel -->
    <div class="m-t-6px flex items-center gap-4px">
      <template v-if="badge">
        <span class="text-12px color-[var(--el-text-color-secondary)]">{{ changeLabel }}</span>
        <span class="inline-block px-6px py-1px rounded-3px text-11px font-500" :class="badgePositive ? 'bg-[#f0f9eb] color-[#67C23A]' : 'bg-[#fef0f0] color-[#F56C6C]'">
          {{ badge }}
        </span>
      </template>
      <template v-else-if="changeLabel && change != null">
        <span class="text-12px color-[var(--el-text-color-secondary)]">{{ changeLabel }}</span>
        <span class="text-13px font-600" :class="change <= 0 ? 'color-[#67C23A]' : 'color-[#F56C6C]'">
          {{ change > 0 ? '+' : '' }}{{ change.toFixed(2) }}%
        </span>
      </template>
      <template v-else-if="dateLabel">
        <span class="text-12px color-[var(--el-text-color-secondary)]">{{ dateLabel }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

const props = defineProps<{
  label: string
  value: number | string | null
  unit?: string
  change?: number
  changeLabel?: string
  badge?: string
  badgePositive?: boolean
  dateLabel?: string
  valueColor?: string
  icon: Component
  borderColor: string
  iconBgColor: string
  iconColor: string
}>()

const displayValue = computed(() => {
  if (props.value == null) return '--'
  if (typeof props.value === 'string') return props.value
  return Number(props.value).toFixed(2)
})
</script>
