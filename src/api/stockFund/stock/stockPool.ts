import { request } from '@/utils/axios.ts'
import type {
  StockInfo,
  StockMarketData,
  StockPageQuery,
  MarketQuery,
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
} from './types/stockPool'

export type {
  StockInfo,
  StockMarketData,
  StockPageQuery,
  MarketQuery,
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
}

const BASE_URL = '/api/stockInfo'

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

// ==================== 三大财务报表 ====================

export const FinancialAPI = {
  /** 查询资产负债表 */
  balanceSheet(stockId: string) {
    return request<any, BalanceSheet[]>({
      url: `${BASE_URL}/finance/balance/${stockId}`, method: 'get',
    })
  },
  /** 查询利润表 */
  incomeStatement(stockId: string) {
    return request<any, IncomeStatement[]>({
      url: `${BASE_URL}/finance/income/${stockId}`, method: 'get',
    })
  },
  /** 查询现金流量表 */
  cashFlow(stockId: string) {
    return request<any, CashFlowStatement[]>({
      url: `${BASE_URL}/finance/cashflow/${stockId}`, method: 'get',
    })
  },
}
