import { RouterView, type RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};
//系统管理模块路由
const systemManagementRoute: Array<RouterObject> = [
  {
    path: '/systemManagement',
    name: 'systemManagement',
    component: () => import('@/layout/main/index.vue'),
    redirect: { name: 'Dashboard' },
    meta: {
      title: 'home',
      description: '系统管理',
      icon: 'system' // collapse 模式侧边栏显示此图标
    },
    children: [
      //首页
      {
        path: 'dashboard',
        component: () => import("@/views/systemManagement/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "dashboard",
          description: '首页',
          icon: "home",
          affix: true,
          keepAlive: true,
          permKey: 'system:dashboard:view',
        },
      },
      //基础信息
      {
        path: 'baseInfo',
        name: 'baseInfo',
        component: RouterView,
        redirect: { name: 'user' },
        meta:{
          title:"baseInfo",
          description:"基础信息",
          icon:"system"
        },
        children:[
          //部门管理
          {
            path: 'dept',
            name: 'dept',
            component: () => import('@/views/systemManagement/baseInfo/deptManagement/index.vue'),
            meta: {
              title: 'dept',
              description: '部门管理',
              icon: 'dept',
              permKey: 'system:dept:view',
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
              permKey: 'system:user:view',
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
              permKey: 'system:industry:view',
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
              permKey: 'system:dict:view',
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
        meta:{
          title:"permission",
          description:"权限管理",
          icon:"permission"
        },
        children:[
          {
            path: 'role',
            name: 'role',
            component: () => import('@/views/systemManagement/permission/role/index.vue'),
            meta: {
              title: 'role',
              description: '角色管理',
              icon: 'role',
              permKey: 'system:role:view',
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
              permKey: 'system:menu:view',
            },
          },
        ]
      },
      //基金模块
      {
        path: 'fund',
        name: 'fund',
        component: RouterView,
        redirect: { name: 'fundBaseInfo' },
        meta:{
          title:"fund",
          description:"基金模块",
          icon:"fund"
        },
        children:[
          //基金信息表
          {
            path: 'fundBaseInfo',
            name: 'fundBaseInfo',
            component: () => import('@/views/systemManagement/fund/index.vue'),
            meta: {
              title: 'fundBaseInfo',
              description: '基金信息',
              icon: 'fund-info',
              permKey: 'system:fund:view',
            },
          },
          //基金信息表
          {
            path: 'fundBaseInfo/detail',
            name: 'fundBaseInfoDetail',
            component: () => import('@/views/systemManagement/fund/detail.vue'),
            meta: {
              title: 'fundBaseInfoDetail',
              description: '基金信息详情',
              icon: 'fund-info',
              hidden: true,
              permKey: 'system:fund:detail',
            },
          },
          //行业分类
          {
            path: 'industry',
            name: 'industry',
            component: () => import('@/views/systemManagement/fund/Industry/index.vue'),
            meta: {
              title: 'industry',
              description: '行业分类',
              icon: 'industry',
              permKey: 'system:fund:industry:view',
            },
          },
        ]
      },
      //股息监控
      {
        path: 'stockManagement',
        name: 'stockManagement',
        component: RouterView,
        redirect: { name: 'stockQuote' },
        meta:{
          title:"stockManagement",
          description:"股息监控",
          icon:"trend-charts"
        },
        children:[
          {
            path: 'stockQuote',
            name: 'stockQuote',
            component: () => import('@/views/systemManagement/stockManagement/stockQuote/index.vue'),
            meta: {
              title: 'stockQuote',
              description: '股票实时行情',
              icon: 'trend-charts',
              permKey: 'system:stock:quote:view',
            },
          },
          {
            path: 'stockPool',
            name: 'stockPool',
            component: () => import('@/views/systemManagement/stockManagement/stockPool/index.vue'),
            meta: {
              title: 'stockPool',
              description: '股票池管理',
              icon: 'fund-info',
              permKey: 'system:stock:pool:view',
            },
          },
          {
            path: 'stockPool/detail',
            name: 'stockPoolDetail',
            component: () => import('@/views/systemManagement/stockManagement/stockPool/detail.vue'),
            meta: {
              title: 'stockPoolDetail',
              description: '股票详情',
              hidden: true,
            }
          },
          {
            path: 'dividendData',
            name: 'dividendData',
            component: () => import('@/views/systemManagement/stockManagement/dividendData/index.vue'),
            meta: {
              title: 'dividendData',
              description: '分红数据维护',
              icon: 'pie-chart',
              permKey: 'system:stock:dividend:view',
            },
          },
          {
            path: 'dashboardView',
            name: 'dashboardView',
            component: () => import('@/views/systemManagement/stockManagement/dashboard/index.vue'),
            meta: {
              title: 'dashboardView',
              description: '股票监控池',
              icon: 'home',
              permKey: 'system:stock:dashboard:view',
            },
          },
          {
            path: 'alertHistory',
            name: 'alertHistory',
            component: () => import('@/views/systemManagement/stockManagement/alertHistory/index.vue'),
            meta: {
              title: 'alertHistory',
              description: '告警历史记录',
              icon: 'histogram',
              permKey: 'system:stock:alert:view',
            },
          }
        ]
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
          icon: 'generic-com'
        },
        children: [
          //电子签名
          {
            path: 'electronicSignatures',
            name: 'electronicSignatures',
            component: () => import('@/views/systemManagement/components/electronicSignatures/ESign.vue'),
            meta: {
              title: 'electronicSignatures',
              description: '电子签名',
              icon: 'e-sign',
              permKey: 'system:component:esign:view',
            },
          },
          {
            path: 'encapsulationTable',
            name: 'encapsulationTable',
            component:()=> import("@/views/systemManagement/components/encapsulationTable/index.vue"),
            meta:{
              title:"encapsulationTable",
              description: "表格封装",
              icon:"encapsulation-table",
              permKey: 'system:component:table:view',
            },
          },
          {
            path: 'splitTable',
            name: 'splitTable',
            component:()=> import("@/views/systemManagement/components/splitTableCode/index.vue"),
            meta:{
              title:"splitTable",
              description: "表格封装",
              icon:"encapsulation-table",
              permKey: 'system:component:splitTable:view',
            },
          },
          //富文本编辑器
          {
            path: 'wang-editer',
            name: 'wangEditer',
            component:() => import("@/views/systemManagement/components/wangEditer/wang-editor.vue"),
            meta:{
              title: 'wangEditer',
              description: '富文本编辑器',
              icon: 'wang-editer',
              permKey: 'system:component:editor:view',
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
        meta:{
          title:"graphical",
          description:"图形化管理",
          icon:"graphical"
        },
        children:[
          {
            path: 'flowCharts',
            name: 'flowCharts',
            component:() => import("@/views/systemManagement/graphical/index.vue"),
            meta: {
              title: 'flowCharts',
              description: '流程图',
              icon: 'flow-chart',
              permKey: 'system:graphical:flow:view',
            },
          },
        ]
      },
      //AI
      {
        path: 'aiInteraction',
        name: 'aiInteraction',
        component: RouterView,
        redirect: { name: 'rag' },
        children:[
          //RAG知识库
          {
            path: 'rag',
            name: 'rag',
            component:() => import("@/views/systemManagement/aiInteraction/index.vue"),
            meta:{
              title:"rag",
              description: "RAG知识库",
              icon:"rag",
              permKey: 'system:ai:rag:view',
            },
          },
          //智能体交互
          {
            path: 'agent',
            name: 'agent',
            component:() => import("@/views/systemManagement/aiInteraction/agent/index.vue"),
            meta:{
              title:"agent",
              description: "智能体交互",
              icon:"agent",
              permKey: 'system:ai:agent:view',
            },
          },
          //图片生成
          {
            path: 'image',
            name: 'imageGeneration',
            component:() => import("@/views/systemManagement/aiInteraction/imageGeneration/index.vue"),
            meta:{
              title:"imageGeneration",
              description: "图片生成",
              icon:"image",
              permKey: 'system:ai:image:view',
            },
          },
        ],
        meta:{
          title:"aiInteraction",
          description: '人工智能',
          icon:"ai-interaction"
        }
      },
      //博客文档
      {
        path: 'doc',
        name: 'doc',
        component: RouterView,
        redirect: "https://juejin.cn/post/7484987385665011762",
        meta: {
          title: 'document',
          description: '博客文档',
          icon: 'document'
        },
        children:[
          {
            path: 'internal-doc-1',
            component: () => import("@/views/systemManagement/blogDocument/internal-doc-1.vue"),
            name: "InternalDoc-1",
            meta: {
              title: "InternalDoc-1",
              description: '实现电子签名',
              icon: "document",
              permKey: 'system:doc:*:view',
            },
          },
          {
            path: 'internal-doc-2',
            component: () => import("@/views/systemManagement/blogDocument/internal-doc-2.vue"),
            name: "InternalDoc-2",
            meta: {
              title: "InternalDoc-2",
              description: '实现水印',
              icon: "document",
              permKey: 'system:doc:*:view',
            },
          },
          {
            path: 'internal-doc-3',
            component: () => import("@/views/systemManagement/blogDocument/internal-doc-3.vue"),
            name: "InternalDoc-3",
            meta: {
              title: "InternalDoc-3",
              description: '封装SVG图标',
              icon: "document",
              permKey: 'system:doc:*:view',
            },
          },
          {
            path: 'internal-doc-4',
            component: () => import("@/views/systemManagement/blogDocument/internal-doc-4.vue"),
            name: "InternalDoc-4",
            meta: {
              title: "InternalDoc-4",
              description: 'JS原型链详解',
              icon: "document",
              permKey: 'system:doc:*:view',
            },
          },
          {
            path: 'internal-doc-5',
            component: () => import("@/views/systemManagement/blogDocument/internal-doc-5.vue"),
            name: "InternalDoc-5",
            meta: {
              title: "InternalDoc-5",
              description: '模板引擎详解',
              icon: "document",
              permKey: 'system:doc:*:view',
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
          icon: 'pie-chart',
        },
        children:[
          //中国地图
          {
            path: 'chinaMap',
            name: 'chinaMap',
            component: () => import('@/views/systemManagement/echarts/chinaMap.vue'),
            meta: {
              title: 'chinaMap',
              description: '中国地图',
              icon: 'china-map',
              permKey: 'system:echarts:china:view',
            },
          },
          {
            path: 'migrationMap',
            name: 'migrationMap',
            component: () => import('@/views/systemManagement/echarts/migrationMap.vue'),
            meta: {
              title: 'migrationMap',
              description: '迁徙地图',
              icon: 'migration-map',
              permKey: 'system:echarts:migration:view',
            },
          },
          {
            path: 'histogram',
            name: 'histogram',
            component: () => import('@/views/systemManagement/echarts/histogram.vue'),
            meta: {
              title: 'histogram',
              description: '柱状图',
              icon: 'histogram',
              permKey: 'system:echarts:histogram:view',
            },
          },
          {
            path: 'relationship',
            name: 'relationship',
            component: () => import('@/views/systemManagement/echarts/relationship.vue'),
            meta: {
              title: 'relationship',
              description: '人物关系',
              icon: 'histogram',
              permKey: 'system:echarts:relationship:view',
            },
          },
          {
            path: 'radar',
            name: 'radar',
            component: () => import('@/views/systemManagement/echarts/radar.vue'),
            meta: {
              title: 'radar',
              description: '雷达图',
              icon: 'radar',
              permKey: 'system:echarts:radar:view',
            },
          },
        ]
      }
    ]
  },
];

export default systemManagementRoute;
