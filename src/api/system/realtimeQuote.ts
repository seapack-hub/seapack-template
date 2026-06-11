import { request } from '@/utils/axios'

const BASE_URL = '/api/stockRealtimeQuote'

/** 股票实时行情（对应 stock_realtime_quote 表） */
export interface StockRealtimeQuote {
  id?: number
  stockCode: string
  currentPrice: number
  openPrice?: number
  highPrice?: number
  lowPrice?: number
  dynamicYield?: number
  tradeDate: string
  updateTime?: string
}

/** 实时行情分页查询参数 */
export interface RealtimeQuoteQuery {
  stockCode?: string
  tradeDate?: string
  pageNum: number
  pageSize: number
}

/** iTick WebSocket 推送的行情数据格式 */
export interface ITickQuote {
  symbol: string
  price: number
  open: number
  high: number
  low: number
  volume: number
  timestamp: number
}

/** 实时行情 API */
export const RealtimeQuoteAPI = {
  page(query: RealtimeQuoteQuery) {
    return request<any, PageResult<StockRealtimeQuote[]>>({
      url: `${BASE_URL}/page`, method: 'post', data: query,
    })
  },
  latest(stockCode: string) {
    return request<any, StockRealtimeQuote>({
      url: `${BASE_URL}/latest/${stockCode}`, method: 'get',
    })
  },
  listByDate(stockCode: string, tradeDate?: string) {
    return request<any, StockRealtimeQuote[]>({
      url: `${BASE_URL}/list`, method: 'get', params: { stockCode, tradeDate },
    })
  },
}
