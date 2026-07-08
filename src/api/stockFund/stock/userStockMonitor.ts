import { request } from '@/utils/axios.ts'
import type {
  ThresholdItem,
  ThresholdRowDTO,
  UserStockMonitorVO,
  UserStockMonitorQuery,
} from './types/userStockMonitor'

export type {
  ThresholdItem,
  ThresholdRowDTO,
  UserStockMonitorVO,
  UserStockMonitorQuery,
}

const BASE_URL = '/api/userStockMonitor'

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
