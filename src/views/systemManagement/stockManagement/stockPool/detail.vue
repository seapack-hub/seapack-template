<template>
  <!-- 股票详情页：基本信息 / 分红 / K 线 / 财务 四个 Tab -->
  <div class="detail-container flex flex-col">
    <PageHeader :title="stockName" :edit="false" back-text="返回" @cancel="goBack" />

    <el-tabs v-model="activeTab" class="detail-tabs flex-1">
      <!-- 标的概况 + 交易参数 -->
      <el-tab-pane label="基本信息" name="info" lazy>
        <StockInfoTab :info="stockInfo" :loading="infoLoading" />
      </el-tab-pane>
      <!-- 历年分红走势图 + 分红明细表 -->
      <el-tab-pane label="分红" name="dividend" lazy>
        <StockDividendTab :stock-code="stockInfo.stockCode" />
      </el-tab-pane>
      <!-- K 线图 + 日期筛选 + 行情概要 -->
      <el-tab-pane label="历史行情" name="price" lazy>
        <StockChartTab :stock-code="stockInfo.stockCode" />
      </el-tab-pane>
      <!-- 三大财务报表：资产负债表 / 利润表 / 现金流量表 -->
      <el-tab-pane label="财务数据" name="finance" lazy>
        <StockFinanceTab :data="financeData" :loading="financeLoading" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { InstrumentAPI } from '@/api/system/instrument.ts'
import { generateMockFinance } from './components/detailShared'
import StockInfoTab from './components/StockInfoTab.vue'
import StockChartTab from './components/StockChartTab.vue'
import StockDividendTab from './components/StockDividendTab.vue'
import StockFinanceTab from './components/StockFinanceTab.vue'

const router = useRouter()
const route = useRoute()
/** 从路由查询参数取股票 ID（对应 stock_pool 表主键） */
const stockCode = route.query?.stockCode || '000001'
const stockName = computed(()=>(route.query?.stockName || '--'))
function goBack() { router.back() }

/** 当前激活的 tab 名称 */
const activeTab = ref('info')
/** 标的详情（InstrumentDto），合并后挂载 stockCode 供子组件使用 */
const stockInfo = ref<any>({})
/** 三大财务报表原始数据 */
const financeData = ref<{ balance: any[]; income: any[]; cashflow: any[] }>({ balance: [], income: [], cashflow: [] })

const infoLoading = ref(true)
const financeLoading = ref(true)

onMounted(async () => {
  if (!stockCode) return
  try {
    infoLoading.value = true
    financeLoading.value = true
    const [instruments] = await Promise.all([
      InstrumentAPI.getByCode(stockCode as string).catch(() => null),
    ])
    const inst = Array.isArray(instruments) && instruments.length ? instruments[0] : null
    stockInfo.value = { ...inst, stockCode: inst?.code }
    infoLoading.value = false

    financeData.value = generateMockFinance(stockCode as string)
    financeLoading.value = false

  } catch {
    infoLoading.value = false
    financeLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.detail-container {
  height: 100%;
  width: 100%;
  padding: 0;
  background: #f5f7fa;
  box-sizing: border-box;
  overflow-y: auto;
}
.detail-tabs {
  background: #fff; border-radius: 8px; padding: 0 16px 16px;
}
</style>
