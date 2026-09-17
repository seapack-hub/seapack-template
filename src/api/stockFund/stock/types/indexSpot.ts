/**
 * 大盘指数 - 类型定义
 */

/** 大盘指数实时行情 */
export interface IndexSpot {
  /** 指数代码，如 000001 */
  indexCode: string
  /** 指数名称，如 上证指数 */
  indexName: string
  /** 最新价 */
  latestPrice: number | null
  /** 涨跌幅(%)，可能为 null */
  changePct: number | null
  /** 涨跌额，可能为 null */
  changeAmt: number | null
  /** 开盘价 */
  openPrice: number | null
  /** 最高价 */
  highPrice: number | null
  /** 最低价 */
  lowPrice: number | null
  /** 昨收价 */
  prevClose: number | null
  /** 成交量(手) */
  volume: number | null
  /** 成交额(元) */
  turnover: number | null
  /** 交易日期 */
  tradeDate: string | null
  /** 展示排序 */
  sortOrder: number | null
}
