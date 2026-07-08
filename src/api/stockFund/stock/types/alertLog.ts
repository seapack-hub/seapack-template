/**
 * 预警日志 - 类型定义
 */

export interface AlertLogDto {
  id: number
  ruleId: number
  triggeredRate: number
  triggeredPrice: number
  sentTime: string
}

export interface AlertLogQuery {
  userId: number | string
  pageNum: number
  pageSize: number
  stockCode?: string
  startTime?: string
  endTime?: string
}
