/**
 * 工作流统计 API
 */
import { request } from '@/utils/axios'
import type { WorkflowStats, StatsQuery, StatsOverview } from './types'

const BASE_URL = '/api/workflows/stats'

export const StatsAPI = {
  /** 总览统计 */
  overview() {
    return request<any, StatsOverview>({
      url: `${BASE_URL}/overview`,
      method: 'get',
    })
  },

  /** 按工作流查询统计 */
  byWorkflow(query: StatsQuery) {
    return request<any, WorkflowStats[]>({
      url: `${BASE_URL}/byWorkflow`,
      method: 'get',
      params: query,
    })
  },

  /** 按日期查询统计 */
  byDate(query: StatsQuery & { granularity?: 'day' | 'week' | 'month' }) {
    return request<any, WorkflowStats[]>({
      url: `${BASE_URL}/byDate`,
      method: 'get',
      params: query,
    })
  },

  /** 热门工作流排行 */
  topWorkflows(limit?: number) {
    return request<any, Array<{ workflowId: number; workflowName: string; totalRuns: number; successRate: number }>>({
      url: `${BASE_URL}/topWorkflows`,
      method: 'get',
      params: { limit: limit || 10 },
    })
  },
}
