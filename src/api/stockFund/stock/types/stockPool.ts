/**
 * 股票池 & 财务报表 - 类型定义
 */

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
