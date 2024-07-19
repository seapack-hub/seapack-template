import router from "@/router/index.ts";
import {setRouteChange} from "@/hooks/useRouteListener.ts"

router.beforeEach((to,from,next)=>{
    next();
})
router.afterEach((to)=>{
    //路由变化时，设置最新的路由
    setRouteChange(to);
})