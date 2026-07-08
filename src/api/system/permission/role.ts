import { request } from '@/utils/axios'
import type { Role, RoleQuery } from './types/role'

export type { Role, RoleQuery }

const BASE_URL = '/api/sys/roles'

export const RoleAPI = {
  /** 分页查询角色列表 */
  page(query: RoleQuery) {
    return request<any, PageResult<Role[]>>({ url: BASE_URL, method: 'get', params: query })
  },

  /** 新增角色 */
  insert(data: Partial<Role>) {
    return request<any, any>({ url: BASE_URL, method: 'post', data })
  },

  /** 编辑角色 */
  update(id: number, data: Partial<Role>) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'put', data })
  },

  /** 删除角色 */
  delete(id: number) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'delete' })
  },

  /** 分配角色权限 */
  assignPermissions(id: number, permissionIds: number[]) {
    return request<any, any>({ url: `${BASE_URL}/${id}/permissions`, method: 'put', data: { permissionIds } })
  },

  /** 查询角色已有权限ID */
  getPermissionIds(id: number) {
    return request<any, number[]>({ url: `${BASE_URL}/${id}/permissions`, method: 'get' })
  },
}
