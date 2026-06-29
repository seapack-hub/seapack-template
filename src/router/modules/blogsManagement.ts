import { RouterView, type RouteRecordRaw } from 'vue-router';
type RouterObject = RouteRecordRaw & {
  children?: RouterObject[];
};

const blogsManagementRoute: Array<RouterObject> = [
  {
    path: '/blogsManagement',
    name: 'blogsManagement',
    component: () => import('@/layout/blogs/index.vue'),
    redirect: { name: 'blogs' },
    meta: {
      title: 'blogsManagement',
      description: '个人博客',
      icon: 'blog',
      permKey: 'blogsManagement',
    },
    children: [
      // 博客前台
      {
        path: 'blogs',
        name: 'blogs',
        component: () => import('@/views/blogs/index.vue'),
        meta: {
          title: 'blogs',
          description: '博客首页',
          icon: 'blog',
          permKey: 'blogs',
        },
      },
      // 文章详情
      {
        path: 'article/:id',
        name: 'articleDetail',
        component: () => import('@/views/blogs/detail/index.vue'),
        meta: {
          title: 'articleDetail',
          description: '文章详情',
          hidden: true,
          permKey: 'articleDetail',
        },
      },
      // 管理后台
      {
        path: 'admin',
        name: 'blogsAdmin',
        component: RouterView,
        redirect: { name: 'articleList' },
        meta: {
          title: 'blogsAdmin',
          description: '博客管理',
          icon: 'setting',
          permKey: 'blogsAdmin',
        },
        children: [
          {
            path: 'articles',
            name: 'articleList',
            component: () => import('@/views/blogs/admin/ArticleList.vue'),
            meta: {
              title: 'articleList',
              description: '文章管理',
              icon: 'document',
              permKey: 'articleList',
            },
          },
          {
            path: 'articleCreate',
            name: 'articleCreate',
            component: () => import('@/views/blogs/admin/ArticleEdit.vue'),
            meta: {
              title: 'articleCreate',
              description: '文章创作',
              icon: 'article-create',
              permKey: 'articleCreate',
            },
          },
          {
            path: 'edit/:id',
            name: 'articleEdit',
            component: () => import('@/views/blogs/admin/ArticleEdit.vue'),
            meta: {
              title: 'articleEdit',
              description: '编辑文章',
              icon: 'article-create',
              hidden: true,
              permKey: 'articleEdit',
            },
          },
          {
            path: 'projects',
            name: 'projectList',
            component: () => import('@/views/blogs/admin/ProjectList.vue'),
            meta: {
              title: 'projectList',
              description: '项目管理',
              icon: 'project-list',
              permKey: 'projectList',
            },
          },
          {
            path: 'project/create',
            name: 'projectCreate',
            component: () => import('@/views/blogs/admin/ProjectEdit.vue'),
            meta: {
              title: 'projectCreate',
              description: '新增项目',
              icon: 'plus',
              hidden: true,
              permKey: 'projectCreate',
            },
          },
          {
            path: 'project/edit/:id',
            name: 'projectEdit',
            component: () => import('@/views/blogs/admin/ProjectEdit.vue'),
            meta: {
              title: 'projectEdit',
              description: '编辑项目',
              icon: 'edit',
              hidden: true,
              permKey: 'projectEdit',
            },
          },
          {
            path: 'categories',
            name: 'categoryManage',
            component: () => import('@/views/blogs/admin/CategoryManage.vue'),
            meta: {
              title: 'categoryManage',
              description: '分类管理',
              icon: 'category-manage',
              permKey: 'categoryManage',
            },
          },
        ],
      },
    ],
  },
];

export default blogsManagementRoute;
