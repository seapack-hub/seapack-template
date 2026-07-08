<!--
  趋势折线图
  近7天/30天 Token 消耗趋势
-->
<template>
  <div class="border border-[var(--el-border-color-lighter)] rounded-10px bg-white">
    <div class="flex items-center justify-between px-16px py-12px border-b border-[var(--el-border-color-lighter)]">
      <span class="text-14px font-600">Token 消耗趋势</span>
      <el-radio-group v-model="rangeDays" size="small" @change="$emit('rangeChange', rangeDays)">
        <el-radio-button :value="7">7天</el-radio-button>
        <el-radio-button :value="30">30天</el-radio-button>
      </el-radio-group>
    </div>
    <div class="p-12px">
      <BaseCharts :options="chartOption" height="320px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import BaseCharts from '@/components/baseCharts/index.vue'

const props = defineProps<{
  data: { dates: string[]; input: number[]; output: number[]; total: number[] }
}>()

defineEmits<{ rangeChange: [days: number] }>()

const rangeDays = ref(7)

const chartOption = computed<EChartsOption>(() => {
  const d = props.data
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#eee',
      textStyle: { fontSize: 12 },
      formatter: (params: any) => {
        const lines = [`<b>${params[0].axisValue}</b>`]
        params.forEach((p: any) => {
          lines.push(`${p.marker} ${p.seriesName}: <b>${p.value.toLocaleString()}</b>`)
        })
        return lines.join('<br/>')
      },
    },
    legend: {
      data: ['输入 Token', '输出 Token'],
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    grid: { top: 20, right: 20, bottom: 40, left: 60 },
    xAxis: {
      type: 'category',
      data: d.dates,
      axisLabel: { fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v),
      },
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
    },
    series: [
      {
        name: '输入 Token',
        type: 'line',
        data: d.input,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#409EFF' },
        areaStyle: { color: 'rgba(64,158,255,0.08)' },
      },
      {
        name: '输出 Token',
        type: 'line',
        data: d.output,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#67C23A' },
        areaStyle: { color: 'rgba(103,194,58,0.08)' },
      },
    ],
  }
})
</script>
