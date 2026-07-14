import { RouterView, type RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};

const devToolsRoute: Array<RouterObject> = [
  {
    path: '/devTools',
    name: 'devTools',
    component: () => import('@/layout/main/index.vue'),
    redirect: { name: 'devToolsWorkbench' },
    meta: {
      title: 'devTools',
      description: '开发工具',
      icon: 'dev-tools',
      permKey: 'devTools',
    },
    children: [
      //工作台
      {
        path: 'workbench',
        name: 'devToolsWorkbench',
        component: () => import('@/views/devTools/workbench/index.vue'),
        meta: {
          title: 'devToolsWorkbench',
          description: '工作台',
          icon: 'workbench',
          affix: true,
          keepAlive: true,
          permKey: 'devToolsWorkbench',
        },
      },
      //组件封装
      {
        path: 'genericComponent',
        name: 'genericComponent',
        component: RouterView,
        redirect: { name: 'electronicSignatures' },
        meta: {
          title: 'genericComponent',
          description: '组件封装',
          icon: 'generic-component',
          permKey: 'genericComponent',
        },
        children: [
          {
            path: 'electronicSignatures',
            name: 'electronicSignatures',
            component: () => import('@/views/devTools/components/electronicSignatures/ESign.vue'),
            meta: {
              title: 'electronicSignatures',
              description: '电子签名',
              icon: 'electronic-signatures',
              permKey: 'electronicSignatures',
            },
          },
          {
            path: 'encapsulationTable',
            name: 'encapsulationTable',
            component: () => import('@/views/devTools/components/encapsulationTable/index.vue'),
            meta: {
              title: 'encapsulationTable',
              description: '表格封装',
              icon: 'encapsulation-table',
              permKey: 'encapsulationTable',
            },
          },
          {
            path: 'splitTable',
            name: 'splitTable',
            component: () => import('@/views/devTools/components/splitTableCode/index.vue'),
            meta: {
              title: 'splitTable',
              description: '表格封装',
              icon: 'split-table',
              permKey: 'splitTable',
            },
          },
          {
            path: 'wang-editer',
            name: 'wangEditer',
            component: () => import('@/views/devTools/components/wangEditer/wang-editor.vue'),
            meta: {
              title: 'wangEditer',
              description: '富文本编辑器',
              icon: 'wang-editor',
              permKey: 'wangEditer',
            },
          },
          {
            path: 'file-preview',
            name: 'filePreview',
            component: () => import('@/views/devTools/components/filePreview/index.vue'),
            meta: {
              title: 'filePreview',
              description: '文件预览',
              icon: 'file-preview',
              permKey: 'filePreview',
            },
          },
        ]
      },
      //图形化管理
      {
        path: 'graphical',
        name: 'graphical',
        component: RouterView,
        redirect: { name: 'flowCharts' },
        meta: {
          title: 'graphical',
          description: '图形化管理',
          icon: 'graphical',
          permKey: 'graphical',
        },
        children: [
          {
            path: 'flowCharts',
            name: 'flowCharts',
            component: () => import('@/views/devTools/graphical/index.vue'),
            meta: {
              title: 'flowCharts',
              description: '流程图',
              icon: 'flow-chart',
              permKey: 'flowCharts',
            },
          },
        ]
      },
      //echarts图表
      {
        path: 'echarts',
        name: 'echarts',
        component: RouterView,
        redirect: { name: 'chinaMap' },
        meta: {
          title: 'echarts',
          description: 'echarts',
          icon: 'echarts',
          permKey: 'echarts',
        },
        children: [
          {
            path: 'chinaMap',
            name: 'chinaMap',
            component: () => import('@/views/devTools/echarts/chinaMap.vue'),
            meta: {
              title: 'chinaMap',
              description: '中国地图',
              icon: 'china-map',
              permKey: 'chinaMap',
            },
          },
          {
            path: 'migrationMap',
            name: 'migrationMap',
            component: () => import('@/views/devTools/echarts/migrationMap.vue'),
            meta: {
              title: 'migrationMap',
              description: '迁徙地图',
              icon: 'migration-map',
              permKey: 'migrationMap',
            },
          },
          {
            path: 'histogram',
            name: 'histogram',
            component: () => import('@/views/devTools/echarts/histogram.vue'),
            meta: {
              title: 'histogram',
              description: '柱状图',
              icon: 'histogram',
              permKey: 'histogram',
            },
          },
          {
            path: 'relationship',
            name: 'relationship',
            component: () => import('@/views/devTools/echarts/relationship.vue'),
            meta: {
              title: 'relationship',
              description: '人物关系',
              icon: 'relationship',
              permKey: 'relationship',
            },
          },
          {
            path: 'radar',
            name: 'radar',
            component: () => import('@/views/devTools/echarts/radar.vue'),
            meta: {
              title: 'radar',
              description: '雷达图',
              icon: 'radar',
              permKey: 'radar',
            },
          },
        ]
      },
      //博客文档
      {
        path: 'doc',
        name: 'devDoc',
        component: RouterView,
        redirect: "https://juejin.cn/post/7484987385665011762",
        meta: {
          title: 'devDoc',
          description: '开发文档',
          icon: 'document',
          permKey: 'devDoc',
        },
        children: [
          {
            path: 'internal-doc-1',
            component: () => import('@/views/devTools/blogDocument/internal-doc-1.vue'),
            name: "InternalDoc-1",
            meta: {
              title: "InternalDoc-1",
              description: '实现电子签名',
              icon: "document",
              permKey: 'internalDoc1',
            },
          },
          {
            path: 'internal-doc-2',
            component: () => import('@/views/devTools/blogDocument/internal-doc-2.vue'),
            name: "InternalDoc-2",
            meta: {
              title: "InternalDoc-2",
              description: '实现水印',
              icon: "document",
              permKey: 'internalDoc2',
            },
          },
          {
            path: 'internal-doc-3',
            component: () => import('@/views/devTools/blogDocument/internal-doc-3.vue'),
            name: "InternalDoc-3",
            meta: {
              title: "InternalDoc-3",
              description: '封装SVG图标',
              icon: "document",
              permKey: 'internalDoc3',
            },
          },
          {
            path: 'internal-doc-4',
            component: () => import('@/views/devTools/blogDocument/internal-doc-4.vue'),
            name: "InternalDoc-4",
            meta: {
              title: "InternalDoc-4",
              description: 'JS原型链详解',
              icon: "document",
              permKey: 'internalDoc4',
            },
          },
          {
            path: 'internal-doc-5',
            component: () => import('@/views/devTools/blogDocument/internal-doc-5.vue'),
            name: "InternalDoc-5",
            meta: {
              title: "InternalDoc-5",
              description: '模板引擎详解',
              icon: "document",
              permKey: 'internalDoc5',
            },
          },
        ]
      },
    ]
  },
];

export default devToolsRoute;
