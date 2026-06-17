import { usePermissionStore } from '@/store/modules/permission.ts';
import { useUserStore } from '@/store/modules/user';
import { setRouteChange } from '@/hooks/useRouteListener.ts';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from './router';
import { AuthAPI, type MenuTree } from '@/api/system/permission/auth';

/**
 * 白名单页面：不需要登录即可访问
 */
const WHITE_LIST = ['/login', '/blogs', '/errorPage/404', '/errorPage/403', '/errorPage/500'];

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
  NProgress.start();

  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  // ========== 步骤 1：判断是否有 Token（是否已登录）==========
  const hasToken = userStore.isLoggedIn;

  if (hasToken) {
    // ========== 已登录状态 ==========

    if (to.path === '/login') {
      // 已登录但访问登录页，重定向到首页
      next({ path: '/systemManagement', replace: true });
      return;
    }

    // 检查是否已获取用户信息
    const hasUserInfo = !!userStore.userInfo.id;

    if (!hasUserInfo) {
      // 有 Token 但没有用户信息，需要获取用户信息
      try {
        // 获取用户信息和权限
        const userId = userStore.userInfo.id || '1'; // 临时兼容
        const authInfo = await AuthAPI.getUserInfo(userId);

        // 设置用户权限信息
        userStore.setAuthInfo({ roles: authInfo.roles, perms: authInfo.perms });

        // 获取并生成动态路由
        const menus = await AuthAPI.getMenus(userId);

        if (menus && menus.length > 0) {
          // 转换后端菜单为路由
          const dynamicRoutes = menus
            .map(menu => convertMenuToRoute(menu))
            .filter(Boolean);

          // 添加动态路由
          const formattedRoutes = permissionStore.formatDynamicRoutes(dynamicRoutes);
          formattedRoutes.forEach((route: any) => {
            router.addRoute(route);
          });

          // 保存路由状态
          permissionStore.dynamicRoutes = formattedRoutes;
          permissionStore.setRoutes(formattedRoutes);
          permissionStore.setDynamicLoaded(true);
        }

        // 重新导航到目标页面
        next({ ...to, replace: true });
        return;
      } catch (error) {
        // 获取用户信息失败，清除登录状态
        await userStore.logout();
        next(`/login?redirect=${encodeURIComponent(to.path)}`);
        return;
      }
    }

    // 已登录且有用户信息，正常放行
    next();
  } else {
    // ========== 未登录状态 ==========

    if (WHITE_LIST.includes(to.path)) {
      // 在白名单中，直接放行
      next();
    } else {
      // 不在白名单中，重定向到登录页，并记录原目标地址
      next(`/login?redirect=${encodeURIComponent(to.path)}`);
    }
  }
});

router.afterEach((to) => {
  NProgress.done();
  setRouteChange(to);
});
