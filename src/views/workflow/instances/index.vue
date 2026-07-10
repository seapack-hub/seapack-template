<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar h-[50px]">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="工作流名称">
            <el-input v-model="queryParams.keyword" placeholder="搜索工作流名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="工作流">
            <el-select v-model="queryParams.workflowId" placeholder="全部" clearable filterable style="width: 200px">
              <el-option v-for="wf in workflowList" :key="wf.id" :label="wf.name" :value="wf.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
              <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格 -->
      <div class="flex-1 flex flex-col">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="false">
          <template #status>
            <el-table-column label="状态" width="90" slot-name="status">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </template>
          <template #triggerType>
            <el-table-column label="触发方式" width="90" slot-name="triggerType">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ triggerLabel(row.triggerType) }}</el-tag>
              </template>
            </el-table-column>
          </template>
          <template #progress>
            <el-table-column label="进度" width="150" slot-name="progress">
              <template #default="{ row }">
                <el-progress v-if="row.status === 1" :percentage="getProgress(row as any)" :stroke-width="6" />
                <span v-else class="text-12px text-gray-400">{{ row.completedCount || 0 }}/{{ row.totalNodes || 0 }}</span>
              </template>
            </el-table-column>
          </template>
          <template #duration>
            <el-table-column label="耗时" width="100" slot-name="duration">
              <template #default="{ row }">
                <span class="text-12px">{{ formatDuration(row.durationMs) }}</span>
              </template>
            </el-table-column>
          </template>
          <template #operate>
            <el-table-column label="操作" width="180" fixed="right" slot-name="operate">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleDetail(row as any)">详情</el-button>
                <el-button v-if="row.status === 1" type="warning" link @click="handlePause(row as any)">暂停</el-button>
                <el-button v-if="row.status === 4" type="success" link @click="handleResume(row as any)">恢复</el-button>
                <el-button v-if="row.status === 0 || row.status === 1" type="danger" link @click="handleCancel(row as any)">取消</el-button>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useWorkflowInstance } from '../utils/useWorkflowInstance'
import { INSTANCE_LIST_COLUMNS } from '../utils/tableColumns'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const {
  loading,
  tableData,
  total,
  workflowList,
  queryParams,
  statusOptions,
  statusLabel,
  statusTagType,
  triggerLabel,
  getProgress,
  formatDuration,
  handleQuery,
  handleReset,
  handleDetail,
  handlePause,
  handleResume,
  handleCancel,
  loadWorkflows,
  loadDictData,
} = useWorkflowInstance()

const columns = INSTANCE_LIST_COLUMNS

onMounted(() => {
  loadDictData()
  loadWorkflows()
  handleQuery()
})
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
