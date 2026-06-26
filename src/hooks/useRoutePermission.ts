/**
 * useRoutePermission —— 路由页面级权限校验组合式函数
 *
 * 基于 userStore.menuPermKeys（后端返回的已过滤菜单权限标识）判断当前用户
 * 是否有权访问某个路由页面。admin 用户默认放行，无 permKey 的路由视为公开。
 *
 * 适用于：
 *   - 工作台/仪表盘中的快捷入口点击前做权限拦截
 *   - 页面内跳转前校验目标菜单是否对当前用户可见
 */

import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'

export function useRoutePermission() {
  const router = useRouter()
  const userStore = useUserStore()

  /**
   * 判断当前用户是否有权限访问指定 name 的路由
   * @param routeName 目标路由 name
   * @returns true 表示有权限，false 表示无权限
   */
  function hasRoutePermission(routeName: string): boolean {
    // admin 拥有全量页面访问权限
    if (userStore.username === 'admin') return true

    const resolved = router.resolve({ name: routeName })
    const permKey = String(resolved.meta?.permKey ?? '').trim()

    // 路由未配置 permKey 时视为公开页面，直接放行
    if (!permKey) return true

    return userStore.menuPermKeys.includes(permKey)
  }

  /**
   * 获取路由的友好名称，优先使用 meta.description，其次 meta.title
   * @param routeName 目标路由 name
   * @returns 路由中文名称或 routeName 兜底
   */
  function getRouteTitle(routeName: string): string {
    const resolved = router.resolve({ name: routeName })
    return String(resolved.meta?.description ?? resolved.meta?.title ?? routeName)
  }

  /**
   * 带权限校验的路由跳转
   *
   * 有权限时正常 push；无权限时弹出 ElMessage 错误提示，不执行跳转。
   *
   * @param routeName 目标路由 name
   * @returns 是否跳转成功
   */
  function navigateWithPermission(routeName: string): boolean {
    if (!hasRoutePermission(routeName)) {
      const title = getRouteTitle(routeName)
      ElMessage.error(`当前用户没有跳转到${title}页面的权限，请联系管理员添加！`)
      return false
    }

    router.push({ name: routeName })
    return true
  }

  return {
    hasRoutePermission,
    getRouteTitle,
    navigateWithPermission,
  }
}
