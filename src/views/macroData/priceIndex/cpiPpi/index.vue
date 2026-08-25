<template>
  <div class="flex flex-col gap-16px">
    <div class="grid grid-cols-3 gap-16px">
      <MacroKpiCard label="CPI 同比" :value="latest?.cpi + '%'" :change="cpiChange" unit="pp" icon="DataLine" color="#E6A23C" />
      <MacroKpiCard label="PPI 同比" :value="latest?.ppi + '%'" :change="ppiChange" unit="pp" icon="DataLine" color="#F56C6C" />
      <MacroKpiCard label="CPI-PPI 剪刀差" :value="gap + '%'" icon="Histogram" color="#409EFF" />
    </div>

    <MacroChartCard title="CPI / PPI 同比走势（%）" :options="yoyOption" height="360px" />
    <MacroChartCard title="CPI / PPI 环比走势（%）" :options="momOption" />

    <div class="rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
      <div class="p-x-15 p-y-10 border-b border-[var(--el-border-color-lighter)]">
        <span class="text-15px font-600 color-[var(--el-text-color-primary)]">历史数据</span>
      </div>
      <SpTable :columns="columns" :data="tableData" :show-empty="true" size="small" height="400px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { EChartsOption } from 'echarts'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import MacroKpiCard from '@/views/macroData/components/MacroKpiCard.vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import { useMacroData } from '@/views/macroData/utils/useMacroData'

const { priceIndex, fetchPriceIndex } = useMacroData()
const latest = computed(() => priceIndex.value[priceIndex.value.length - 1])
const prev = computed(() => priceIndex.value[priceIndex.value.length - 2])
const cpiChange = computed(() => latest.value && prev.value ? +(latest.value.cpi - prev.value.cpi).toFixed(1) : 0)
const ppiChange = computed(() => latest.value && prev.value ? +(latest.value.ppi - prev.value.ppi).toFixed(1) : 0)
const gap = computed(() => latest.value ? +(latest.value.cpi - latest.value.ppi).toFixed(1) : 0)
const tableData = computed(() => [...priceIndex.value].reverse())
const dates = computed(() => priceIndex.value.map((d) => d.date))

const columns = [
  { prop: 'date', label: '月份', width: 100 },
  { prop: 'cpi', label: 'CPI 同比', align: 'center' as const },
  { prop: 'ppi', label: 'PPI 同比', align: 'center' as const },
  { prop: 'cpiMom', label: 'CPI 环比', align: 'center' as const },
  { prop: 'ppiMom', label: 'PPI 环比', align: 'center' as const },
]

const yoyOption = computed<EChartsOption>(() => ({
  legend: { data: ['CPI 同比', 'PPI 同比'], bottom: 0 },
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '%' },
  series: [
    { name: 'CPI 同比', type: 'line', data: priceIndex.value.map((d) => d.cpi), smooth: true, itemStyle: { color: '#E6A23C' }, areaStyle: { color: 'rgba(230,162,60,0.06)' } },
    { name: 'PPI 同比', type: 'line', data: priceIndex.value.map((d) => d.ppi), smooth: true, itemStyle: { color: '#F56C6C' }, areaStyle: { color: 'rgba(245,108,108,0.06)' } },
  ],
}))

const momOption = computed<EChartsOption>(() => ({
  legend: { data: ['CPI 环比', 'PPI 环比'], bottom: 0 },
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '%' },
  series: [
    { name: 'CPI 环比', type: 'bar', data: priceIndex.value.map((d) => d.cpiMom), itemStyle: { color: '#E6A23C', borderRadius: [3, 3, 0, 0] }, barMaxWidth: 14 },
    { name: 'PPI 环比', type: 'bar', data: priceIndex.value.map((d) => d.ppiMom), itemStyle: { color: '#F56C6C', borderRadius: [3, 3, 0, 0] }, barMaxWidth: 14 },
  ],
}))

onMounted(() => { fetchPriceIndex() })
</script>