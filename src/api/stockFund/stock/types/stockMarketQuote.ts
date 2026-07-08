/**
 * 股票行情 - 类型定义
 */

/** 行情 DTO */
export interface StockMarketQuoteDto {
  /** 股票代码 */
  stockCode: string
  /** 股票名称 */
  stockName: string
  /** 交易所代码（SH / SZ） */
  exchange: string
  /** 交易所中文名称（沪市 / 深市） */
  exchangeName: string
  /** 行业代码 */
  industry: string
  /** 行业中文名称 */
  industryName: string
  /** 最新成交价 */
  currentPrice: number
  /** 今日开盘价 */
  openPrice: number
  /** 今日最高价 */
  highPrice: number
  /** 今日最低价 */
  lowPrice: number
  /** 每股股息 */
  dividendPerShare: number
  /** 动态股息率（%） */
  dynamicYield: number
  /** 交易日 */
  tradeDate: string
  /** 行情更新时间 */
  quoteUpdateTime: string
  /** 搜索关键字（冗余字段） */
  keywords?: string
  /** 最近一次分红年份 */
  latestDividendYear: number
  /** 最近一次分红类型（INTERIM / FINAL） */
  latestDividendType: string
  /** 最近一次每股派息（元） */
  latestCashPerShare: number
  /** 最近一次送股（每10股） */
  latestBonusSharesPer10: number
  /** 最近一次转增（每10股） */
  latestTransferSharesPer10: number
  /** 最近一次分红方案描述 */
  latestPlanText: string
  /** 涨跌幅（%） */
  changePercent: number
  /** 静态股息率（%） */
  dividendYield: number
}

/** 行情分页查询参数 */
export interface StockMarketQuoteQuery {
  stockCode?: string
  stockName?: string
  exchange?: string
  industry?: string
  keywords?: string
  pageNum: number
  pageSize: number
}
