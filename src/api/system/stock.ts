import { request } from '@/utils/axios'

const STOCK_URL = '/api/stockInfo'
const DIVIDEND_URL = '/api/dividendRule'
const MARKET_URL = '/api/stockMarketData'
const NOTIFY_URL = '/api/notificationLog'

export interface StockInfo {
  id?: number
  stockCode: string
  stockName: string
  exchange: string
  createTime?: string
  updateTime?: string
}

export interface DividendRule {
  id?: number
  stockId: number
  stockName?: string
  triggerRate: number
  emailNotify: string
  phoneNotify: string
  isActive: number
  createTime?: string
  updateTime?: string
}

export interface StockMarketData {
  id?: number
  stockId: number
  stockName?: string
  currentPrice: number
  dividendPerShare: number
  calculatedYield: number
  dataTime: string
  createTime?: string
}

export interface NotificationLog {
  id?: number
  stockId: number
  stockName?: string
  ruleId: number
  triggerYield: number
  notifyType: string
  status: number
  message: string
  createTime?: string
}

export interface StockOverview {
  id: number
  stockCode: string
  stockName: string
  exchange: string
  currentPrice: number
  dividendPerShare: number
  calculatedYield: number
  dataTime: string
  triggerRate: number
  emailNotify: string
  phoneNotify: string
  isActive: number
  createTime: string
  updateTime: string
}

export interface StockPageQuery extends PageQuery {
  keywords?: string
  exchange?: string
  isActive?: number
}

export interface DividendPageQuery extends PageQuery {
  keywords?: string
  isActive?: number
}

export interface MarketPageQuery extends PageQuery {
  keywords?: string
}

export interface NotifyPageQuery extends PageQuery {
  keywords?: string
  notifyType?: string
}

const StockAPI = {
  getList(queryParams: StockPageQuery) {
    const { pageNum, pageSize, ...rest } = queryParams
    return request<any, PageResult<StockInfo[]>>({
      url: `${STOCK_URL}/page`,
      method: 'post',
      params: { pageNum, pageSize },
      data: rest,
    })
  },
  insert(data: StockInfo) {
    return request<any, any>({ url: `${STOCK_URL}/insert`, method: 'post', data })
  },
  update(data: StockInfo) {
    return request<any, any>({ url: `${STOCK_URL}/update`, method: 'post', data })
  },
  delete(id: number) {
    return request<any, any>({ url: `${STOCK_URL}/delete/${id}`, method: 'delete' })
  },
  getDetail(id: number) {
    return request<any, StockInfo>({ url: `${STOCK_URL}/detail/${id}`, method: 'get' })
  },
}

export const DividendRuleAPI = {
  getList(queryParams: DividendPageQuery) {
    const { pageNum, pageSize, ...rest } = queryParams
    return request<any, PageResult<DividendRule[]>>({
      url: `${DIVIDEND_URL}/page`,
      method: 'post',
      params: { pageNum, pageSize },
      data: rest,
    })
  },
  insert(data: DividendRule) {
    return request<any, any>({ url: `${DIVIDEND_URL}/insert`, method: 'post', data })
  },
  update(data: DividendRule) {
    return request<any, any>({ url: `${DIVIDEND_URL}/update`, method: 'post', data })
  },
  delete(id: number) {
    return request<any, any>({ url: `${DIVIDEND_URL}/delete/${id}`, method: 'delete' })
  },
}

export const MarketDataAPI = {
  getList(queryParams: MarketPageQuery) {
    const { pageNum, pageSize, ...rest } = queryParams
    return request<any, PageResult<StockMarketData[]>>({
      url: `${MARKET_URL}/page`,
      method: 'post',
      params: { pageNum, pageSize },
      data: rest,
    })
  },
  insert(data: StockMarketData) {
    return request<any, any>({ url: `${MARKET_URL}/insert`, method: 'post', data })
  },
  delete(id: number) {
    return request<any, any>({ url: `${MARKET_URL}/delete/${id}`, method: 'delete' })
  },
}

export const NotifyLogAPI = {
  getList(queryParams: NotifyPageQuery) {
    const { pageNum, pageSize, ...rest } = queryParams
    return request<any, PageResult<NotificationLog[]>>({
      url: `${NOTIFY_URL}/page`,
      method: 'post',
      params: { pageNum, pageSize },
      data: rest,
    })
  },
  delete(id: number) {
    return request<any, any>({ url: `${NOTIFY_URL}/delete/${id}`, method: 'delete' })
  },
}

export const StockOverviewAPI = {
  getList(queryParams: StockPageQuery) {
    const { pageNum, pageSize, ...rest } = queryParams
    return request<any, PageResult<StockOverview[]>>({
      url: `/api/stockOverview/page`,
      method: 'post',
      params: { pageNum, pageSize },
      data: rest,
    })
  },
}

export default StockAPI
