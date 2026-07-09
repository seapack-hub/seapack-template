import { RouterView, type RouteRecordRaw } from 'vue-router';

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
      // ==================== AI交互 ====================
      {
        path: 'interaction',
        name: 'aiInteraction',
        component: RouterView,
        redirect: { name: 'rag' },
        meta: {
          title: 'aiInteraction',
          description: 'AI交互',
          icon: 'ai-interaction',
          permKey: 'aiInteraction',
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
              icon: 'image-generation',
              permKey: 'imageGeneration',
            },
          },
        ],
      },
      // ==================== 配置管理 ====================
      {
        path: 'config',
        name: 'aiConfig',
        component: RouterView,
        redirect: { name: 'agentManage' },
        meta: {
          title: 'aiConfig',
          description: '配置管理',
          icon: 'setting',
          permKey: 'aiConfig',
        },
        children: [
          //Agent 管理
          {
            path: 'agentManage',
            name: 'agentManage',
            component: () => import('@/views/aiModule/agent/index.vue'),
            meta: {
              title: 'agentManage',
              description: 'Agent 管理',
              icon: 'agent-manage',
              permKey: 'agentManage',
            },
          },
          //场景管理
          {
            path: 'sceneManage',
            name: 'sceneManage',
            component: () => import('@/views/aiModule/scene/index.vue'),
            meta: {
              title: 'sceneManage',
              description: '场景管理',
              icon: 'scene-manage',
              permKey: 'sceneManage',
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
              icon: 'prompt-template',
              permKey: 'promptTemplate',
            },
          },
          //知识库管理
          {
            path: 'knowledgeBase',
            name: 'knowledgeBase',
            component: () => import('@/views/aiModule/knowledgeBase/index.vue'),
            meta: {
              title: 'knowledgeBase',
              description: '知识库管理',
              icon: 'knowledge-base',
              permKey: 'knowledgeBase',
            },
          },
        ],
      },
      // ==================== 数据管理 ====================
      {
        path: 'data',
        name: 'aiData',
        component: RouterView,
        redirect: { name: 'tokenStats' },
        meta: {
          title: 'aiData',
          description: '数据管理',
          icon: 'data-line',
          permKey: 'aiData',
        },
        children: [
          //Token 用量统计
          {
            path: 'tokenStats',
            name: 'tokenStats',
            component: () => import('@/views/aiModule/tokenStats/index.vue'),
            meta: {
              title: 'tokenStats',
              description: 'Token 统计',
              icon: 'data-analysis',
              permKey: 'tokenStats'
            },
          },
        ],
      },
    ],
  },
];

export default aiModuleRoute;
