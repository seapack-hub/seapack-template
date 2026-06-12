<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <div class="search-bar h-[50px]">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="queryParams.dictType" placeholder="精确匹配" clearable style="width: 160px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="queryParams.keyword" placeholder="编码/名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="table-search">
        <div>
          <el-button type="success" icon="plus" @click="openDialog()">新增</el-button>
          <el-button type="danger" icon="delete" :disabled="selectIds.length === 0" @click="handleBatchDelete">删除</el-button>
        </div>
      </div>

      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true" @selection-change="handleSelectionChange" />
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>

    <DictDialog v-model:visible="dialogVisible" v-model:isEdit="dialogIsEdit" v-model:form="dialogForm" @confirm="onDialogConfirm" />
  </div>
</template>

<script setup lang="ts">
import { DictAPI, type Dict } from '@/api/system/common/dict.ts'
import DictDialog from './components/DictDialog.vue'

const queryFormRef = ref()
const queryParams = reactive({ pageNum: 1, pageSize: 10, dictType: '', keyword: '' })
const tableData = ref<Dict[]>([])
const total = ref(0)
const loading = ref(false)
const selectIds = ref<number[]>([])

const columns = ref([
  { label: '字典类型', prop: 'dictType', minWidth: '120px', showOverflowTooltip: true },
  { label: '字典编码', prop: 'dictCode', minWidth: '100px' },
  { label: '字典名称', prop: 'dictName', minWidth: '130px', showOverflowTooltip: true },
  { label: '排序号', prop: 'orderNum', minWidth: '60px', align: 'center' },
  { label: '备注', prop: 'remark', minWidth: '160px', showOverflowTooltip: true },
  { label: '创建时间', prop: 'gmtCreate', minWidth: '160px' },
  {
    columnType: 'operate', label: '操作', width: '130px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openDialog(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该字典吗？' }, click: ({ row }: any) => handleDelete(row) },
    ],
  },
])

const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const dialogForm = ref<any>({ dictType: '', dictCode: '', dictName: '', orderNum: 0, status: '1', remark: '' })

function openDialog(row?: any) {
  if (row) {
    dialogForm.value = { ...row }
    dialogIsEdit.value = true
  } else {
    dialogForm.value = { dictType: '', dictCode: '', dictName: '', orderNum: 0, status: '1', remark: '' }
    dialogIsEdit.value = false
  }
  dialogVisible.value = true
}

async function onDialogConfirm(form: any, isEdit: boolean) {
  if (!isEdit) { delete form.id; form.status = '1' }
  const api = isEdit ? DictAPI.update : DictAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  dialogVisible.value = false
  handleQuery()
}

async function handleDelete(row: any) {
  await DictAPI.delete(row.id)
  ElMessage.success('删除成功')
  handleQuery()
}

async function handleBatchDelete() {
  if (selectIds.value.length === 0) return
  ElMessageBox.confirm('确认删除选中的字典？', '警告', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }).then(async () => {
    for (const id of selectIds.value) await DictAPI.delete(id)
    ElMessage.success('删除成功')
    handleQuery()
  }).catch(() => ElMessage.info('已取消删除'))
}

function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item: any) => item.id)
}

async function handleQuery() {
  loading.value = true
  try {
    const res = await DictAPI.getList({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      dictType: queryParams.dictType || undefined,
      keyword: queryParams.keyword || undefined,
    })
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

function handleResetQuery() {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  queryParams.dictType = ''
  queryParams.keyword = ''
  handleQuery()
}

onMounted(() => { handleQuery() })
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
