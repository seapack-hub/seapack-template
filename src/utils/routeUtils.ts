/**
 * routeUtils —— 路由工具函数
 *
 * 提供路由列表的过滤处理函数，主要用于侧边栏导航的渲染。
 */

import type { RouteRecordRaw } from 'vue-router';

function getValidPermKey(route: RouteRecordRaw): string | undefined {
  const key = route.meta?.permKey as string | undefined
  if (!key) return undefined
  const trimmed = key.trim()
  return trimmed || undefined
}

/**
 * 过滤需要在侧边栏中显示的路由，支持权限过滤
 *
 * 过滤规则：
 *   1. meta.hidden 为 true 时隐藏
 *   2. 提供了 perms 时，检查 meta.permKey 是否在权限列表中（空字符串视为无 permKey，公开访问）
 *   3. isAdmin 时跳过 permKey 检查
 *   4. 递归处理子路由，子路由全部隐藏时父级也隐藏
 *
 * @param routes 原始路由列表
 * @param perms  当前用户的权限标识列表（可选），不传则不进行权限过滤
 * @param isAdmin 是否为管理员（可选），为 true 时跳过权限检查
 */
export function filterVisibleRoutes(
  routes: RouteRecordRaw[],
  perms?: string[],
  isAdmin = false,
): RouteRecordRaw[] {
  return routes.reduce<RouteRecordRaw[]>((acc, route) => {
    if (route.meta?.hidden) return acc;

    const routePermKey = getValidPermKey(route)
    if (!isAdmin && perms && routePermKey) {
      if (!perms.includes(routePermKey)) return acc;
    }

    let visibleChildren: RouteRecordRaw[] | undefined
    if (route.children && route.children.length > 0) {
      visibleChildren = filterVisibleRoutes(route.children, perms, isAdmin)
      if (visibleChildren.length === 0) return acc
    }

    acc.push({ ...route, children: visibleChildren })
    return acc
  }, [])
}
