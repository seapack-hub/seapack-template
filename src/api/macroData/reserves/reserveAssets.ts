/**
 * 储备资产看板专用 API
 */
import { request } from '@/utils/axios'
import type { RaOverview, RaTrend, RaDetail } from './types'

const BASE_URL = '/api/macro/reserve-assets'

export const ReserveAssetsAPI = {
  /** 概览（KPI 卡片 + 预警） */
  getOverview() {
    return request<any, RaOverview>({ url: `${BASE_URL}/overview`, method: 'get' })
  },

  /** 趋势数据 */
  getTrend(months = 120) {
    return request<any, RaTrend>({ url: `${BASE_URL}/trend`, method: 'get', params: { months } })
  },

  /** 明细表 */
  getDetail(months = 120) {
    return request<any, RaDetail>({ url: `${BASE_URL}/detail`, method: 'get', params: { months } })
  },
}
