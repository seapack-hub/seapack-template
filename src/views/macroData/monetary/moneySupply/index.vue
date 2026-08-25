<template>
  <div class="flex flex-col gap-16px">
    <!-- KPI 卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-16px">
      <MacroKpiCard label="M0 余额" :value="latest?.m0 + '万亿'" :change="m0Change" unit="%" icon="Coin" color="#409EFF" />
      <MacroKpiCard label="M1 余额" :value="latest?.m1 + '万亿'" :change="m1Change" unit="%" icon="Money" color="#67C23A" />
      <MacroKpiCard label="M2 余额" :value="latest?.m2 + '万亿'" :change="m2Change" unit="%" icon="Wallet" color="#E6A23C" />
      <MacroKpiCard label="M1-M2 剪刀差" :value="scissors + '%'" :icon="scissorsVal >= 0 ? 'Top' : 'Bottom'" :color="scissorsVal >= 0 ? '#67C23A' : '#F56C6C'" />
    </div>

    <!-- 余额趋势图 -->
    <MacroChartCard title="M0 / M1 / M2 余额趋势（万亿元）" :options="balanceOption" />

    <!-- 增速趋势图 -->
    <MacroChartCard title="同比增速走势（%）" :options="yoyOption" />

    <!-- 历史数据表 -->
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

const { moneySupply, fetchMoneySupply } = useMacroData()
const latest = computed(() => moneySupply.value[moneySupply.value.length - 1])
const prev = computed(() => moneySupply.value[moneySupply.value.length - 2])
const m0Change = computed(() => latest.value && prev.value ? +(latest.value.m0Yoy - prev.value.m0Yoy).toFixed(1) : 0)
const m1Change = computed(() => latest.value && prev.value ? +(latest.value.m1Yoy - prev.value.m1Yoy).toFixed(1) : 0)
const m2Change = computed(() => latest.value && prev.value ? +(latest.value.m2Yoy - prev.value.m2Yoy).toFixed(1) : 0)
const scissorsVal = computed(() => latest.value ? +(latest.value.m1Yoy - latest.value.m2Yoy).toFixed(1) : 0)
const scissors = computed(() => (scissorsVal.value >= 0 ? '+' : '') + scissorsVal.value)
const tableData = computed(() => [...moneySupply.value].reverse())
const dates = computed(() => moneySupply.value.map((d) => d.date))

const columns = [
  { prop: 'date', label: '月份', width: 100 },
  { prop: 'm0', label: 'M0（万亿）', align: 'center' as const },
  { prop: 'm1', label: 'M1（万亿）', align: 'center' as const },
  { prop: 'm2', label: 'M2（万亿）', align: 'center' as const },
  { prop: 'm0Yoy', label: 'M0 同比', align: 'center' as const },
  { prop: 'm1Yoy', label: 'M1 同比', align: 'center' as const },
  { prop: 'm2Yoy', label: 'M2 同比', align: 'center' as const },
]

const balanceOption = computed<EChartsOption>(() => ({
  legend: { data: ['M0', 'M1', 'M2'], bottom: 0 },
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '万亿元' },
  series: [
    { name: 'M0', type: 'line', data: moneySupply.value.map((d) => d.m0), smooth: true, itemStyle: { color: '#409EFF' } },
    { name: 'M1', type: 'line', data: moneySupply.value.map((d) => d.m1), smooth: true, itemStyle: { color: '#67C23A' } },
    { name: 'M2', type: 'line', data: moneySupply.value.map((d) => d.m2), smooth: true, itemStyle: { color: '#E6A23C' } },
  ],
}))

const yoyOption = computed<EChartsOption>(() => ({
  legend: { data: ['M0 同比', 'M1 同比', 'M2 同比'], bottom: 0 },
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '%' },
  series: [
    { name: 'M0 同比', type: 'line', data: moneySupply.value.map((d) => d.m0Yoy), smooth: true, itemStyle: { color: '#409EFF' } },
    { name: 'M1 同比', type: 'line', data: moneySupply.value.map((d) => d.m1Yoy), smooth: true, itemStyle: { color: '#67C23A' } },
    { name: 'M2 同比', type: 'line', data: moneySupply.value.map((d) => d.m2Yoy), smooth: true, itemStyle: { color: '#E6A23C' } },
  ],
}))

onMounted(() => { fetchMoneySupply() })
</script>