/**
 * Token 用量统计 - 类型定义
 *
 * 后端接口：/api/ai/token-stats/*
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

/** 调用明细（对应 ai_token_usage_log 表） */
export interface TokenUsageLog {
  id: number
  callTime: string
  bizType?: string
  bizId?: number
  bizName?: string
  conversationId?: string
  sceneId?: number
  requestId?: string
  outputResult?: string
  traceSnapshot?: string
  totalDurationMs?: number
  tokensPrompt?: number
  tokensCompletion?: number
  tokensTotal?: number
  modelName?: string
  status?: string
  errorMessage?: string
  createdBy?: number
  createdAt?: string
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

/** 用户 Token 消耗排行 */
export interface TokenUserRankItem {
  userId: number
  userName: string
  callCount: number
  tokensInput: number
  tokensOutput: number
  tokensTotal: number
  totalCostYuan: number
}

// ===== 查询参数 =====

/** 通用统计查询参数 */
export interface TokenStatsQuery {
  /** 起始日期 YYYY-MM-DD */
  startDate: string
  /** 结束日期 YYYY-MM-DD */
  endDate: string
  /** 用户ID（可选） */
  userId?: number
  /** 用途（可选）：orchestration / agent / chat / skill */
  bizType?: string
  /** 模型编码（可选） */
  modelName?: string
}

/** 最近调用记录查询参数 */
export interface RecentCallsQuery {
  pageNum: number
  pageSize: number
  startDate?: string
  endDate?: string
  userId?: number
  bizType?: string
  modelName?: string
  status?: string
}

/** 用户排行查询参数 */
export interface UserRankingQuery {
  startDate: string
  endDate: string
  limit?: number
}
