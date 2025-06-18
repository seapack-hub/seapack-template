import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';
//引入静态路由
import { routerRecordRow } from '@/router/index.ts';
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    basePath: <string>'', //当前模块路由的基础路径
    currentModules: <string | any>'', //当前模块
    dynamicRoutes: <RouteRecordRaw[]>[], //动态路由，一般由后台返回
    currentModulesRoutes: <RouteRecordRaw[]>[], //当前模块路由
    routes: <RouteRecordRaw[]>[], //显示的路由
    mixLeftMenu: <RouteRecordRaw[]>[], //混合模式下的路由
    routesHierarchy: <any[]>[], //路由层级
    activeTopMenu: <string>'' // 激活的顶部菜单
  }),
  actions: {
    /**
     * 变更顶部菜单
     * @param val
     */
    changeTopActive(val: string) {
      this.activeTopMenu = val;
    },
    /**
     * 格式化动态路由
     * @param routes
     */
    formatDynamicRoutes,

    /**
     * 将新路由与静态路由合并
     * @param newRoutes
     */
    setRoutes(newRoutes: RouteRecordRaw[]) {
      this.routes = routerRecordRow.concat(newRoutes);
    }
  }
});

function formatDynamicRoutes(routes: Array<RouteRecordRaw>) {
  const asyncRoute: RouteRecordRaw[] = [];
  routes.forEach((route) => {
    const tmpRoute = { ...route };
    if (!route.name) {
      tmpRoute.name = route.path;
    }
    //有子路由，递归调用
    if (tmpRoute.children && tmpRoute.children.length > 0) {
      tmpRoute.children = formatDynamicRoutes(tmpRoute.children);
    }
    asyncRoute.push(tmpRoute);
  });
  return asyncRoute;
}
