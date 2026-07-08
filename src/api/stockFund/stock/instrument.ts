import { request } from '@/utils/axios.ts'
import type { StockDailyKlineDto, InstrumentDto } from './types/instrument'

export type { StockDailyKlineDto, InstrumentDto }

/* ==================== 日 K 线接口（StockDailyController） ==================== */

export const StockDailyAPI = {
  /** 查询股票日 K 线 */
  klines(stockCode: string, startDate?: string, endDate?: string) {
    return request<any, StockDailyKlineDto[]>({
      url: '/api/stockDaily/klines',
      method: 'get',
      params: { stockCode, startDate, endDate },
    })
  },
}

/* ==================== 标的池接口（InstrumentController） ==================== */

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
