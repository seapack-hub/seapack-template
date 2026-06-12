import { request } from '@/utils/axios.ts'

const BASE_URL = '/api/userStockMonitor'

/** 监控阈值项（对应 monitor_threshold_config 表） */
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

export const UserStockMonitorAPI = {
  list(query: UserStockMonitorQuery) {
    return request<any, PageResult<UserStockMonitorVO[]>>({
      url: `${BASE_URL}/list`, method: 'post', data: query,
    })
  },
  add(userId: string, stockCode: string, remark?: string) {
    return request<any, number>({ url: `${BASE_URL}/add`, method: 'post', data: { userId, stockCode, remark } })
  },
  toggle(id: number) {
    return request<any, number>({ url: `${BASE_URL}/toggle/${id}`, method: 'post' })
  },
  delete(id: number) {
    return request<any, number>({ url: `${BASE_URL}/delete/${id}`, method: 'delete' })
  },
  /** 全量保存阈值（先删后插） */
  saveThreshold(monitorId: number, thresholds: ThresholdRowDTO[]) {
    return request<any, void>({
      url: `${BASE_URL}/threshold/save`, method: 'post', data: { monitorId, thresholds },
    })
  },
  /** 查询指定监控记录的所有阈值 */
  thresholdList(monitorId: number) {
    return request<any, ThresholdItem[]>({
      url: `${BASE_URL}/threshold/list/${monitorId}`, method: 'get',
    })
  },
}
