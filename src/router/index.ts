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
    }
];
const base:string = ""
const router = createRouter({
    history:createWebHistory(base),
    routes:routerRecordRow as RouteRecordRaw[]
});

export default router;