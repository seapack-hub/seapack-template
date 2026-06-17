import { request } from '@/utils/axios'

const BASE_URL = '/api/sys/roles'

/** 角色实体（对应 sys_role） */
export interface Role {
  id?: number
  /** 角色名称 */
  roleName: string
  /** 角色编码 */
  roleCode: string
  /** 角色描述 */
  description?: string
  /** 状态（1正常 0停用） */
  status?: number
  createTime?: string
}

/** 角色分页查询参数 */
export interface RoleQuery {
  pageNum: number
  pageSize: number
  /** 角色名称模糊搜索 */
  roleName?: string
  /** 状态筛选（1正常 0停用） */
  status?: number
}

export const RoleAPI = {
  /** 
   * 分页查询角色列表（GET /sys/roles） 
   **/
  page(query: RoleQuery) {
    return request<any, PageResult<Role[]>>({ url: BASE_URL, method: 'get', params: query })
  },

  /** 
   * 新增角色（POST /sys/roles） 
   **/
  insert(data: Partial<Role>) {
    return request<any, any>({ url: BASE_URL, method: 'post', data })
  },

  /** 
   * 编辑角色（PUT /sys/roles/{id}） 
   **/
  update(id: number, data: Partial<Role>) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'put', data })
  },

  /** 
   * 删除角色（DELETE /sys/roles/{id}，级联清理 role_permission） 
   **/
  delete(id: number) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'delete' })
  },

  /** 
   * 分配角色权限（PUT /sys/roles/{id}/permissions，JSON 体 { permissionIds: [1,2,3] }）
   **/
  assignPermissions(id: number, permissionIds: number[]) {
    return request<any, any>({ url: `${BASE_URL}/${id}/permissions`, method: 'put', data: { permissionIds } })
  },

  /** 
   * 查询角色已有权限ID（GET /sys/roles/{id}/permissions，用于回显 el-tree 勾选） 
   **/
  getPermissionIds(id: number) {
    return request<any, number[]>({ url: `${BASE_URL}/${id}/permissions`, method: 'get' })
  },
}
