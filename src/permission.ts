//引入路由配置文件
import routerJson from "@/json/router.json";

import {usePermissionStore} from "@/store/modules/permission.ts";

//引入路由
import router from "./router";

//创建路由前置守卫
router.beforeEach((to,from)=>{
    const permissionStore = usePermissionStore();

    //判断是否添加动态路由
    const dynamicRoutes = permissionStore?.dynamicRoutes??[];
    if(dynamicRoutes.length>0){
        //todo 动态路由处理
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