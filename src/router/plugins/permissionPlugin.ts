import type { RouterPlugin } from './types'
import { useUserStore } from '@/store/modules/user'

// 白名单页面：不需要登录即可访问
const WHITE_LIST = ['/login', '/blogs', '/errorPage/401', '/errorPage/403', '/errorPage/404', '/errorPage/500']

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

    // 4. 其他用户获取菜单权限


    // 4. 权限标识检查：如果路由声明了 permKey，校验用户是否拥有
    const permKey = to.meta?.permKey as string | undefined
    if (permKey) {
      const userPerms = userStore.perms ?? []
      if (!userPerms.includes(permKey)) {
        return '/errorPage/403'
      }
    }
  }
}
