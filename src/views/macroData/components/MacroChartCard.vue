<template>
  <div class="h-full box-border p-x-15 p-y-10 flex flex-col rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
    <div class="flex items-center justify-between p-b-10 border-b border-[var(--el-border-color-lighter)]">
      <span class="text-15px font-600 color-[var(--el-text-color-primary)]">{{ title }}</span>
      <slot name="extra" />
    </div>
    <BaseCharts :options="mergedOptions" :height="height" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsOption } from 'echarts'
import BaseCharts from '@/components/baseCharts/index.vue'

const props = withDefaults(
  defineProps<{
    title: string
    options: EChartsOption
    height?: string
  }>(),
  { height: '320px' },
)

const mergedOptions = computed<EChartsOption>(() => {
  const base: EChartsOption = {
    grid: { 
      left: 50, 
      right: 24, 
      top: 60, 
      bottom: 30, 
      containLabel: false 
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#ebeef5',
      textStyle: { color: '#303133', fontSize: 13 },
      axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
    },
  }
  return { ...base, ...props.options }
})
</script>
