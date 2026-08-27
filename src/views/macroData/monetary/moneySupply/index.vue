<template>
  <div class="flex flex-col gap-16px">
    <!-- ==================== Header ==================== -->
    <div class="flex items-center justify-between box-border p-x-24 p-y-16 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm">
      <div class="flex items-center gap-12px">
        <div class="w-40px h-40px rounded-10px bg-[var(--el-color-primary-light-9)] flex items-center justify-center">
          <el-icon :size="22" color="var(--el-color-primary)"><TrendCharts /></el-icon>
        </div>
        <div class="flex flex-col">
          <span class="text-18px font-700 color-[var(--el-text-color-primary)] leading-24px">宏观经济货币流动性监控看板</span>
          <span class="text-12px color-[var(--el-text-color-secondary)] leading-18px">Macro Liquidity Dashboard</span>
        </div>
      </div>
      <div class="flex items-center gap-8px">
        <span class="text-14px color-[var(--el-text-color-secondary)]">时间筛选：</span>
        <el-select v-model="months" style="width: 120px" @change="fetchAll">
          <el-option v-for="opt in MONTHS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button :icon="Refresh" circle @click="fetchAll" />
      </div>
    </div>

    <!-- ==================== 1. 核心指标卡片区 ==================== -->
    <div class="grid grid-cols-3 gap-16px">
      <KpiCard label="M0 流通中现金" :balance="overview?.m0 ?? null" :yoy="m0Yoy" :trend="m0Trend" :icon="Coin" icon-bg-color="#ecf5ff" icon-color="#409EFF" />
      <KpiCard label="M1 狭义货币" :balance="overview?.m1 ?? null" :yoy="m1Yoy" :trend="m1Trend" :icon="Money" icon-bg-color="#f0f9eb" icon-color="#67C23A" tag="新口径" />
      <KpiCard label="M2 广义货币" :balance="overview?.m2 ?? null" :yoy="m2Yoy" :trend="m2Trend" :icon="Wallet" icon-bg-color="#fdf6ec" icon-color="#E6A23C" />
    </div>

    <!-- ==================== 2. 核心图表区（双列） ==================== -->
    <div class="flex gap-16px">
      <MacroChartCard title="M0 / M1 / M2 余额与同比增速趋势" :options="balanceYoyOption" height="420px" class="flex-[3] min-w-0" />
      <MacroChartCard title="M1-M2 剪刀差（核心灵魂）" :options="scissorsOption" height="420px" class="flex-[2] min-w-0" />
    </div>

    <!-- ==================== 3. 跨市场关联分析区（双列） ==================== -->
    <div class="grid grid-cols-2 gap-16px">
      <MacroChartCard title="剪刀差 vs 上证指数" :options="scissorsStockOption" height="380px" />
      <MacroChartCard title="M2 增速 vs CPI / PPI" :options="m2CpiOption" height="380px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, TrendCharts, Coin, Money, Wallet } from '@element-plus/icons-vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import KpiCard from './components/KpiCard.vue'
import { MoneySupplyAPI } from '@/api/macroData/monetary/moneySupply'
import type {
  MoneySupplyOverview,
  MoneySupplyTrend,
  MoneySupplyScissors,
  ScissorsVsStock,
  M2VsCpi,
} from '@/api/macroData/monetary/types'
import { MONTHS_OPTIONS } from './utils/moduleOptions'
import {
  useBalanceYoyOption,
  useScissorsOption,
  useScissorsStockOption,
  useM2CpiOption,
} from './utils/chartOptions'

// ==================== 状态 ====================
const months = ref(36)

const overview = ref<MoneySupplyOverview | null>(null)
const trend = ref<MoneySupplyTrend | null>(null)
const scissorsData = ref<MoneySupplyScissors | null>(null)
const scissorsStock = ref<ScissorsVsStock | null>(null)
const m2Cpi = ref<M2VsCpi | null>(null)

// ==================== KPI 计算 ====================
const m0Yoy = computed(() => overview.value?.m0Yoy ?? 0)
const m1Yoy = computed(() => overview.value?.m1Yoy ?? 0)
const m2Yoy = computed(() => overview.value?.m2Yoy ?? 0)

const m0Trend = computed(() => {
  const v = m0Yoy.value
  if (v > 8) return '流动性偏热'
  if (v > 5) return '流动性充裕'
  if (v > 0) return '平稳'
  return '流动性偏紧'
})

const m1Trend = computed(() => {
  const v = m1Yoy.value
  if (v > 3) return '资金活化度上升'
  if (v > 0) return '温和增长'
  if (v > -2) return '资金活化度下降'
  return '资金沉淀加剧'
})

const m2Trend = computed(() => {
  const v = m2Yoy.value
  if (v > 10) return '流动性充裕'
  if (v > 7) return '适度宽松'
  if (v > 4) return '中性'
  return '流动性偏紧'
})

// ==================== ECharts 配置 ====================
const balanceYoyOption = computed(() => useBalanceYoyOption(trend.value))
const scissorsOption = computed(() => useScissorsOption(scissorsData.value))
const scissorsStockOption = computed(() => useScissorsStockOption(scissorsStock.value))
const m2CpiOption = computed(() => useM2CpiOption(m2Cpi.value))

// ==================== 数据加载 ====================
async function fetchAll() {
  const m = months.value
  const [ov, tr, sc, ss, mc] = await Promise.allSettled([
    MoneySupplyAPI.getOverview(m),
    MoneySupplyAPI.getTrend(m),
    MoneySupplyAPI.getScissors(m),
    MoneySupplyAPI.getCorrelationScissorsStock(m),
    MoneySupplyAPI.getCorrelationM2Cpi(m),
  ])
  if (ov.status === 'fulfilled') overview.value = ov.value as unknown as MoneySupplyOverview
  if (tr.status === 'fulfilled') trend.value = tr.value as unknown as MoneySupplyTrend
  if (sc.status === 'fulfilled') scissorsData.value = sc.value as unknown as MoneySupplyScissors
  if (ss.status === 'fulfilled') scissorsStock.value = ss.value as unknown as ScissorsVsStock
  if (mc.status === 'fulfilled') m2Cpi.value = mc.value as unknown as M2VsCpi
}

onMounted(() => { fetchAll() })
</script>
