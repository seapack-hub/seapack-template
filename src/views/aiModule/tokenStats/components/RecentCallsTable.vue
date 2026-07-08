<!--
  最近调用记录表格
-->
<template>
  <div class="border border-[var(--el-border-color-lighter)] rounded-10px bg-white overflow-hidden">
    <div class="px-16px py-12px border-b border-[var(--el-border-color-lighter)]">
      <span class="text-14px font-600">最近调用记录</span>
    </div>
    <el-table :data="calls" size="small" max-height="360" stripe>
      <el-table-column prop="callTime" label="时间" width="170" />
      <el-table-column prop="moduleKey" label="模块" width="110" />
      <el-table-column prop="modelName" label="模型" width="120" />
      <el-table-column label="Token (入/出)" width="140" align="center">
        <template #default="{ row }">
          <span class="text-12px">{{ row.tokensInput }} / {{ row.tokensOutput }}</span>
        </template>
      </el-table-column>
      <el-table-column label="耗时" width="80" align="center">
        <template #default="{ row }">
          <span class="text-12px">{{ row.durationMs }}ms</span>
        </template>
      </el-table-column>
      <el-table-column label="费用" width="80" align="right">
        <template #default="{ row }">
          <span class="text-12px font-600 color-[var(--el-color-primary)]">¥{{ row.costYuan }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
            {{ row.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { TokenUsageLog } from '../utils/useTokenStats'

defineProps<{ calls: TokenUsageLog[] }>()
</script>
