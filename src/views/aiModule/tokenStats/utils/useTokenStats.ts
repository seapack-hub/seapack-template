/**
 * useTokenStats — Token 用量统计 composable
 *
 * 所有数据均从后端 API 获取，无 Mock 数据
 */
import {
  TokenStatsAPI,
  type TokenStatOverview,
  type TokenTrendItem,
  type TokenModelPieItem,
  type TokenSceneBarItem,
  type TokenCostSummaryItem,
  type TokenUserRankItem,
  type TokenUsageLog,
  type TokenStatsQuery,
} from '@/api/ai/tokenStats'

export function useTokenStats() {
  const loading = ref(false)

  // ===== 工具函数 =====
  function getDateRange(days: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days + 1)
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    }
  }

  function makeQuery(days: number, extra?: Partial<TokenStatsQuery>): TokenStatsQuery {
    return { ...getDateRange(days), ...extra }
  }

  // ===== 概览 =====
  const overview = ref<TokenStatOverview>({
    todayCalls: 0, todayTokens: 0, todayCost: 0, successRate: 0,
    yesterdayCalls: 0, yesterdayTokens: 0, yesterdayCost: 0, yesterdaySuccessRate: 0,
  })

  async function fetchOverview() {
    try {
      const res = await TokenStatsAPI.getOverview()
      if (res) overview.value = res
    } catch { /* 接口异常时保持默认值 */ }
  }

  // ===== 趋势 =====
  const trendData = ref<{ dates: string[]; input: number[]; output: number[]; total: number[] }>({ dates: [], input: [], output: [], total: [] })

  async function fetchTrend(days: number) {
    try {
      const res = await TokenStatsAPI.getTrend(makeQuery(days))
      if (res && res.length > 0) {
        trendData.value = {
          dates: res.map((r: TokenTrendItem) => r.date.slice(5)),
          input: res.map((r: TokenTrendItem) => r.tokensInput),
          output: res.map((r: TokenTrendItem) => r.tokensOutput),
          total: res.map((r: TokenTrendItem) => r.tokensTotal),
        }
      } else {
        trendData.value = { dates: [], input: [], output: [], total: [] }
      }
    } catch {
      trendData.value = { dates: [], input: [], output: [], total: [] }
    }
  }

  // ===== 模型饼图 =====
  const modelPieData = ref<{ name: string; value: number }[]>([])

  async function fetchModelPie(days = 30) {
    try {
      const res = await TokenStatsAPI.getModelPie(makeQuery(days))
      if (res && res.length > 0) {
        modelPieData.value = res.map((r: TokenModelPieItem) => ({ name: r.modelName, value: r.tokensTotal }))
      } else {
        modelPieData.value = []
      }
    } catch {
      modelPieData.value = []
    }
  }

  // ===== 场景柱状图 =====
  const sceneBarData = ref<{ scenes: string[]; calls: number[] }>({ scenes: [], calls: [] })

  async function fetchSceneBar(days = 30) {
    try {
      const res = await TokenStatsAPI.getSceneBar(makeQuery(days))
      if (res && res.length > 0) {
        sceneBarData.value = {
          scenes: res.map((r: TokenSceneBarItem) => r.sceneName),
          calls: res.map((r: TokenSceneBarItem) => r.callCount),
        }
      } else {
        sceneBarData.value = { scenes: [], calls: [] }
      }
    } catch {
      sceneBarData.value = { scenes: [], calls: [] }
    }
  }

  // ===== 费用汇总 =====
  const costSummary = ref<TokenCostSummaryItem[]>([])

  async function fetchCostSummary(days = 30) {
    try {
      const res = await TokenStatsAPI.getCostSummary(makeQuery(days))
      costSummary.value = res || []
    } catch {
      costSummary.value = []
    }
  }

  // ===== 用户排行 =====
  const userRanking = ref<TokenUserRankItem[]>([])

  async function fetchUserRanking(days = 30, limit = 10) {
    try {
      const res = await TokenStatsAPI.getUserRanking({ ...getDateRange(days), limit })
      userRanking.value = res || []
    } catch {
      userRanking.value = []
    }
  }

  // ===== 最近调用 =====
  const recentCalls = ref<TokenUsageLog[]>([])

  async function fetchRecentCalls(pageNum = 1, pageSize = 20) {
    try {
      const res = await TokenStatsAPI.getRecentCalls({ pageNum, pageSize })
      recentCalls.value = res?.list || []
    } catch {
      recentCalls.value = []
    }
  }

  // ===== 加载所有 =====
  async function loadAll(days = 30) {
    loading.value = true
    await Promise.all([
      fetchOverview(),
      fetchTrend(days),
      fetchModelPie(days),
      fetchSceneBar(days),
      fetchCostSummary(days),
      fetchUserRanking(days),
      fetchRecentCalls(),
    ])
    loading.value = false
  }

  return {
    loading,
    overview,
    trendData,
    modelPieData,
    sceneBarData,
    costSummary,
    userRanking,
    recentCalls,
    loadAll,
    fetchOverview,
    fetchTrend,
    fetchModelPie,
    fetchSceneBar,
    fetchCostSummary,
    fetchUserRanking,
    fetchRecentCalls,
  }
}
