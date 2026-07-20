<!--
  场景管理主页面
  卡片 + 列表双模式切换
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar h-[50px]">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="场景名称">
            <el-input v-model="queryParams.keyword" placeholder="名称/编码模糊搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 200px">
              <el-option v-for="opt in SCENE_STATUS_OPTIONS" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
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
        <el-button type="success" icon="plus" @click="openAddDialog()">新增场景</el-button>
        <el-radio-group v-model="viewMode">
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
          empty-text="暂无场景"
          @pagination="handleQuery"
        >
          <SceneCard
            v-for="row in tableData"
            :key="row.id"
            :scene="row"
            @edit="openEditDialog"
            @config="openConfigDrawer"
            @copy="handleCopyCard"
            @delete="handleCardDelete"
            @status-change="onStatusChange"
          />
        </CardGrid>

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
    <SceneFormDialog
      v-model:visible="formVisible"
      v-model:is-edit="formIsEdit"
      v-model:form="formData"
      @confirm="onFormConfirm"
    />

    <!-- 配置抽屉 -->
    <SceneConfigDrawer
      v-model:visible="configDrawerVisible"
      :scene-id="currentSceneId"
      :scene-name="currentSceneName"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { type Scene } from '@/api/ai/scene'
import { SCENE_STATUS_OPTIONS } from './utils/moduleOptions'
import { SCENE_LIST_COLUMNS } from './utils/tableColumns'
import { useScene } from './utils/useScene'
import SceneCard from './components/SceneCard.vue'
import SceneFormDialog from './components/SceneFormDialog.vue'
import SceneConfigDrawer from './components/SceneConfigDrawer.vue'

const {
  queryParams, tableData, total, loading,
  handleQuery, handleReset,
  formVisible, formIsEdit, formData,
  openAddDialog, openEditDialog, onFormConfirm,
  handleDelete, handleCopy, onStatusChange,
  configDrawerVisible, currentSceneId, currentSceneName, openConfigDrawer,
} = useScene()

const viewMode = ref<'card' | 'list'>('card')

const columns = [
  ...SCENE_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: '150px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openEditDialog(row) },
      { type: 'primary', label: '配置', size: 'small', renderType: 'link', click: ({ row }: any) => openConfigDrawer(row) },
      { type: 'primary', label: '复制', size: 'small', renderType: 'link', click: ({ row }: any) => handleCopy(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该场景吗？' }, click: ({ row }: any) => handleDelete(row) },
    ],
  },
]

async function handleCardDelete(row: Scene) {
  await ElMessageBox.confirm(`确认删除场景【${row.name}】？`, '提示', { type: 'warning' })
  await handleDelete(row)
}

async function handleCopyCard(row: Scene) {
  await handleCopy(row)
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
