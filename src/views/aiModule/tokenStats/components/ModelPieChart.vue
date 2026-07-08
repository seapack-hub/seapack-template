<!--
  模型占比饼图
-->
<template>
  <div class="border border-[var(--el-border-color-lighter)] rounded-10px bg-white">
    <div class="px-16px py-12px border-b border-[var(--el-border-color-lighter)]">
      <span class="text-14px font-600">模型 Token 占比</span>
    </div>
    <div class="p-12px">
      <BaseCharts :options="chartOption" height="300px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import BaseCharts from '@/components/baseCharts/index.vue'
import { MODEL_COLOR_MAP } from '../utils/moduleOptions'

const props = defineProps<{
  data: { name: string; value: number }[]
}>()

const chartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#eee',
    textStyle: { fontSize: 12 },
    formatter: (p: any) => `${p.marker} ${p.name}<br/>Token: <b>${p.value.toLocaleString()}</b> (${p.percent}%)`,
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { fontSize: 12 },
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
      },
      data: props.data.map(d => ({
        ...d,
        itemStyle: { color: MODEL_COLOR_MAP[d.name] || '#409EFF' },
      })),
    },
  ],
}))
</script>
