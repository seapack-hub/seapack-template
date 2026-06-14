<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <!-- 搜索栏 -->
    <div class="search-bar h-[50px]">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="queryParams.keyword" placeholder="部门名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="部门层级" prop="deptLevel">
          <el-select v-model="queryParams.deptLevel" placeholder="全部" clearable style="width: 120px">
            <el-option label="一级" value="1" />
            <el-option label="二级" value="2" />
            <el-option label="三级" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 工具栏 -->
      <div class="table-search">
        <div>
          <el-button type="success" icon="plus" @click="openFormDialog()">新增部门</el-button>
        </div>
      </div>

      <!-- SpTable + 分页 -->
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true">
          <template #deptLevel>
            <el-table-column label="部门层级" minWidth="90px" align="center" slotName="deptLevel">
              <template #default="{ row }">
                <el-tag :type="({ '1': 'primary', '2': 'success', '3': 'warning' } as any)[row.deptLevel] || 'info'" size="small" effect="light">
                  {{ { '1': '一级', '2': '二级', '3': '三级' }[row.deptLevel] || row.deptLevel }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>

    <DeptFormDialog v-model:visible="formVisible" v-model:isEdit="formIsEdit" v-model:form="formData" @confirm="onFormConfirm" />
  </div>
</template>

<script setup lang="ts">
import DeptAPI, { type DeptVO, type DeptPageQuery } from '@/api/system/baseInfo/dept'
import { createDeptColumns } from './components/DeptColumns'
import DeptFormDialog from './components/DeptFormDialog.vue'

const queryFormRef = ref()
const queryParams = reactive<DeptPageQuery>({ pageNum: 1, pageSize: 10, keyword: '', deptLevel: undefined })
const tableData = ref<DeptVO[]>([])
const total = ref(0)
const loading = ref(false)

const columns = createDeptColumns({
  onEdit(row) { onEdit(row) },
  onDelete(row) {
    ElMessageBox.confirm(`确认删除【${row.deptName}】及其所有子部门？`, '警告', { type: 'warning' }).then(async () => {
      await DeptAPI.delete(row.deptId)
      ElMessage.success('删除成功')
      handleQuery()
    }).catch(() => {})
  },
})

async function handleQuery() {
  loading.value = true
  try {
    const params = { ...queryParams }
    if (!params.keyword) delete (params as any).keyword
    if (params.deptLevel == null) delete (params as any).deptLevel
    const res = await DeptAPI.getPage(params)
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

function handleResetQuery() {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  queryParams.keyword = ''
  queryParams.deptLevel = undefined
  handleQuery()
}

/* ========== 新增 / 编辑 ========== */
const formVisible = ref(false)
const formIsEdit = ref(false)
const formData = ref<any>({})

const defaultForm = { deptName: '', parentDeptId: undefined, deptLevel: '', seq: '' }

function openFormDialog() {
  formData.value = { ...defaultForm }
  formIsEdit.value = false
  formVisible.value = true
}

function onEdit(row: any) {
  formData.value = { deptName: row.deptName, parentDeptId: row.parentDeptId, deptLevel: row.deptLevel ?? '', seq: row.seq ?? '', deptId: row.deptId }
  formIsEdit.value = true
  formVisible.value = true
}

async function onFormConfirm(form: any, isEdit: boolean) {
  const api = isEdit ? DeptAPI.update : DeptAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  formVisible.value = false
  handleQuery()
}

onMounted(() => handleQuery())
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>