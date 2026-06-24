import { createRouter, createWebHistory, RouteRecordRaw, RouterView } from 'vue-router';

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
        path: '403',
        name: '403',
        component: () => import('@/views/common/errorPage/403.vue'),
        meta: {
          title: '403',
          icon: 'security'
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
  // 旧路径兼容重定向
  //通用模板大屏
  {
    path: '/universalTemplate',
    redirect: '/bigData/universalTemplate'
  },
  {
    path: '/bigScreen',
    redirect: '/bigData/bigScreen'
  },
  // 兜底：未匹配到任何路由时跳转 404 错误页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/errorPage/404'
  }
];
const base: string = '';
const router = createRouter({
  history: createWebHistory(base),
  routes: routerRecordRow as RouteRecordRaw[]
});

// 缓存原始模块路由定义（供 collectRoutes 和 sidebar 使用，避免 router.getRoutes() 标准化后结构丢失）
let rawModuleRoutes: RouteRecordRaw[] = [];

// 启动时全量加载所有模块路由，使导航永不因路由未注册而失败
export function initAllRoutes() {
  const modules = import.meta.glob('@/router/modules/*.ts', { eager: true })
  Object.values(modules).forEach((mod: any) => {
    if (mod.default && Array.isArray(mod.default)) {
      mod.default.forEach((route: RouteRecordRaw) => {
        if (!router.hasRoute(route.name as string)) {
          router.addRoute(route)
        }
        // 缓存原始路由定义（只存顶级模块路由）
        if (route.name && !rawModuleRoutes.some(r => r.name === route.name)) {
          rawModuleRoutes.push(route)
        }
      })
    }
  })
}

// 获取缓存的原始模块路由定义
export function getRawModuleRoutes(): RouteRecordRaw[] {
  return rawModuleRoutes;
}

export default router;
