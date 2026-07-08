/**
 * 股票分红 - 类型定义
 */

/** 股票分红记录实体 */
export interface StockDividend {
  id?: number
  /** 关联股票代码，如 600519 */
  stockCode: string
  /** 分红所属年份 */
  year: number
  /** 分红类型：INTERIM-中期分红, FINAL-末期分红/年度分红 */
  dividendType: string
  /** 每股派发现金金额(元) */
  cashPerShare: number
  /** 每10股送红股数量(股) */
  bonusSharesPer10?: number
  /** 每10股转增股本数量(股) */
  transferSharesPer10?: number
  /** 分红方案原文，如: 10派5元送3股转2股 */
  planText?: string
  /** 预案公告日期 */
  announcementDate?: string
  /** 除权除息日 */
  exDividendDate?: string
  /** 实施状态：PROPOSED-预案, APPROVED-已批准, IMPLEMENTED-已实施 */
  status: string
  /** 创建时间 */
  createdAt?: string
  /** 分红类型名称（字典关联，非数据库字段） */
  dividendTypeName?: string
  /** 实施状态名称（字典关联，非数据库字段） */
  statusName?: string
  /** 股票名称（关联查询，非数据库字段） */
  stockName?: string
}

/** 分红分页查询参数 */
export interface DividendPageQuery {
  pageNum: number
  pageSize: number
  /** 股票代码（精确匹配） */
  stockCode?: string
  /** 分红年份（精确匹配） */
  year?: number
  /** 分红类型：INTERIM-中期分红, FINAL-末期分红 */
  dividendType?: string
  /** 实施状态：PROPOSED-预案, APPROVED-已批准, IMPLEMENTED-已实施 */
  status?: string
  /** 关键字（模糊匹配股票代码或名称） */
  keyword?: string
}
