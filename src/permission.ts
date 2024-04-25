//引入路由配置文件
import routerJson from "@/json/router.json";

import {usePermissionStore} from "@/store/modules/permission.ts";

//引入路由
import router from "./router";

//创建路由前置守卫
router.beforeEach((to,from,next)=>{
    //使用权限存储对象
    const permissionStore = usePermissionStore();

    //判断是否添加动态路由
    const dynamicRoutes = permissionStore?.dynamicRoutes??[];
    if(dynamicRoutes.length>0){
        //todo 动态路由处理

        // 判断是否根据模块匹配模块路由
        const currentModules = permissionStore.currentModules;
        const hasRoutes = permissionStore?.routes?.length > 0;
        const currentRouteModules = to?.matched?.[0]?.name;
        if(hasRoutes && currentModules === currentRouteModules){
            // 如果当前路由没有匹配到任何模块，则重定向到404页面；否则继续导航
            if (to.matched.length === 0) {
                from.name ? next({ name: from.name }) : next('/errorPage/404')
            } else {
                next()
            }
        }else{

        }
        next();
    }else{
        //将静态路由添加至路由表中
        const asyncRouter = permissionStore.formatDynamicRoutes(routerJson);
        asyncRouter.forEach(route=>{
            router.addRoute(route);
        });
        permissionStore.dynamicRoutes = asyncRouter;
        //重定向并替换当前路径
        next({...to,replace:true});
    }

})