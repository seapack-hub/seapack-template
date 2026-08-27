<template>
  <div
    class="box-border p-x-24 p-y-20 rounded-12px bg-white shadow-sm hover:shadow-md transition-shadow"
    :style="{ borderTop: `3px solid ${iconColor}` }"
  >
    <!-- 标题行 -->
    <div class="flex items-center gap-10px">
      <div class="w-36px h-36px rounded-10px flex items-center justify-center" :style="{ backgroundColor: iconBgColor }">
        <el-icon :size="20" :color="iconColor"><component :is="icon" /></el-icon>
      </div>
      <span class="text-16px font-700 color-[var(--el-text-color-primary)]">{{ label }}</span>
      <el-tag v-if="tag" size="small" type="info" effect="plain" class="m-l-4px">{{ tag }}</el-tag>
    </div>

    <!-- 余额 -->
    <div class="m-t-18px flex items-baseline gap-4px">
      <span class="text-14px font-400 color-[var(--el-text-color-secondary)]">余额</span>
      <span class="text-28px font-800" :style="{ color: iconColor }">{{ balance ?? '--' }}</span>
      <span class="text-14px font-400 color-[var(--el-text-color-secondary)]">万亿</span>
    </div>

    <!-- 同比 -->
    <div class="m-t-12px flex items-center gap-8px">
      <span class="text-14px font-400 color-[var(--el-text-color-secondary)]">同比</span>
      <span class="text-18px font-700" :class="yoy < 0 ? 'color-[#67C23A]' : 'color-[#F56C6C]'">
        {{ yoy >= 0 ? '+' : '' }}{{ yoy }}%
      </span>
      <span class="inline-block w-8px h-8px rounded-full" :class="yoy < 0 ? 'bg-[#67C23A]' : 'bg-[#F56C6C]'" />
    </div>

    <!-- 趋势 -->
    <div class="m-t-10px flex items-center gap-6px">
      <span class="text-14px font-400 color-[var(--el-text-color-secondary)]">趋势</span>
      <span
        class="inline-block px-8px py-2px rounded-4px text-13px font-500"
        :style="{ backgroundColor: iconBgColor, color: iconColor }"
      >{{ trend }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  balance: number | string | null
  yoy: number
  trend: string
  icon: Component
  iconBgColor: string
  iconColor: string
  tag?: string
}>()
</script>
