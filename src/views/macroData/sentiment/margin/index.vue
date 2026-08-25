<template>
  <div class="flex flex-col gap-16px">
    <div class="grid grid-cols-3 gap-16px">
      <MacroKpiCard label="融资余额" :value="latest?.marginBuy + '亿'" icon="Coin" color="#409EFF" />
      <MacroKpiCard label="融券余额" :value="latest?.shortSell + '亿'" icon="Switch" color="#F56C6C" />
      <MacroKpiCard label="两融合计" :value="latest?.total + '亿'" icon="Wallet" color="#67C23A" />
    </div>

    <MacroChartCard title="两融余额走势（亿元）" :options="marginOption" height="380px" />

    <div class="h-full box-border p-x-15 p-y-10 flex flex-col rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
      <div class="p-b-10 border-b border-[var(--el-border-color-lighter)]">
        <span class="text-15px font-600 color-[var(--el-text-color-primary)]">历史数据</span>
      </div>
      <SpTable :columns="columns" :data="tableData" :show-empty="true" size="small" height="400px" />
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

const columns = [
  { prop: 'date', label: '月份', width: '100' },
  { prop: 'marginBuy', label: '融资余额（亿元）', align: 'center' as const },
  { prop: 'shortSell', label: '融券余额（亿元）', align: 'center' as const },
  { prop: 'total', label: '两融合计（亿元）', align: 'center' as const }
]

const { marginTrading, fetchMarginTrading } = useMacroData()
const latest = computed(() => marginTrading.value[marginTrading.value.length - 1])
const tableData = computed(() => [...marginTrading.value].reverse())
const dates = computed(() => marginTrading.value.map((d) => d.date))

const marginOption = computed<EChartsOption>(() => ({
  legend: { data: ['融资余额', '融券余额'], bottom: 0 },
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '亿元' },
  series: [
    { name: '融资余额', type: 'bar', stack: 'total', data: marginTrading.value.map((d) => d.marginBuy), itemStyle: { color: '#409EFF' }, barMaxWidth: 20 },
    { name: '融券余额', type: 'bar', stack: 'total', data: marginTrading.value.map((d) => d.shortSell), itemStyle: { color: '#F56C6C', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 20 },
  ],
}))

onMounted(() => { fetchMarginTrading() })
</script>