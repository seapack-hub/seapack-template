<template>
  <div class="flex-none flex items-center justify-between box-border p-x-24 p-y-16 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm">
    <div class="flex items-center gap-12px">
      <div class="w-40px h-40px rounded-10px bg-[var(--el-color-primary-light-9)] flex items-center justify-center">
        <el-icon :size="22" color="var(--el-color-primary)"><TrendCharts /></el-icon>
      </div>
      <div class="flex flex-col">
        <span class="text-18px font-700 color-[var(--el-text-color-primary)] leading-24px">社会融资规模监控看板</span>
        <span class="text-12px color-[var(--el-text-color-secondary)] leading-18px">Total Social Financing Dashboard</span>
      </div>
    </div>
    <div class="flex items-center gap-8px">
      <span class="text-14px color-[var(--el-text-color-secondary)]">时间筛选：</span>
      <el-select :model-value="months" style="width: 120px" @update:model-value="$emit('update:months', $event)">
        <el-option v-for="opt in MONTHS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
      <el-button :icon="Refresh" circle @click="$emit('refresh')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh, TrendCharts } from '@element-plus/icons-vue'
import { MONTHS_OPTIONS } from '../utils/moduleOptions'

defineProps<{ months: number }>()
defineEmits<{ 'update:months': [value: number]; refresh: [] }>()
</script>
