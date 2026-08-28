/**
 * 社会融资规模看板专用 API
 */
import { request } from '@/utils/axios'
import type { SfOverview, SfTrend, SfStructure } from './types'

const BASE_URL = '/api/macro/social-finance'

export const SocialFinanceAPI = {
  /** 概览（KPI 卡片） */
  getOverview() {
    return request<any, SfOverview>({
      url: `${BASE_URL}/overview`,
      method: 'get',
    })
  },

  /** 趋势数据（双轴图 + 信用脉冲） */
  getTrend(months = 36) {
    return request<any, SfTrend>({
      url: `${BASE_URL}/trend`,
      method: 'get',
      params: { months },
    })
  },

  /** 结构贡献图（百分比堆叠） */
  getStructure(months = 24) {
    return request<any, SfStructure>({
      url: `${BASE_URL}/structure`,
      method: 'get',
      params: { months },
    })
  },
}
