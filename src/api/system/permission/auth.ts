import { request } from '@/utils/axios'
import type { UserAuthInfo, MenuTree } from './types/auth'

export type { UserAuthInfo, MenuTree }

const BASE_URL = '/api/auth'

export const AuthAPI = {
  /** 获取用户信息+权限（仅目录和菜单的 permKey） */
  getUserInfo(userId: number | string) {
    return request<any, UserAuthInfo>({ url: `${BASE_URL}/user-info`, method: 'get', params: { userId } })
  },

  /** 获取动态菜单树 */
  getMenus(userId: number | string) {
    return request<any, MenuTree[]>({ url: `${BASE_URL}/menus`, method: 'get', params: { userId } })
  },

  /** 获取按钮权限标识符列表（完整路径，如 sys:dept:add） */
  getButtons() {
    return request<any, string[]>({ url: `${BASE_URL}/buttons`, method: 'get' })
  },
}
