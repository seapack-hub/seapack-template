<template>
  <div class="page-container">
    <!-- ===== 顶部：大盘指数 ===== -->
    <el-row :gutter="10">
      <el-col :span="4" v-for="item in marketIndices" :key="item.code">
        <el-card shadow="hover" :body-style="{ padding: '8px 12px' }" class="index-card">
          <div class="flex items-center justify-between">
            <span class="text-12px text-gray-400">{{ item.name }}</span>
            <el-tag :type="item.change >= 0 ? 'danger' : 'success'" size="small" effect="dark" class="!border-0">
              {{ item.change >= 0 ? '+' : '' }}{{ item.changePct }}%
            </el-tag>
          </div>
          <div class="flex items-baseline gap-6px mt-4px">
            <span class="text-20px font-bold font-mono">{{ item.price }}</span>
            <span class="text-12px" :class="item.change >= 0 ? 'text-red' : 'text-green'">
              {{ item.change >= 0 ? '+' : '' }}{{ item.change }}
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ===== 统计卡片 ===== -->
    <el-row :gutter="12">
      <el-col :span="8" v-for="card in statCards" :key="card.label">
        <el-card shadow="hover" :body-style="{ padding: '14px 18px' }" class="stat-card">
          <div class="flex items-center justify-between">
            <span class="text-13px text-gray-400">{{ card.label }}</span>
            <el-icon :size="22" :color="card.color"><component :is="card.icon" /></el-icon>
          </div>
          <div class="text-26px font-bold mt-6px">{{ card.value }}</div>
          <div class="text-12px text-gray-400 mt-2px">{{ card.sub }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ===== 看板：左侧行业树 + 右侧表格 ===== -->
    <div class="flex-1 flex gap-10px overflow-hidden">
      <!-- 左侧：行业板块树形筛选 -->
      <el-card shadow="never" class="tree-panel w-180px flex-shrink-0" :body-style="{ padding: '12px', height: '100%' }">
        <div class="font-bold text-15px mb-8px">行业板块</div>
        <el-input v-model="filterText" placeholder="搜索板块" clearable class="mb-8px" size="small" />
        <div class="tree-wrapper overflow-y-auto pb-20">
          <el-tree
            ref="treeRef"
            :data="industryTree"
            :props="{ children: 'children', label: 'label' }"
            node-key="id"
            default-expand-all
            highlight-current
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="flex items-center gap-4px text-14px">
                <span class="text-yellow-500 text-13px">&#9679;</span>
                <span>{{ node.label }}</span>
                <span class="text-gray-400 text-13px ml-auto">({{ data.count }})</span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-card>

      <!-- 右侧：表格区域 -->
      <el-card shadow="never" class="flex-1 flex flex-col el-card-main">
        <div class="flex items-center justify-between mb-10px">
          <div class="flex items-center gap-10px">
            <span class="font-bold text-16px">{{ currentTitle }}</span>
            <el-tag v-if="lastRefresh" type="info" effect="plain">最后刷新: {{ lastRefresh }}</el-tag>
          </div>
          <div class="flex items-center gap-8px">
            <el-input v-model="query.keywords" placeholder="搜索股票名称/代码" clearable style="width: 180px" prefix-icon="search" @keyup.enter="handleQuery" />
            <el-checkbox v-model="query.onlyTriggered" border size="small">仅看触发</el-checkbox>
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleRefresh" :loading="refreshing">一键刷新</el-button>
          </div>
        </div>
        <div class="flex-1 flex flex-col justify-between overflow-hidden border">
          <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true">
            <template #changePct>
              <el-table-column label="涨跌幅" minWidth="90px" align="right" slotName="changePct">
                <template #default="{ row }">
                  <span :class="row.changePct >= 0 ? 'text-red' : 'text-green'">
                    {{ row.changePct >= 0 ? '+' : '' }}{{ row.changePct?.toFixed(2) }}%
                  </span>
                </template>
              </el-table-column>
            </template>
            <template #calculatedYield>
              <el-table-column label="动态股息率" minWidth="110px" align="right" slotName="calculatedYield">
                <template #default="{ row }">
                  <span :class="['yield-tag', yieldLevelClass(row.calculatedYield)]">{{ row.calculatedYield?.toFixed(2) }}%</span>
                </template>
              </el-table-column>
            </template>
            <template #triggered>
              <el-table-column label="触发状态" minWidth="100px" align="center" slotName="triggered">
                <template #default="{ row }">
                  <span :class="row.triggered ? 'badge-alert' : 'badge-safe'">{{ row.triggered ? '已触发' : '正常' }}</span>
                </template>
              </el-table-column>
            </template>
          </SpTable>
          <div class="h-[40px] mt-10px">
            <Pagination v-model:total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" layout="sizes, prev, pager, next" background small @pagination="handleQuery" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DashboardAPI } from '@/api/system/stockNew'
import { Search, Notification, TrendCharts } from '@element-plus/icons-vue'
import { createDashboardColumns } from '../components/columns'
import { yieldLevelClass, industryTree } from '../components/shared'

/* ========== 大盘指数 ========== */
const marketIndices = [
  { name: '上证指数', code: '000001', price: '3,289.45', change: 26.78, changePct: 0.82 },
  { name: '深证成指', code: '399001', price: '10,456.82', change: 62.34, changePct: 0.60 },
  { name: '创业板指', code: '399006', price: '2,156.33', change: -8.21, changePct: -0.38 },
  { name: '科创50', code: '000688', price: '967.12', change: 5.43, changePct: 0.56 },
  { name: '沪深300', code: '000300', price: '3,892.67', change: 15.22, changePct: 0.39 },
  { name: '中证500', code: '000905', price: '5,678.90', change: -12.34, changePct: -0.22 },
]

/* ========== 统计卡片 ========== */
const statCards = ref([
  { label: '监控股票总数', value: 0, sub: '当前监控池中股票数量', icon: TrendCharts, color: '#409eff' },
  { label: '触发告警数', value: 0, sub: '股息率超过阈值的股票', icon: Notification, color: '#e6a23c' },
  { label: '平均股息率', value: '0.00%', sub: '全部监控股票的平均值', icon: Search, color: '#67c23a' },
])

/* ========== 行业树 ========== */
const filterText = ref('')
const treeRef = ref<any>(null)
const currentTitle = ref('全部分类')

function filterNode(value: string, data: any) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

function handleNodeClick(data: any) {
  currentTitle.value = data.label
  query.value.industry = data.id === 'all' ? '' : data.id
  query.value.pageNum = 1
  handleQuery()
}

watch(filterText, (val) => { treeRef.value?.filter(val) })

/* ========== 查询参数 ========== */
const query = ref({ pageNum: 1, pageSize: 10, keywords: '', industry: '', onlyTriggered: false })
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const refreshing = ref(false)
const lastRefresh = ref('')
const columns = createDashboardColumns()

/* ========== 查询（带 Mock 降级） ========== */
const handleQuery = async () => {
  loading.value = true
  try {
    const res = await DashboardAPI.getList(query.value)
    tableData.value = res.list; total.value = res.total
  } catch {
    const mock = generateMockDashboard(query.value)
    tableData.value = mock.list; total.value = mock.total
  }
  try {
    const stats = await DashboardAPI.getStats()
    statCards.value[0].value = stats.totalStocks
    statCards.value[1].value = stats.activeAlerts
    statCards.value[2].value = stats.avgYield.toFixed(2) + '%'
  } catch {
    statCards.value[0].value = total.value
    statCards.value[1].value = tableData.value.filter((r: any) => r.triggered).length
    statCards.value[2].value = (tableData.value.reduce((s: number, r: any) => s + (r.calculatedYield || 0), 0) / Math.max(tableData.value.length, 1)).toFixed(2) + '%'
  } finally { loading.value = false }
}

/* ========== 一键刷新行情 ========== */
const handleRefresh = async () => {
  refreshing.value = true
  try {
    await DashboardAPI.refreshQuotes()
    lastRefresh.value = new Date().toLocaleTimeString()
    await handleQuery()
    ElMessage.success('行情数据已刷新')
  } finally { refreshing.value = false }
}

/* ========== Mock 数据（后端未就绪时使用） ========== */
function generateMockDashboard(q: any) {
  const stocks = [
    { code: '600519', name: '贵州茅台', ex: 'SH', ind: '食品饮料', price: 1896.50, chg: 1.25, dvd: 45.00, yr: 2025, yield: 2.37, trig: false, cnt: 0 },
    { code: '601398', name: '工商银行', ex: 'SH', ind: '银行', price: 6.87, chg: -0.45, dvd: 0.32, yr: 2025, yield: 4.66, trig: true, cnt: 2 },
    { code: '600036', name: '招商银行', ex: 'SH', ind: '银行', price: 38.92, chg: 0.78, dvd: 1.95, yr: 2025, yield: 5.01, trig: true, cnt: 3 },
    { code: '000858', name: '五粮液', ex: 'SZ', ind: '食品饮料', price: 145.30, chg: -0.32, dvd: 5.80, yr: 2025, yield: 3.99, trig: false, cnt: 0 },
    { code: '600585', name: '海螺水泥', ex: 'SH', ind: '钢铁', price: 23.56, chg: 0.56, dvd: 1.20, yr: 2025, yield: 5.09, trig: true, cnt: 1 },
    { code: '601088', name: '中国神华', ex: 'SH', ind: '煤炭', price: 42.18, chg: 1.02, dvd: 2.55, yr: 2025, yield: 6.04, trig: true, cnt: 4 },
    { code: '000002', name: '万科A', ex: 'SZ', ind: '地产', price: 8.34, chg: -1.10, dvd: 0.62, yr: 2025, yield: 7.43, trig: true, cnt: 5 },
    { code: '600900', name: '长江电力', ex: 'SH', ind: '电力', price: 28.76, chg: 0.35, dvd: 0.85, yr: 2025, yield: 2.95, trig: false, cnt: 0 },
    { code: '601857', name: '中国石油', ex: 'SH', ind: '化工', price: 10.23, chg: -0.20, dvd: 0.42, yr: 2025, yield: 4.11, trig: true, cnt: 1 },
    { code: '600028', name: '中国石化', ex: 'SH', ind: '化工', price: 6.45, chg: 0.15, dvd: 0.30, yr: 2025, yield: 4.65, trig: true, cnt: 2 },
  ]
  const filtered = stocks.filter(s => {
    if (q.keywords && !s.name.includes(q.keywords) && !s.code.includes(q.keywords)) return false
    if (q.industry && s.ind !== q.industry) return false
    if (q.onlyTriggered && !s.trig) return false
    return true
  })
  const start = (q.pageNum - 1) * q.pageSize
  const page = filtered.slice(start, start + q.pageSize).map((s, i) => ({
    stockId: i + 1, stockCode: s.code, stockName: s.name, exchange: s.ex,
    industry: s.ind, currentPrice: s.price, changePct: s.chg, volume: Math.floor(Math.random() * 5000000 + 100000),
    cashPerShare: s.dvd, year: s.yr, dividendType: 'FINAL', calculatedYield: s.yield,
    triggered: s.trig, triggerCount: s.cnt,
  }))
  return { list: page, total: filtered.length }
}

onMounted(() => { handleQuery() })
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%; width: 100%; display: flex; flex-direction: column; gap: 10px;
  padding: 10px; background: #f5f7fa; box-sizing: border-box;
}

.index-card {
  transition: all 0.25s;
  &:hover { transform: translateY(-3px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
}
.stat-card { transition: all 0.2s; &:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); } }

.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.text-green { color: #19be6b; }
.text-red { color: #ed4014; }

:deep(.yield-tag) {
  display: inline-block; padding: 0 8px; border-radius: 4px; font-weight: 600; font-size: 13px; line-height: 22px;
}
:deep(.yield-green)  { background: #e1f3d8; color: #67c23a; }
:deep(.yield-blue)   { background: #ecf5ff; color: #409eff; }
:deep(.yield-yellow) { background: #fdf6ec; color: #e6a23c; }
:deep(.yield-gray)   { background: #f4f4f5; color: #909399; }

:deep(.badge-alert) {
  display: inline-block; padding: 0 8px; border-radius: 10px; font-size: 12px; line-height: 22px;
  background: #fde2e2; color: #f56c6c; font-weight: 500;
}
:deep(.badge-safe) {
  display: inline-block; padding: 0 8px; border-radius: 10px; font-size: 12px; line-height: 22px;
  background: #e1f3d8; color: #67c23a; font-weight: 500;
}
</style>
