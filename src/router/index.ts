import {createRouter,createWebHistory,RouteRecordRaw,onBeforeRouteUpdate } from "vue-router";

import layout from "@/layout/menuTab/index.vue"
import {useLayoutMode} from "@/hooks/useLayoutMode.ts";
import {SystemTypeEnum} from "@/constants/app-key.ts";

export const routerRecordRow:RouteRecordRaw[] = [
    {
        path:"/",
        redirect:"/login"
    },
    {
        path:"/login",
        component:()=> import("@/views/login/index.vue"),
        meta:{
            hidden:true
        }
    },
    {
        path:"/menuTab",
        component:layout,
        redirect:"/menuTab/index",
        meta:{},
        children:[
            {
                path:"index",
                name:"menuTabIndex",
                component:()=>import("@/views/common/menuTab/index.vue"),
                meta:{}
            }
        ]
    },
    {
        path:"/errorPage",
        name:"errorPage",
        meta:{
            title:"错误界面",
            icon: 'security'
        },
        children:[
            {
                path: '401',
                name: '401',
                component: () => import('@/views/common/errorPage/401.vue'),
                meta: {
                    title: '401',
                    icon: 'security',
                    hideWatermark: true
                }
            },
            {
                path: '404',
                name: '404',
                component: () => import('@/views/common/errorPage/404.vue'),
                meta: {
                    title: '404',
                    icon: 'security'
                }
            }
        ]
    },
];
const base:string = ""
const router = createRouter({
    history:createWebHistory(base),
    routes:routerRecordRow as RouteRecordRaw[]
});
export default router;