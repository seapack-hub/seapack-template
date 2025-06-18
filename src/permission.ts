//引入路由配置文件
//import routerJson from '@/json/router.json';

import { usePermissionStore } from '@/store/modules/permission.ts';
import { setRouteChange } from '@/hooks/useRouteListener.ts';
//引入路由
import router from './router';

//创建路由前置守卫
router.beforeEach((to, from, next) => {
  console.log('-3333---');
  //使用权限存储对象
  const permissionStore = usePermissionStore();

  //判断是否添加动态路由
  const dynamicRoutes = permissionStore?.dynamicRoutes ?? [];
  if (dynamicRoutes.length > 0) {
    console.log('--222---');
    //todo 动态路由处理

    // 判断是否根据模块匹配模块路由
    const currentModules = permissionStore.currentModules;
    const hasRoutes = permissionStore?.routes?.length > 0;
    const currentRouteModules = to?.matched?.[0]?.name;
    if (hasRoutes && currentModules === currentRouteModules) {
      // 如果当前路由没有匹配到任何模块，则重定向到404页面；否则继续导航
      if (to.matched.length === 0 && !from.name) {
        next('/errorPage/404');
      } else {
        next();
      }
    } else {
      //console.log('form',from);
    }
    next();
  } else {
    //扫描静态路由文件
    const tsFiles = import.meta.glob('@/router/modules/*.ts', { eager: true });
    //合并文件
    const mergedArray: any[] = [];
    Object.values(tsFiles).forEach((module: any) => {
      if (module.default && Array.isArray(module.default)) {
        mergedArray.push(...module.default); // 合并数组
      }
    });
    //将静态路由添加至路由表中
    // const asyncRouter = permissionStore.formatDynamicRoutes(routerJson);
    const asyncRouter = permissionStore.formatDynamicRoutes(mergedArray);
    asyncRouter.forEach((route) => {
      router.addRoute(route);
    });
    console.log('--路由--',asyncRouter);
    permissionStore.dynamicRoutes = asyncRouter;
    permissionStore.setRoutes(asyncRouter);
    //重定向并替换当前路径
    next({ ...to, replace: true });
  }
});

//路由后置守卫
router.afterEach((to) => {
  //路由变化时，设置最新的路由
  setRouteChange(to);
});
