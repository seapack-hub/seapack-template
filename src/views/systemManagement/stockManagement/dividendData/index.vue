<template>
  <div class="page-container">
    <el-card shadow="never" class="flex-1 flex flex-col el-card-main">
      <div class="search-bar h-[50px]">
        <el-form :model="query" :inline="true">
          <el-form-item label="股票">
            <el-select v-model="query.stockId" placeholder="全部" clearable style="width: 180px" filterable>
              <el-option v-for="s in stockCandidates" :key="s.stockId" :label="s.stockName" :value="s.stockId" />
            </el-select>
          </el-form-item>
          <el-form-item label="年度">
            <el-date-picker v-model="query.year" type="year" placeholder="全部" clearable style="width: 130px" value-format="YYYY" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-toolbar h-[50px] flex items-center justify-between">
        <span class="text-15px font-bold">分红数据维护</span>
        <el-button type="success" icon="plus" @click="openDialog()">新增分红</el-button>
      </div>
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true">
          <template #dividendType>
            <el-table-column label="分红类型" minWidth="100px" align="center" slotName="dividendType">
              <template #default="{ row }">
                <el-tag :type="row.dividendType === 'FINAL' ? 'primary' : 'warning'" size="small" effect="light">
                  {{ row.dividendType === 'FINAL' ? '末期' : '中期' }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
          <template #status>
            <el-table-column label="实施状态" minWidth="90px" align="center" slotName="status">
              <template #default="{ row }">
                <span :class="['badge', row.status === 'IMPLEMENTED' ? 'badge-green' : row.status === 'APPROVED' ? 'badge-blue' : 'badge-yellow']">
                  {{ { PROPOSED: '预案', APPROVED: '已批准', IMPLEMENTED: '已实施' }[row.status as string] || row.status }}
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
    <DividendDialog v-model:visible="dialogVisible" v-model:isEdit="dialogIsEdit" v-model:form="dialogForm" @confirm="onDialogConfirm" />
  </div>
</template>

<script setup lang="ts">
import { stockCandidates } from '../components/shared'
import { createDividendColumns } from '../components/columns'
import DividendDialog from '../components/DividendDialog.vue'

/* ========== 查询参数 ========== */
const query = ref({ pageNum: 1, pageSize: 10, stockId: undefined, year: '' })
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

/* 弹框状态 */
const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const dialogForm = ref<any>({})

/* 表格列配置 */
const columns = createDividendColumns({
  onEdit(row) { dialogIsEdit.value = true; dialogForm.value = { ...row }; dialogVisible.value = true },
  onDelete(row) { tableData.value = tableData.value.filter((r: any) => r.id !== row.id); total.value--; ElMessage.success('删除成功') },
})

function openDialog() { dialogVisible.value = true }

function onDialogConfirm(_form: any, isEdit: boolean) {
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  dialogVisible.value = false
  handleQuery()
}

function handleQuery() {
  loading.value = true
  setTimeout(() => {
    const data = [
      { id: 1, stockName: '工商银行', year: '2025', dividendType: 'FINAL', cashPerShare: 0.3200, planText: '10派3.2元', announcementDate: '2026-03-28', exDividendDate: '2026-04-15', status: 'IMPLEMENTED', createdAt: '2026-01-15 10:00:00' },
      { id: 2, stockName: '招商银行', year: '2025', dividendType: 'FINAL', cashPerShare: 1.9500, planText: '10派19.5元', announcementDate: '2026-03-25', exDividendDate: '2026-04-20', status: 'APPROVED', createdAt: '2026-01-20 14:30:00' },
      { id: 3, stockName: '中国神华', year: '2025', dividendType: 'FINAL', cashPerShare: 2.5500, planText: '10派25.5元', announcementDate: '2026-03-30', exDividendDate: '2026-04-22', status: 'PROPOSED', createdAt: '2026-02-01 09:00:00' },
      { id: 4, stockName: '海螺水泥', year: '2025', dividendType: 'FINAL', cashPerShare: 1.2000, planText: '10派12元', announcementDate: '2026-03-20', exDividendDate: '2026-04-10', status: 'IMPLEMENTED', createdAt: '2026-01-10 11:00:00' },
      { id: 5, stockName: '中国石油', year: '2025', dividendType: 'INTERIM', cashPerShare: 0.2200, planText: '10派2.2元', announcementDate: '2025-09-15', exDividendDate: '2025-10-08', status: 'IMPLEMENTED', createdAt: '2025-09-16 08:00:00' },
    ]
    tableData.value = data
    total.value = data.length
    loading.value = false
  }, 200)
}

const handleReset = () => { query.value = { pageNum: 1, pageSize: 10, stockId: undefined, year: '' } as any; handleQuery() }

onMounted(() => { handleQuery() })
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%; width: 100%; display: flex; flex-direction: column; gap: 10px;
  padding: 10px; background: #f5f7fa; box-sizing: border-box;
}
.table-toolbar { display: flex; justify-content: space-between; align-items: center; }

:deep(.badge) {
  display: inline-block; padding: 0 8px; border-radius: 10px; font-size: 12px; line-height: 22px; font-weight: 500;
}
:deep(.badge-green) { background: #e1f3d8; color: #67c23a; }
:deep(.badge-blue) { background: #ecf5ff; color: #409eff; }
:deep(.badge-yellow) { background: #fdf6ec; color: #e6a23c; }
.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
