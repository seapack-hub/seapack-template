<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="search-bar h-50px flex items-center gap-10px">
        <el-input v-model="queryParams.keyword" placeholder="搜索任务标题" clearable style="width: 200px" @keyup.enter="handleQuery" />
        <el-select v-model="queryParams.taskType" placeholder="任务类型" clearable style="width: 140px">
          <el-option v-for="opt in taskTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <div class="flex-1 flex flex-col">
        <SpTable :loading="loading" :columns="columns" :data="tableData" :show-index="false">
          <template #taskType>
            <el-table-column label="任务类型" width="100" slot-name="taskType">
              <template #default="{ row }">
                <el-tag size="small" :type="taskTypeTagType(row.taskType)">{{ taskTypeLabel(row.taskType) }}</el-tag>
              </template>
            </el-table-column>
          </template>
          <template #status>
            <el-table-column label="状态" width="100" slot-name="status">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </template>
          <template #operate>
            <el-table-column label="操作" width="140" fixed="right" slot-name="operate">
              <template #default="{ row }">
                <el-button v-if="row.status === 0 || row.status === 1" type="primary" link @click="handleProcess(row as any)">处理</el-button>
                <el-button type="info" link @click="handleView(row as any)">查看</el-button>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
      </div>
    </el-card>

    <!-- 处理对话框 -->
    <TaskProcessDialog
      v-model:visible="processVisible"
      v-model:current-task="currentTask"
      @success="handleQuery"
    />
  </div>
</template>

<script setup lang="ts">
import { useHumanTask } from '../utils/useHumanTask'
import { HUMAN_TASK_COLUMNS } from '../utils/tableColumns'
import TaskProcessDialog from '../components/TaskProcessDialog.vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const {
  loading,
  tableData,
  total,
  queryParams,
  processVisible,
  currentTask,
  taskTypeOptions,
  statusOptions,
  statusLabel,
  statusTagType,
  taskTypeLabel,
  taskTypeTagType,
  handleQuery,
  handleReset,
  handleProcess,
  handleView,
  loadDictData,
} = useHumanTask()

const columns = HUMAN_TASK_COLUMNS

onMounted(() => {
  loadDictData()
  handleQuery()
})
</script>
