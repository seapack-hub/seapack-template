import { request } from '@/utils/axios.ts'

/* ==================== 日 K 线接口（StockDailyController） ==================== */

/** 日 K 线数据 DTO */
export interface StockDailyKlineDto {
  symbol: string
  name: string
  timestamp: number
  tradeDate: string
  tradeTime: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount: number
}

export const StockDailyAPI = {
  /** 查询股票日 K 线，stockCode 为 6 位纯数字，日期格式 yyyy-MM-dd，不传日期默认最近 3 个月 */
  klines(stockCode: string, startDate?: string, endDate?: string) {
    return request<any, StockDailyKlineDto[]>({
      url: '/api/stockDaily/klines',
      method: 'get',
      params: { stockCode, startDate, endDate },
    })
  },
}

/* ==================== 标的池接口（InstrumentController） ==================== */

/** 标的 DTO */
export interface InstrumentDto {
  symbol: string
  exchange: string
  code: string
  name: string
  region: string
  type: string
  extType: string
  listingDate: string
  totalShares: number
  floatShares: number
  tickSize: number
  limitUp: number
  limitDown: number
}

export const InstrumentAPI = {
  /** 查询全部标的池列表 */
  list() {
    return request<any, InstrumentDto[]>({ url: '/api/instrument/list', method: 'get' })
  },

  /** 根据纯数字股票代码查询 */
  getByCode(code: string) {
    return request<any, InstrumentDto[]>({ url: `/api/instrument/${code}`, method: 'get' })
  },

  /** 根据带交易所后缀的 symbol 查询 */
  getBySymbol(symbol: string) {
    return request<any, InstrumentDto[]>({ url: `/api/instrument/symbol/${symbol}`, method: 'get' })
  },
}
