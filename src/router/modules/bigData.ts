import { type RouteRecordRaw } from 'vue-router';

type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};

const bigDataRoutes: Array<RouterObject> = [
  {
    path: '/bigScreen',
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
    path: '/universalTemplate',
    name: 'universalTemplate',
    component: () => import('@/views/bigData/universalTemplates/index.vue'),
    meta: {
      title: 'universalTemplate',
      description: '通用大屏模板',
      icon: 'basic-dashboard',
      permKey: 'universalTemplate',
    },
  },
];

export default bigDataRoutes;
