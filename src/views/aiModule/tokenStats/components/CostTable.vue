<!--
  费用汇总表格（SpTable 版）
  与 UserRankingTable 保持一致高度
-->
<template>
  <div class="h-full box-border p-x-15 p-y-10 flex flex-col rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
    <div class="p-10 border-b border-[var(--el-border-color-lighter)]">
      <span class="text-15px font-600 color-[var(--el-text-color-primary)]">费用汇总</span>
    </div>
    <SpTable
      :columns="columns"
      :data="data"
      :show-empty="true"
      size="small"
      class="flex-1"
      height="100%"
      :show-summary="true"
      :summary-method="getSummary"
    >
      <template #cost>
        <el-table-column label="费用（元）" width="100" align="right" fixed="right" slot-name="cost">
          <template #default="{ row }">
            <span class="font-600 color-[var(--el-color-danger)] tabular-nums">
              ¥{{ Number(row.totalCostYuan || 0).toFixed(4) }}
            </span>
          </template>
        </el-table-column>
      </template>
    </SpTable>
  </div>
</template>

<script setup lang="ts">
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import type { TokenCostSummaryItem } from '@/api/ai/tokenStats'

defineProps<{ data: TokenCostSummaryItem[] }>()

const columns = [
  { prop: 'modelName', label: '模型', width: 120, showOverflowTooltip: true },
  { prop: 'callCount', label: '调用次数', width: 80, align: 'center' as const },
  { prop: 'tokensInput', label: '输入 Token', width: 100, align: 'right' as const, formatter: (row: any) => row.tokensInput?.toLocaleString() ?? '--' },
  { prop: 'tokensOutput', label: '输出 Token', width: 100, align: 'right' as const, formatter: (row: any) => row.tokensOutput?.toLocaleString() ?? '--' },
  { prop: 'tokensTotal', label: '总 Token', width: 100, align: 'right' as const, formatter: (row: any) => row.tokensTotal?.toLocaleString() ?? '--' },
  { prop: 'avgDurationMs', label: '平均耗时', width: 80, align: 'center' as const, formatter: (row: any) => row.avgDurationMs != null ? `${row.avgDurationMs}ms` : '--' },
  { slotName: 'cost', label: '费用（元）', width: 100, align: 'right' as const, fixed: 'right' as const },
]

function getSummary({ columns: cols, data }: any) {
  const sums: string[] = []
  cols.forEach((_: any, index: number) => {
    if (index === 0) { sums[index] = '合计'; return }
    const prop = cols[index]?.property
    if (!prop) { sums[index] = ''; return }
    const values = data.map((item: any) => Number(item[prop]) || 0)
    const sum = values.reduce((a: number, b: number) => a + b, 0)
    if (prop === 'totalCostYuan') {
      sums[index] = `¥${sum.toFixed(4)}`
    } else if (prop === 'avgDurationMs') {
      sums[index] = data.length > 0 ? `${Math.round(sum / data.length)}ms` : '--'
    } else {
      sums[index] = sum.toLocaleString()
    }
  })
  return sums
}
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
