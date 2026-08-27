/**
 * LPR 利率看板专用 API
 */
import { request } from '@/utils/axios'
import type { LprOverview, LprTrend } from '../types'

const BASE_URL = '/api/macro/lpr'

export const LprAPI = {
  /** 最新 LPR 概览（KPI 卡片） */
  getOverview() {
    return request<any, LprOverview>({ url: `${BASE_URL}/overview`, method: 'get' })
  },

  /** LPR 走势（阶梯折线图） */
  getTrend(months = 120) {
    return request<any, LprTrend>({ url: `${BASE_URL}/trend`, method: 'get', params: { months } })
  },
}
