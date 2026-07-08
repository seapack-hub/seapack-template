import { request } from '@/utils/axios'
import type { Permission, PermissionTree } from './types/permission'

export type { Permission, PermissionTree }

const BASE_URL = '/api/sys/permissions'

export const PermissionAPI = {
  /** 获取权限树 */
  getTree() {
    return request<any, PermissionTree[]>({ url: `${BASE_URL}/tree`, method: 'get' })
  },

  /** 新增权限节点 */
  insert(data: Partial<Permission>) {
    return request<any, any>({ url: BASE_URL, method: 'post', data })
  },

  /** 编辑权限节点 */
  update(id: number, data: Partial<Permission>) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'put', data })
  },

  /** 删除权限节点 */
  delete(id: number) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'delete' })
  },
}
