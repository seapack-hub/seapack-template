/**
 * useTokenStats — Token 用量统计 composable
 * 支持 API 接口调用，数据为空时回退到 Mock 展示
 */
import {
  TokenStatsAPI,
  type TokenStatOverview,
  type TokenTrendItem,
  type TokenModelPieItem,
  type TokenSceneBarItem,
  type TokenCostSummaryItem,
  type TokenUsageLog,
  type TokenStatsQuery,
} from '@/api/ai/tokenStats'

export function useTokenStats() {
  const loading = ref(false)
  const useMock = ref(false)

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
      overview.value = res
      useMock.value = false
    } catch {
      useMock.value = true
      overview.value = mockOverview()
    }
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
        trendData.value = mockTrend(days)
      }
    } catch {
      trendData.value = mockTrend(days)
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
        modelPieData.value = mockModelPie()
      }
    } catch {
      modelPieData.value = mockModelPie()
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
        sceneBarData.value = mockSceneBar()
      }
    } catch {
      sceneBarData.value = mockSceneBar()
    }
  }

  // ===== 费用汇总 =====
  const costSummary = ref<TokenCostSummaryItem[]>([])

  async function fetchCostSummary(days = 30) {
    try {
      const res = await TokenStatsAPI.getCostSummary(makeQuery(days))
      if (res && res.length > 0) {
        costSummary.value = res
      } else {
        costSummary.value = mockCostSummary()
      }
    } catch {
      costSummary.value = mockCostSummary()
    }
  }

  // ===== 最近调用 =====
  const recentCalls = ref<TokenUsageLog[]>([])

  async function fetchRecentCalls() {
    try {
      const res = await TokenStatsAPI.getRecentCalls({ pageNum: 1, pageSize: 20 })
      if (res?.list && res.list.length > 0) {
        recentCalls.value = res.list
      } else {
        recentCalls.value = mockRecentCalls()
      }
    } catch {
      recentCalls.value = mockRecentCalls()
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
      fetchRecentCalls(),
    ])
    loading.value = false
  }

  return {
    loading,
    useMock,
    overview,
    trendData,
    modelPieData,
    sceneBarData,
    costSummary,
    recentCalls,
    loadAll,
    fetchTrend,
    fetchModelPie,
    fetchSceneBar,
    fetchCostSummary,
    fetchRecentCalls,
  }
}

// ===== Mock 数据（API 无数据时回退） =====

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const MODELS = ['deepseek-chat', 'gpt-4o', 'gpt-4o-mini', 'qwen-plus']

function mockOverview(): TokenStatOverview {
  return {
    todayCalls: randomInt(120, 350),
    todayTokens: randomInt(80000, 250000),
    todayCost: Number((Math.random() * 5 + 0.5).toFixed(2)),
    successRate: Number((92 + Math.random() * 8).toFixed(1)),
    yesterdayCalls: randomInt(100, 300),
    yesterdayTokens: randomInt(60000, 200000),
    yesterdayCost: Number((Math.random() * 4 + 0.3).toFixed(2)),
    yesterdaySuccessRate: Number((90 + Math.random() * 10).toFixed(1)),
  }
}

function mockTrend(days: number) {
  const dates: string[] = []
  const input: number[] = []
  const output: number[] = []
  const total: number[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(5, 10))
    const inp = randomInt(5000, 40000)
    const out = randomInt(3000, 25000)
    input.push(inp)
    output.push(out)
    total.push(inp + out)
  }
  return { dates, input, output, total }
}

function mockModelPie() {
  return [
    { name: 'deepseek-chat', value: randomInt(80000, 200000) },
    { name: 'gpt-4o', value: randomInt(30000, 100000) },
    { name: 'gpt-4o-mini', value: randomInt(20000, 60000) },
    { name: 'qwen-plus', value: randomInt(10000, 40000) },
  ]
}

function mockSceneBar() {
  return {
    scenes: ['股票分析', '内容生成', '代码助手', '智能客服', '数据分析'],
    calls: [randomInt(300, 800), randomInt(200, 600), randomInt(150, 500), randomInt(100, 400), randomInt(80, 300)],
  }
}

function mockCostSummary(): TokenCostSummaryItem[] {
  return MODELS.map(m => ({
    modelName: m,
    callCount: randomInt(100, 800),
    tokensInput: randomInt(30000, 150000),
    tokensOutput: randomInt(20000, 100000),
    tokensTotal: 0,
    totalCostYuan: Number((Math.random() * 8 + 0.2).toFixed(4)),
    avgDurationMs: randomInt(800, 3500),
  })).map(s => ({ ...s, tokensTotal: s.tokensInput + s.tokensOutput })).sort((a, b) => b.totalCostYuan - a.totalCostYuan)
}

function mockRecentCalls(): TokenUsageLog[] {
  const modules = ['stockFund', 'smartCustomer', 'contentGen', 'codeHelper']
  const now = new Date()
  return Array.from({ length: 20 }, (_, i) => {
    const d = new Date(now.getTime() - i * randomInt(60000, 600000))
    const inp = randomInt(100, 1200)
    const out = randomInt(50, 800)
    return {
      id: i + 1,
      callTime: d.toISOString().replace('T', ' ').slice(0, 19),
      moduleKey: modules[randomInt(0, modules.length - 1)],
      modelName: MODELS[randomInt(0, MODELS.length - 1)],
      tokensInput: inp,
      tokensOutput: out,
      durationMs: randomInt(500, 5000),
      costYuan: Number(((inp * 0.001 + out * 0.002) / 1000).toFixed(4)),
      status: Math.random() > 0.05 ? 'success' : 'fail' as const,
    }
  })
}
