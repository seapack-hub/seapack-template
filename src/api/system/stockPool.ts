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

// ==================== 三大财务报表 ====================

/** 资产负债表 */
export interface BalanceSheet {
  id?: number
  stockId: number
  reportDate: string
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  currentAssets: number
  nonCurrentAssets: number
  currentLiabilities: number
  nonCurrentLiabilities: number
  accountsReceivable: number
  inventory: number
  cashAndEquivalents: number
  createTime?: string
}

/** 利润表 */
export interface IncomeStatement {
  id?: number
  stockId: number
  reportDate: string
  revenue: number
  costOfSales: number
  grossProfit: number
  operatingExpenses: number
  operatingProfit: number
  netProfit: number
  eps: number
  createTime?: string
}

/** 现金流量表 */
export interface CashFlowStatement {
  id?: number
  stockId: number
  reportDate: string
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  freeCashFlow: number
  createTime?: string
}

/* ==================== 东方财富行情接口 ==================== */

/** 历史K线数据 */
export interface StockHistoryData {
  tradeDate: string
  openPrice: number
  closePrice: number
  highPrice: number
  lowPrice: number
  volume: number
  turnover: number
  amplitude: number
}

/** 实时行情 */
export interface RealtimeQuote {
  openPrice: number
  closePrice: number
  highPrice: number
  lowPrice: number
  currentPrice: number
  previousClose: number
  volume: number
  turnover: number
  changePct: number
  amplitude: number
}

/** 龙虎榜条目 */
export interface BillboardItem {
  tradeDate: string
  stockCode: string
  stockName: string
  buyAmount: number
  sellAmount: number
  netAmount: number
  reason: string
}

export const EastMoneyAPI = {
  /** 获取历史K线数据（格式：code, start=yyyMMdd, end=yyyyMMdd） */
  history(code: string, start?: string, end?: string) {
    return request<any, StockHistoryData[]>({
      url: '/api/eastmoney/history',
      method: 'get',
      params: { code, start, end },
    })
  },

  /** 获取实时行情 */
  realtime(code: string) {
    return request<any, RealtimeQuote>({
      url: '/api/eastmoney/realtime',
      method: 'get',
      params: { code },
    })
  },

  /** 获取龙虎榜详情（date 格式 yyyy-MM-dd） */
  billboard(code: string, date?: string) {
    return request<any, BillboardItem[]>({
      url: '/api/eastmoney/billboard',
      method: 'get',
      params: { code, date },
    })
  },
}

export const FinancialAPI = {
  /** 查询资产负债表 */
  balanceSheet(stockId: number) {
    return request<any, BalanceSheet[]>({
      url: `${BASE_URL}/finance/balance/${stockId}`, method: 'get',
    })
  },
  /** 查询利润表 */
  incomeStatement(stockId: number) {
    return request<any, IncomeStatement[]>({
      url: `${BASE_URL}/finance/income/${stockId}`, method: 'get',
    })
  },
  /** 查询现金流量表 */
  cashFlow(stockId: number) {
    return request<any, CashFlowStatement[]>({
      url: `${BASE_URL}/finance/cashflow/${stockId}`, method: 'get',
    })
  },
}
