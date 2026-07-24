<!--
  提示词模板管理主页面
  搜索栏 + 工具栏 + 卡片/列表双模式 + 分页 + 弹窗
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams" @submit.prevent="handleQuery">
          <el-form-item label="模板名称">
            <el-input v-model="queryParams.keyword" placeholder="名称/编码模糊搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="queryParams.category" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="opt in TEMPLATE_CATEGORY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
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
        <el-button type="success" icon="plus" @click="openAddDialog()">新增模板</el-button>
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
          empty-text="暂无模板"
          @pagination="handleQuery"
        >
          <PromptTemplateCard
            v-for="row in tableData"
            :key="row.id"
            :tpl="row"
            @edit="openEditDialog"
            @preview="openPreview"
            @copy="handleCardCopy"
            @delete="handleCardDelete"
            @status-change="onStatusChange"
          />
        </CardGrid>

        <!-- 列表模式 -->
        <div v-else key="list" class="flex-1 flex flex-col justify-between overflow-hidden border">
          <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="true">
            <template #category>
              <el-table-column label="分类" prop="category" min-width="100" align="center" slot-name="category">
                <template #default="{ row }">
                  <el-tag :type="categoryTagType(row.category) as any" effect="light">{{ categoryLabel(row.category) }}</el-tag>
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
                    @change="(val) => onStatusChange(row as any, val as number)"
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
    <PromptFormDialog
      v-model:visible="formVisible"
      v-model:is-edit="formIsEdit"
      v-model:form="formData"
      :loading="formLoading"
      @confirm="onFormConfirm"
    />

    <!-- 预览/测试弹窗 -->
    <PromptPreviewDialog v-model:visible="previewVisible" :template="previewTemplate" />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import type { PromptTemplate } from '@/api/ai/promptTemplate'
import { PromptTemplateAPI } from '@/api/ai/promptTemplate'
import { ElMessage } from 'element-plus'
import { usePromptTemplate } from './utils/usePromptTemplate'
import { TEMPLATE_CATEGORY_OPTIONS, STATUS_OPTIONS, categoryLabel, categoryTagType } from './utils/moduleOptions'
import { TEMPLATE_LIST_COLUMNS } from './utils/tableColumns'
import PromptFormDialog from './components/PromptFormDialog.vue'
import PromptPreviewDialog from './components/PromptPreviewDialog.vue'
import PromptTemplateCard from './components/PromptTemplateCard.vue'

const {
  queryParams, tableData, total, loading,
  handleQuery, handleReset,
  formVisible, formIsEdit, formLoading, formData,
  openAddDialog, openEditDialog, onFormConfirm,
  handleDelete, handleCopy, onStatusChange,
} = usePromptTemplate()

const viewMode = ref<'card' | 'list'>('list')

const columns = [
  ...TEMPLATE_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: '170px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openEditDialog(row) },
      { type: 'primary', label: '预览', size: 'small', renderType: 'link', click: ({ row }: any) => openPreview(row) },
      { type: 'primary', label: '复制', size: 'small', renderType: 'link', click: ({ row }: any) => handleCopy(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该模板吗？' }, click: ({ row }: any) => handleDelete(row) },
    ],
  },
]

// ===== 预览弹窗 =====
const previewVisible = ref(false)
const previewTemplate = ref<PromptTemplate | null>(null)
const previewLoading = ref(false)

async function openPreview(row: PromptTemplate) {
  previewVisible.value = true
  previewLoading.value = true
  try {
    const detail = await PromptTemplateAPI.getById(row.id!)
    previewTemplate.value = detail
  } catch {
    ElMessage.error('获取模板详情失败')
    previewVisible.value = false
  } finally {
    previewLoading.value = false
  }
}

async function handleCardDelete(row: PromptTemplate) {
  await ElMessageBox.confirm(`确认删除模板【${row.name}】？`, '提示', { type: 'warning' })
  await handleDelete(row)
}

async function handleCardCopy(row: PromptTemplate) {
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
