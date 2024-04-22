import {createRouter,createWebHistory,RouteRecordRaw} from "vue-router";

import layout from "@/layout/menuTab/index.vue"

const routerRecordRow:RouteRecordRaw[] = [
    {
        path:"/",
        redirect:"/menuTab"
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
    {
        "path": "/systemManagement",
        "name": "systemManagement",
        "component": layout,
        "redirect": "/systemManagement/workbench",
        "meta": {
            "title": "home",
            "description": "系统管理"
        },
        "children": [
            {
                "path": "workbench",
                "name": "workbench",
                "component": ()=> import("@/views/common/workbench/index.vue"),
                "meta": {
                    "title": "workbench",
                    "description": "工作台"
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