import { request } from '@/utils/axios'

const BASE_URL = '/api/stockMarketQuote'

/** 行情 DTO（对应 StockMarketQuoteDto） */
export interface StockMarketQuoteDto {
  stockCode: string
  stockName: string
  exchange: string
  exchangeName: string
  industry: string
  industryName: string
  currentPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  dividendPerShare: number
  dynamicYield: number
  tradeDate: string
  quoteUpdateTime: string
  keywords?: string
  latestDividendYear: number
  latestDividendType: string
  latestCashPerShare: number
  latestBonusSharesPer10: number
  latestTransferSharesPer10: number
  latestPlanText: string
  changePercent: number
  dividendYield: number
}

/** 行情分页参数 */
export interface StockMarketQuoteQuery {
  stockCode?: string
  stockName?: string
  exchange?: string
  industry?: string
  keywords?: string
  pageNum: number
  pageSize: number
}

export const StockMarketQuoteAPI = {
  page(query: StockMarketQuoteQuery) {
    const { pageNum, pageSize, ...rest } = query
    return request<any, PageResult<StockMarketQuoteDto[]>>({
      url: `${BASE_URL}/page`,
      method: 'post',
      params: { pageNum, pageSize },
      data: rest,
    })
  },
}
