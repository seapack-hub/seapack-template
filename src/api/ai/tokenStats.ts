/**
 * Token 用量统计 API
 *
 * 后端需实现以下接口：
 *
 * 1. GET  /api/ai/token-stats/overview        → 概览（今日/昨日汇总）
 * 2. GET  /api/ai/token-stats/trend           → 趋势（按天聚合）
 * 3. GET  /api/ai/token-stats/model-pie       → 模型占比
 * 4. GET  /api/ai/token-stats/scene-bar       → 场景调用柱状图
 * 5. GET  /api/ai/token-stats/cost-summary    → 费用汇总表
 * 6. GET  /api/ai/token-stats/recent-calls    → 最近调用记录
 *
 * 注意：最近调用记录需要一张明细表（ai_token_usage_log），
 *       ai_token_usage_daily 是聚合表，不含单次调用明细。
 */
import { request } from '@/utils/axios'

const BASE_URL = '/api/ai/token-stats'

// ===== 实体类型 =====

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

// ===== API 方法 =====

export const TokenStatsAPI = {
  /**
   * 概览统计
   * 后端逻辑：分别查询今日和昨日的聚合数据，返回对比结果
   * SQL: SELECT stat_date, SUM(call_count), SUM(success_count), SUM(tokens_total), SUM(total_cost_yuan)
   *      FROM ai_token_usage_daily WHERE stat_date IN (CURDATE(), CURDATE()-1) GROUP BY stat_date
   */
  getOverview() {
    return request<any, TokenStatOverview>({
      url: `${BASE_URL}/overview`,
      method: 'get',
    })
  },

  /**
   * 趋势数据（按天聚合）
   * 后端逻辑：按 stat_date 分组聚合
   * SQL: SELECT stat_date, SUM(tokens_input), SUM(tokens_output), SUM(tokens_total), SUM(call_count)
   *      FROM ai_token_usage_daily WHERE stat_date BETWEEN ? AND ? GROUP BY stat_date ORDER BY stat_date
   */
  getTrend(query: TokenStatsQuery) {
    return request<any, TokenTrendItem[]>({
      url: `${BASE_URL}/trend`,
      method: 'get',
      params: query,
    })
  },

  /**
   * 模型占比
   * 后端逻辑：按 model_name 分组聚合
   * SQL: SELECT model_name, SUM(tokens_total), SUM(call_count)
   *      FROM ai_token_usage_daily WHERE stat_date BETWEEN ? AND ? GROUP BY model_name
   */
  getModelPie(query: TokenStatsQuery) {
    return request<any, TokenModelPieItem[]>({
      url: `${BASE_URL}/model-pie`,
      method: 'get',
      params: query,
    })
  },

  /**
   * 场景调用柱状图
   * 后端逻辑：按 scene_id 关联 ai_scene 表，分组聚合
   * SQL: SELECT d.scene_id, s.name, SUM(d.call_count), SUM(d.tokens_total)
   *      FROM ai_token_usage_daily d LEFT JOIN ai_scene s ON d.scene_id = s.id
   *      WHERE d.stat_date BETWEEN ? AND ? AND d.scene_id IS NOT NULL GROUP BY d.scene_id
   */
  getSceneBar(query: TokenStatsQuery) {
    return request<any, TokenSceneBarItem[]>({
      url: `${BASE_URL}/scene-bar`,
      method: 'get',
      params: query,
    })
  },

  /**
   * 费用汇总表（按模型聚合）
   * 后端逻辑：按 model_name 分组聚合，计算平均耗时
   * SQL: SELECT model_name, SUM(call_count), SUM(tokens_input), SUM(tokens_output),
   *          SUM(tokens_total), SUM(total_cost_yuan), AVG(total_duration_ms/call_count)
   *      FROM ai_token_usage_daily WHERE stat_date BETWEEN ? AND ? GROUP BY model_name ORDER BY total_cost_yuan DESC
   */
  getCostSummary(query: TokenStatsQuery) {
    return request<any, TokenCostSummaryItem[]>({
      url: `${BASE_URL}/cost-summary`,
      method: 'get',
      params: query,
    })
  },

  /**
   * 最近调用记录（分页）
   * 需要 ai_token_usage_log 明细表支持
   * SQL: SELECT * FROM ai_token_usage_log ORDER BY call_time DESC LIMIT ?, ?
   */
  getRecentCalls(query: RecentCallsQuery) {
    return request<any, PageResult<TokenUsageLog[]>>({
      url: `${BASE_URL}/recent-calls`,
      method: 'get',
      params: query,
    })
  },
}
