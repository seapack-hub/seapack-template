import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

//import layout from '@/layout/main/index.vue';

export const routerRecordRow: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      hidden: true
    }
  },
  //主页-工作台
  {
    path: '/menuTab',
    component: () => import('@/views/common/workbench/index.vue'),
  },
  //博客
  {
    path: "/blogsManagement",
    //component:()=> import("@/views/blogs/index.vue"),
    component: ()=>import("@/layout/menuTab/index.vue"),
    redirect: '/blogs',
    children:[
      {
        path: "/blogs",
        component: () => import("@/views/blogs/index.vue"),
        name: "blogs",
      }
    ]
  },
  {
    path: '/errorPage',
    name: 'errorPage',
    meta: {
      title: '错误界面',
      icon: 'security'
    },
    children: [
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
  }
];
const base: string = '';
const router = createRouter({
  history: createWebHistory(base),
  routes: routerRecordRow as RouteRecordRaw[]
});
export default router;
