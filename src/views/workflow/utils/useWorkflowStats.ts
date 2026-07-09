/**
 * useWorkflowStats — 工作流统计 composable
 */
import * as echarts from 'echarts'
import { StatsAPI } from '@/api/workflow/stats'
import type { WorkflowStats, StatsOverview } from '@/api/workflow/types'

export function useWorkflowStats() {
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
    { label: '工作流总数', value: 0, icon: 'DataLine', color: '#409eff' },
    { label: '总执行次数', value: 0, icon: 'TrendCharts', color: '#67c23a' },
    { label: '运行中实例', value: 0, icon: 'Loading', color: '#e6a23c' },
    { label: '今日执行', value: 0, icon: 'CircleCheck', color: '#909399' },
  ])

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
    } catch { /* ignored */ }
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
    } catch { /* ignored */ }
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

  return {
    overview,
    statsData,
    dateRange,
    trendChartRef,
    topChartRef,
    overviewCards,
    formatDuration,
    loadOverview,
    loadStats,
  }
}
