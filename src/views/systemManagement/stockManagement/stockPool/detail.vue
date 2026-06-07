<template>
  <div class="detail-container">
    <PageHeader title="股票详情" backText="返回" @cancel="goBack" />

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="基本信息" name="info" lazy>
        <StockInfoTab :info="stockInfo" />
      </el-tab-pane>
      <el-tab-pane label="分红" name="dividend" lazy>
        <StockDividendTab :dividends="dividends" />
      </el-tab-pane>
      <el-tab-pane label="股价" name="price" lazy>
        <StockChartTab :stockCode="stockInfo.stockCode" />
      </el-tab-pane>
      <el-tab-pane label="财务数据" name="finance" lazy>
        <StockFinanceTab :data="financeData" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { StockInfoAPI, MarketDataAPI, FinancialAPI } from '@/api/system/stockPool'
import { generateMockFinance } from './components/detailShared'
import StockInfoTab from './components/StockInfoTab.vue'
import StockChartTab from './components/StockChartTab.vue'
import StockDividendTab from './components/StockDividendTab.vue'
import StockFinanceTab from './components/StockFinanceTab.vue'

const router = useRouter()
const route = useRoute()
const stockId = Number(route.query.stockId)

function goBack() { router.back() }

const activeTab = ref('info')
const stockInfo = ref<any>({})
const dividends = ref<any[]>([])
const financeData = ref<{ balance: any[]; income: any[]; cashflow: any[] }>({ balance: [], income: [], cashflow: [] })

onMounted(async () => {
  if (!stockId) return
  try {
    const [info, market, divs] = await Promise.all([
      StockInfoAPI.detail(stockId),
      MarketDataAPI.latest(stockId).catch(() => null),
      MarketDataAPI.history(stockId).catch(() => [] as any[]),
    ])
    stockInfo.value = { ...info, ...market }
    dividends.value = divs?.length ? divs : []

    const [bal, inc, cf] = await Promise.all([
      FinancialAPI.balanceSheet(stockId).catch(() => [] as any),
      FinancialAPI.incomeStatement(stockId).catch(() => [] as any),
      FinancialAPI.cashFlow(stockId).catch(() => [] as any),
    ])
    if (bal?.length) financeData.value.balance = bal
    if (inc?.length) financeData.value.income = inc
    if (cf?.length) financeData.value.cashflow = cf
    if (!bal?.length && !inc?.length && !cf?.length) {
      financeData.value = generateMockFinance(stockId)
    }
  } catch { /* 静默降级 */ }
})
</script>

<style lang="scss" scoped>
.detail-container {
  height: 100%; width: 100%;
  padding: 16px; background: #f5f7fa; box-sizing: border-box; overflow-y: auto;
}
.detail-tabs {
  background: #fff; border-radius: 8px; padding: 0 16px 16px;
}
</style>
