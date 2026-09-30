import type { RouterPlugin } from './types'
import { useUserStore } from '@/store/modules/user'
import { useSceneBindingsStore } from '@/store/modules/sceneBindings'
import { MODULE_DEFS, MODULE_ROUTE_NAMES } from '@/config/modules'
import { AuthAPI } from '@/api/system/permission/auth'

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
      if (!isRestored) {
        return `/login?redirect=${to.path}`
      }
    }

    // 2a. 验证 token 有效性（页面刷新时从缓存恢复后需验证）
    if (userStore.token && !userStore.authLoaded) {
      console.log('[Permission] token exists, authLoaded=false, checking cache...')
      const cached = userStore.restoreAuthFromCache()
      console.log('[Permission] restoreAuthFromCache result:', cached)
      if (cached) {
        // 从缓存恢复后需要验证 token 有效性
        console.log('[Permission] cache hit, calling checkToken...')
        try {
          await AuthAPI.checkToken()
          console.log('[Permission] checkToken success')
        } catch (e) {
          console.log('[Permission] checkToken failed:', e)
          // token 无效或过期 → 清除状态并跳转登录
          userStore.clearAuth()
          userStore.clearToken()
          userStore.clearUserInfo()
          return `/login?redirect=${to.path}`
        }
        // 从缓存恢复后需要重建路由表供侧边栏渲染
        const { usePermissionStore } = await import('@/store/modules/permission')
        usePermissionStore().collectRoutes()
      } else {
        console.log('[Permission] cache miss, calling fetchAuthPerms...')
        // 缓存未命中 → 从后端拉取
        try {
          await userStore.fetchAuthPerms(String(userStore.userId))
        } catch {
          // token 过期或网络错误 → 清除状态并跳转登录
          userStore.clearAuth()
          userStore.clearToken()
          userStore.clearUserInfo()
          return `/login?redirect=${to.path}`
        }
      }

      // 加载 AI 场景绑定数据（低频变动，全量缓存供全局使用）
      useSceneBindingsStore().fetchAllBindings()
    }

    // 3. 权限标识检查：从后端菜单树（getMenus）提取 permKey 作为数据源
    // 空字符串 permKey 视为无权限要求，公开访问
    const permKey = getValidPermKey(to.meta as Record<string, unknown>)
    if (permKey) {
      if (!userStore.menuPermKeys.includes(permKey)) {
        // 4. 默认路由无权限时：在同模块内找到第一个有权限的子路由并重定向
        const moduleName = to.matched.find(
          r => r.name && MODULE_ROUTE_NAMES.includes(r.name as string)
        )?.name as string | undefined

        if (moduleName) {
          const modDef = MODULE_DEFS.find(m => m.key === moduleName)
          if (modDef?.entryRoutes?.length) {
            const fallback = modDef.entryRoutes.find(
              name => userStore.menuPermKeys.includes(name)
            )
            if (fallback) {
              return { name: fallback }
            }
          }
        }
        return '/errorPage/403'
      }
    }
  }
}
