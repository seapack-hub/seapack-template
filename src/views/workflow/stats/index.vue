<template>
  <div class="app-container w-100% h-100% flex flex-col gap-16px">
    <!-- 总览卡片 -->
    <div class="grid grid-cols-4 gap-16px">
      <el-card v-for="card in overviewCards" :key="card.label" shadow="never" class="overview-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-12px text-gray-400 mb-4px">{{ card.label }}</div>
            <div class="text-24px font-bold">{{ card.value }}</div>
          </div>
          <el-icon :size="40" :color="card.color"><component :is="card.icon" /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-2 gap-16px flex-1 min-h-0">
      <!-- 执行趋势 -->
      <el-card shadow="never" class="flex flex-col">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-14px font-medium">执行趋势</span>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" size="small" @change="loadStats" />
          </div>
        </template>
        <div ref="trendChartRef" class="flex-1 min-h-300px"></div>
      </el-card>

      <!-- 热门工作流 -->
      <el-card shadow="never" class="flex flex-col">
        <template #header>
          <span class="text-14px font-medium">热门工作流 Top 10</span>
        </template>
        <div ref="topChartRef" class="flex-1 min-h-300px"></div>
      </el-card>
    </div>

    <!-- 统计明细 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-14px font-medium">工作流统计明细</span>
          <el-button type="primary" size="small" @click="loadStats">刷新</el-button>
        </div>
      </template>
      <SpTable :columns="columns" :data="statsData" :show-index="false" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { DataLine, TrendCharts, CircleCheck, Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { StatsAPI } from '@/api/workflow/stats'
import type { WorkflowStats, StatsOverview } from '@/api/workflow/types'
import SpTable from '@/components/baseComponents/SpTable/index.vue'

const overview = ref<StatsOverview>({
  totalWorkflows: 0,
  totalInstances: 0,
  runningInstances: 0,
  todayInstances: 0,
  successRate: 0,
  avgDurationMs: 0,
})

const statsData = ref<WorkflowStats[]>([])
const dateRange = ref<[Date, Date] | null>(null)

const trendChartRef = ref<HTMLElement | null>(null)
const topChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let topChart: echarts.ECharts | null = null

const overviewCards = ref([
  { label: '工作流总数', value: 0, icon: DataLine, color: '#409eff' },
  { label: '总执行次数', value: 0, icon: TrendCharts, color: '#67c23a' },
  { label: '运行中实例', value: 0, icon: Loading, color: '#e6a23c' },
  { label: '今日执行', value: 0, icon: CircleCheck, color: '#909399' },
])

const columns = [
  { label: '工作流', prop: 'workflowName', minWidth: 150 },
  { label: '统计日期', prop: 'statDate', width: 120 },
  { label: '总执行', prop: 'totalRuns', width: 80 },
  { label: '成功', prop: 'successCount', width: 80 },
  { label: '失败', prop: 'failedCount', width: 80 },
  { label: '成功率', width: 100, formatter: (row: WorkflowStats) => {
    if (!row.totalRuns) return '-'
    return `${((row.successCount || 0) / row.totalRuns * 100).toFixed(1)}%`
  }},
  { label: '平均耗时', width: 100, formatter: (row: WorkflowStats) => formatDuration(row.avgDurationMs) },
  { label: 'Token消耗', prop: 'totalTokens', width: 100 },
  { label: '人工任务', prop: 'humanTasksCount', width: 80 },
]

const formatDuration = (ms?: number) => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}min`
}

const loadOverview = async () => {
  try {
    overview.value = await StatsAPI.overview()
    overviewCards.value[0].value = overview.value.totalWorkflows
    overviewCards.value[1].value = overview.value.totalInstances
    overviewCards.value[2].value = overview.value.runningInstances
    overviewCards.value[3].value = overview.value.todayInstances
  } catch {}
}

const loadStats = async () => {
  try {
    const query: any = {}
    if (dateRange.value) {
      query.startDate = dateRange.value[0].toISOString().slice(0, 10)
      query.endDate = dateRange.value[1].toISOString().slice(0, 10)
    }
    const [byDate, topList] = await Promise.all([
      StatsAPI.byDate(query),
      StatsAPI.topWorkflows(10),
    ])
    statsData.value = byDate || []
    renderTrendChart(byDate || [])
    renderTopChart(topList || [])
  } catch {}
}

const renderTrendChart = (data: WorkflowStats[]) => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  const dates = [...new Set(data.map(d => d.statDate))].sort()
  const successData = dates.map(d => data.filter(x => x.statDate === d).reduce((s, x) => s + (x.successCount || 0), 0))
  const failData = dates.map(d => data.filter(x => x.statDate === d).reduce((s, x) => s + (x.failedCount || 0), 0))

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['成功', '失败'] },
    grid: { left: 40, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [
      { name: '成功', type: 'line', data: successData, itemStyle: { color: '#67c23a' }, areaStyle: { color: 'rgba(103,194,58,0.15)' } },
      { name: '失败', type: 'line', data: failData, itemStyle: { color: '#f56c6c' }, areaStyle: { color: 'rgba(245,108,108,0.15)' } },
    ],
  })
}

const renderTopChart = (data: Array<{ workflowName: string; totalRuns: number; successRate: number }>) => {
  if (!topChartRef.value) return
  if (!topChart) {
    topChart = echarts.init(topChartRef.value)
  }
  const names = data.map(d => d.workflowName).reverse()
  const runs = data.map(d => d.totalRuns).reverse()

  topChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 40, bottom: 20, top: 10 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: names, axisLabel: { width: 100, overflow: 'truncate' } },
    series: [{ type: 'bar', data: runs, itemStyle: { color: '#409eff', borderRadius: [0, 4, 4, 0] } }],
  })
}

const handleResize = () => {
  trendChart?.resize()
  topChart?.resize()
}

onMounted(() => {
  loadOverview()
  loadStats()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  topChart?.dispose()
})
</script>

<style lang="scss" scoped>
.overview-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>
