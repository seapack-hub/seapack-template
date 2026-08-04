<!--
  用户 Token 消耗排行表格（SpTable 版）
  与 CostTable 保持一致高度
-->
<template>
  <div class="h-full box-border p-x-15 p-y-10 flex flex-col rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
    <div class="p-10 border-b border-[var(--el-border-color-lighter)]">
      <span class="text-15px font-600 color-[var(--el-text-color-primary)]">用户消耗排行</span>
    </div>
    <SpTable
      :columns="columns"
      :data="data"
      :show-empty="true"
      size="small"
      class="flex-1"
      height="100%"
    >
      <template #rank>
        <el-table-column label="排名" width="60" align="center" slot-name="rank">
          <template #default="{ $index }">
            <div
              class="w-22px h-22px rounded-full flex items-center justify-center text-11px font-600"
              :class="$index < 3 ? 'rank-badge' : 'rank-normal'"
            >
              {{ $index + 1 }}
            </div>
          </template>
        </el-table-column>
      </template>
      <template #tokens>
        <el-table-column label="Token (入/出)" width="130" align="center" slot-name="tokens">
          <template #default="{ row }">
            <span class="tabular-nums text-[var(--el-text-color-regular)]">
              {{ row.tokensInput?.toLocaleString() }} / {{ row.tokensOutput?.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
      </template>
      <template #cost>
        <el-table-column label="费用(元)" width="100" align="right" slot-name="cost">
          <template #default="{ row }">
            <span class="text-[var(--el-color-danger)] font-500 tabular-nums">
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
import type { TokenUserRankItem } from '@/api/ai/tokenStats'

defineProps<{
  data: TokenUserRankItem[]
}>()

const columns = [
  { slotName: 'rank', label: '排名', width: 60, align: 'center' as const },
  { prop: 'userName', label: '用户', minWidth: 100, showOverflowTooltip: true },
  { prop: 'callCount', label: '调用次数', width: 80, align: 'center' as const, formatter: (row: any) => row.callCount?.toLocaleString() ?? '--' },
  { slotName: 'tokens', label: 'Token (入/出)', width: 130, align: 'center' as const },
  { slotName: 'cost', label: '费用(元)', width: 100, align: 'right' as const },
]
</script>

<style scoped lang="scss">
.rank-badge {
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: white;
}

.rank-normal {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
