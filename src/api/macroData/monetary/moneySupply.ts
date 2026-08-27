/**
 * 货币供应量看板专用 API
 */
import { request } from '@/utils/axios'
import type {
  MoneySupplyOverview,
  MoneySupplyTrend,
  MoneySupplyScissors,
  MoneySupplyStructure,
  ScissorsVsStock,
  M2VsCpi,
  SocialFinanceVsM2,
} from './types'

const BASE_URL = '/api/macro/money-supply'

export const MoneySupplyAPI = {
  /** 总览（KPI 卡片） */
  getOverview(months = 36) {
    return request<any, MoneySupplyOverview>({
      url: `${BASE_URL}/overview`,
      method: 'get',
      params: { months },
    })
  },

  /** 趋势（双Y轴：余额 + 同比增速） */
  getTrend(months = 36) {
    return request<any, MoneySupplyTrend>({
      url: `${BASE_URL}/trend`,
      method: 'get',
      params: { months },
    })
  },

  /** M1-M2 剪刀差走势 */
  getScissors(months = 36) {
    return request<any, MoneySupplyScissors>({
      url: `${BASE_URL}/scissors`,
      method: 'get',
      params: { months },
    })
  },

  /** 货币结构占比（环形图） */
  getStructure() {
    return request<any, MoneySupplyStructure>({
      url: `${BASE_URL}/structure`,
      method: 'get',
    })
  },

  /** 剪刀差 vs 上证指数（跨市场关联） */
  getCorrelationScissorsStock(months = 36) {
    return request<any, ScissorsVsStock>({
      url: `${BASE_URL}/correlation/scissors-stock`,
      method: 'get',
      params: { months },
    })
  },

  /** M2 增速 vs CPI/PPI */
  getCorrelationM2Cpi(months = 36) {
    return request<any, M2VsCpi>({
      url: `${BASE_URL}/correlation/m2-cpi`,
      method: 'get',
      params: { months },
    })
  },

  /** 社融增量 vs M2 增速 */
  getCorrelationSfM2(months = 36) {
    return request<any, SocialFinanceVsM2>({
      url: `${BASE_URL}/correlation/sf-m2`,
      method: 'get',
      params: { months },
    })
  },
}
