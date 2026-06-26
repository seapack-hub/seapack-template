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
    ]
  },
];

export default aiModuleRoute;
