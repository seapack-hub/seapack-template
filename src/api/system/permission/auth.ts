import { request } from '@/utils/axios'

const BASE_URL = '/api/auth'

/** 用户信息+权限响应 */
export interface UserAuthInfo {
  userId: number
  username: string
  nickname?: string
  avatar?: string
  /** 角色编码列表 */
  roles: string[]
  /** 权限标识符集合（permKey） */
  perms: string[]
}

/** 动态菜单树节点 */
export interface MenuTree {
  id: number
  name: string
  path: string
  permKey: string
  component: string
  icon?: string
  /** 节点类型（1目录 2菜单） */
  type: number
  parentId?: number | null
  sortOrder?: number
  status?: number
  children?: MenuTree[]
}

export const AuthAPI = {
  /** 
   * 获取用户信息+权限（GET /auth/user-info?userId=，返回角色编码列表和权限标识符集合） 
   **/
  getUserInfo(userId: number | string) {
    return request<any, UserAuthInfo>({ url: `${BASE_URL}/user-info`, method: 'get', params: { userId } })
  },

  /** 
   * 获取动态菜单树（GET /auth/menus?userId=，返回角色过滤后的目录+菜单，type=1/2） 
   **/
  getMenus(userId: number | string) {
    return request<any, MenuTree[]>({ url: `${BASE_URL}/menus`, method: 'get', params: { userId } })
  },
}
