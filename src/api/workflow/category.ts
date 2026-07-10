/**
 * 工作流分类 API
 */
import { request } from '@/utils/axios'
import type { WorkflowCategory } from './types'

const BASE_URL = '/api/workflows/categories'

export const WorkflowCategoryAPI = {
  /** 分类列表（平铺） */
  list() {
    return request<any, WorkflowCategory[]>({
      url: `${BASE_URL}/all`,
      method: 'get',
    })
  },

  /** 分类树形结构 */
  tree() {
    return request<any, WorkflowCategory[]>({
      url: `${BASE_URL}/tree`,
      method: 'get',
    })
  },

  /** 查询子分类 */
  getChildren(parentId: number) {
    return request<any, WorkflowCategory[]>({
      url: `${BASE_URL}/children/${parentId}`,
      method: 'get',
    })
  },

  /** 查询分类详情 */
  getById(id: number) {
    return request<any, WorkflowCategory>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** 新增分类 */
  insert(data: Partial<WorkflowCategory>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** 编辑分类 */
  update(id: number, data: Partial<WorkflowCategory>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** 启停切换 */
  updateStatus(id: number, status: number) {
    return request<any, any>({
      url: `${BASE_URL}/updateStatus/${id}`,
      method: 'put',
      data: { status },
    })
  },

  /** 删除分类 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'delete',
    })
  },
}
