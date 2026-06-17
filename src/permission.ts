import { usePermissionStore } from '@/store/modules/permission.ts';
import { useUserStore } from '@/store/modules/user';
import { setRouteChange } from '@/hooks/useRouteListener.ts';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from './router';
import { AuthAPI, type MenuTree } from '@/api/system/permission/auth';

/**
 * 将后端返回的 MenuTree 节点递归转换为 Vue Router 所需的 RouteRecordRaw 格式
 */
function convertMenuToRoute(menu: MenuTree, depth = 0): any {
  if (depth > 5) return null
  const route: any = {
    path: menu.path || '',
    name: menu.name,
    meta: {
      title: menu.name,
      description: menu.name,
      icon: menu.icon || '',
      type: menu.type,
      hidden: menu.status === 0,
    },
  }
  if (menu.type === 2 && menu.component && menu.component.startsWith('/')) {
    const compPath = menu.component.replace(/^\//, '')
    route.component = () => import(`@/views/${compPath}.vue`)
  }
  if (menu.children && menu.children.length > 0) {
    const converted: any[] = []
    for (const child of menu.children) {
      const c = convertMenuToRoute(child, depth + 1)
      if (c) converted.push(c)
    }
    if (converted.length > 0) route.children = converted
  }
  return route
}

// 全局路由前置守卫
router.beforeEach(async (to, _from, next) => {
  const permissionStore = usePermissionStore();
  const dynamicRoutes = permissionStore?.dynamicRoutes ?? [];

  // 首次访问：同步加载静态路由模块（纯内存操作，极快），然后立即放行
  if (dynamicRoutes.length === 0) {
    NProgress.start();
    const tsFiles = import.meta.glob('@/router/modules/*.ts', { eager: true });
    const mergedArray: any[] = [];
    Object.values(tsFiles).forEach((module: any) => {
      if (module.default && Array.isArray(module.default)) {
        mergedArray.push(...module.default);
      }
    });
    const asyncRouter = permissionStore.formatDynamicRoutes(mergedArray);
    asyncRouter.forEach((route:any) => { router.addRoute(route); });
    permissionStore.dynamicRoutes = asyncRouter;
    permissionStore.setRoutes(asyncRouter);

    // 先放行导航（组件懒加载开始），再异步拉取后端菜单权限，不阻塞首次渲染
    next({ ...to, replace: true });

    // fire-and-forget：后端菜单获取，不影响页面展示
    fetchMenusSilently();
    return;
  }

  // 正常导航 — 开启进度条，直接放行
  NProgress.start();

  // 路径无匹配时重定向到 404
  if (to.matched.length === 0) {
    next('/errorPage/404');
    return;
  }

  next();
});

async function fetchMenusSilently() {
  try {
    const userStore = useUserStore();
    const userId = userStore.userInfo.id;
    const menus = await AuthAPI.getMenus(userId);
    if (menus && menus.length > 0) {
      const permissionStore = usePermissionStore();
      permissionStore.setDynamicLoaded(true)
    }
  } catch {
    // 静默失败，不影响页面渲染
  }
}

router.afterEach((to) => {
  NProgress.done()
  setRouteChange(to);
});
