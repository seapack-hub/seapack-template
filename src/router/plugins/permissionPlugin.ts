import type { RouterPlugin } from './types'
import { useUserStore } from '@/store/modules/user'
import { useAiSkillBindingsStore } from '@/store/modules/aiSkillBindings'

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

      // 2a. 权限数据已加载则跳过（同一会话内避免重复请求）
      if (!userStore.authLoaded) {
        // 2b. 优先从 sessionStorage 恢复（页面刷新后避免重复 API 调用）
        const cached = userStore.restoreAuthFromCache()
        if (!cached) {
          // 2c. 缓存未命中 → 从后端拉取
          try {
            await userStore.fetchAuthPerms(String(userStore.userId))
          } catch {
            // token 过期或网络错误 → 清除状态并跳转登录
            userStore.clearAuth()
            userStore.clearToken()
            userStore.clearUserInfo()
            return `/login?redirect=${to.path}`
          }
        } else {
          // 从缓存恢复后需要重建路由表供侧边栏渲染
          const { usePermissionStore } = await import('@/store/modules/permission')
          usePermissionStore().collectRoutes()
        }

        // 加载 AI 技能绑定数据（低频变动，全量缓存供全局使用）
        useAiSkillBindingsStore().fetchAllBindings()
      }
    }

    // 3. admin 跳过所有权限检查
    if (userStore.username === 'admin') return undefined

    // 4. 权限标识检查：从后端菜单树（getMenus）提取 permKey 作为数据源
    // 空字符串 permKey 视为无权限要求，公开访问
    const permKey = getValidPermKey(to.meta as Record<string, unknown>)
    if (permKey) {
      if (!userStore.menuPermKeys.includes(permKey)) {
        return '/errorPage/403'
      }
    }
  }
}
