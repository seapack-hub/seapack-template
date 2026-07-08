/**
 * 用户监控股票 - 类型定义
 */

/** 监控阈值项 */
export interface ThresholdItem {
  id?: number
  monitorId?: number
  thresholdRate: number
  triggerType: 'CROSS_UP' | 'CROSS_DOWN'
}

/** 保存阈值时传入的行数据结构 */
export interface ThresholdRowDTO {
  type: 'CROSS_UP' | 'CROSS_DOWN'
  rate: number
}

/** 用户监控股票 VO */
export interface UserStockMonitorVO {
  monitorId: number
  stockCode: string
  stockName: string
  isActive: number
  remark?: string
  thresholds: string
}

/** 监控池分页查询参数 */
export interface UserStockMonitorQuery {
  userId?: string
  stockCode?: string
  stockName?: string
  isActive?: number
  pageNum: number
  pageSize: number
}
