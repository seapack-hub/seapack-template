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
      permKey: 'bigData',
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
          permKey: 'bigScreen',
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
          permKey: 'universalTemplate',
        },
      },
    ],
  },
];

export default bigDataRoute;
