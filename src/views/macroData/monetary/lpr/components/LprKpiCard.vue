<template>
  <div class="box-border p-x-24 p-y-20 rounded-12px bg-white shadow-sm" :style="{ borderTop: `3px solid ${borderColor}` }">
    <!-- 标题行 -->
    <div class="flex items-center gap-8px">
      <div class="w-36px h-36px rounded-10px flex items-center justify-center" :style="{ backgroundColor: iconBgColor }">
        <el-icon :size="20" :color="iconColor"><component :is="icon" /></el-icon>
      </div>
      <span class="text-16px font-700 color-[var(--el-text-color-primary)]">{{ label }}</span>
    </div>
    <!-- 利率值 -->
    <div class="m-t-18px flex items-baseline gap-4px">
      <span class="text-32px font-800" :style="{ color: iconColor }">{{ value ?? '--' }}</span>
      <span class="text-14px font-400 color-[var(--el-text-color-secondary)]">{{ unit }}</span>
    </div>
    <!-- 较上月变动 -->
    <div class="m-t-8px flex items-center gap-4px">
      <span class="text-13px color-[var(--el-text-color-secondary)]">{{ changeLabel }}</span>
      <span class="text-14px font-600" :class="change <= 0 ? 'color-[#67C23A]' : 'color-[#F56C6C]'">
        {{ change > 0 ? '+' : '' }}{{ change.toFixed(2) }}{{ unit }}
      </span>
      <span class="text-12px">{{ change < 0 ? '↓' : change > 0 ? '↑' : '—' }}</span>
    </div>
    <!-- 描述 -->
    <div v-if="description" class="m-t-6px flex items-center gap-4px">
      <span class="text-13px color-[var(--el-text-color-secondary)]">{{ description }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: number | string | null
  unit?: string
  change: number
  changeLabel?: string
  icon: Component
  borderColor: string
  iconBgColor: string
  iconColor: string
  description?: string
}>()
</script>
