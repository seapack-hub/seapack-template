<template>
  <div class="page-container">
    <el-card shadow="never" class="flex-1 flex flex-col el-card-main">
      <div class="header">
        <span class="title">股票监控池</span>
        <el-button type="primary" icon="plus" @click="addVisible = true">添加监控股票</el-button>
      </div>

      <div class="search-bar h-[50px]">
        <el-form :model="query" :inline="true" @keyup.enter="handleSearch">
          <el-form-item label="股票代码">
            <el-input v-model="query.stockCode" placeholder="模糊搜索" clearable style="width:200px" />
          </el-form-item>
          <el-form-item label="股票名称">
            <el-input v-model="query.stockName" placeholder="模糊搜索" clearable style="width:200px" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.isActive" placeholder="全部" clearable style="width:200px">
              <el-option label="启用" :value="1" />
              <el-option label="暂停" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleSearch">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="true">
          <template #isActive>
            <el-table-column label="状态" min-width="80px" align="center" slot-name="isActive">
              <template #default="{ row }">
                <el-switch :model-value="row.isActive === 1" @change="onToggle(row)" />
              </template>
            </el-table-column>
          </template>
          <template #operate>
            <el-table-column label="操作" width="200px" align="center" slot-name="operate">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="onThreshold(row)">设置阈值</el-button>
                <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="fetchData" />
        </div>
      </div>
    </el-card>

    <AddStockDialog v-model:visible="addVisible" @refresh="fetchData" />
    <ThresholdDrawer
      v-model:visible="drawerVisible" :monitor-id="drawerMonitorId"
      :stock-code="drawerStockCode" :stock-name="drawerStockName" @refresh="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { UserStockMonitorAPI, type UserStockMonitorVO, type UserStockMonitorQuery } from '@/api/system/stock/stockMonitor/userStockMonitor.ts'
import { useUserStore } from '@/store/modules/user'
import AddStockDialog from './components/AddStockDialog.vue'
import ThresholdDrawer from './components/ThresholdDrawer.vue'

const userStore = useUserStore()

const query = ref<UserStockMonitorQuery>({ userId: userStore.userInfo.id!, pageNum: 1, pageSize: 10, stockCode: '', stockName: '', isActive: undefined })
const loading = ref(false)
const tableData = ref<UserStockMonitorVO[]>([])
const total = ref(0)
const addVisible = ref(false)
const drawerVisible = ref(false)
const drawerMonitorId = ref(0)
const drawerStockCode = ref('')
const drawerStockName = ref('')

const columns = [
  { label: '股票代码', prop: 'stockCode', minWidth: '110px' },
  { label: '股票名称', prop: 'stockName', minWidth: '130px' },
  { label: '备注', prop: 'remark', minWidth: '120px', showOverflowTooltip: true },
  { label: '阈值数', prop: 'thresholdCount', minWidth: '70px', align: 'center' },
  { label: '状态', slotName: 'isActive', minWidth: '80px', align: 'center' },
  { label: '操作', slotName: 'operate', width: '200px', align: 'center' },
]

const mockPool: UserStockMonitorVO[] = [
  { monitorId: 1, stockCode: '600519', stockName: '贵州茅台', isActive: 1, remark: '核心资产', thresholds: JSON.stringify([{ id: 1, rate: 0.05, type: 'CROSS_DOWN' }, { id: 2, rate: 0.08, type: 'CROSS_UP' }]) },
  { monitorId: 2, stockCode: '601398', stockName: '工商银行', isActive: 1, remark: '高股息', thresholds: JSON.stringify([{ id: 3, rate: 0.04, type: 'CROSS_DOWN' }]) },
  { monitorId: 3, stockCode: '600036', stockName: '招商银行', isActive: 1, remark: '银行龙头', thresholds: JSON.stringify([{ id: 4, rate: 0.035, type: 'CROSS_DOWN' }, { id: 5, rate: 0.06, type: 'CROSS_UP' }, { id: 6, rate: 0.045, type: 'CROSS_UP' }]) },
  { monitorId: 4, stockCode: '000858', stockName: '五粮液', isActive: 0, remark: '', thresholds: '[]' },
  { monitorId: 5, stockCode: '600585', stockName: '海螺水泥', isActive: 1, remark: '周期股', thresholds: JSON.stringify([{ id: 7, rate: 0.05, type: 'CROSS_DOWN' }]) },
  { monitorId: 6, stockCode: '601088', stockName: '中国神华', isActive: 1, remark: '能源', thresholds: JSON.stringify([{ id: 8, rate: 0.06, type: 'CROSS_DOWN' }, { id: 9, rate: 0.1, type: 'CROSS_UP' }]) },
  { monitorId: 7, stockCode: '000002', stockName: '万科A', isActive: 0, remark: '地产', thresholds: JSON.stringify([{ id: 10, rate: 0.07, type: 'CROSS_DOWN' }]) },
  { monitorId: 8, stockCode: '600900', stockName: '长江电力', isActive: 1, remark: '稳定防御', thresholds: JSON.stringify([{ id: 11, rate: 0.03, type: 'CROSS_DOWN' }]) },
  { monitorId: 9, stockCode: '000001', stockName: '平安银行', isActive: 1, remark: '', thresholds: JSON.stringify([{ id: 12, rate: 0.04, type: 'CROSS_UP' }]) },
  { monitorId: 10, stockCode: '002415', stockName: '海康威视', isActive: 1, remark: '科技', thresholds: '[]' },
  { monitorId: 11, stockCode: '601318', stockName: '中国平安', isActive: 1, remark: '保险龙头', thresholds: JSON.stringify([{ id: 13, rate: 0.05, type: 'CROSS_DOWN' }]) },
  { monitorId: 12, stockCode: '300750', stockName: '宁德时代', isActive: 0, remark: '新能源', thresholds: JSON.stringify([{ id: 14, rate: 0.08, type: 'CROSS_DOWN' }]) },
]

function mockFilter(): { list: UserStockMonitorVO[]; total: number } {
  let filtered = [...mockPool]
  if (query.value.stockCode) {
    const q = query.value.stockCode.toLowerCase()
    filtered = filtered.filter(r => r.stockCode.toLowerCase().includes(q))
  }
  if (query.value.stockName) {
    const q = query.value.stockName.toLowerCase()
    filtered = filtered.filter(r => r.stockName.toLowerCase().includes(q))
  }
  if (query.value.isActive != null) {
    filtered = filtered.filter(r => r.isActive === query.value.isActive)
  }
  const total = filtered.length
  const start = (query.value.pageNum - 1) * query.value.pageSize
  const page = filtered.slice(start, start + query.value.pageSize)
  return { list: page, total }
}

async function fetchData() {
  loading.value = true
  try {
    const res = await UserStockMonitorAPI.list(query.value)
    tableData.value = (res.list ?? []).map(r => ({ ...r, thresholdCount: countThresholds(r.thresholds) }))
    total.value = res.total ?? 0
  } catch {
    const mock = mockFilter()
    tableData.value = mock.list.map(r => ({ ...r, thresholdCount: countThresholds(r.thresholds) }))
    total.value = mock.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.value.pageNum = 1
  fetchData()
}

function handleReset() {
  query.value.stockCode = ''
  query.value.stockName = ''
  query.value.isActive = undefined
  query.value.pageNum = 1
  fetchData()
}

function countThresholds(thresholds: string): number {
  try {
    const arr = JSON.parse(thresholds)
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}

async function onToggle(row: UserStockMonitorVO) {
  try {
    await UserStockMonitorAPI.toggle(row.monitorId)
    row.isActive = row.isActive === 1 ? 0 : 1
    ElMessage.success(row.isActive ? '已启用' : '已暂停')
  } catch {
    ElMessage.error('操作失败')
  }
}

function onThreshold(row: UserStockMonitorVO) {
  drawerMonitorId.value = row.monitorId
  drawerStockCode.value = row.stockCode
  drawerStockName.value = row.stockName
  drawerVisible.value = true
}

async function onDelete(row: UserStockMonitorVO) {
  try {
    await ElMessageBox.confirm(`确定将 ${row.stockName} (${row.stockCode}) 移出监控池？`, '确认删除')
    await UserStockMonitorAPI.delete(row.monitorId)
    ElMessage.success('已删除')
    fetchData()
  } catch { /* 静默 */ }
}

onMounted(() => { fetchData() })
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%; width: 100%; display: flex; flex-direction: column; gap: 10px;
  background: #f5f7fa; box-sizing: border-box;
}
.header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;
  .title { font-size: 16px; font-weight: 700; color: #303133; }
}
.search-bar {
  :deep(.el-form-item) { margin-bottom: 0; }
}
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px); display: flex; flex-direction: column; gap: 10px;
}
</style>
