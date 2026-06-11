interface RouterObject {
  [key: string]: any;
}
const Layout = () => import('@/layout/main/index.vue');
//系统管理模块路由
const systemManagementRoute: Array<RouterObject> = [
  {
    path: '/systemManagement',
    name: 'systemManagement',
    component: Layout,
    redirect: '/dashboard',
    show: true,
    meta: {
      title: 'home',
      description: '系统管理'
    },
    children: [
      //首页
      {
        path: "/dashboard",
        component: () => import("@/views/systemManagement/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "dashboard",
          description: '首页',
          icon: "home",
          affix: true,
          keepAlive: true,
        },
      },
      //系统管理
      {
        path:"/system",
        redirect: '/user',
        meta:{
          title:"system",
          description:"系统管理",
          icon:"system"
        },
        children:[
          //用户管理
          {
            path: '/user',
            name: 'user',
            component: () => import('@/views/systemManagement/userManagement/index.vue'),
            meta: {
              title: 'user',
              description: '用户管理',
              icon: 'user'
            }
          },
          //行业管理
          {
            path: '/industryManagement',
            name: 'industryManagement',
            component: () => import('@/views/systemManagement/industryManagement/index.vue'),
            meta: {
              title: 'industryManagement',
              description: '行业管理',
              icon: 'industry'
            }
          },
          //字典设置
          {
            path: '/dictSetting',
            name: 'dictSetting',
            component: () => import('@/views/systemManagement/dictSetting/index.vue'),
            meta: {
              title: 'dictSetting',
              description: '字典设置',
              icon: 'dict'
            }
          },
        ]
      },
      //基金模块
      {
        path:"/fund",
        redirect: '/fundBaseInfo',
        meta:{
          title:"fund",
          description:"基金模块",
          icon:"fund"
        },
        children:[
          //基金信息表
          {
            path: '/fundBaseInfo',
            name: 'fundBaseInfo',
            component: () => import('@/views/systemManagement/fundManagement/index.vue'),
            meta: {
              title: 'fundBaseInfo',
              description: '基金信息',
              icon: 'fund-info'
            }
          },
          //基金信息表
          {
            path: '/fundBaseInfo/detail',
            name: 'fundBaseInfoDetail',
            component: () => import('@/views/systemManagement/fundManagement/detail.vue'),
            meta: {
              title: 'fundBaseInfoDetail',
              hidden: true,
              description: '基金信息详情',
              icon: 'fund-info'
            }
          },
          //行业分类
          {
            path: '/industry',
            name: 'industry',
            component: () => import('@/views/systemManagement/fundManagement/Industry/index.vue'),
            meta: {
              title: 'industry',
              description: '行业分类',
              icon: 'industry'
            }
          },
          //股票行情
          {
            path: '/stockTrading',
            name: 'stockTrading',
            component: () => import('@/views/systemManagement/stockTrading/index.vue'),
            meta: {
              title: 'stockTrading',
              description: '股票行情',
              icon: 'trend-charts'
            }
          }
        ]
      },
      //股息监控
      {
        path:"/stockManagement",
        redirect: '/dashboardView',
        meta:{
          title:"stockManagement",
          description:"股息监控",
          icon:"trend-charts"
        },
        children:[
          {
            path: '/dashboardView',
            name: 'dashboardView',
            component: () => import('@/views/systemManagement/stockManagement/dashboard/index.vue'),
            meta: {
              title: 'dashboardView',
              description: '股票监控池',
              icon: 'home'
            }
          },
          {
            path: '/stockPool',
            name: 'stockPool',
            component: () => import('@/views/systemManagement/stockManagement/stockPool/index.vue'),
            meta: {
              title: 'stockPool',
              description: '股票池管理',
              icon: 'fund-info'
            }
          },
          {
            path: '/stockPool/detail',
            name: 'stockPoolDetail',
            component: () => import('@/views/systemManagement/stockManagement/stockPool/detail.vue'),
            meta: {
              title: 'stockPoolDetail',
              description: '股票详情',
              hidden: true,
            }
          },
          {
            path: '/dividendData',
            name: 'dividendData',
            component: () => import('@/views/systemManagement/stockManagement/dividendData/index.vue'),
            meta: {
              title: 'dividendData',
              description: '分红数据维护',
              icon: 'pie-chart'
            }
          },
          {
            path: '/alertRules',
            name: 'alertRules',
            component: () => import('@/views/systemManagement/stockManagement/alertRules/index.vue'),
            meta: {
              title: 'alertRules',
              description: '监控规则配置',
              icon: 'alert'
            }
          },
          {
            path: '/alertHistory',
            name: 'alertHistory',
            component: () => import('@/views/systemManagement/stockManagement/alertHistory/index.vue'),
            meta: {
              title: 'alertHistory',
              description: '告警历史记录',
              icon: 'histogram'
            }
          }
        ]
      },
      //组件封装
      {
        path: '/genericComponent',
        name: 'genericComponent',
        redirect: '/electronicSignatures',
        meta: {
          title: 'genericComponent',
          description: '组件封装',
          icon: 'generic-com'
        },
        children: [
          //电子签名
          {
            path: '/electronicSignatures',
            name: 'electronicSignatures',
            component: () => import('@/views/systemManagement/components/electronicSignatures/ESign.vue'),
            meta: {
              title: 'electronicSignatures',
              description: '电子签名',
              icon: 'e-sign'
            }
          },
          {
            path:"/encapsulationTable",
            name:"encapsulationTable",
            component:()=> import("@/views/systemManagement/components/encapsulationTable/index.vue"),
            meta:{
              title:"encapsulationTable",
              description:"表格封装",
              icon:"encapsulation-table"
            }
          },
          {
            path:"/splitTable",
            name:"splitTable",
            component:()=> import("@/views/systemManagement/components/splitTableCode/index.vue"),
            meta:{
              title:"splitTable",
              description:"表格封装",
              icon:"encapsulation-table"
            }
          },
          //富文本编辑器
          {
            path:"/wang-editer",
            name:"wangEditer",
            component:() => import("@/views/systemManagement/wangEditer/wang-editor.vue"),
            meta:{
              title: 'wangEditer',
              description: '富文本编辑器',
              icon: 'wang-editer'
            }
          },
        ]
      },
      //图形化管理
      {
        path:"/graphical",
        name:"graphical",
        redirect: '/flowCharts',
        meta:{
          title:"graphical",
          description:"图形化管理",
          icon:"graphical"
        },
        children:[
          {
            path: '/flowCharts',
            name: 'flowCharts',
            component:() => import("@/views/systemManagement/graphical/index.vue"),
            meta: {
              title: 'flowCharts',
              description: '流程图',
              icon: 'flow-chart'
            }
          },
        ]
      },
      {
        path:"/aiInteraction",
        name:"aiInteraction",
        // component:() => import("@/views/systemManagement/aiInteraction/index.vue"),
        redirect: '/rag',
        children:[
          //RAG知识库
          {
            path:"/rag",
            name:"rag",
            component:() => import("@/views/systemManagement/aiInteraction/index.vue"),
            meta:{
              title:"rag",
              description:"RAG知识库",
              icon:"rag"
            }
          },
          //智能体交互
          {
            path:"/agent",
            name:"agent",
            component:() => import("@/views/systemManagement/aiInteraction/agent/index.vue"),
            meta:{
              title:"agent",
              description:"智能体交互",
              icon:"agent"
            }
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
        path:"/doc",
        name:"doc",
        redirect: "https://juejin.cn/post/7484987385665011762",
        meta: {
          title: 'document',
          description: '博客文档',
          icon: 'document'
        },
        children:[
          {
            path: "/internal-doc-1",
            component: () => import("@/views/blogs/demo/internal-doc-1.vue"),
            name: "InternalDoc-1",
            meta: {
              title: "InternalDoc-1",
              description: '实现电子签名',
              icon: "document"
            },
          },
          {
            path: "/internal-doc-2",
            component: () => import("@/views/blogs/demo/internal-doc-2.vue"),
            name: "InternalDoc-2",
            meta: {
              title: "InternalDoc-2",
              description: '实现水印',
              icon: "document"
            },
          },
          {
            path: "/internal-doc-3",
            component: () => import("@/views/blogs/demo/internal-doc-3.vue"),
            name: "InternalDoc-3",
            meta: {
              title: "InternalDoc-3",
              description: '封装SVG图标',
              icon: "document"
            },
          },
          {
            path: "/internal-doc-4",
            component: () => import("@/views/blogs/demo/internal-doc-4.vue"),
            name: "InternalDoc-4",
            meta: {
              title: "InternalDoc-4",
              description: 'JS原型链详解',
              icon: "document"
            },
          },
          {
            path: "/internal-doc-5",
            component: () => import("@/views/blogs/demo/internal-doc-5.vue"),
            name: "InternalDoc-5",
            meta: {
              title: "InternalDoc-5",
              description: '模板引擎详解',
              icon: "document"
            },
          },
        ]
      },
      //echarts图表
      {
        path: '/echarts',
        name: 'echarts',
        redirect: '/chinaMap',
        meta: {
          title: 'echarts',
          description: 'echarts',
          icon: 'pie-chart',
        },
        children:[
          //中国地图
          {
            path: '/chinaMap',
            name: 'chinaMap',
            component: () => import('@/views/systemManagement/echarts/chinaMap.vue'),
            meta: {
              title: 'chinaMap',
              description: '中国地图',
              icon: 'china-map'
            }
          },
          {
            path: '/migrationMap',
            name: 'migrationMap',
            component: () => import('@/views/systemManagement/echarts/migrationMap.vue'),
            meta: {
              title: 'migrationMap',
              description: '迁徙地图',
              icon: 'migration-map'
            }
          },
          {
            path: '/histogram',
            name: 'histogram',
            component: () => import('@/views/systemManagement/echarts/histogram.vue'),
            meta: {
              title: 'histogram',
              description: '柱状图',
              icon: 'histogram'
            }
          },
          {
            path: '/relationship',
            name: 'relationship',
            component: () => import('@/views/systemManagement/echarts/relationship.vue'),
            meta: {
              title: 'relationship',
              description: '人物关系',
              icon: 'histogram'
            }
          },
          {
            path: '/radar',
            name: 'radar',
            component: () => import('@/views/systemManagement/echarts/radar.vue'),
            meta: {
              title: 'radar',
              description: '雷达图',
              icon: 'radar'
            }
          },
        ]
      }
    ]
  },
];

export default systemManagementRoute;