import { RouterView, type RouteRecordRaw } from 'vue-router'
type RouterObject = RouteRecordRaw & {
  children?: RouterObject[]
}

const macroDataRoute: Array<RouterObject> = [
  {
    path: '/macroData',
    name: 'macroData',
    component: () => import('@/layout/main/index.vue'),
    redirect: { name: 'macroDataWorkbench' },
    meta: {
      title: 'macroData',
      description: '宏观数据',
      icon: 'macro-data',
      permKey: 'macroData',
    },
    children: [
      // ===== 工作台 =====
      {
        path: 'workbench',
        name: 'macroDataWorkbench',
        component: () => import('@/views/macroData/workbench/index.vue'),
        meta: {
          title: 'macroDataWorkbench',
          description: '宏观概览',
          icon: 'workbench',
          affix: true,
          keepAlive: true,
          permKey: 'macroDataWorkbench',
        },
      },
      // ===== 货币与利率 =====
      {
        path: 'monetary',
        name: 'macroMonetary',
        component: RouterView,
        redirect: { name: 'macroMoneySupply' },
        meta: {
          title: 'monetary',
          description: '货币与利率',
          icon: 'monetary',
          permKey: 'macroMonetary',
        },
        children: [
          {
            path: 'moneySupply',
            name: 'macroMoneySupply',
            component: () => import('@/views/macroData/monetary/moneySupply/index.vue'),
            meta: {
              title: 'macroMoneySupply',
              description: '货币供应量',
              icon: 'money-supply',
              permKey: 'macroMoneySupply',
            },
          },
          {
            path: 'lpr',
            name: 'macroLpr',
            component: () => import('@/views/macroData/monetary/lpr/index.vue'),
            meta: {
              title: 'macroLpr',
              description: 'LPR利率',
              icon: 'lpr-rate',
              permKey: 'macroLpr',
            },
          },
          {
            path: 'shibor',
            name: 'macroShibor',
            component: () => import('@/views/macroData/monetary/shibor/index.vue'),
            meta: {
              title: 'macroShibor',
              description: 'SHIBOR利率',
              icon: 'shibor-rate',
              permKey: 'macroShibor',
            },
          },
        ],
      },
      // ===== 融资信贷 =====
      {
        path: 'financing',
        name: 'macroFinancing',
        component: RouterView,
        redirect: { name: 'macroSocialFinance' },
        meta: {
          title: 'financing',
          description: '融资信贷',
          icon: 'financing',
          permKey: 'macroFinancing',
        },
        children: [
          {
            path: 'socialFinance',
            name: 'macroSocialFinance',
            component: () => import('@/views/macroData/financing/socialFinance/index.vue'),
            meta: {
              title: 'macroSocialFinance',
              description: '社会融资规模',
              icon: 'social-finance',
              permKey: 'macroSocialFinance',
            },
          },
        ],
      },
      // ===== 物价指数 =====
      {
        path: 'priceIndex',
        name: 'macroPriceIndex',
        component: RouterView,
        redirect: { name: 'macroCpiPpi' },
        meta: {
          title: 'priceIndex',
          description: '物价指数',
          icon: 'price-index',
          permKey: 'macroPriceIndex',
        },
        children: [
          {
            path: 'cpiPpi',
            name: 'macroCpiPpi',
            component: () => import('@/views/macroData/priceIndex/cpiPpi/index.vue'),
            meta: {
              title: 'macroCpiPpi',
              description: 'CPI/PPI',
              icon: 'cpi-ppi',
              permKey: 'macroCpiPpi',
            },
          },
        ],
      },
      // ===== 经济景气 =====
      {
        path: 'prosperity',
        name: 'macroProsperity',
        component: RouterView,
        redirect: { name: 'macroPmi' },
        meta: {
          title: 'prosperity',
          description: '经济景气',
          icon: 'prosperity',
          permKey: 'macroProsperity',
        },
        children: [
          {
            path: 'pmi',
            name: 'macroPmi',
            component: () => import('@/views/macroData/prosperity/pmi/index.vue'),
            meta: {
              title: 'macroPmi',
              description: 'PMI指数',
              icon: 'pmi',
              permKey: 'macroPmi',
            },
          },
        ],
      },
      // ===== 外汇储备 =====
      {
        path: 'reserves',
        name: 'macroReserves',
        component: RouterView,
        redirect: { name: 'macroForexReserves' },
        meta: {
          title: 'reserves',
          description: '外汇储备',
          icon: 'reserves',
          permKey: 'macroReserves',
        },
        children: [
          {
            path: 'forex',
            name: 'macroForexReserves',
            component: () => import('@/views/macroData/reserves/forex/index.vue'),
            meta: {
              title: 'macroForexReserves',
              description: '外汇储备',
              icon: 'forex-reserves',
              permKey: 'macroForexReserves',
            },
          },
          {
            path: 'gold',
            name: 'macroGoldReserves',
            component: () => import('@/views/macroData/reserves/gold/index.vue'),
            meta: {
              title: 'macroGoldReserves',
              description: '黄金储备',
              icon: 'gold-reserves',
              permKey: 'macroGoldReserves',
            },
          },
        ],
      },
      // ===== 市场情绪 =====
      {
        path: 'sentiment',
        name: 'macroSentiment',
        component: RouterView,
        redirect: { name: 'macroAccountOpenings' },
        meta: {
          title: 'sentiment',
          description: '市场情绪',
          icon: 'sentiment',
          permKey: 'macroSentiment',
        },
        children: [
          {
            path: 'openings',
            name: 'macroAccountOpenings',
            component: () => import('@/views/macroData/sentiment/openings/index.vue'),
            meta: {
              title: 'macroAccountOpenings',
              description: '股票开户数',
              icon: 'account-openings',
              permKey: 'macroAccountOpenings',
            },
          },
          {
            path: 'margin',
            name: 'macroMarginTrading',
            component: () => import('@/views/macroData/sentiment/margin/index.vue'),
            meta: {
              title: 'macroMarginTrading',
              description: '两融余额',
              icon: 'margin-trading',
              permKey: 'macroMarginTrading',
            },
          },
        ],
      },
      // ===== 数据管理 =====
      {
        path: 'management',
        name: 'macroDataManagement',
        component: () => import('@/views/macroData/management/index.vue'),
        meta: {
          title: 'macroDataManagement',
          description: '数据管理',
          icon: 'setting',
          permKey: 'macroDataManagement',
        },
      },
    ],
  },
]

export default macroDataRoute
