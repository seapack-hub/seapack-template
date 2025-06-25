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
        component: () => import('@/views/systemManagement/components/index.vue'),
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
        ]
      },
      //组件封装
      {
        path: '/genericComponent',
        name: 'genericComponent',
        component: () => import('@/views/systemManagement/components/index.vue'),
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
          }
        ]
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
        //component: "systemManagement/components/SPEcharts",
        component: () => import('@/views/systemManagement/components/index.vue'),
        //component: () => import('@/views/systemManagement/echarts/chinaMap.vue'),
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