<template>
  <div class="flex flex-col gap-16px">
    <div class="grid grid-cols-3 gap-16px">
      <MacroKpiCard label="最新存量" :value="latest?.stockAmount + '万亿'" :change="stockChange" unit="%" icon="Coin" color="#409EFF" />
      <MacroKpiCard label="当月新增" :value="latest?.newAmount + '万亿'" icon="Plus" color="#67C23A" />
      <MacroKpiCard label="存量同比增速" :value="latest?.yoyGrowth + '%'" icon="TrendCharts" color="#E6A23C" />
    </div>

    <MacroChartCard title="社融存量与当月新增" :options="mainOption" height="360px" />

    <div class="box-border p-x-15 p-y-10 flex flex-col rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
      <div class="p-10 border-b border-[var(--el-border-color-lighter)]">
        <span class="text-15px font-600 color-[var(--el-text-color-primary)]">历史数据</span>
      </div>
      <SpTable :columns="columns" :data="tableData" :show-empty="true" size="small" max-height="400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { EChartsOption } from 'echarts'
import MacroKpiCard from '@/views/macroData/components/MacroKpiCard.vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import { useMacroData } from '@/views/macroData/utils/useMacroData'

const { socialFinance, fetchSocialFinance } = useMacroData()
const latest = computed(() => socialFinance.value[socialFinance.value.length - 1])
const prev = computed(() => socialFinance.value[socialFinance.value.length - 2])
const stockChange = computed(() => latest.value && prev.value ? +(latest.value.yoyGrowth - prev.value.yoyGrowth).toFixed(1) : 0)
const tableData = computed(() => [...socialFinance.value].reverse())
const dates = computed(() => socialFinance.value.map((d) => d.date))

const columns = [
  { prop: 'date', label: '月份', width: 100 },
  { prop: 'stockAmount', label: '存量（万亿元）', align: 'center' as const },
  { prop: 'newAmount', label: '当月新增（万亿元）', align: 'center' as const },
  { prop: 'yoyGrowth', label: '同比增速（%）', align: 'center' as const },
]

const mainOption = computed<EChartsOption>(() => ({
  legend: { data: ['当月新增', '存量同比'], bottom: 0 },
  xAxis: { type: 'category', data: dates.value },
  yAxis: [
    { type: 'value', name: '万亿元', position: 'left' },
    { type: 'value', name: '%', position: 'right' },
  ],
  series: [
    { name: '当月新增', type: 'bar', data: socialFinance.value.map((d) => d.newAmount), itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 20 },
    { name: '存量同比', type: 'line', yAxisIndex: 1, data: socialFinance.value.map((d) => d.yoyGrowth), smooth: true, itemStyle: { color: '#F56C6C' } },
  ],
}))

onMounted(() => { fetchSocialFinance() })
</script>