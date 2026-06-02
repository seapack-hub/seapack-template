import { request } from '@/utils/axios'

const BASE_URL = '/api/stockInfo'

/** 股票基础信息 */
export interface StockInfo {
  stockId?: number
  stockCode: string
  stockName: string
  exchange?: string
  industry?: string
  createdAt?: string
  updatedAt?: string
}

/** 股票行情数据 */
export interface StockMarketData {
  id?: number
  stockId: number
  stockName?: string
  currentPrice: number
  dividendPerShare?: number
  calculatedYield?: number
  dataTime?: string
  createTime?: string
}

/** 分页查询参数 */
export interface StockPageQuery extends PageQuery {
  keywords?: string
  exchange?: string
  industry?: string
  stockCode?: string
  stockName?: string
}

/** 行情查询参数 */
export interface MarketQuery {
  stockId?: number
  stockCode?: string
  startDate?: string
  endDate?: string
}

export const StockInfoAPI = {
  /** 分页查询股票列表 */
  page(query: StockPageQuery) {
    const { pageNum, pageSize, ...rest } = query
    return request<any, PageResult<StockInfo[]>>({
      url: `${BASE_URL}/page`,
      method: 'post',
      params: { pageNum, pageSize },
      data: rest,
    })
  },

  /** 查询全部股票列表（不分页） */
  list(param?: Partial<StockInfo>) {
    return request<any, StockInfo[]>({
      url: `${BASE_URL}/list`,
      method: 'get',
      params: param,
    })
  },

  /** 新增股票 */
  insert(data: Partial<StockInfo>) {
    return request<any, number>({ url: `${BASE_URL}/insert`, method: 'post', data })
  },

  /** 更新股票信息 */
  update(data: StockInfo) {
    return request<any, number>({ url: `${BASE_URL}/update`, method: 'post', data })
  },

  /** 删除股票 */
  delete(stockId: number) {
    return request<any, number>({ url: `${BASE_URL}/delete/${stockId}`, method: 'delete' })
  },

  /** 根据ID查询股票详情 */
  detail(stockId: number) {
    return request<any, StockInfo>({ url: `${BASE_URL}/detail/${stockId}`, method: 'get' })
  },

  /** 根据股票代码查询 */
  byCode(stockCode: string) {
    return request<any, StockInfo>({ url: `${BASE_URL}/code/${stockCode}`, method: 'get' })
  },
}

export const MarketDataAPI = {
  /** 查询股票最新行情 */
  latest(stockId: number) {
    return request<any, StockMarketData>({
      url: `${BASE_URL}/market/latest/${stockId}`,
      method: 'get',
    })
  },

  /** 查询股票历史分红趋势 */
  history(stockId: number) {
    return request<any, StockMarketData[]>({
      url: `${BASE_URL}/market/history/${stockId}`,
      method: 'get',
    })
  },

  /** 多条件查询行情数据 */
  list(param?: Partial<StockMarketData>) {
    return request<any, StockMarketData[]>({
      url: `${BASE_URL}/market/list`,
      method: 'get',
      params: param,
    })
  },
}

export const DividendAPI = {
  /** 统计全市场平均股息率 */
  averageDividendYield() {
    return request<any, Record<string, any>[]>({
      url: `${BASE_URL}/dividend/average`,
      method: 'get',
    })
  },
}
