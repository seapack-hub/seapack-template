<!--
  Agent 管理主页面
  卡片 + 列表双模式切换
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="h-[50px]">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="agent名称">
            <el-input v-model="queryParams.keyword" placeholder="名称/编码模糊搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 200px">
              <el-option v-for="opt in AGENT_STATUS_OPTIONS" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
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
        <el-button type="success" icon="plus" @click="openAddDialog()">新增 Agent</el-button>
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
        <div v-if="viewMode === 'card'" key="card" class="card-grid">
          <div v-if="tableData.length === 0 && !loading" class="col-span-full">
            <el-empty description="暂无 Agent" />
          </div>
          <div v-for="row in tableData" :key="row.id" class="agent-card">
            <div class="flex items-center gap-10px">
              <div class="card-avatar">{{ row.avatar || row.name?.charAt(0) || 'A' }}</div>
              <div class="flex-1 min-w-0">
                <div class="text-14px font-600 color-[var(--el-text-color-primary)] overflow-hidden text-ellipsis whitespace-nowrap">{{ row.name }}</div>
                <div class="text-12px text-[var(--el-text-color-secondary)] overflow-hidden text-ellipsis whitespace-nowrap">{{ row.code }}</div>
              </div>
              <el-switch
                :model-value="row.status"
                :active-value="1"
                :inactive-value="0"
                size="small"
                @change="(val) => onStatusChange(row, val as any)"
              />
            </div>
            <div class="text-12px text-[var(--el-text-color-secondary)] leading-1.5 line-clamp-2">{{ row.description || '暂无描述' }}</div>
            <div class="flex items-center gap-8px">
              <el-tag size="small" type="info">{{ row.modelCode }}</el-tag>
              <span class="text-12px text-[var(--el-text-color-secondary)]">v{{ row.version }}</span>
              <span class="text-12px text-[var(--el-text-color-secondary)]">使用 {{ row.useCount || 0 }} 次</span>
            </div>
            <div class="flex gap-4px border-t border-[var(--el-border-color-extra-light)] pt-10px">
              <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="primary" size="small" @click="openConfigDrawer(row)">配置</el-button>
              <el-button link type="primary" size="small" @click="openTestDrawer(row)">测试</el-button>
              <el-button link type="primary" size="small" @click="handleCopy(row)">复制</el-button>
              <el-button link type="danger" size="small" @click="handleCardDelete(row)">删除</el-button>
            </div>
          </div>
        </div>

        <!-- 列表模式 -->
        <div v-else key="list" class="flex-1 flex flex-col justify-between overflow-hidden border">
          <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="true">
            <template #status>
              <el-table-column label="状态" prop="status" width="80" align="center" slot-name="status">
                <template #default="{ row }">
                  <el-switch
                    :model-value="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    size="small"
                    @change="(val) => onStatusChange(row as any, val as any)"
                  />
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

    <!-- 新增/编辑弹窗 -->
    <AgentFormDialog
      v-model:visible="formVisible"
      v-model:is-edit="formIsEdit"
      v-model:form="formData"
      @confirm="onFormConfirm"
    />

    <!-- 配置抽屉 -->
    <AgentConfigDrawer
      v-model:visible="configDrawerVisible"
      :agent-id="currentAgentId"
      :agent-name="currentAgentName"
    />

    <!-- 测试抽屉 -->
    <AgentTestDrawer
      v-model:visible="testDrawerVisible"
      :agent-id="currentAgentId"
      :agent-name="currentAgentName"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { type Agent } from '@/api/ai/agent'
import { AGENT_STATUS_OPTIONS } from './utils/moduleOptions'
import { AGENT_LIST_COLUMNS } from './utils/tableColumns'
import { useAgent } from './utils/useAgent'
import AgentFormDialog from './components/AgentFormDialog.vue'
import AgentConfigDrawer from './components/AgentConfigDrawer.vue'
import AgentTestDrawer from './components/AgentTestDrawer.vue'

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
  openEditDialog, 
  onFormConfirm,
  handleDelete, 
  handleCopy, 
  onStatusChange,
  configDrawerVisible, currentAgentId, currentAgentName, openConfigDrawer,
  testDrawerVisible, openTestDrawer,
} = useAgent()

const viewMode = ref<'card' | 'list'>('card')

const columns = [
  ...AGENT_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: '170px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openEditDialog(row) },
      { type: 'primary', label: '配置', size: 'small', renderType: 'link', click: ({ row }: any) => openConfigDrawer(row) },
      { type: 'primary', label: '测试', size: 'small', renderType: 'link', click: ({ row }: any) => openTestDrawer(row) },
      { type: 'primary', label: '复制', size: 'small', renderType: 'link', click: ({ row }: any) => handleCopy(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该 Agent 吗？' }, click: ({ row }: any) => handleDelete(row) },
    ],
  },
]

onMounted(() => {
  handleQuery()
})

async function handleCardDelete(row: Agent) {
  await ElMessageBox.confirm(`确认删除 Agent【${row.name}】？`, '提示', { type: 'warning' })
  await handleDelete(row)
}
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  align-content: start;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
  padding: 1px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color-lighter);
}

.col-span-full {
  grid-column: 1 / -1;
}

.agent-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
}

.card-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--el-color-primary-light-3), var(--el-color-primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

/* 视图切换过渡 */
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
