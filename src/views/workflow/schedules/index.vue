<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="search-bar h-50px flex items-center gap-10px">
        <el-input v-model="queryParams.keyword" placeholder="搜索调度名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <div class="h-40px flex justify-between items-center">
        <el-button type="primary" @click="openAddDialog"><el-icon><Plus /></el-icon>新建调度</el-button>
      </div>

      <div class="flex-1 flex flex-col">
        <SpTable :loading="loading" :columns="columns" :data="tableData" :show-index="false">
          <template #status>
            <el-table-column label="状态" width="80" slot-name="status">
              <template #default="{ row }">
                <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row as any)" />
              </template>
            </el-table-column>
          </template>
          <template #scheduleType>
            <el-table-column label="类型" width="100" slot-name="scheduleType">
              <template #default="{ row }">
                <el-tag size="small">{{ scheduleTypeLabel(row.scheduleType) }}</el-tag>
              </template>
            </el-table-column>
          </template>
          <template #operate>
            <el-table-column label="操作" width="180" fixed="right" slot-name="operate">
              <template #default="{ row }">
                <el-button type="primary" link @click="openEditDialog(row as any)">编辑</el-button>
                <el-button type="success" link @click="handleTrigger(row as any)">立即执行</el-button>
                <el-button type="danger" link @click="handleDelete(row as any)">删除</el-button>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
      </div>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <ScheduleFormDialog
      v-model:visible="formVisible"
      v-model:is-edit="formIsEdit"
      v-model:form="formData"
      :workflow-list="workflowList"
      @confirm="onFormConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useWorkflowSchedule } from '../utils/useWorkflowSchedule'
import { SCHEDULE_COLUMNS } from '../utils/tableColumns'
import ScheduleFormDialog from '../components/ScheduleFormDialog.vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const {
  loading,
  tableData,
  total,
  queryParams,
  formVisible,
  formIsEdit,
  formData,
  workflowList,
  scheduleTypeLabel,
  handleQuery,
  handleReset,
  openAddDialog,
  openEditDialog,
  onFormConfirm,
  handleDelete,
  handleStatusChange,
  handleTrigger,
  loadWorkflows,
} = useWorkflowSchedule()

const columns = SCHEDULE_COLUMNS

onMounted(() => {
  loadWorkflows()
  handleQuery()
})
</script>
