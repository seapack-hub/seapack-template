import {defineStore} from "pinia";
import {ref} from "vue";
import {RouteRecordRaw} from "vue-router"

//引入基础路由
import router from "@/router/index.ts";
//引入views下所有文件
const modules = import.meta.glob("../../views/**/**.vue");
//引入布局
//主布局
const Layout = ()=> import("../../layout/main/index.vue");
//页眉页脚布局
const menuTab =()=> import("../../layout/menuTab/index.vue");
//趣味游戏布局
const funGame = ()=> import("../../layout/funGame/index.vue");
//技术天地布局
const technologyWorld = ()=> import("../../layout/technologyWorld/index.vue");
//数据世界布局
const worldData = ()=> import("@/layout/worldData/index.vue")
export const usePermissionStore = defineStore("permission",{
    state:()=>({
        basePath:<string>"", //当前模块路由的基础路径
        currentModules:<string|any>"", //当前模块
        dynamicRoutes:<RouteRecordRaw[]>[], //动态路由，一般由后台返回
        currentModulesRoutes:<RouteRecordRaw[]>[], //当前模块路由
        routes:<RouteRecordRaw[]>[], //显示的路由
        mixLeftMenu:<RouteRecordRaw[]>[], //混合模式下的路由
        routesHierarchy: <any[]>[], //路由层级
        activeTopMenu: <string>'' // 激活的顶部菜单
    }),
    actions:{
        /**
         * 变更顶部菜单
         * @param val
         */
        changeTopActive(val:string){
            this.activeTopMenu = val;
        },
        /**
         * 格式化动态路由
         * @param routes
         */
        formatDynamicRoutes,
    }
});

function formatDynamicRoutes(routes:Array<RouteRecordRaw>){
    const asyncRoute:RouteRecordRaw[] = [];
    routes.forEach(route=>{
        const tmpRoute = {...route};
        if(!route.name){
            tmpRoute.name = route.path;
        }
        const layoutObj = {
            Layout,
            menuTab,
            funGame,
            technologyWorld,
            worldData,
        };
        const layoutName = tmpRoute.component?.toString()??'';
        if(Object.keys(layoutObj).includes(layoutName)){
            //如果是布局路由，则给布局路由的component赋值
            tmpRoute.component = layoutObj[layoutName as keyof typeof layoutObj];
        }else{
            //普通路由
            //先获取views下对应的组件
            const component = modules[`../../views/${tmpRoute.component}.vue`];
            console.log('--路由--',tmpRoute.component);
            console.log('--c-',component);
            if(component){
                //组件存在则赋值，
                tmpRoute.component = component;
            }else{
                //否则，跳转到404
                tmpRoute.component = modules[`../../views/common/errorPage/404.vue}`];
            }
        }
        //有子路由，递归调用
        if(tmpRoute.children && tmpRoute.children.length>0){
            tmpRoute.children = formatDynamicRoutes(tmpRoute.children)
        }
        asyncRoute.push(tmpRoute);
    });
    return asyncRoute;
}