import { request } from '@/utils/axios.ts'
import type { IndexSpot } from './types/indexSpot'

export type { IndexSpot }

const BASE_URL = '/api/stock/index-spot'

export const IndexSpotAPI = {
  /** 查询所有大盘指数（按 sort_order 排序） */
  list() {
    return request<any, IndexSpot[]>({
      url: `${BASE_URL}/list`,
      method: 'get',
    })
  },
}
