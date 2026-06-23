<template>
  <div class="page-container">
    <el-card shadow="never" class="flex-1 flex flex-col el-card-main">
      <!-- 搜索区域：关键字 + 年度 + 分红类型 + 实施状态 -->
      <div class="search-bar h-[50px]">
        <DividendSearch :model="query" @search="handleQuery" @reset="handleReset" />
      </div>
      <!-- 工具栏 -->
      <div class="table-toolbar h-[50px] flex items-center justify-between">
        <span class="text-15px font-bold">分红数据维护</span>
        <el-button type="success" icon="plus" @click="openDialog()">新增分红</el-button>
      </div>
      <!-- 表格 + 分页 -->
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="true">
          <!-- 分红类型 el-tag：颜色从 dict tagType 映射读取，无映射则默认 primary -->
          <template #dividendType>
            <el-table-column label="分红类型" min-width="120px" align="center" slot-name="dividendType">
              <template #default="{ row }">
                <el-tag :type="typeTagMap[row.dividendType] as any || 'primary'" size="small" effect="light">
                  {{ dictName(typeOpts, row.dividendType) }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
          <!-- 实施状态彩色徽章：颜色根据 dict 配置显示 -->
          <template #status>
            <el-table-column label="实施状态" min-width="130px" align="center" slot-name="status">
              <template #default="{ row }">
                <span :class="['badge', statusClassMap[row.status] || 'badge-yellow']">
                  {{ dictName(statusOpts, row.status) }}
                </span>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>
    <!-- 新增/编辑弹框 -->
    <DividendFormDialog v-model:visible="dialogVisible" v-model:is-edit="dialogIsEdit" v-model:form="dialogForm" @confirm="onDialogConfirm" />
  </div>
</template>

<script setup lang="ts">
import { StockDividendAPI } from '@/api/system/stock/stockDividend/stockDividend.ts'
import { createDividendColumns } from '../components/columns'
import { useDividendDict } from './components/useDividendDict'
import DividendSearch from './components/DividendSearch.vue'
import DividendFormDialog from './components/DividendFormDialog.vue'

const { typeOpts, statusOpts, load, dictName } = useDividendDict()

const typeTagMap: Record<string, string> = { FINAL: 'primary', INTERIM: 'warning' }
const statusClassMap: Record<string, string> = { IMPLEMENTED: 'badge-green', APPROVED: 'badge-blue', PROPOSED: 'badge-yellow' }

load()

/** 查询参数：后端分页 + 四个筛选条件 */
const query = ref({ pageNum: 1, pageSize: 10, keyword: '', year: '', dividendType: '', status: '' })
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

/** 弹框状态 */
const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const dialogForm = ref<any>({})

/** 表格列配置（操作列回调绑定到当前页面逻辑） */
const columns = createDividendColumns({
  onEdit(row) {
    dialogIsEdit.value = true;
    console.log('--row--',row);
    dialogForm.value = {
      ...row ,
      year: String(row.year)
    };
    dialogVisible.value = true
  },
  async onDelete(row) {
    await StockDividendAPI.delete(row.id)
    ElMessage.success('删除成功')
    await handleQuery()
  },
})

function openDialog() { dialogVisible.value = true }

/** 弹框确认回调：编辑调用 update，新增调用 insert */
async function onDialogConfirm(form: any, isEdit: boolean) {
  const api = isEdit ? StockDividendAPI.update : StockDividendAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  dialogVisible.value = false
  await handleQuery()
}

/** 查询：移除空字符串参数后调用分页接口 */
const handleQuery = async () => {
  loading.value = true
  try {
    const params = { ...query.value }
    if (!params.year) delete (params as any).year
    if (!params.dividendType) delete (params as any).dividendType
    if (!params.status) delete (params as any).status
    if (!params.keyword) delete (params as any).keyword
    const res = await StockDividendAPI.list(params as any)
    tableData.value = res.list
    total.value = res.total
  } catch {
    tableData.value = []
    total.value = 0
  } finally { loading.value = false }
}

/** 重置查询条件并重新加载 */
const handleReset = () => {
  query.value = { pageNum: 1, pageSize: 10, keyword: '', year: '', dividendType: '', status: '' }
  handleQuery()
}

onMounted(() => handleQuery())
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%; width: 100%; display: flex; flex-direction: column; gap: 10px;
  background: #f5f7fa; box-sizing: border-box;
}
.table-toolbar { display: flex; justify-content: space-between; align-items: center; }
:deep(.badge) {
  display: inline-block; padding: 0 8px; border-radius: 10px; font-size: 12px; line-height: 22px; font-weight: 500;
}
:deep(.badge-green) { background: #e1f3d8; color: #67c23a; }
:deep(.badge-blue) { background: #ecf5ff; color: #409eff; }
:deep(.badge-yellow) { background: #fdf6ec; color: #e6a23c; }
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px); display: flex; flex-direction: column; gap: 10px;
}
</style>
