import { request } from '@/utils/axios.ts'
import type { Dict, DictQuery } from './types/dict'

export type { Dict, DictQuery }

const USER_BASE_URL = '/api'

export const DictAPI = {
  /** 分页查询字典列表 */
  getList(params?: DictQuery) {
    return request<any, PageResult<Dict[]>>({
      url: `${USER_BASE_URL}/dict/list`, method: 'get', params,
    })
  },
  /** 根据主键ID查询详情 */
  getDetail(id: number) {
    return request<any, Dict>({
      url: `${USER_BASE_URL}/dict/${id}`, method: 'get',
    })
  },
  /** 新增字典 */
  insert(data: Partial<Dict>) {
    return request<any, any>({ url: `${USER_BASE_URL}/dict/insert`, method: 'post', data })
  },
  /** 更新字典 */
  update(data: Dict) {
    return request<any, any>({ url: `${USER_BASE_URL}/dict/update`, method: 'post', data })
  },
  /** 删除字典 */
  delete(id: number) {
    return request<any, any>({ url: `${USER_BASE_URL}/dict/delete/${id}`, method: 'delete' })
  },
}

/** 按类型查询字典列表 */
export const getDictByType = (dictType: string) =>
  DictAPI.getList({ dictType, pageSize: 9999 }).then(res => res.list || [])
