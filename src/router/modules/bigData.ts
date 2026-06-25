import { RouterView, type RouteRecordRaw } from 'vue-router';

type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};

const bigDataRoute: Array<RouterObject> = [
  {
    path: '/bigData',
    name: 'bigData',
    component: RouterView,
    redirect: { name: 'bigScreen' },
    meta: {
      title: 'bigData',
      description: '数据大屏',
      icon: 'screen',
    },
    children: [
      {
        path: 'bigScreen',
        name: 'bigScreen',
        component: () => import('@/views/bigScreen/index.vue'),
        meta: {
          title: 'bigScreen',
          description: '智慧运营大屏',
          icon: 'screen',
          permKey: 'bigdata:screen:view',
        },
      },
      {
        path: 'universalTemplate',
        name: 'universalTemplate',
        component: () => import('@/views/bigData/universalTemplates/index.vue'),
        meta: {
          title: 'universalTemplate',
          description: '通用大屏模板',
          icon: 'screen',
          permKey: 'bigdata:template:view',
        },
      },
    ],
  },
];

export default bigDataRoute;
