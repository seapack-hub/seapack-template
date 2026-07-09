<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar h-[50px]">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="工作流名称">
            <el-input v-model="queryParams.keyword" placeholder="名称/编码模糊搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="h-[40px] flex justify-between items-center">
        <el-button type="success" icon="plus" @click="openAddDialog">新建工作流</el-button>
        <el-radio-group v-model="viewMode">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 卡片模式 -->
      <Transition name="view-fade" mode="out-in">
        <div v-if="viewMode === 'card'" key="card" class="card-grid p-10 flex-1 overflow-y-auto">
          <div v-if="tableData.length === 0 && !loading" class="col-span-full">
            <el-empty description="暂无工作流" />
          </div>
          <div
            v-for="item in tableData"
            :key="item.id"
            class="workflow-card"
            @click="handleEdit(item)"
          >
            <div class="card-header flex items-center justify-between">
              <el-tag :type="item.status === 1 ? 'success' : 'info'" size="small">
                {{ item.status === 1 ? '启用' : '禁用' }}
              </el-tag>
              <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, item)">
                <el-icon class="cursor-pointer"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="copy">复制</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="card-title mt-10px mb-5px">{{ item.name }}</div>
            <div class="card-desc text-12px color-[var(--el-text-color-secondary)]">{{ item.description || '暂无描述' }}</div>
            <div class="card-footer mt-10px flex items-center justify-between text-12px color-[var(--el-text-color-secondary)]">
              <span>v{{ item.version || 1 }}</span>
              <span>{{ item.createdAt }}</span>
            </div>
          </div>
        </div>

        <!-- 列表模式 -->
        <div v-else key="list" class="flex-1 flex flex-col">
          <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="false">
            <template #status>
              <el-table-column label="状态" width="80" slot-name="status">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                    {{ row.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
            </template>
            <template #operate>
              <el-table-column label="操作" width="180" fixed="right" slot-name="operate">
                <template #default="{ row }">
                  <el-button type="primary" link @click.stop="handleEdit(row as any)">编辑</el-button>
                  <el-button type="primary" link @click.stop="handleCopy(row as any)">复制</el-button>
                  <el-button type="danger" link @click.stop="handleDelete(row as any)">删除</el-button>
                </template>
              </el-table-column>
            </template>
          </SpTable>
          <div class="h-[40px] mt-10px">
            <Pagination
              v-model:total="total"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              @pagination="handleQuery"
            />
          </div>
        </div>
      </Transition>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <WorkflowFormDialog
      v-model:visible="formVisible"
      v-model:is-edit="formIsEdit"
      v-model:form="formData"
      @confirm="onFormConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { MoreFilled, Grid, List } from '@element-plus/icons-vue'
import { useWorkflow } from './utils/useWorkflow'
import { WORKFLOW_LIST_COLUMNS } from './utils/tableColumns'
import WorkflowFormDialog from './components/WorkflowFormDialog.vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const {
  queryParams,
  tableData,
  total,
  loading,
  handleQuery,
  handleReset,
  formVisible,
  formIsEdit,
  formData,
  openAddDialog,
  onFormConfirm,
  handleEdit,
  handleCopy,
  handleDelete,
  handleCommand,
} = useWorkflow()

const viewMode = ref<'card' | 'list'>('card')

const columns = [
  ...WORKFLOW_LIST_COLUMNS,
  { label: '状态', slotName: 'status', width: 80 },
  { label: '操作', slotName: 'operate', width: 180, fixed: 'right' },
]

onMounted(() => {
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-content: start;
  gap: 16px;
  padding: 8px 0;
  border: 1px solid var(--el-border-color-lighter);
}

.col-span-full {
  grid-column: 1 / -1;
}

.workflow-card {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.view-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
