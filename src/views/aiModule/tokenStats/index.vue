<!--
  Token 用量统计仪表盘
-->
<template>
  <div class="app-container overflow-y-auto">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-16px mb-16px">
      <StatCard title="今日调用次数" :value="overview.todayCalls" :icon="TrendCharts" bg-color="#409EFF" :trend="callTrend" format="number" />
      <StatCard title="今日 Token 消耗" :value="overview.todayTokens" :icon="Coin" bg-color="#67C23A" :trend="tokenTrend" format="number" />
      <StatCard title="今日费用" :value="overview.todayCost" :icon="Wallet" bg-color="#E6A23C" :trend="costTrend" format="cost" />
      <StatCard title="成功率" :value="overview.successRate" :icon="CircleCheck" bg-color="#F56C6C" :trend="rateTrend" format="percent" />
    </div>

    <!-- Mock 提示 -->
    <el-alert v-if="useMock" title="当前展示为 Mock 数据，后端接口对接后将自动切换" type="info" show-icon :closable="false" class="mb-16px" />

    <!-- 图表行 -->
    <div class="grid grid-cols-3 gap-16px mb-16px">
      <div class="col-span-2">
        <TrendChart :data="trendData" @range-change="onTrendRangeChange" />
      </div>
      <ModelPieChart :data="modelPieData" />
    </div>

    <div class="grid grid-cols-3 gap-16px mb-16px">
      <div class="col-span-1">
        <SceneBarChart :scenes="sceneBarData.scenes" :calls="sceneBarData.calls" />
      </div>
      <div class="col-span-2">
        <CostTable :data="costSummary" />
      </div>
    </div>

    <!-- 最近调用 -->
    <RecentCallsTable :calls="recentCalls" />
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
import RecentCallsTable from './components/RecentCallsTable.vue'

const {
  useMock,
  overview,
  trendData,
  modelPieData,
  sceneBarData,
  costSummary,
  recentCalls,
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
