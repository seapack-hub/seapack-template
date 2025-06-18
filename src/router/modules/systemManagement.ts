interface RouterObject {
  [key: string]: any;
}
const Layout = () => import('@/layout/main/index.vue');
//系统管理模块路由
const systemManagementRoute: Array<RouterObject> = [
  //系统管理
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
      //通用组件
      {
        path: '/genericComponent',
        name: 'genericComponent',
        //component: "systemManagement/components/index",
        component: () => import('@/views/systemManagement/components/index.vue'),
        meta: {
          title: 'genericComponent',
          description: '通用组件',
          icon: 'generic-com'
        },
        children: [
          {
            path: '/systemManagement/components/electronicSignatures/ESign',
            name: 'electronicSignatures',
            //component: "systemManagement/components/electronicSignatures/ESign",
            component: () => import('@/views/systemManagement/components/electronicSignatures/ESign.vue'),
            meta: {
              title: 'electronicSignatures',
              description: '电子签名',
              icon: 'e-sign'
            }
          }
        ]
      },
      //文件上传
      {
        path: '/systemManagement/components/SPFileUpload',
        name: 'fileUpload',
        //component: "systemManagement/components/SPFileUpload",
        component: () => import('@/views/systemManagement/components/SPFileUpload.vue'),
        meta: {
          title: 'fileUpload',
          description: '文件上传',
          icon: 'file-upload-dark',
          elIcon: 'Grid'
        }
      },
      //echarts图表
      {
        path: '/echarts-table',
        name: 'echarts',
        //component: "systemManagement/components/SPEcharts",
        component: () => import('@/views/systemManagement/components/SPEcharts.vue'),
        meta: {
          title: 'fileUpload',
          description: 'echarts图表',
          icon: 'pie-chart',
          elIcon: 'Grid'
        }
      }
    ]
  },
];

export default systemManagementRoute;