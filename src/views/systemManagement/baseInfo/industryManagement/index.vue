<template>
  <div class="app-container w-100% h-100% flex flex-col">

    <!-- 搜索栏 -->
    <div class="search-bar h-[50px]">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keyword">
          <el-input v-model="queryParams.keyword" placeholder="行业名称/编码" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="层级" prop="nodeLevel">
          <el-select v-model="queryParams.nodeLevel" placeholder="全部" clearable style="width: 180px">
            <el-option label="一级行业" :value="1" />
            <el-option label="二级行业" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="父级行业" prop="parentId">
          <el-select v-model="queryParams.parentId" placeholder="全部" clearable filterable style="width: 180px">
            <el-option v-for="item in parentOptions" :key="item.id" :label="`${item.label} ${item.code}`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!--表格数据-->
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 工具栏 -->
      <div class="table-search">
        <div>
          <el-button type="success" icon="plus" @click="openDialog()">新增</el-button>
        </div>
      </div>

      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <!-- 行业列表表格 -->
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true" @selection-change="handleSelectionChange">
          <!-- 层级列（插槽渲染，el-tag 颜色区分一级/二级） -->
          <template #nodeLevel>
            <el-table-column label="层级" minWidth="100px" align="center" slotName="nodeLevel">
              <template #default="{ row }">
                <el-tag :type="row.nodeLevel === 1 ? 'primary' : 'success'" size="small">
                  {{ row.nodeLevel === 1 ? '一级行业' : '二级行业' }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <div class="h-[40px] mt-10px">
          <!-- 分页组件（服务端分页） -->
          <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>
    <!-- 新增/编辑弹框 -->
    <IndustrySectorDialog v-model:visible="dialogVisible" v-model:isEdit="dialogIsEdit" v-model:form="dialogForm" @confirm="onDialogConfirm" />
  </div>
</template>

<script setup lang="ts">
import { IndustrySectorAPI, type IndustrySector } from '@/api/system/common/industrySector.ts'
import IndustrySectorDialog from './components/IndustrySectorDialog.vue'

// ===== 查询状态 =====
const queryFormRef = ref()
const queryParams = reactive({ pageNum: 1, pageSize: 10, keyword: '', nodeLevel: undefined as number | undefined, parentId: undefined as number | undefined })
const tableData = ref<IndustrySector[]>([])  // 当前页数据
const total = ref(0)
const loading = ref(false)
const selectIds = ref<number[]>([])          // 多选选中的 ID 列表
const parentLabelMap = ref<Record<number, string>>({})  // parentId → label 映射
const parentOptions = ref<IndustrySector[]>([])  // 父级筛选下拉选项（一级行业）

// ===== 表格列配置 =====
const columns = ref([
  { label: '编码', prop: 'code', minWidth: '80px' },
  { label: '行业名称', prop: 'label', minWidth: '160px', showOverflowTooltip: true },
  { label: '父级行业', prop: 'parentLabel', minWidth: '120px' },
  { label: '层级', prop: 'nodeLevel', minWidth: '80px', align: 'center', slotName: 'nodeLevel' },
  { label: '创建时间', prop: 'createdAt', minWidth: '160px' },
  {
    columnType: 'operate', 
    label: '操作', 
    width: '130px', 
    fixed: 'right',
    buttons: [
      { 
        type: 'primary', 
        label: '编辑', 
        size: 'small', 
        renderType: 'link', 
        click: ({ row }: any) => openDialog(row) 
      },
      { 
        type: 'danger', 
        label: '删除', 
        size: 'small', 
        renderType: 'link', 
        popconFirm: { title: '确认删除该行业吗？' }, 
        click: ({ row }: any) => handleDelete(row) 
      },
    ],
  },
])

// ===== 弹框状态 =====
const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const dialogForm = ref<any>({ code: '', label: '', parentId: null, nodeLevel: 1, sortOrder: 0 })

/** 打开新增/编辑弹框，编辑模式回填当前行数据 */
function openDialog(row?: any) {
  if (row) {
    dialogForm.value = { ...row }
    dialogIsEdit.value = true
  } else {
    dialogForm.value = { code: '', label: '', parentId: null, nodeLevel: 1, sortOrder: 0 }
    dialogIsEdit.value = false
  }
  dialogVisible.value = true
}

/** 弹框确认回调：新增或更新后刷新列表 */
async function onDialogConfirm(form: any, isEdit: boolean) {
  const payload = { ...form, parentId: form.parentId || null }
  if (!isEdit) delete payload.id
  const api = isEdit ? IndustrySectorAPI.update : IndustrySectorAPI.insert
  await api(payload)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  dialogVisible.value = false
  handleQuery()
}

/** 单行删除 */
async function handleDelete(row: any) {
  await IndustrySectorAPI.delete(row.id)
  ElMessage.success('删除成功')
  handleQuery()
}

/** 多选变化时更新选中 ID 列表 */
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item: any) => Number(item.id))
}

/** 查询（服务端分页 + 筛选），返回数据补充 parentLabel */
async function handleQuery() {
  loading.value = true
  try {
    const res = await IndustrySectorAPI.getList({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keyword: queryParams.keyword || undefined,
      nodeLevel: queryParams.nodeLevel || undefined,
      parentId: queryParams.parentId || undefined,
    })
    tableData.value = (res.list || []).map(r => ({
      ...r,
      parentLabel: r.parentId ? parentLabelMap.value[r.parentId] || `(${r.parentId})` : '--',
    }))
    total.value = res.total || 0
  } finally { loading.value = false }
}

/** 重置搜索条件 */
function handleResetQuery() {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  queryParams.keyword = ''
  queryParams.nodeLevel = undefined
  queryParams.parentId = undefined
  handleQuery()
}

/** 初始化加载一级行业列表（供父级名称映射 + 筛选下拉）+ 首屏数据 */
async function initPage() {
  try {
    const mapRes = await IndustrySectorAPI.getList({ pageSize: 999, nodeLevel: 1 })
    parentOptions.value = mapRes.list || []
    for (const item of (mapRes.list || [])) { parentLabelMap.value[item.id] = item.label }
  } catch { /* 降级：parentLabel 显示 ID */ }
  handleQuery()
}

onMounted(() => { initPage() })
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
