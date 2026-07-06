import { type RouteRecordRaw } from 'vue-router';

type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};

const aiModuleRoute: Array<RouterObject> = [
  {
    path: '/aiModule',
    name: 'aiModule',
    component: () => import('@/layout/main/index.vue'),
    redirect: { name: 'rag' },
    meta: {
      title: 'aiModule',
      description: 'AI交互',
      icon: 'ai-interaction',
      permKey: 'aiModule',
    },
    children: [
      //RAG知识库
      {
        path: 'rag',
        name: 'rag',
        component: () => import('@/views/aiModule/aiInteraction/index.vue'),
        meta: {
          title: 'rag',
          description: 'RAG知识库',
          icon: 'rag',
          permKey: 'rag',
        },
      },
      //智能体交互
      {
        path: 'agent',
        name: 'agent',
        component: () => import('@/views/aiModule/aiInteraction/agent/index.vue'),
        meta: {
          title: 'agent',
          description: '智能体交互',
          icon: 'agent',
          permKey: 'agent',
        },
      },
      //图片生成
      {
        path: 'image',
        name: 'imageGeneration',
        component: () => import('@/views/aiModule/aiInteraction/imageGeneration/index.vue'),
        meta: {
          title: 'imageGeneration',
          description: '图片生成',
          icon: 'image',
          permKey: 'imageGeneration',
        },
      },
      //AI技能管理
      {
        path: 'skills',
        name: 'skillManagement',
        component: () => import('@/views/aiModule/skillManagement/index.vue'),
        meta: {
          title: 'skillManagement',
          description: 'Skills 管理',
          icon: 'skill-management',
          permKey: 'skillManagement',
        },
      },
      //提示词模板管理
      {
        path: 'promptTemplate',
        name: 'promptTemplate',
        component: () => import('@/views/aiModule/promptTemplate/index.vue'),
        meta: {
          title: 'promptTemplate',
          description: '提示词模板',
          icon: 'Document',
          permKey: 'promptTemplate',
        },
      },
      //Agent 管理
      {
        path: 'agentManage',
        name: 'agentManage',
        component: () => import('@/views/aiModule/agent/index.vue'),
        meta: {
          title: 'agentManage',
          description: 'Agent 管理',
          icon: 'User',
          permKey: 'agentManage',
        },
      },
    ]
  },
];

export default aiModuleRoute;
