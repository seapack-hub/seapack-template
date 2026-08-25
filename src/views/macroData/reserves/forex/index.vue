<template>
  <div class="flex flex-col gap-16px">
    <div class="grid grid-cols-4 gap-16px">
      <MacroKpiCard label="外汇储备" :value="(latest?.forexUsd / 10000)?.toFixed(2) + '万亿美元'" :change="latest?.forexChange" unit="亿美元" icon="Wallet" color="#409EFF" />
      <MacroKpiCard label="基金组织头寸" :value="(latest?.imfUsd)?.toFixed(2) + '亿美元'" icon="OfficeBuilding" color="#67C23A" />
      <MacroKpiCard label="特别提款权" :value="(latest?.sdrUsd)?.toFixed(2) + '亿美元'" icon="Document" color="#E6A23C" />
      <MacroKpiCard label="合计" :value="(latest?.totalUsd / 10000)?.toFixed(2) + '万亿美元'" icon="Coin" color="#909399" />
    </div>

    <MacroChartCard title="外汇储备走势（亿美元）" :options="forexOption" height="380px" />

    <div class="h-full box-border p-x-15 p-y-10 flex flex-col rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
      <div class="p-b-10 border-b border-[var(--el-border-color-lighter)]">
        <span class="text-15px font-600 color-[var(--el-text-color-primary)]">历史数据</span>
      </div>
      <SpTable :columns="columns" :data="tableData" :show-empty="true" size="small" height="400px">
        <template #forexChange>
          <el-table-column label="环比变化（亿美元）" width="160" align="center" slot-name="forexChange">
            <template #default="{ row }">
              <span :class="row.forexChange >= 0 ? 'color-[#67C23A]' : 'color-[#F56C6C]'">{{ row.forexChange >= 0 ? '+' : '' }}{{ row.forexChange }}</span>
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
  { prop: 'forexUsd', label: '外汇储备（亿美元）', align: 'center' as const },
  { slotName: 'forexChange' }
]

const { officialReserves, fetchOfficialReserves } = useMacroData()
const latest = computed(() => officialReserves.value[officialReserves.value.length - 1])
const tableData = computed(() => [...officialReserves.value].reverse())
const dates = computed(() => officialReserves.value.map((d) => d.date))

const forexOption = computed<EChartsOption>(() => ({
  xAxis: { type: 'category', data: dates.value },
  yAxis: { type: 'value', name: '亿美元' },
  series: [{
    type: 'bar',
    data: officialReserves.value.map((d) => d.forexUsd),
    itemStyle: {
      color: (params: any) => {
        const v = officialReserves.value[params.dataIndex]
        return v.forexChange >= 0 ? '#67C23A' : '#F56C6C'
      },
      borderRadius: [4, 4, 0, 0],
    },
    barMaxWidth: 18,
  }],
}))

onMounted(() => { fetchOfficialReserves() })
</script>
