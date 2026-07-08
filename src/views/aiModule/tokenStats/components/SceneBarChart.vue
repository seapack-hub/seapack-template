<!--
  场景调用柱状图
-->
<template>
  <div class="border border-[var(--el-border-color-lighter)] rounded-10px bg-white">
    <div class="px-16px py-12px border-b border-[var(--el-border-color-lighter)]">
      <span class="text-14px font-600">场景调用统计</span>
    </div>
    <div class="p-12px">
      <BaseCharts :options="chartOption" height="300px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import BaseCharts from '@/components/baseCharts/index.vue'

const props = defineProps<{
  scenes: string[]
  calls: number[]
}>()

const chartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#eee',
    textStyle: { fontSize: 12 },
  },
  grid: { top: 20, right: 20, bottom: 40, left: 80 },
  xAxis: {
    type: 'value',
    axisLabel: { fontSize: 11 },
    splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
  },
  yAxis: {
    type: 'category',
    data: props.scenes,
    axisLabel: { fontSize: 12 },
    axisTick: { show: false },
    axisLine: { show: false },
  },
  series: [
    {
      type: 'bar',
      data: props.calls,
      barWidth: 20,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#79bbff' },
          ],
        },
      },
      label: {
        show: true,
        position: 'right',
        fontSize: 12,
        color: '#606266',
      },
    },
  ],
}))
</script>
