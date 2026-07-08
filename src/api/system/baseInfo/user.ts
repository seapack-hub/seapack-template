import { request } from "@/utils/axios.ts"
import type { User, UserPageQuery } from "./types/user"

export type { User, UserPageQuery }

const USER_BASE_URL = "/api/user"

export const UserAPI = {
  /** 分页查询用户列表 */
  getPage(queryParams: UserPageQuery) {
    return request<any, PageResult<User[]>>({
      url: `${USER_BASE_URL}/page/list`,
      method: "get",
      params: queryParams,
    })
  },

  /** 查询用户详情 */
  getUserInfo(userId: string) {
    return request<any, User>({
      url: `${USER_BASE_URL}/${userId}`,
      method: "get",
    })
  },

  /** 新增用户 */
  insert(data: any) {
    return request<any, any>({
      url: `${USER_BASE_URL}/insert`,
      method: "post",
      data,
    })
  },

  /** 修改用户信息 */
  update(data: any) {
    return request<any, any>({
      url: `${USER_BASE_URL}/update`,
      method: "post",
      data,
    })
  },

  /** 删除用户 */
  delete(id: number) {
    return request<any, any>({
      url: `${USER_BASE_URL}/delete/${id}`,
      method: "delete",
    })
  },

  /** 重置密码 */
  resetPassword(id: number, newPassword: string) {
    return request({
      url: `${USER_BASE_URL}/resetPassword`,
      method: "put",
      data: { id, newPassword },
    })
  },

  /** 批量删除用户 */
  deleteByIds(ids: number[]) {
    return request({
      url: `${USER_BASE_URL}/batchDelete`,
      method: "delete",
      data: ids,
    })
  },

  /** 为用户分配角色 */
  assignRoles(id: number, roleIds: number[]) {
    return request<any, any>({ url: `${USER_BASE_URL}/${id}/roles`, method: 'put', data: { roleIds } })
  },

  /** 查询用户已有角色ID */
  getRoleIds(id: number) {
    return request<any, number[]>({ url: `${USER_BASE_URL}/${id}/roles`, method: 'get' })
  },
}
