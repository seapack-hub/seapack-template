import { usePermissionStore } from '@/store/modules/permission.ts';
import { useUserStore } from '@/store/modules/user';
import { setRouteChange } from '@/hooks/useRouteListener.ts';
// @ts-ignore
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from './router';
import { AuthAPI } from '@/api/system/permission/auth';

/**
 * 白名单页面：不需要登录即可访问
 */
const WHITE_LIST = ['/login', '/blogs', '/errorPage/404', '/errorPage/403', '/errorPage/500'];

// 全局路由前置守卫
router.beforeEach(async (to, _from, next) => {
  NProgress.start()

  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  //获取静态路由
  const { isDynamicLoaded} = permissionStore;
  if(!isDynamicLoaded){
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
    const asyncRouter = permissionStore.formatDynamicRoutes(mergedArray);
    // 将格式化后的路由逐条添加到 Vue Router 实例中
    asyncRouter.forEach((route) => {
      router.addRoute(route);
    });
    // 将动态路由保存到 store，供后续路由守卫判断 "是否已加载"
    permissionStore.dynamicRoutes = asyncRouter;
    // 将合并后的路由（静态路由 + 动态路由）存入 store
    permissionStore.setRoutes(asyncRouter);
    //路由已加载完成
    permissionStore.setDynamicLoaded(true);
  }


  const hasToken = userStore.isLoggedIn
  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/systemManagement', replace: true })
      return
    }

    const hasUserInfo = !!userStore.userInfo.id

    if (!hasUserInfo) {
      try {
        if (!hasUserInfo) {
          const authInfo = await AuthAPI.getUserInfo(userStore.userInfo.id)
          userStore.setAuthInfo({ roles: authInfo.roles, perms: authInfo.perms })
        }
      } catch (error) {
        await userStore.logout()
        next(`/login?redirect=${encodeURIComponent(to.path)}`)
        return
      }
    }
    next()
  } else {
    if (WHITE_LIST.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${encodeURIComponent(to.path)}`)
    }
  }
})

router.afterEach((to) => {
  NProgress.done();
  setRouteChange(to);
});
