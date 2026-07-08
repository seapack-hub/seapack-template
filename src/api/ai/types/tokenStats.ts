/**
 * Token 用量统计 - 类型定义
 */

/** 日统计汇总（对应 ai_token_usage_daily 表） */
export interface TokenUsageDaily {
  id: number
  statDate: string
  modelName: string
  agentId?: number
  skillId?: number
  sceneId?: number
  moduleKey?: string
  callCount: number
  successCount: number
  failCount: number
  tokensInput: number
  tokensOutput: number
  tokensTotal: number
  totalDurationMs: number
  totalCostYuan: number
}

/** 调用明细（需 ai_token_usage_log 表支持） */
export interface TokenUsageLog {
  id: number
  callTime: string
  moduleKey: string
  modelName: string
  agentId?: number
  agentName?: string
  sceneId?: number
  sceneName?: string
  tokensInput: number
  tokensOutput: number
  durationMs: number
  costYuan: number
  status: 'success' | 'fail'
  errorMsg?: string
}

/** 概览统计 */
export interface TokenStatOverview {
  todayCalls: number
  todayTokens: number
  todayCost: number
  successRate: number
  yesterdayCalls: number
  yesterdayTokens: number
  yesterdayCost: number
  yesterdaySuccessRate: number
}

/** 趋势数据（按天聚合） */
export interface TokenTrendItem {
  date: string
  tokensInput: number
  tokensOutput: number
  tokensTotal: number
  callCount: number
}

/** 模型占比 */
export interface TokenModelPieItem {
  modelName: string
  tokensTotal: number
  callCount: number
}

/** 场景柱状图 */
export interface TokenSceneBarItem {
  sceneId: number
  sceneName: string
  callCount: number
  tokensTotal: number
}

/** 费用汇总 */
export interface TokenCostSummaryItem {
  modelName: string
  callCount: number
  tokensInput: number
  tokensOutput: number
  tokensTotal: number
  totalCostYuan: number
  avgDurationMs: number
}

// ===== 查询参数 =====

export interface TokenStatsQuery {
  /** 起始日期 YYYY-MM-DD */
  startDate: string
  /** 结束日期 YYYY-MM-DD */
  endDate: string
  /** 模型编码（可选筛选） */
  modelName?: string
  /** 模块 key（可选筛选） */
  moduleKey?: string
}

export interface RecentCallsQuery {
  pageNum: number
  pageSize: number
  startDate?: string
  endDate?: string
  modelName?: string
  moduleKey?: string
  status?: 'success' | 'fail'
}
