/**
 * routeUtils —— 路由工具函数
 *
 * 提供路由列表的过滤处理函数，主要用于侧边栏导航的渲染。
 */

import { RouteRecordRaw } from 'vue-router';
/**
 * 过滤需要在侧边栏 / 导航中显示的路由
 *
 * 过滤规则：
 *   1. 路由的 meta.hidden 为 true 时隐藏（直接移除）
 *   2. 有子路由时递归过滤子路由
 *   3. 如果所有子路由都被过滤掉（空数组），父级也应隐藏
 *   4. 将过滤后的可见子路由重新赋值给父级的 children
 *
 * @param routes 原始路由列表（通常是合并后的完整路由表）
 * @returns 仅包含可见路由的列表，可直接用于侧边栏渲染
 */
export function filterVisibleRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.filter((route) => {
    // 1. 如果当前路由在 meta 中标记为 hidden，直接过滤掉
    if (route.meta?.hidden) {
      return false;
    }

    // 2. 如果存在子路由，递归过滤子路由
    if (route.children && route.children.length > 0) {
      const visibleChildren = filterVisibleRoutes(route.children);

      // 3. 如果子路由全部被过滤掉（空数组），父级也应该隐藏
      //    这个场景常见于：目录下所有菜单都对当前用户不可见
      if (visibleChildren.length === 0) {
        return false;
      }

      // 4. 将过滤后的可见子路由赋值回父级 route 的 children
      //    这样侧边栏渲染时只显示子节点中可见的部分
      route.children = visibleChildren;
    }

    // 5. 通过以上所有检查，保留该路由
    return true;
  });
}
