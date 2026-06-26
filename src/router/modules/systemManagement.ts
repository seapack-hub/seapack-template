import { RouterView, type RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};

const systemManagementRoute: Array<RouterObject> = [
  {
    path: '/systemManagement',
    name: 'systemManagement',
    component: () => import('@/layout/main/index.vue'),
    redirect: { name: 'Dashboard' },
    meta: {
      title: 'home',
      description: '系统管理',
      icon: 'system',
      permKey: 'systemManagement',
    },
    children: [
      //工作台
      {
        path: 'dashboard',
        component: () => import("@/views/systemManagement/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "dashboard",
          description: '工作台',
          icon: "home",
          affix: true,
          keepAlive: true,
          permKey: 'dashboard',
        },
      },
      //基础信息
      {
        path: 'baseInfo',
        name: 'baseInfo',
        component: RouterView,
        redirect: { name: 'user' },
        meta: {
          title: "baseInfo",
          description: "基础信息",
          icon: "system",
          permKey: 'baseInfo',
        },
        children: [
          //部门管理
          {
            path: 'dept',
            name: 'dept',
            component: () => import('@/views/systemManagement/baseInfo/deptManagement/index.vue'),
            meta: {
              title: 'dept',
              description: '部门管理',
              icon: 'dept',
              permKey: 'dept',
            },
          },
          //用户管理
          {
            path: 'user',
            name: 'user',
            component: () => import('@/views/systemManagement/baseInfo/userManagement/index.vue'),
            meta: {
              title: 'user',
              description: '用户管理',
              icon: 'user',
              permKey: 'user',
            },
          },
          //行业管理
          {
            path: 'industryManagement',
            name: 'industryManagement',
            component: () => import('@/views/systemManagement/baseInfo/industryManagement/index.vue'),
            meta: {
              title: 'industryManagement',
              description: '行业管理',
              icon: 'industry',
              permKey: 'industryManagement',
            },
          },
          //行业分类（基金行业树）
          {
            path: 'industryClassification',
            name: 'industryClassification',
            component: () => import('@/views/systemManagement/baseInfo/industryClassification/index.vue'),
            meta: {
              title: 'industryClassification',
              description: '行业分类',
              icon: 'industry',
              permKey: 'industryClassification',
            },
          },
          //字典设置
          {
            path: 'dictSetting',
            name: 'dictSetting',
            component: () => import('@/views/systemManagement/baseInfo/dictSetting/index.vue'),
            meta: {
              title: 'dictSetting',
              description: '字典设置',
              icon: 'dict',
              permKey: 'dictSetting',
            },
          },
        ]
      },
      //权限管理
      {
        path: 'permission',
        name: 'permission',
        component: RouterView,
        redirect: { name: 'role' },
        meta: {
          title: "permission",
          description: "权限管理",
          icon: "permission",
          permKey: 'permission',
        },
        children: [
          {
            path: 'role',
            name: 'role',
            component: () => import('@/views/systemManagement/permission/role/index.vue'),
            meta: {
              title: 'role',
              description: '角色管理',
              icon: 'role',
              permKey: 'role',
            },
          },
          {
            path: 'menu',
            name: 'menu',
            component: () => import('@/views/systemManagement/permission/menu/index.vue'),
            meta: {
              title: 'menu',
              description: '菜单权限',
              icon: 'menu',
              permKey: 'menu',
            },
          },
        ]
      },
    ]
  },
];

export default systemManagementRoute;
