import { RouterView, type RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};

const stockFundRoute: Array<RouterObject> = [
  {
    path: '/stockFund',
    name: 'stockFund',
    component: () => import('@/layout/main/index.vue'),
    redirect: { name: 'stockFundWorkbench' },
    meta: {
      title: 'stockFund',
      description: '股票基金',
      icon: 'trend-charts',
      permKey: 'stockFund',
    },
    children: [
      //工作台
      {
        path: 'workbench',
        name: 'stockFundWorkbench',
        component: () => import('@/views/stockFund/workbench/index.vue'),
        meta: {
          title: 'stockFundWorkbench',
          description: '工作台',
          icon: 'home',
          affix: true,
          keepAlive: true,
          permKey: 'stockFundWorkbench',
        },
      },
      //股票
      {
        path: 'stock',
        name: 'stock',
        component: RouterView,
        redirect: { name: 'stockQuote' },
        meta: {
          title: 'stock',
          description: '股票',
          icon: 'trend-charts',
          permKey: 'stock',
        },
        children: [
          //股票实时行情
          {
            path: 'stockQuote',
            name: 'stockQuote',
            component: () => import('@/views/stockFund/stockManagement/stockQuote/index.vue'),
            meta: {
              title: 'stockQuote',
              description: '股票实时行情',
              icon: 'trend-charts',
              permKey: 'stockQuote',
            },
          },
          //股票池管理
          {
            path: 'stockPool',
            name: 'stockPool',
            component: () => import('@/views/stockFund/stockManagement/stockPool/index.vue'),
            meta: {
              title: 'stockPool',
              description: '股票池管理',
              icon: 'fund-info',
              permKey: 'stockPool',
            },
          },
          {
            path: 'stockPool/detail',
            name: 'stockPoolDetail',
            component: () => import('@/views/stockFund/stockManagement/stockPool/detail.vue'),
            meta: {
              title: 'stockPoolDetail',
              description: '股票详情',
              hidden: true,
              permKey: 'stockPoolDetail',
            }
          },
          //分红数据维护
          {
            path: 'dividendData',
            name: 'dividendData',
            component: () => import('@/views/stockFund/stockManagement/dividendData/index.vue'),
            meta: {
              title: 'dividendData',
              description: '分红数据维护',
              icon: 'pie-chart',
              permKey: 'dividendData',
            },
          },
          //股票监控池
          {
            path: 'dashboardView',
            name: 'dashboardView',
            component: () => import('@/views/stockFund/stockManagement/dashboard/index.vue'),
            meta: {
              title: 'dashboardView',
              description: '股票监控池',
              icon: 'home',
              permKey: 'dashboardView',
            },
          },
          //告警历史记录
          {
            path: 'alertHistory',
            name: 'alertHistory',
            component: () => import('@/views/stockFund/stockManagement/alertHistory/index.vue'),
            meta: {
              title: 'alertHistory',
              description: '告警历史记录',
              icon: 'histogram',
              permKey: 'alertHistory',
            },
          },
        ]
      },
      //基金
      {
        path: 'fund',
        name: 'fund',
        component: RouterView,
        redirect: { name: 'fundBaseInfo' },
        meta: {
          title: 'fund',
          description: '基金',
          icon: 'fund-info',
          permKey: 'fund',
        },
        children: [
          //基金信息
          {
            path: 'fundBaseInfo',
            name: 'fundBaseInfo',
            component: () => import('@/views/stockFund/fund/index.vue'),
            meta: {
              title: 'fundBaseInfo',
              description: '基金信息',
              icon: 'fund-info',
              permKey: 'fundBaseInfo',
            },
          },
          {
            path: 'fundBaseInfo/detail',
            name: 'fundBaseInfoDetail',
            component: () => import('@/views/stockFund/fund/detail.vue'),
            meta: {
              title: 'fundBaseInfoDetail',
              description: '基金信息详情',
              icon: 'fund-info',
              hidden: true,
              permKey: 'fundBaseInfoDetail',
            },
          },
        ]
      },
    ]
  },
];

export default stockFundRoute;
