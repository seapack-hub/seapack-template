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
    }
];
const base:string = ""
const router = createRouter({
    history:createWebHistory(base),
    routes:routerRecordRow as RouteRecordRaw[]
});

export default router;