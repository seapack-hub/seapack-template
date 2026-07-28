<!--
  AI 助手位置管理主页面
  搜索栏 + 工具栏 + 卡片/列表双模式 + 分页 + 弹窗
  参考 promptTemplate/index.vue 的结构
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams" @submit.prevent="handleQuery">
          <el-form-item label="模块">
            <el-select v-model="queryParams.moduleKey" placeholder="全部模块" clearable style="width: 180px">
              <el-option v-for="m in moduleOptions" :key="m.moduleKey" :label="`${m.label}（${m.moduleKey}）`" :value="m.moduleKey" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="queryParams.keyword" placeholder="位置名称/编码搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
              <el-option v-for="opt in STATUS_OPTIONS" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="success" icon="plus" @click="openAddDialog()">新增位置</el-button>
        <el-radio-group v-model="viewMode" class="view-switcher">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 卡片 + 列表 模式切换 -->
      <Transition name="view-fade" mode="out-in">
        <!-- 卡片模式 -->
        <CardGrid
          v-if="viewMode === 'card'"
          key="card"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          :loading="loading"
          empty-text="暂无位置"
          @pagination="handleQuery"
        >
          <PositionCard
            v-for="row in tableData"
            :key="row.id"
            :pos="row"
            @edit="openEditDialog"
            @delete="handleCardDelete"
            @status-change="onStatusChange"
          />
        </CardGrid>

        <!-- 列表模式 -->
        <div v-else key="list" class="flex-1 flex flex-col justify-between overflow-hidden border">
          <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="true">
            <template #moduleKey>
              <el-table-column label="模块标识" prop="moduleKey" min-width="160">
                <template #default="{ row }">
                  <el-tag effect="plain" size="small">{{ row.moduleKey }}</el-tag>
                </template>
              </el-table-column>
            </template>
            <template #positionKey>
              <el-table-column label="位置编码" prop="positionKey" min-width="160">
                <template #default="{ row }">
                  <span class="font-mono text-12px c-[#606266]">{{ row.positionKey }}</span>
                </template>
              </el-table-column>
            </template>
            <template #status>
              <el-table-column label="状态" prop="status" width="90" align="center" slot-name="status">
                <template #default="{ row }">
                  <el-switch
                    :model-value="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    size="small"
                    @change="(val) => onStatusChange(row as AiPosition, val as number)"
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
    <PositionFormDialog
      v-model:visible="formVisible"
      v-model:is-edit="formIsEdit"
      v-model:form="formData"
      @confirm="onFormConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import type { AiPosition } from '@/api/ai/position'
import { useAiPositionsStore } from '@/store/modules/aiPositions'
import { POSITION_LIST_COLUMNS } from './utils/tableColumns'
import { STATUS_OPTIONS } from './utils/moduleOptions'
import { usePosition } from './utils/usePosition'
import PositionFormDialog from './components/PositionFormDialog.vue'
import PositionCard from './components/PositionCard.vue'

const positionsStore = useAiPositionsStore()

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
  onStatusChange,
} = usePosition()

const viewMode = ref<'card' | 'list'>('list')

/** 模块下拉选项：从 store 缓存读取 */
const moduleOptions = computed(() => {
  const seen = new Map<string, string>()
  for (const p of positionsStore.positions) {
    if (!seen.has(p.moduleKey)) seen.set(p.moduleKey, p.label.split('-')[0] || p.moduleKey)
  }
  return Array.from(seen.entries()).map(([moduleKey, label]) => ({ moduleKey, label }))
})

const columns = [
  ...POSITION_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: '140px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openEditDialog(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该位置？删除后已部署的场景将无法识别此位置。' }, click: ({ row }: any) => handleCardDelete(row) },
    ],
  },
]

async function handleCardDelete(row: AiPosition) {
  await ElMessageBox.confirm(`确认删除位置「${row.label}」？`, '提示', { type: 'warning' })
  await handleDelete(row)
}

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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.view-switcher {
  :deep(.el-radio-button__inner) {
    padding: 6px 10px;
  }
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
