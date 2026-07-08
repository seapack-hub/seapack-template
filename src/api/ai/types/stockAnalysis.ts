/**
 * AI 个股诊断 - 类型定义
 */

/** 个股诊断请求参数 */
export interface StockAnalyzeRequest {
  /** 股票代码，如 600519 */
  stockCode: string
  /** 分析维度（可选），如 technical / fundamental / dividend / all */
  dimension?: string
  /** 额外补充问题（可选） */
  question?: string
}

/** 个股诊断响应 */
export interface StockAnalyzeResponse {
  /** 分析结论（Markdown） */
  content: string
  /** 股票代码 */
  stockCode: string
  /** 股票名称 */
  stockName?: string
  /** 分析耗时（毫秒） */
  costTime?: number
}
