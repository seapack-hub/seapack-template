<template>
  <div class="flex flex-col gap-16px">
    <el-alert title="新开户数是散户情绪的反向指标：开户暴增常接近阶段性顶部，开户低迷常接近底部" type="warning" :closable="false" show-icon />

    <div class="grid grid-cols-2 gap-16px">
      <MacroKpiCard label="最新月新增" :value="latest?.newInvestors + '万'" icon="User" color="#9C27B0" />
      <MacroKpiCard label="累计投资者" :value="latest?.totalInvestors + '万'" icon="UserFilled" color="#409EFF" />
    </div>

    <MacroChartCard title="月度新增投资者（万人）" :options="barOption" height="360px" />
    <MacroChartCard title="累计投资者（万人）" :options="lineOption" />

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
  { prop: 'newInvestors', label: '新增投资者（万人）', align: 'center' as const },
  { prop: 'totalInvestors', label: '累计投资者（万人）', align: 'center' as const }
]

const { accountOpenings, fetchAccountOpenings } = useMacroData()
const latest = computed(() => accountOpenings.value[accountOpenings.value.length - 1])
const tableData = computed(() => [...accountOpenings.value].reverse())
const dates = computed(() => accountOpenings.value.map((d) => d.date))

const barOption = computed<EChartsOption>(() => ({
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '万人' },
  series: [{
    type: 'bar',
    data: accountOpenings.value.map((d) => d.newInvestors),
    itemStyle: { color: '#9C27B0', borderRadius: [4, 4, 0, 0] },
    barMaxWidth: 18,
  }],
}))

const lineOption = computed<EChartsOption>(() => ({
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '万人' },
  series: [{
    type: 'line',
    data: accountOpenings.value.map((d) => d.totalInvestors),
    smooth: true,
    itemStyle: { color: '#409EFF' },
    areaStyle: { color: 'rgba(64,158,255,0.08)' },
  }],
}))

onMounted(() => { fetchAccountOpenings() })
</script>