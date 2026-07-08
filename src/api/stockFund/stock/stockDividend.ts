import { request } from '@/utils/axios.ts'
import type { StockDividend, DividendPageQuery } from './types/stockDividend'

export type { StockDividend, DividendPageQuery }

const BASE_URL = '/api/stockDividend'

export const StockDividendAPI = {
  /** 多条件分页查询分红记录 */
  list(query: DividendPageQuery) {
    return request<any, PageResult<StockDividend[]>>({
      url: `${BASE_URL}/list`,
      method: 'get',
      params: query,
    })
  },

  /** 查询分红详情 */
  detail(id: number) {
    return request<any, StockDividend>({ url: `${BASE_URL}/${id}`, method: 'get' })
  },

  /** 新增分红记录 */
  insert(data: Partial<StockDividend>) {
    return request<any, number>({ url: `${BASE_URL}/insert`, method: 'post', data })
  },

  /** 更新分红记录 */
  update(data: StockDividend) {
    return request<any, number>({ url: `${BASE_URL}/update`, method: 'post', data })
  },

  /** 删除分红记录 */
  delete(id: number) {
    return request<any, number>({ url: `${BASE_URL}/delete/${id}`, method: 'delete' })
  },
}
