import { request } from '@/utils/axios'
import type { UserAuthInfo, MenuTree } from './types/auth'

export type { UserAuthInfo, MenuTree }

const BASE_URL = '/api/auth'

export const AuthAPI = {
  /** 获取用户信息+权限 */
  getUserInfo(userId: number | string) {
    return request<any, UserAuthInfo>({ url: `${BASE_URL}/user-info`, method: 'get', params: { userId } })
  },

  /** 获取动态菜单树 */
  getMenus(userId: number | string) {
    return request<any, MenuTree[]>({ url: `${BASE_URL}/menus`, method: 'get', params: { userId } })
  },
}
