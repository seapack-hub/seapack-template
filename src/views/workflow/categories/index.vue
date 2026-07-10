<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar h-[50px]">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="分类名称">
            <el-input v-model="queryParams.keyword" placeholder="搜索分类名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
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
        <el-button type="success" icon="plus" @click="handleAdd">新建分类</el-button>
      </div>

      <!-- 表格 -->
      <div class="flex-1 flex flex-col">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="false">
          <template #status>
            <el-table-column label="状态" width="80" slot-name="status">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleStatusChange(row as any)"
                />
              </template>
            </el-table-column>
          </template>
          <template #operate>
            <el-table-column label="操作" width="150" fixed="right" slot-name="operate">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEdit(row as any)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(row as any)">删除</el-button>
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

    <!-- 新建/编辑分类弹框 -->
    <CategoryFormDialog
      v-model:visible="formVisible"
      v-model:is-edit="formIsEdit"
      v-model:form="formData"
      :category-options="categoryTree"
      @confirm="onFormConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { useWorkflowCategory } from '../utils/useWorkflowCategory'
import { CATEGORY_COLUMNS } from '../utils/tableColumns'
import CategoryFormDialog from '../components/CategoryFormDialog.vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const {
  loading,
  tableData,
  total,
  queryParams,
  categoryTree,
  formVisible,
  formIsEdit,
  formData,
  handleQuery,
  handleReset,
  loadCategoryTree,
  handleAdd,
  handleEdit,
  handleStatusChange,
  handleDelete,
  onFormConfirm,
} = useWorkflowCategory()

const columns = CATEGORY_COLUMNS

onMounted(() => {
  loadCategoryTree()
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
