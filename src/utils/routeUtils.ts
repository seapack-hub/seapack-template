// utils/routeUtils.ts
import { RouteRecordRaw } from 'vue-router';

/**
 * 过滤需要显示在导航栏中的路由
 * @param routes 原始路由列表
 * @returns 过滤后的路由列表
 */
export function filterVisibleRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.filter(route => {
    // 1. 如果当前路由明确标记为隐藏，则直接过滤掉
    if (route.meta?.hidden) {
      return false;
    }

    // 2. 如果存在子路由，则递归过滤子路由
    if (route.children && route.children.length > 0) {
      const visibleChildren = filterVisibleRoutes(route.children);
      
      // 3. 关键逻辑：如果过滤后子路由为空数组，说明所有子项都隐藏了，那么父级也应隐藏
      if (visibleChildren.length === 0) {
        return false;
      }
      
      // 4. 将过滤后的可见子路由赋值回当前路由
      route.children = visibleChildren;
    }

    // 5. 通过上述检查，则保留该路由
    return true;
  });
}