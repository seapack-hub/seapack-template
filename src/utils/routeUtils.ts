/**
 * routeUtils —— 路由工具函数
 *
 * 提供路由列表的过滤处理函数，主要用于侧边栏导航的渲染。
 */

import { RouteRecordRaw } from 'vue-router';

/**
 * 过滤需要在侧边栏中显示的路由，支持权限过滤
 *
 * 过滤规则：
 *   1. meta.hidden 为 true 时隐藏
 *   2. 提供了 perms 时，检查 meta.permKey 是否在权限列表中
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
  return routes.filter((route) => {
    if (route.meta?.hidden) return false;

    // 权限检查
    if (!isAdmin && perms && route.meta?.permKey) {
      if (!perms.includes(route.meta.permKey as string)) return false;
    }

    // 递归处理子路由
    if (route.children && route.children.length > 0) {
      const visibleChildren = filterVisibleRoutes(route.children, perms, isAdmin);
      if (visibleChildren.length === 0) return false;
      route.children = visibleChildren;
    }

    return true;
  });
}
