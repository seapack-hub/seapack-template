<!--
  模型占比饼图
-->
<template>
  <div class="rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm">
    <div class="px-20px py-16px border-b border-[var(--el-border-color-lighter)]">
      <span class="text-15px font-600 color-[var(--el-text-color-primary)]">模型 Token 占比</span>
    </div>
    <div class="p-10px">
      <BaseCharts :options="chartOption" height="320px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import BaseCharts from '@/components/baseCharts/index.vue'
import { getModelColor } from '../utils/moduleOptions'

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
    textStyle: {
      fontSize: 12,
      rich: {
        dot: {
          fontSize: 10,
        },
      },
    },
    formatter: (name: string) => {
      const item = props.data.find(d => d.name === name)
      if (item) {
        return `${name}  {dot|●}  ${item.value.toLocaleString()}`
      }
      return name
    },
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
      data: props.data.map((d, index) => ({
        ...d,
        itemStyle: { color: getModelColor(d.name, index) },
      })),
    },
  ],
}))
</script>
