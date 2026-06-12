import { request } from "@/utils/axios.ts";
const USER_BASE_URL = "/api/user";

const UserAPI = {
  getPage(queryParams: UserPageQuery) {
    return request<any, PageResult<UserPageVO[]>>({
      url: `${USER_BASE_URL}/page/list`,
      method: "get",
      params: queryParams,
    })
  },
  insert(data: any) {
    return request<any, any>({
      url: `${USER_BASE_URL}/insert`,
      method: "post",
      data,
    })
  },
  update(data: any) {
    return request<any, any>({
      url: `${USER_BASE_URL}/update`,
      method: "post",
      data,
    })
  },
  delete(id: number) {
    return request<any, any>({
      url: `${USER_BASE_URL}/delete/${id}`,
      method: "delete",
    })
  },
  resetPassword(id: number, password: string) {
    return request({
      url: `${USER_BASE_URL}/${id}/password/reset`,
      method: "put",
      params: { password },
    })
  },
  deleteByIds(ids: string) {
    return request({
      url: `${USER_BASE_URL}/${ids}`,
      method: "delete",
    })
  },
}
export default UserAPI

export interface UserInfo {
  userId?: number
  username?: string
  nickname?: string
  avatar?: string
  roles: string[]
  perms: string[]
}

export interface UserPageQuery extends PageQuery {
  keywords?: string
  status?: string
  deptId?: number
  startTime?: string
  endTime?: string
}

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
