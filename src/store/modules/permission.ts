import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';
import { routerRecordRow } from '@/router/index.ts';

/**
 * usePermissionStore —— 权限与路由状态管理
 *
 * 职责：
 *   1. 管理动态路由（后端返回或静态模块合并后的结果）
 *   2. 记录当前激活的菜单/模块，适配混合布局模式
 *   3. 提供路由格式化工具方法
 */
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    // 当前模块路由的基础路径，如 '/systemManagement'
    basePath: <string>'',

    // 当前激活的模块标识（用于区分系统管理 / 地图世界等顶层模块）
    currentModules: <string | any>'',

    // 已注册的动态路由列表，由 formatDynamicRoutes 处理后存入
    dynamicRoutes: <RouteRecordRaw[]>[],

    // 当前模块下匹配到的子路由列表
    currentModulesRoutes: <RouteRecordRaw[]>[],

    // 合并后的最终路由（静态路由 + 动态路由），供侧边栏渲染使用
    routes: <RouteRecordRaw[]>[],

    // 混合布局模式下左侧菜单的路由列表
    mixLeftMenu: <RouteRecordRaw[]>[],

    // 路由层级结构（用于面包屑导航等场景）
    routesHierarchy: <any[]>[],

    // 当前激活的顶部菜单标识（混合布局模式下使用）
    activeTopMenu: <string>'',

    // 后端动态菜单是否已加载完成，供路由守卫判断是否跳过首次加载
    isDynamicLoaded: false,
  }),

  actions: {
    /**
     * 切换当前激活的顶部菜单（混合布局模式）
     * @param val 顶部菜单标识
     */
    changeTopActive(val: string) {
      this.activeTopMenu = val;
    },

    // 格式化路由的工具函数（在下方定义，通过函数名直接引用）
    formatDynamicRoutes,

    /**
     * 将格式化后的动态路由与静态路由合并，并保存到 state
     * @param newRoutes 格式化后的动态路由数组
     */
    setRoutes(newRoutes: RouteRecordRaw[]) {
      // 合并：静态路由（login/blogs/errorPage）在前，动态路由在后
      this.routes = routerRecordRow.concat(newRoutes);
      // 保存动态路由供路由守卫判断 "是否已加载"
      this.dynamicRoutes = newRoutes;
      // 标记路由已加载完成
      this.isDynamicLoaded = true;
    },

    /**
     * 手动设置动态菜单加载状态
     * @param val true=已加载 / false=未加载，下次导航会重新拉取
     */
    setDynamicLoaded(val: boolean) {
      this.isDynamicLoaded = val;
    },

    /**
     * 重置权限状态（登出时调用）
     * 清空所有动态路由和权限相关状态
     */
    resetPermissionState() {
      this.basePath = '';
      this.currentModules = '';
      this.dynamicRoutes = [];
      this.currentModulesRoutes = [];
      this.routes = [];
      this.mixLeftMenu = [];
      this.routesHierarchy = [];
      this.activeTopMenu = '';
      this.isDynamicLoaded = false;
    },
  }
});

/**
 * 格式化动态路由列表
 *
 * 作用：确保每条路由都有 name 字段（没有则用 path 代替），并递归处理子路由。
 *
 * @param routes 原始路由配置数组
 * @returns 格式化后的路由数组
 */
function formatDynamicRoutes(routes: Array<RouteRecordRaw>) {
  // 存放格式化后的路由
  const asyncRoute: RouteRecordRaw[] = [];

  routes.forEach((route) => {
    // 浅拷贝路由对象，避免修改原始引用
    const tmpRoute = { ...route };

    // 如果路由没有 name 字段，用 path 作为 name
    // 这是为了支持 router.push({ name: ... }) 和 keep-alive 的 include 匹配
    if (!route.name) {
      tmpRoute.name = route.path;
    }

    // 递归处理子路由，保证嵌套路由的每一层都有 name
    if (tmpRoute.children && tmpRoute.children.length > 0) {
      tmpRoute.children = formatDynamicRoutes(tmpRoute.children);
    }

    // 将处理好的路由加入结果数组
    asyncRoute.push(tmpRoute);
  });

  return asyncRoute;
}
