/**
 * Token 用量统计 API
 *
 * 后端接口前缀：/api/ai/token-stats
 */
import { request } from '@/utils/axios'
import type {
  TokenStatOverview,
  TokenTrendItem,
  TokenModelPieItem,
  TokenSceneBarItem,
  TokenCostSummaryItem,
  TokenUserRankItem,
  TokenUsageLog,
  TokenStatsQuery,
  RecentCallsQuery,
  UserRankingQuery,
} from './types/tokenStats'

export type {
  TokenStatOverview,
  TokenTrendItem,
  TokenModelPieItem,
  TokenSceneBarItem,
  TokenCostSummaryItem,
  TokenUserRankItem,
  TokenUsageLog,
  TokenStatsQuery,
  RecentCallsQuery,
  UserRankingQuery,
}

const BASE_URL = '/api/ai/token-stats'

export const TokenStatsAPI = {
  /** 概览统计（今日 vs 昨日对比） */
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

  /** 用户 Token 消耗排行 */
  getUserRanking(query: UserRankingQuery) {
    return request<any, TokenUserRankItem[]>({
      url: `${BASE_URL}/user-ranking`,
      method: 'get',
      params: query,
    })
  },

  /** 最近调用记录（分页） */
  getRecentCalls(query: RecentCallsQuery) {
    return request<any, { list: TokenUsageLog[]; total: number }>({
      url: `${BASE_URL}/recent-calls`,
      method: 'get',
      params: query,
    })
  },
}
