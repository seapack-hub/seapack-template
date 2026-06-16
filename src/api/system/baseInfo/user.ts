import { request } from "@/utils/axios.ts"
const USER_BASE_URL = "/api/user"

const UserAPI = {
  /** 分页查询用户列表（GET /api/user/page/list） */
  getPage(queryParams: UserPageQuery) {
    return request<any, PageResult<UserPageVO[]>>({
      url: `${USER_BASE_URL}/page/list`,
      method: "get",
      params: queryParams,
    })
  },
  /** 新增用户（POST /api/user/insert） */
  insert(data: any) {
    return request<any, any>({
      url: `${USER_BASE_URL}/insert`,
      method: "post",
      data,
    })
  },
  /** 修改用户信息（POST /api/user/update） */
  update(data: any) {
    return request<any, any>({
      url: `${USER_BASE_URL}/update`,
      method: "post",
      data,
    })
  },
  /** 删除用户（DELETE /api/user/delete/{id}） */
  delete(id: number) {
    return request<any, any>({
      url: `${USER_BASE_URL}/delete/${id}`,
      method: "delete",
    })
  },
  /** 重置密码（PUT /api/user/resetPassword） */
  resetPassword(id: number, newPassword: string) {
    return request({
      url: `${USER_BASE_URL}/resetPassword`,
      method: "put",
      data: { id, newPassword },
    })
  },
  /** 批量删除用户（DELETE /api/user/batchDelete） */
  deleteByIds(ids: number[]) {
    return request({
      url: `${USER_BASE_URL}/batchDelete`,
      method: "delete",
      data: ids,
    })
  },
  /** 为用户分配角色（PUT /api/user/{id}/roles，JSON 体 { roleIds: [1,2,3] }） */
  assignRoles(id: number, roleIds: number[]) {
    return request<any, any>({ url: `${USER_BASE_URL}/${id}/roles`, method: 'put', data: { roleIds } })
  },
  /** 查询用户已有角色ID（GET /api/user/{id}/roles，用于回显弹窗勾选） */
  getRoleIds(id: number) {
    return request<any, number[]>({ url: `${USER_BASE_URL}/${id}/roles`, method: 'get' })
  },
}
export default UserAPI

/** 登录用户信息 */
export interface UserInfo {
  userId?: number
  username?: string
  nickname?: string
  avatar?: string
  roles: string[]
  perms: string[]
}

/** 用户分页查询参数 */
export interface UserPageQuery extends PageQuery {
  keywords?: string
  status?: string
  deptId?: number
  startTime?: string
  endTime?: string
}

/** 用户分页对象 */
export interface UserPageVO {
  id: number
  avatar?: string
  createTime?: Date
  deptName?: string
  email?: string
  gender?: number
  mobile?: string
  nickname?: string
  roleNames?: string
  status?: number
  username?: string
}
