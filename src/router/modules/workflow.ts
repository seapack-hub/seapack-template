import type { RouteRecordRaw } from 'vue-router';

const workflowRoutes: RouteRecordRaw[] = [
  {
    path: '/workflow',
    name: 'workflowModule',
    component: () => import('@/layout/main/index.vue'),
    redirect: { name: 'workflowList' },
    meta: {
      title: 'workflow',
      description: '工作流管理',
      icon: 'workflow',
      permKey: 'workflowModule',
    },
    children: [
      {
        path: 'list',
        name: 'workflowList',
        component: () => import('@/views/workflow/index.vue'),
        meta: {
          title: 'workflowList',
          description: '工作流列表',
          icon: 'workflow-list',
          permKey: 'workflowList',
        },
      },
      {
        path: 'categories',
        name: 'workflowCategories',
        component: () => import('@/views/workflow/categories/index.vue'),
        meta: {
          title: 'workflowCategories',
          description: '分类管理',
          icon: 'workflow-categories',
          permKey: 'workflowCategories',
        },
      },
      {
        path: 'editor/:id?',
        name: 'workflowEditor',
        component: () => import('@/views/workflow/editor.vue'),
        meta: {
          title: 'workflowEditor',
          description: '工作流编辑器',
          icon: 'workflow-editor',
          permKey: 'workflowEditor',
          hidden: true,
        },
      },
      {
        path: 'instances',
        name: 'workflowInstances',
        component: () => import('@/views/workflow/instances/index.vue'),
        meta: {
          title: 'workflowInstances',
          description: '执行实例',
          icon: 'workflow-instances',
          permKey: 'workflowInstances',
        },
      },
      {
        path: 'instances/:id',
        name: 'workflowInstanceDetail',
        component: () => import('@/views/workflow/instances/detail.vue'),
        meta: {
          title: 'workflowInstanceDetail',
          description: '实例详情',
          permKey: 'workflowInstanceDetail',
          hidden: true,
        },
      },
      {
        path: 'tasks',
        name: 'workflowTasks',
        component: () => import('@/views/workflow/tasks/index.vue'),
        meta: {
          title: 'workflowTasks',
          description: '人工任务',
          icon: 'workflow-tasks',
          permKey: 'workflowTasks',
        },
      },
      {
        path: 'schedules',
        name: 'workflowSchedules',
        component: () => import('@/views/workflow/schedules/index.vue'),
        meta: {
          title: 'workflowSchedules',
          description: '调度管理',
          icon: 'workflow-schedules',
          permKey: 'workflowSchedules',
        },
      },
      {
        path: 'stats',
        name: 'workflowStats',
        component: () => import('@/views/workflow/stats/index.vue'),
        meta: {
          title: 'workflowStats',
          description: '执行统计',
          icon: 'workflow-stats',
          permKey: 'workflowStats',
        },
      },
    ],
  },
];

export default workflowRoutes;
