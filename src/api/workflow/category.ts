/**
 * 工作流分类 API
 */
import { request } from '@/utils/axios'
import type { WorkflowCategory } from './types'

const BASE_URL = '/api/workflows'

export const WorkflowCategoryAPI = {
  /** 分类列表 */
  list() {
    return request<any, WorkflowCategory[]>({
      url: `${BASE_URL}/categories/all`,
      method: 'get',
    })
  },

  /** 新增分类 */
  insert(data: Partial<WorkflowCategory>) {
    return request<any, any>({
      url: `${BASE_URL}/categories/insert`,
      method: 'post',
      data,
    })
  },

  /** 编辑分类 */
  update(id: number, data: Partial<WorkflowCategory>) {
    return request<any, any>({
      url: `${BASE_URL}/categories/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** 删除分类 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/categories/delete/${id}`,
      method: 'delete',
    })
  },
}
