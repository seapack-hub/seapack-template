import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';
import { routerRecordRow, getRawModuleRoutes } from '@/router/index.ts';
import router from "@/router/index"
import { MODULE_ROUTE_NAMES } from '@/config/modules'

/**
 * usePermissionStore —— 权限与路由状态管理
 */
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    basePath: <string>'',
    currentModules: <string | any>'',
    // 所有已加载的模块路由列表（供侧边栏渲染）
    dynamicRoutes: <RouteRecordRaw[]>[],
    currentModulesRoutes: <RouteRecordRaw[]>[],
    // 合并后的最终路由（静态路由 + 动态路由）
    routes: <RouteRecordRaw[]>[],
    mixLeftMenu: <RouteRecordRaw[]>[],
    routesHierarchy: <any[]>[],
    activeTopMenu: <string>'',
    isDynamicLoaded: false,
  }),

  actions: {
    changeTopActive(val: string) {
      this.activeTopMenu = val;
    },

    setRoutes(newRoutes: RouteRecordRaw[]) {
      this.routes = routerRecordRow.concat(newRoutes);
      this.dynamicRoutes = newRoutes;
      this.isDynamicLoaded = true;
    },

    setDynamicLoaded(val: boolean) {
      this.isDynamicLoaded = val;
    },

    // 登出时清理路由状态，移除模块路由防止旧路由残留
    resetPermissionState() {
      this.basePath = '';
      this.currentModules = '';
      this.currentModulesRoutes = [];
      this.mixLeftMenu = [];
      this.routesHierarchy = [];
      this.activeTopMenu = '';
      // 移除所有模块路由
      MODULE_ROUTE_NAMES.forEach(name => {
        if (router.hasRoute(name)) router.removeRoute(name)
      })
      this.dynamicRoutes = [];
      this.routes = [];
      this.isDynamicLoaded = false;
    },

    // 从已加载的路由中收集所有顶级模块路由，供侧边栏使用
    collectRoutes() {
      const allRoutes: RouteRecordRaw[] = []

      // 使用 router/index.ts 中缓存的原始路由定义（与 initAllRoutes 同源，保证 children 结构完整）
      const moduleRoutes = getRawModuleRoutes()
      MODULE_ROUTE_NAMES.forEach(name => {
        const route = moduleRoutes.find(r => r.name === name)
        if (route) allRoutes.push(route)
      })

      // 补充静态路由中定义的模块（如 blogsManagement）
      const staticModuleRoutes = routerRecordRow.filter(
        r => r.name && MODULE_ROUTE_NAMES.includes(r.name as string) && !allRoutes.some(existing => existing.name === r.name)
      )
      allRoutes.push(...(staticModuleRoutes as RouteRecordRaw[]))

      this.setRoutes(allRoutes)
    }
  }
});
