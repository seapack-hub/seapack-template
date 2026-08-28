/**
 * SHIBOR 资金面监控看板专用 API
 */
import { request } from '@/utils/axios'
import type { ShiborOverview, ShiborTrend, ShiborCurve } from './types'

const BASE_URL = '/api/macro/shibor'

export const ShiborAPI = {
  /** 概览（KPI 卡片） */
  getOverview() {
    return request<any, ShiborOverview>({
      url: `${BASE_URL}/overview`,
      method: 'get',
    })
  },

  /** 多期限趋势（8条折线） */
  getTrend(months = 12) {
    return request<any, ShiborTrend>({
      url: `${BASE_URL}/trend`,
      method: 'get',
      params: { months },
    })
  },

  /** 今日期限结构曲线 */
  getCurve() {
    return request<any, ShiborCurve>({
      url: `${BASE_URL}/curve`,
      method: 'get',
    })
  },
}
