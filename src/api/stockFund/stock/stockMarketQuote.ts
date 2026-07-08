import { request } from '@/utils/axios.ts'
import type { StockMarketQuoteDto, StockMarketQuoteQuery } from './types/stockMarketQuote'

export type { StockMarketQuoteDto, StockMarketQuoteQuery }

const BASE_URL = '/api/stockMarketQuote'

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
