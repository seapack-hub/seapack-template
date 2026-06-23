import { createRouter, createWebHistory, RouteRecordRaw, RouterView } from 'vue-router';

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
    name: "blogsManagement",
    component: RouterView,
    redirect: { name: 'blogs' },
    children:[
      {
        path: "blogs",
        component: () => import("@/views/blogs/index.vue"),
        meta: {
          title: '博客管理',
          icon: 'security'
        },
        name: "blogs",
      }
    ]
  },
  {
    path: '/errorPage',
    name: 'errorPage',
    component: RouterView,
    redirect: { name: '401' },
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
