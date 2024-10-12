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
    // {
    //     path: "/worldData",
    //     name: "worldData",
    //     component: ()=>import("@/layout/worldData/index.vue"),
    //     redirect: "/worldData/openLayers/index",
    //     meta: {
    //       "title": "home",
    //       "description": "数据世界"
    //     },
    //     children: [
    //       {
    //         path: "openLayers",
    //         name: "openLayers",
    //         component: ()=>import("@/views/worldData/openLayers/index.vue"),
    //         redirect: "/worldData/openLayers/index",
    //         meta: {
    //           title: "openLayers",
    //           description: "二维地图",
    //           icon:"openlayers"
    //         },
    //         children:[
    //           {
    //             path:"index",
    //             name:"index",
    //             component: ()=>import("@/views/worldData/openLayers/index.vue"),
    //             meta: {
    //               title: "openLayers",
    //               description: "天地图",
    //               icon:"openlayers"
    //             }
    //           },
    //           {
    //             path:"ceshi",
    //             name:"ceshi",
    //             component: ()=>import("@/views/worldData/openLayers/components/ceshi.vue"),
    //             meta: {
    //               title: "openLayers",
    //               description: "测试",
    //               icon:"openlayers"
    //             }
    //           },
    //         ]
    //       }
    //     ]
    //   }
];
const base:string = ""
const router = createRouter({
    history:createWebHistory(base),
    routes:routerRecordRow as RouteRecordRaw[]
});
export default router;