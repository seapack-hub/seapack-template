<template>
  <div class="flex flex-col gap-16px">
    <div class="grid grid-cols-3 gap-16px">
      <MacroKpiCard label="1年期 LPR" :value="latest?.lpr1y + '%'" icon="Histogram" color="#409EFF" />
      <MacroKpiCard label="5年期 LPR" :value="latest?.lpr5y + '%'" icon="Histogram" color="#F56C6C" />
      <MacroKpiCard label="利差" :value="spread + '%'" icon="DataLine" color="#E6A23C" />
    </div>

    <MacroChartCard title="LPR 利率走势（%）" :options="lprOption" />

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

const { lpr, fetchLpr } = useMacroData()
const latest = computed(() => lpr.value[lpr.value.length - 1])
const spread = computed(() => latest.value ? +(latest.value.lpr5y - latest.value.lpr1y).toFixed(2).toString() : '-')
const tableData = computed(() => [...lpr.value].reverse())
const dates = computed(() => lpr.value.map((d) => d.date))

const columns = [
  { prop: 'date', label: '月份', width: 100 },
  { prop: 'lpr1y', label: '1年期 LPR（%）', align: 'center' as const },
  { prop: 'lpr5y', label: '5年期 LPR（%）', align: 'center' as const },
]

const lprOption = computed<EChartsOption>(() => ({
  legend: { data: ['1年期 LPR', '5年期 LPR'], bottom: 0 },
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '%', min: 3.0, max: 4.5 },
  series: [
    { name: '1年期 LPR', type: 'line', data: lpr.value.map((d) => d.lpr1y), step: 'end', itemStyle: { color: '#409EFF' }, lineStyle: { width: 2 } },
    { name: '5年期 LPR', type: 'line', data: lpr.value.map((d) => d.lpr5y), step: 'end', itemStyle: { color: '#F56C6C' }, lineStyle: { width: 2 } },
  ],
}))

onMounted(() => { fetchLpr() })
</script>