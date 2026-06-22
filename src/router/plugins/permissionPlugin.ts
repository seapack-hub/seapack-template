import type { RouterPlugin } from './types'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'
/**
 * 白名单页面：不需要登录即可访问
 */
const WHITE_LIST = ['/login', '/blogs', '/errorPage/404', '/errorPage/403', '/errorPage/500'];

//权限验证插件
export const permissionPlugin: RouterPlugin = {
  name: 'PermissionPlugin',

  priority: 1, // 权限校验通常优先级最高

  async beforeEach({to}){
    
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()

    // 1. 白名单直接放行
    if (WHITE_LIST.includes(to.path)) return undefined

    // 2. Token 校验与恢复
    if (!userStore.token) {
      const isRestored = userStore.restoreLoginState() // 确保此方法是同步的
      if (!isRestored) {
        return `/login?redirect=${to.path}` // 拦截并跳转
      }
    }

    // 3. 动态路由加载
    if (permissionStore.isDynamicLoaded) return undefined

    try {
      //加载用户权限
      await userStore.fetchAuthPerms(String(userStore.userId))

      if (userStore.username === 'admin') {
        //admin用户加载静态路由
        await permissionStore.fetchStaticRoute()
      } else {
        //加载动态路由
        await permissionStore.fetchBackendRoute(String(userStore.userId))
      }
      // 动态路由添加后，必须 replace 重新触发导航
      return { ...to, replace: true }
    } catch (err) {
      await userStore.logout(false)
      return `/login?redirect=${to.path}`
    }

  }
}