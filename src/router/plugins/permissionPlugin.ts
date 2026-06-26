import type { RouterPlugin } from './types'
import { useUserStore } from '@/store/modules/user'

// 白名单页面：不需要登录即可访问
const WHITE_LIST = ['/login', '/blogs', '/errorPage/401', '/errorPage/403', '/errorPage/404', '/errorPage/500']

/** 获取有效的 permKey，空字符串视为无权限要求 */
function getValidPermKey(meta: Record<string, unknown> | undefined): string | undefined {
  const key = meta?.permKey as string | undefined
  if (!key) return undefined
  const trimmed = key.trim()
  return trimmed || undefined
}

// 权限验证插件：检查 token 和权限标识
export const permissionPlugin: RouterPlugin = {
  name: 'PermissionPlugin',
  priority: 1,

  async beforeEach({to}){
    const userStore = useUserStore()

    // 1. 白名单直接放行
    if (WHITE_LIST.includes(to.path)) return undefined

    // 2. Token 校验与恢复
    if (!userStore.token) {
      const isRestored = userStore.restoreLoginState()
      //获取按钮权限数据
      await userStore.fetchAuthPerms(String(userStore.userId))
      if (!isRestored) {
        return `/login?redirect=${to.path}`
      }
    }

    // 3. admin 跳过所有权限检查
    if (userStore.username === 'admin') return undefined

    // 4. 权限标识检查：从后端菜单树（getMenus）提取 permKey 作为数据源
    //    空字符串 permKey 视为无权限要求，公开访问
    const permKey = getValidPermKey(to.meta as Record<string, unknown>)
    if (permKey) {
      if (!userStore.menuPermKeys.includes(permKey)) {
        return '/errorPage/403'
      }
    }
  }
}
