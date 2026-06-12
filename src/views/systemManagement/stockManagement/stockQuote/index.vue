<template>
  <div class="page-container">
    <!-- ===== 顶部大盘指数卡片 ===== -->
    <!-- 6 个主要指数：上证、深证、创业板、科创50、沪深300、上证50 -->
    <el-row :gutter="12" class="market-indices">
      <el-col :span="4" v-for="idx in marketIndices" :key="idx.code">
        <el-card shadow="never" :body-style="{ padding: '12px 16px' }" class="index-card">
          <div class="index-name">{{ idx.name }}</div>
          <div class="index-price" :class="changeClass(idx.change)">{{ idx.price.toFixed(2) }}</div>
          <div class="index-change" :class="changeClass(idx.change)">
            <template v-if="idx.change > 0">+</template>{{ idx.change.toFixed(2) }}
            <span class="ml-4px">({{ idx.changePct > 0 ? '+' : '' }}{{ idx.changePct.toFixed(2) }}%)</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ===== 左侧行业板块树 + 右侧行情表格 ===== -->
    <div class="flex-1 flex gap-10px overflow-hidden">
      <!-- 左侧行业树面板 -->
      <el-card shadow="never" class="tree-panel w-220px flex-shrink-0" :body-style="{ padding: '12px', height: '100%' }">
        <div class="font-bold text-15px mb-8px">行业板块</div>
        <el-input v-model="filterText" placeholder="搜索板块" clearable class="mb-8px" size="small" />
        <div class="tree-wrapper overflow-y-auto pb-20">
          <!-- 行业树：数据由 IndustrySectorAPI.getTree() 动态加载 -->
          <el-tree
            ref="treeRef"
            :data="industryTreeData"
            :props="{ children: 'children', label: 'label' }"
            node-key="id"
            default-expand-all
            highlight-current
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          >
            <template #default="{ node }">
              <span class="flex items-center gap-4px text-14px">
                <span class="text-yellow-500 text-13px">&#9679;</span>
                <span>{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-card>

      <!-- 右侧行情表格面板 -->
      <el-card shadow="never" class="flex-1 flex flex-col overflow-hidden el-card-main">
        <!-- 搜索栏：股票代码/名称模糊搜索 + 交易所下拉筛选 -->
        <div class="search-bar h-[50px]">
          <el-form :model="query" :inline="true">
            <el-form-item label="股票代码">
              <el-input v-model="query.stockCode" placeholder="模糊搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="股票名称">
              <el-input v-model="query.stockName" placeholder="模糊搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="交易所">
              <!-- 交易所选项从 dict 表动态加载（exchange_type） -->
              <el-select v-model="query.exchange" placeholder="全部" clearable style="width: 130px">
                <el-option v-for="item in exchangeOptions" :key="item.dictCode" :label="item.dictName" :value="item.dictCode" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleSearch">搜索</el-button>
              <el-button icon="refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 表格主体 + 分页 -->
        <div class="flex-1 flex flex-col justify-between border">
          <!-- SpTable 表格组件：列配置由 createStockQuoteColumns() 生成 -->
          <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true">
            <!-- 涨跌幅插槽：>0 红色 / <0 绿色 / =0 灰色 -->
            <template #changePercent>
              <el-table-column label="涨跌幅" minWidth="90px" align="right" slotName="changePercent">
                <template #default="{ row }">
                  <span :class="changeClass(row.changePercent)">
                    {{ row.changePercent > 0 ? '+' : '' }}{{ row.changePercent?.toFixed(2) }}%
                  </span>
                </template>
              </el-table-column>
            </template>
            <!-- 股息率插槽：按数值分色（绿≥5% / 蓝≥4% / 黄≥3% / 灰<3%） -->
            <template #dividendYield>
              <el-table-column label="股息率" minWidth="90px" align="right" slotName="dividendYield">
                <template #default="{ row }">
                  <span :class="yieldLevelClass(row.dividendYield)">{{ row.dividendYield?.toFixed(2) }}%</span>
                </template>
              </el-table-column>
            </template>
            <!-- 动态股息率插槽：同上分色规则 -->
            <template #dynamicYield>
              <el-table-column label="动态股息率" minWidth="100px" align="right" slotName="dynamicYield">
                <template #default="{ row }">
                  <span :class="yieldLevelClass(row.dynamicYield)">{{ row.dynamicYield?.toFixed(2) }}%</span>
                </template>
              </el-table-column>
            </template>
            <!-- 开盘价插槽：琥珀色文字 + 暖色底纹 -->
            <template #openPrice>
              <el-table-column label="开盘" minWidth="85px" align="right" slotName="openPrice" :cell-style="cellOpen">
                <template #default="{ row }">
                  <span class="price-open">{{ row.openPrice?.toFixed(2) }}</span>
                </template>
              </el-table-column>
            </template>
            <!-- 最高价插槽：红色文字 + 浅红底纹 -->
            <template #highPrice>
              <el-table-column label="最高" minWidth="85px" align="right" slotName="highPrice" :cell-style="cellHigh">
                <template #default="{ row }">
                  <span class="price-high">{{ row.highPrice?.toFixed(2) }}</span>
                </template>
              </el-table-column>
            </template>
            <!-- 最低价插槽：绿色文字 + 浅绿底纹 -->
            <template #lowPrice>
              <el-table-column label="最低" minWidth="85px" align="right" slotName="lowPrice" :cell-style="cellLow">
                <template #default="{ row }">
                  <span class="price-low">{{ row.lowPrice?.toFixed(2) }}</span>
                </template>
              </el-table-column>
            </template>
          </SpTable>
          <!-- 分页组件 -->
          <div class="h-[40px] mt-10px">
            <Pagination v-model:total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="fetchData" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
/* ========== API 和工具 ========== */
import { StockMarketQuoteAPI, type StockMarketQuoteDto, type StockMarketQuoteQuery } from '@/api/system/stockMarketQuote'
import { IndustrySectorAPI, type IndustrySector } from '@/api/system/industrySector'
import { getDictByType } from '@/api/system/dict'
import { createStockQuoteColumns } from '../components/columns'
import { yieldLevelClass } from '../components/shared'

/* ========== 状态定义 ========== */
/** 表格列配置（只读，无操作列） */
const columns = createStockQuoteColumns()
/** 交易所下拉字典（从后端 dict 表动态加载） */
const exchangeOptions = ref<any[]>([])

/** 行业树搜索关键字 */
const filterText = ref('')
const treeRef = ref<any>(null)
const currentIndustry = ref('')
/** 行业树数据（虚拟根节点 + 后端实时树） */
const industryTreeData = ref<any[]>([])

/** 分页查询参数 */
const query = ref<StockMarketQuoteQuery>({ pageNum: 1, pageSize: 10, stockCode: '', stockName: '', exchange: '', industry: '', keywords: '' })
const loading = ref(false)
const tableData = ref<StockMarketQuoteDto[]>([])
const total = ref(0)

/** 开盘/最高/最低 单元格背景色 */
const cellOpen = () => ({ background: '#fdf6ec' })
const cellHigh = () => ({ background: '#fef0f0' })
const cellLow = () => ({ background: '#f0f9eb' })

/* ========== 涨跌幅颜色工具 ========== */
/** 根据数值返回 CSS class：正 → red / 负 → green / 零 → gray */
function changeClass(val: number | null | undefined): string {
  if (val == null) return 'zero'
  if (val > 0) return 'up'
  if (val < 0) return 'down'
  return 'zero'
}

/* ========== 大盘指数模拟数据 ========== */
/** 六大核心指数展示（后续可对接后端实时接口） */
const marketIndices = ref([
  { code: '000001', name: '上证指数', price: 3158.68, change: 18.25, changePct: 0.58 },
  { code: '399001', name: '深证成指', price: 10642.36, change: -12.47, changePct: -0.12 },
  { code: '399006', name: '创业板指', price: 2158.42, change: 8.63, changePct: 0.40 },
  { code: '000688', name: '科创50', price: 968.75, change: 5.82, changePct: 0.60 },
  { code: '000300', name: '沪深300', price: 3685.24, change: 10.36, changePct: 0.28 },
  { code: '000016', name: '上证50', price: 2516.48, change: 15.72, changePct: 0.63 },
])

/* ========== 行业树操作 ========== */
/** 将后端 IndustrySector 树形数据转为 el-tree 所需格式 */
function toTreeNodes(list: IndustrySector[]): any[] {
  return list.map(n => ({
    id: n.id,
    label: n.label,
    children: n.children?.length ? toTreeNodes(n.children) : [],
  }))
}

/** 加载行业树：优先走后端 IndustrySectorAPI.getTree()，失败时降级使用本地静态树 */
async function loadIndustryTree() {
  try {
    const res = await IndustrySectorAPI.getTree()
    const children = Array.isArray(res) ? toTreeNodes(res) : []
    industryTreeData.value = [{ id: 'all', label: '全部分类', children }]
  } catch {
    const { industryTree } = await import('../components/shared')
    industryTreeData.value = industryTree
  }
}

/** el-tree 过滤方法：按节点 label 匹配 */
function filterNode(value: string, data: any) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

/** 点击行业树节点 → 更新 industry 查询条件 → 刷新表格 */
function handleNodeClick(data: any) {
  currentIndustry.value = data.id === 'all' ? '' : data.id
  query.value.industry = currentIndustry.value
  query.value.pageNum = 1
  fetchData()
}

/** 监听行业树搜索关键字变化 */
watch(filterText, (val) => { treeRef.value?.filter(val) })

/* ========== 数据加载 ========== */
/** 从后端分页查询实时行情列表，接口为 POST /api/stockMarketQuote/page */
async function fetchData() {
  loading.value = true
  try {
    const res = await StockMarketQuoteAPI.page(query.value)
    tableData.value = res.list ?? []
    total.value = res.total ?? 0
  } catch {
    ElMessage.warning('后端行情接口暂不可用')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/** 搜索按钮：重置到第一页后重新加载 */
function handleSearch() {
  query.value.pageNum = 1
  fetchData()
}

/** 重置按钮：清空所有筛选条件后重新加载 */
function handleReset() {
  query.value = { pageNum: 1, pageSize: 10, stockCode: '', stockName: '', exchange: '', industry: '', keywords: '' }
  currentIndustry.value = ''
  fetchData()
}

/* ========== 初始化 ========== */
onMounted(async () => {
  try {
    const res = await getDictByType('exchange_type')
    exchangeOptions.value = Array.isArray(res) ? res : []
  } catch { /* 降级为空 */ }
  loadIndustryTree()
  fetchData()
})
</script>

<style lang="scss" scoped>
/* 页面容器：全屏 flex 列布局 */
.page-container {
  height: 100%; width: 100%; display: flex; flex-direction: column; gap: 10px;
  background: #f5f7fa; box-sizing: border-box;
}

/* 大盘指数卡片样式 */
.market-indices {
  .index-card {
    border-radius: 8px;
    .index-name { font-size: 13px; color: #909399; margin-bottom: 4px; }
    .index-price { font-size: 20px; font-weight: 700; line-height: 1.3; }
    .index-change { font-size: 12px; margin-top: 2px; }
  }
}

/* 行业树面板 */
.tree-panel {
  border-radius: 8px;
  :deep(.el-card__body) { display: flex; flex-direction: column; }
  .tree-wrapper { flex: 1; overflow: auto; }
}

/* 表格卡片主体 */
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px); display: flex; flex-direction: column; gap: 10px;
}

/* 全局滚动条美化 */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; border: 1px solid transparent; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(156, 163, 175, 0.6); }
.tree-wrapper ::-webkit-scrollbar { width: 4px; }

/* 涨跌色 */
.up { color: #ef232a; }
.down { color: #14b143; }
.zero { color: #909399; }

/* 表格横向滚动（列多时显示滚动条） */
.el-card-main :deep(.el-table__body-wrapper) { overflow-x: auto; }

/* 开/高/低价格颜色 */
.price-open { color: #b8860b; font-weight: 600; font-variant-numeric: tabular-nums; }
.price-high { color: #ef232a; font-weight: 700; font-variant-numeric: tabular-nums; }
.price-low { color: #14b143; font-weight: 700; font-variant-numeric: tabular-nums; }

/* 股息率色阶 */
.yield-green { color: #67c23a; font-weight: 600; }
.yield-blue { color: #409eff; font-weight: 500; }
.yield-yellow { color: #e6a23c; font-weight: 500; }
.yield-gray { color: #909399; }
</style>
