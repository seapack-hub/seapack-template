/**
 * Token 用量统计 API
 */
import { request } from '@/utils/axios'
import type {
  TokenUsageDaily,
  TokenUsageLog,
  TokenStatOverview,
  TokenTrendItem,
  TokenModelPieItem,
  TokenSceneBarItem,
  TokenCostSummaryItem,
  TokenStatsQuery,
  RecentCallsQuery,
} from './types/tokenStats'

export type {
  TokenUsageDaily,
  TokenUsageLog,
  TokenStatOverview,
  TokenTrendItem,
  TokenModelPieItem,
  TokenSceneBarItem,
  TokenCostSummaryItem,
  TokenStatsQuery,
  RecentCallsQuery,
}

const BASE_URL = '/api/ai/token-stats'

export const TokenStatsAPI = {
  /** 概览统计 */
  getOverview() {
    return request<any, TokenStatOverview>({
      url: `${BASE_URL}/overview`,
      method: 'get',
    })
  },

  /** 趋势数据（按天聚合） */
  getTrend(query: TokenStatsQuery) {
    return request<any, TokenTrendItem[]>({
      url: `${BASE_URL}/trend`,
      method: 'get',
      params: query,
    })
  },

  /** 模型占比 */
  getModelPie(query: TokenStatsQuery) {
    return request<any, TokenModelPieItem[]>({
      url: `${BASE_URL}/model-pie`,
      method: 'get',
      params: query,
    })
  },

  /** 场景调用柱状图 */
  getSceneBar(query: TokenStatsQuery) {
    return request<any, TokenSceneBarItem[]>({
      url: `${BASE_URL}/scene-bar`,
      method: 'get',
      params: query,
    })
  },

  /** 费用汇总表（按模型聚合） */
  getCostSummary(query: TokenStatsQuery) {
    return request<any, TokenCostSummaryItem[]>({
      url: `${BASE_URL}/cost-summary`,
      method: 'get',
      params: query,
    })
  },

  /** 最近调用记录（分页） */
  getRecentCalls(query: RecentCallsQuery) {
    return request<any, PageResult<TokenUsageLog[]>>({
      url: `${BASE_URL}/recent-calls`,
      method: 'get',
      params: query,
    })
  },
}
