<template>
  <div class="flex flex-col gap-16px">
    <div class="grid grid-cols-4 gap-16px">
      <MacroKpiCard label="黄金储备（万盎司）" :value="latest?.goldOz?.toString()" icon="FirstAidKit" color="#E6A23C" />
      <MacroKpiCard label="黄金价值（亿美元）" :value="latest?.goldUsd?.toFixed(2)" icon="Coin" color="#409EFF" />
      <MacroKpiCard label="近12月增量" :value="twelveChange + '万盎司'" icon="Top" color="#67C23A" />
      <MacroKpiCard label="黄金占比" :value="goldPct + '%'" icon="PieChart" color="#9C27B0" />
    </div>

    <MacroChartCard title="黄金储备走势（万盎司）" :options="goldOption" height="380px" />

    <div class="h-full box-border p-x-15 p-y-10 flex flex-col rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
      <div class="p-b-10 border-b border-[var(--el-border-color-lighter)]">
        <span class="text-15px font-600 color-[var(--el-text-color-primary)]">历史数据</span>
      </div>
      <SpTable :columns="columns" :data="tableData" :show-empty="true" size="small" height="400px">
        <template #goldChange>
          <el-table-column label="环比变化（万盎司）" width="160" align="center" slot-name="goldChange">
            <template #default="{ row }">
              <span :class="row.goldChange >= 0 ? 'color-[#67C23A]' : 'color-[#F56C6C]'">{{ row.goldChange >= 0 ? '+' : '' }}{{ row.goldChange }}</span>
            </template>
          </el-table-column>
        </template>
      </SpTable>
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
  { prop: 'goldOz', label: '黄金储备（万盎司）', align: 'center' as const },
  { slotName: 'goldChange' }
]

const { officialReserves, fetchOfficialReserves } = useMacroData()
const latest = computed(() => officialReserves.value[officialReserves.value.length - 1])
const twelveChange = computed(() => {
  if (officialReserves.value.length < 13) return 0
  return +(latest.value!.goldOz - officialReserves.value[officialReserves.value.length - 13].goldOz).toFixed(0)
})
const goldPct = computed(() => {
  if (!latest.value || !latest.value.totalUsd) return '0'
  return ((latest.value.goldUsd / latest.value.totalUsd) * 100).toFixed(1)
})
const tableData = computed(() => [...officialReserves.value].reverse())
const dates = computed(() => officialReserves.value.map((d) => d.date))

const goldOption = computed<EChartsOption>(() => ({
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '万盎司' },
  series: [{
    type: 'line',
    data: officialReserves.value.map((d) => d.goldOz),
    smooth: true,
    itemStyle: { color: '#E6A23C' },
    areaStyle: { color: 'rgba(230,162,60,0.1)' },
    lineStyle: { width: 2 },
  }],
}))

onMounted(() => { fetchOfficialReserves() })
</script>
