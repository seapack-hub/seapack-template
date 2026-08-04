<!--
  Token 用量统计仪表盘

  布局结构：
    1. 统计卡片（4列）— StatCard 组件自带白色卡片
    2. 趋势 + 模型占比（3列 2:1）— 子组件自带白色卡片
    3. 场景调用 + 费用汇总 + 用户排行（3列 1:1:1）
    4. 最近调用记录（全宽）
-->
<template>
  <div class="token-stats-page bg-[var(--el-fill-color-light)] overflow-y-auto">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-16px mb-16px">
      <StatCard title="今日调用次数" :value="overview.todayCalls" :icon="TrendCharts" bg-color="#409EFF" :trend="callTrend" format="number" />
      <StatCard title="今日 Token 消耗" :value="overview.todayTokens" :icon="Coin" bg-color="#67C23A" :trend="tokenTrend" format="number" />
      <StatCard title="今日费用" :value="overview.todayCost" :icon="Wallet" bg-color="#E6A23C" :trend="costTrend" format="cost" />
      <StatCard title="成功率" :value="overview.successRate" :icon="CircleCheck" bg-color="#F56C6C" :trend="rateTrend" format="percent" />
    </div>

    <!-- 趋势 + 模型占比 -->
    <div class="grid grid-cols-3 gap-16px mb-16px">
      <div class="col-span-2">
        <TrendChart :data="trendData" @range-change="onTrendRangeChange" />
      </div>
      <div>
        <ModelPieChart :data="modelPieData" />
      </div>
    </div>

    <!-- 场景调用 + 费用汇总 + 用户排行 -->
    <div class="grid grid-cols-3 gap-16px" style="grid-auto-rows: 1fr">
      <div>
        <SceneBarChart :scenes="sceneBarData.scenes" :calls="sceneBarData.calls" />
      </div>
      <div>
        <CostTable :data="costSummary" />
      </div>
      <div>
        <UserRankingTable :data="userRanking" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendCharts, Coin, Wallet, CircleCheck } from '@element-plus/icons-vue'
import { useTokenStats } from './utils/useTokenStats'
import StatCard from './components/StatCard.vue'
import TrendChart from './components/TrendChart.vue'
import ModelPieChart from './components/ModelPieChart.vue'
import SceneBarChart from './components/SceneBarChart.vue'
import CostTable from './components/CostTable.vue'
import UserRankingTable from './components/UserRankingTable.vue'

const {
  overview,
  trendData,
  modelPieData,
  sceneBarData,
  costSummary,
  userRanking,
  loadAll,
  fetchTrend,
} = useTokenStats()

function onTrendRangeChange(days: number) {
  fetchTrend(days)
}

const callTrend = computed(() => {
  if (!overview.value.yesterdayCalls) return 0
  return Number((((overview.value.todayCalls - overview.value.yesterdayCalls) / overview.value.yesterdayCalls) * 100).toFixed(1))
})
const tokenTrend = computed(() => {
  if (!overview.value.yesterdayTokens) return 0
  return Number((((overview.value.todayTokens - overview.value.yesterdayTokens) / overview.value.yesterdayTokens) * 100).toFixed(1))
})
const costTrend = computed(() => {
  if (!overview.value.yesterdayCost) return 0
  return Number((((overview.value.todayCost - overview.value.yesterdayCost) / overview.value.yesterdayCost) * 100).toFixed(1))
})
const rateTrend = computed(() => {
  return Number((overview.value.successRate - overview.value.yesterdaySuccessRate).toFixed(1))
})

onMounted(() => {
  loadAll()
})
</script>

<style scoped lang="scss">
.token-stats-page {
  min-height: 100%;
  background: var(--el-fill-color-light);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
