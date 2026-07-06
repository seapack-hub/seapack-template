<!--
  提示词模板管理主页面
  搜索栏 + 工具栏 + SpTable + 分页 + 弹窗
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar h-[50px]">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="模板名称">
            <el-input v-model="queryParams.keyword" placeholder="名称/编码模糊搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="queryParams.category" placeholder="全部" clearable style="width: 130px">
              <el-option v-for="opt in TEMPLATE_CATEGORY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
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
      <div class="table-toolbar">
        <el-button type="success" icon="plus" @click="openAddDialog()">新增模板</el-button>
      </div>

      <!-- 表格 -->
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable
          :loading="loading"
          :columns="columns"
          :data="tableData"
          :show-index="true"
        >
          <template #category>
            <el-table-column label="分类" prop="category" min-width="100" align="center" slot-name="category">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ categoryLabel(row.category) }}</el-tag>
              </template>
            </el-table-column>
          </template>
          <template #type>
            <el-table-column label="类型" prop="type" width="90" align="center" slot-name="type">
              <template #default="{ row }">
                <el-tag :type="row.type === 1 ? 'warning' : 'info'" size="small">{{ row.type === 1 ? '系统预设' : '自定义' }}</el-tag>
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
    <PromptPreviewDialog
      v-model:visible="previewVisible"
      :template="previewTemplate"
    />
  </div>
</template>

<script setup lang="ts">
import type { PromptTemplate } from '@/api/ai/promptTemplate'
import { PromptTemplateAPI } from '@/api/ai/promptTemplate'
import { ElMessage } from 'element-plus'
import { usePromptTemplate } from './utils/usePromptTemplate'
import { TEMPLATE_CATEGORY_OPTIONS, STATUS_OPTIONS } from './utils/moduleOptions'
import { TEMPLATE_LIST_COLUMNS } from './utils/tableColumns'
import PromptFormDialog from './components/PromptFormDialog.vue'
import PromptPreviewDialog from './components/PromptPreviewDialog.vue'

const {
  queryParams, 
  tableData, 
  total, 
  loading,
  handleQuery, 
  handleReset,
  formVisible, 
  formIsEdit, 
  formLoading,
  formData,
  openAddDialog, 
  openEditDialog, 
  onFormConfirm,
  handleDelete, 
  handleCopy, 
  onStatusChange,
} = usePromptTemplate()

/** SpTable 列配置：基础列 + 操作列 */
const columns = [
  ...TEMPLATE_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: '170px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openEditDialog(row) },
      { type: 'primary', label: '预览', size: 'small', renderType: 'link', click: ({ row }: any) => openPreview(row) },
      { type: 'primary', label: '复制', size: 'small', renderType: 'link', click: ({ row }: any) => handleCopy(row) },
      { 
        type: 'danger', 
        label: '删除', 
        size: 'small', 
        renderType: 'link', 
        popconFirm: { title: '确认删除该模板吗？' }, 
        click: ({ row }: any) => handleDelete(row) },
    ],
  },
]

/** 分类标签文案 */
function categoryLabel(category?: string) {
  return TEMPLATE_CATEGORY_OPTIONS.find(o => o.value === category)?.label || category || '-'
}

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
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
