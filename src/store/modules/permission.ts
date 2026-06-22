import { defineStore } from 'pinia';
import { RouteRecordRaw, RouterView} from 'vue-router';
import { routerRecordRow } from '@/router/index.ts';
import { AuthAPI, type MenuTree } from '@/api/system/permission/auth'
import router from "@/router/index"

//常规页面路由
const modules = import.meta.glob('@/views/**/*.vue');
//布局路由
const layoutModules = import.meta.glob('@/layout/**/*.vue');

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

    /**
     * 获取后端数据配置动态路由
     */
    async fetchBackendRoute(userId:string){
      //接口，获取动态路由、
      const menuList = await AuthAPI.getMenus(userId)
      //格式化后端路由
      const backendRoute = formatBackendRoutes(menuList)
      // 添加完整路由树，Vue Router 内部会自动处理父子关系
      backendRoute.forEach(route => router.addRoute(route as RouteRecordRaw));
      //设置路由
      this.setRoutes(backendRoute)
    },

    /**
     * 配置静态文件路由
     */
    async fetchStaticRoute(){
      //静态路由未加载，加载静态路由
      const tsFiles = import.meta.glob('@/router/modules/*.ts', { eager: true });
      // 用于合并所有模块中导出的路由数组
      const mergedArray: any[] = [];
      // 遍历每个模块文件
      Object.values(tsFiles).forEach((module: any) => {
        // 如果模块有 default 导出且是数组，就合并进来
        if (module.default && Array.isArray(module.default)) {
          mergedArray.push(...module.default);
        }
      });
      // 格式化路由数据（补充 name 等）
      const staticRouter = formatDynamicRoutes(mergedArray);
      // 添加完整路由树，Vue Router 内部会自动处理父子关系
      staticRouter.forEach(route => {
        router.addRoute(route as RouteRecordRaw);
      });
      this.setRoutes(staticRouter)
    }
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

/**
 * 格式化处理后端返回的路由信息
 */
function formatBackendRoutes(treeList:MenuTree[]){
  if (!treeList || !treeList.length) return [];
  return treeList.map(node =>{
    const route:RouteRecordRaw = {
      path:node.path,
      // 优先使用 permKey 作为路由 name，保证唯一性
      name: node.permKey || node.path.replace(/\//g, ''),
      component: null, 
      meta: {
        title: node.name,
        permKey: node.permKey,
        type: node.type
      },
      children: []
    }
    //处理映射
    if (node.type === 1) {
      if(node.component){
        //布局页面，每个模块的布局页面有所差别
        const componentPath = `/src/${node.component}.vue`;
        if (layoutModules[componentPath]) {
          route.component = layoutModules[componentPath];
        } else {
          console.warn(`[路由警告] 未找到对应组件: ${node.component}`);
          route.component = () => import('@/views/common/errorPage/404.vue');
        }
      }else{
        // 纯目录（如：基础信息）使用空占位组件，保证嵌套路由正常渲染
        route.component = RouterView
      }
    }else if(node.type === 2){
      // 菜单类型：动态匹配 views 下的组件
      // 假设后端返回的 component 格式为 "systemManagement/user/index"
      const componentPath = `/src/views/${node.component}.vue`;
      if (modules[componentPath]) {
        route.component = modules[componentPath];
      } else {
        console.warn(`[路由警告] 未找到对应组件: ${node.component}`);
        route.component = () => import('@/views/common/errorPage/404.vue');
      }
    }

    //递归处理子节点
    if (node.children && node.children.length > 0) {
      route.children = formatBackendRoutes(node.children);
    } 
    return route;
  }).filter(Boolean)
}

// addRoutesToRouter 已移除，改为 Vue Router 原生 addRoute 处理完整路由树

