/**
 * 股票标的 & K线 - 类型定义
 */

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
