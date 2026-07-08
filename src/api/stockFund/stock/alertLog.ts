import { request } from '@/utils/axios'
import type { AlertLogDto, AlertLogQuery } from './types/alertLog'

export type { AlertLogDto, AlertLogQuery }

const BASE_URL = '/api/alertLog'

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
