<!--
  费用汇总表格
-->
<template>
  <div class="border border-[var(--el-border-color-lighter)] rounded-10px bg-white overflow-hidden">
    <div class="px-16px py-12px border-b border-[var(--el-border-color-lighter)]">
      <span class="text-14px font-600">费用汇总（近30天）</span>
    </div>
    <el-table :data="data" size="small" show-summary :summary-method="getSummary">
      <el-table-column prop="modelName" label="模型" width="130" />
      <el-table-column label="调用次数" width="90" align="center">
        <template #default="{ row }">{{ row.callCount }}</template>
      </el-table-column>
      <el-table-column label="输入 Token" width="110" align="right">
        <template #default="{ row }">{{ row.tokensInput.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="输出 Token" width="110" align="right">
        <template #default="{ row }">{{ row.tokensOutput.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="总 Token" width="110" align="right">
        <template #default="{ row }">{{ row.tokensTotal.toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="平均耗时" width="90" align="center">
        <template #default="{ row }">{{ row.avgDurationMs }}ms</template>
      </el-table-column>
      <el-table-column label="费用（元）" width="100" align="right" fixed="right">
        <template #default="{ row }">
          <span class="font-600 color-[var(--el-color-danger)]">¥{{ row.totalCostYuan.toFixed(4) }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { CostSummary } from '../utils/useTokenStats'

defineProps<{ data: CostSummary[] }>()

function getSummary({ columns, data }: any) {
  const sums: string[] = []
  columns.forEach((_: any, index: number) => {
    if (index === 0) { sums[index] = '合计'; return }
    const prop = columns[index]?.property
    if (!prop) { sums[index] = ''; return }
    const values = data.map((item: any) => Number(item[prop]) || 0)
    const sum = values.reduce((a: number, b: number) => a + b, 0)
    if (prop === 'totalCostYuan') {
      sums[index] = `¥${sum.toFixed(4)}`
    } else if (prop === 'avgDurationMs') {
      sums[index] = `${Math.round(sum / data.length)}ms`
    } else {
      sums[index] = sum.toLocaleString()
    }
  })
  return sums
}
</script>
