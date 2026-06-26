import { request } from '@/utils/axios'

const BASE_URL = '/api/alertLog'

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

export const AlertLogAPI = {
  listByUser(query: AlertLogQuery) {
    const { userId, pageNum, pageSize, stockCode, startTime, endTime } = query
    return request<any, PageResult<AlertLogDto[]>>({
      url: `${BASE_URL}/listByUser/${userId}`,
      method: 'get',
      params: { pageNum, pageSize, stockCode, startTime, endTime },
    })
  },
}
