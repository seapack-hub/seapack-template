<template>
  <div class="flex flex-col gap-16px">
    <div class="grid grid-cols-3 gap-16px">
      <MacroKpiCard label="制造业 PMI" :value="String(latest?.manufacturing)" :change="mfgChange" unit="" icon="TrendCharts" :color="latest?.manufacturing >= 50 ? '#67C23A' : '#F56C6C'" />
      <MacroKpiCard label="非制造业 PMI" :value="String(latest?.nonManufacturing)" :change="nonMfgChange" unit="" icon="TrendCharts" color="#409EFF" />
      <MacroKpiCard label="综合 PMI" :value="String(latest?.composite)" icon="DataLine" color="#E6A23C" />
    </div>

    <MacroChartCard title="PMI 走势 — 荣枯线对比" :options="pmiOption" height="360px" />

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
const { pmi, fetchPmi } = useMacroData()
const latest = computed(() => pmi.value[pmi.value.length - 1])
const prev = computed(() => pmi.value[pmi.value.length - 2])
const mfgChange = computed(() => latest.value && prev.value ? +(latest.value.manufacturing - prev.value.manufacturing).toFixed(1) : 0)
const nonMfgChange = computed(() => latest.value && prev.value ? +(latest.value.nonManufacturing - prev.value.nonManufacturing).toFixed(1) : 0)
const tableData = computed(() => [...pmi.value].reverse())
const dates = computed(() => pmi.value.map((d) => d.date))

const columns = [
  { prop: 'date', label: '月份', width: 100 },
  { prop: 'manufacturing', label: '制造业', align: 'center' as const },
  { prop: 'nonManufacturing', label: '非制造业', align: 'center' as const },
  { prop: 'composite', label: '综合', align: 'center' as const },
]

const pmiOption = computed<EChartsOption>(() => ({
  legend: { data: ['制造业', '非制造业', '综合'], bottom: 0 },
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', min: 45, max: 58 },
  series: [
    {
      name: '制造业',
      type: 'line',
      data: pmi.value.map((d) => d.manufacturing),
      smooth: true,
      itemStyle: { color: '#409EFF' },
      markLine: { silent: true, data: [{ yAxis: 50, label: { formatter: '荣枯线', fontSize: 11 }, lineStyle: { type: 'dashed', color: '#F56C6C' } }] },
    },
    { name: '非制造业', type: 'line', data: pmi.value.map((d) => d.nonManufacturing), smooth: true, itemStyle: { color: '#67C23A' } },
    { name: '综合', type: 'line', data: pmi.value.map((d) => d.composite), smooth: true, lineStyle: { type: 'dashed' }, itemStyle: { color: '#E6A23C' } },
  ],
}))

onMounted(() => { fetchPmi() })
</script>