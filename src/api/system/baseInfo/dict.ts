import { request } from '@/utils/axios.ts'
import type { Dict, DictQuery, DictTypeInfo } from './types/dict'

export type { Dict, DictQuery, DictTypeInfo }

const API_BASE = '/api'

// ========== 字典类型 CRUD ==========
export const DictTypeAPI = {
  /** 查询字典类型列表（含每个类型的值数量） */
  listWithCount(params?: { keyword?: string }) {
    return request<any, DictTypeInfo[]>({ url: `${API_BASE}/dict/type/listWithCount`, method: 'get', params })
  },
  /** 查询字典类型列表（不含数量） */
  list(params?: { keyword?: string }) {
    return request<any, DictTypeInfo[]>({ url: `${API_BASE}/dict/type/list`, method: 'get', params })
  },
  /** 新增字典类型 */
  insert(data: { dictType: string, dictName: string, remark?: string, orderNum?: number }) {
    return request<any, DictTypeInfo>({ url: `${API_BASE}/dict/type/insert`, method: 'post', data })
  },
  /** 更新字典类型 */
  update(data: { id: number, dictName?: string, remark?: string, orderNum?: number }) {
    return request<any, void>({ url: `${API_BASE}/dict/type/update`, method: 'post', data })
  },
  /** 删除字典类型（同时删除该类型下所有字典值） */
  delete(id: number) {
    return request<any, void>({ url: `${API_BASE}/dict/type/delete/${id}`, method: 'delete' })
  },
}

// ========== 字典值 CRUD ==========
export const DictAPI = {
  /** 分页查询字典列表 */
  getList(params?: DictQuery) {
    return request<any, PageResult<Dict[]>>({
      url: `${API_BASE}/dict/list`, method: 'get', params,
    })
  },
  /** 根据主键ID查询详情 */
  getDetail(id: number) {
    return request<any, Dict>({ url: `${API_BASE}/dict/${id}`, method: 'get' })
  },
  /** 新增字典值 */
  insert(data: Partial<Dict>) {
    return request<any, any>({ url: `${API_BASE}/dict/insert`, method: 'post', data })
  },
  /** 更新字典值 */
  update(data: Dict) {
    return request<any, any>({ url: `${API_BASE}/dict/update`, method: 'post', data })
  },
  /** 删除字典值 */
  delete(id: number) {
    return request<any, any>({ url: `${API_BASE}/dict/delete/${id}`, method: 'delete' })
  },
}

/**
 * 按字典类型查询所有启用的字典值（不分页）
 * 使用新的轻量接口，不再通过分页接口查询
 */
export const getDictByType = (dictType: string) =>
  request<any, Dict[]>({ url: `${API_BASE}/dict/listByType`, method: 'get', params: { dictType } })
