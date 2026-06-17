import { usePermissionStore } from '@/store/modules/permission.ts';
import { useUserStore } from '@/store/modules/user';
import { setRouteChange } from '@/hooks/useRouteListener.ts';
// @ts-ignore
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from './router';
import { AuthAPI, type MenuTree } from '@/api/system/permission/auth';

/**
 * 将后端返回的 MenuTree 节点递归转换为 Vue Router 所需的 RouteRecordRaw 格式
 * @param menu  后端菜单树节点
 * @param depth 当前递归深度，超过 5 层则截断，防止无限递归
 * @returns 转换后的路由配置对象，或 null（深度超限时）
 */
// @ts-ignore
function convertMenuToRoute(menu: MenuTree, depth = 0): any {
  // 递归深度超过 5 层时返回 null，防止后端返回畸形数据导致死循环
  if (depth > 5) return null
  // 构造基础路由对象，path/name/meta 直接从 MenuTree 映射
  const route: any = {
    path: menu.path || '',           // 路由路径，如 '/user'
    name: menu.name,                 // 路由名称，用于命名路由跳转
    meta: {
      title: menu.name,              // 侧边栏显示的标题
      description: menu.name,        // 描述信息
      icon: menu.icon || '',         // 侧边栏图标
      type: menu.type,               // 节点类型：1=目录 2=菜单
      hidden: menu.status === 0,     // status 为 0 时隐藏该路由（不显示在侧边栏）
    },
  }
  // 只有 type === 2（菜单）且 component 存在时，才绑定组件
  // component 格式如 '/systemManagement/baseInfo/userManagement/index.vue'，前导 / 需去掉
  if (menu.type === 2 && menu.component && menu.component.startsWith('/')) {
    // 去掉前导斜杠，得到 'systemManagement/baseInfo/userManagement/index.vue'
    const compPath = menu.component.replace(/^\//, '')
    // 使用动态 import 实现懒加载，路径自动补全 src/views 前缀
    route.component = () => import(`@/views/${compPath}.vue`)
  }
  // 递归处理子节点（如目录下还有子目录或菜单）
  if (menu.children && menu.children.length > 0) {
    const converted: any[] = []
    for (const child of menu.children) {
      const c = convertMenuToRoute(child, depth + 1)
      if (c) converted.push(c)
    }
    // 只有当子路由数组不为空时才赋值，避免空 children 影响路由匹配
    if (converted.length > 0) route.children = converted
  }
  // 返回构建好的路由对象
  return route
}

// 全局路由前置守卫
// 每次路由跳转前都会执行，负责：动态路由加载 / 权限校验 / 进度条控制
router.beforeEach(async (to, from, next) => {
  // 开启顶部加载进度条
  NProgress.start();
  // 获取权限 store 实例
  const permissionStore = usePermissionStore();

  // 从 store 中读取已注册的动态路由列表
  const dynamicRoutes = permissionStore?.dynamicRoutes ?? [];
  // 如果动态路由已存在（已加载过），走正常导航流程
  if (dynamicRoutes.length > 0) {
    // 获取当前模块标记（用于混合布局模式区分顶部/侧边菜单）
    const currentModules = permissionStore.currentModules;
    // 判断 routes 是否已合并
    const hasRoutes = permissionStore?.routes?.length > 0;
    // 获取当前路由匹配到的第一个路由记录的名称
    const currentRouteModules = to?.matched?.[0]?.name;
    // 当存在路由列表且当前模块与路由匹配的模块一致时
    if (hasRoutes && currentModules === currentRouteModules) {
      // 如果当前路径没有任何路由匹配成功且来源页也不存在，说明是非法路径，跳 404
      if (to.matched.length === 0 && !from.name) {
        next('/errorPage/404');
      } else {
        // 正常放行
        next();
      }
    } else {
      // 模块不匹配时什么也不做，继续执行 next()
    }
    // 放行导航（注意：这个 next 在 if/else 外部，确保无论如何都会放行）
    next();
  } else {
    // ========== 首次访问：加载路由 ==========

    // 使用 Vite 的 import.meta.glob 扫描 'src/router/modules/*.ts' 下的所有路由模块文件
    // eager: true 表示同步加载，模块内容直接内联
    const tsFiles = import.meta.glob('@/router/modules/*.ts', { eager: true });
    // 用于合并所有模块中导出的路由数组
    const mergedArray: any[] = [];
    // 遍历每个模块文件
    Object.values(tsFiles).forEach((module: any) => {
      // 如果模块有 default 导出且是数组，就合并进来
      if (module.default && Array.isArray(module.default)) {
        mergedArray.push(...module.default);
      }
    });
    // 格式化路由数据（补充 name 等）
    const asyncRouter = permissionStore.formatDynamicRoutes(mergedArray);
    // 将格式化后的路由逐条添加到 Vue Router 实例中
    asyncRouter.forEach((route) => {
      router.addRoute(route);
    });
    // 将动态路由保存到 store，供后续路由守卫判断 "是否已加载"
    permissionStore.dynamicRoutes = asyncRouter;
    // 将合并后的路由（静态路由 + 动态路由）存入 store
    permissionStore.setRoutes(asyncRouter);

    // 静态路由加载完以后，尝试从后端获取当前用户的动态菜单
    // 目的是让后端根据用户角色过滤菜单，后续可据此做侧边栏筛选
    try {
      // 获取用户 store，拿到当前登录用户的 ID
      const userStore = useUserStore();
      const userId = userStore.userInfo.id;
      // 调用后端接口 /auth/menus?userId=xxx，获取当前用户有权限的菜单树
      const menus = await AuthAPI.getMenus(userId);
      // 如果后端返回了菜单数据
      if (menus && menus.length > 0) {
        // 创建一个 Set 用于收集所有有权限的菜单路径
        const menuPaths = new Set<string>()
        // 递归遍历菜单树，将每个节点的 path 存入 Set
        function collectPaths(list: MenuTree[]) {
          for (const m of list) {
            if (m.path) menuPaths.add(m.path)
            if (m.children) collectPaths(m.children)
          }
        }
        collectPaths(menus)
        // 标记动态菜单已加载完成，下次路由守卫不再进入首次加载分支
        permissionStore.setDynamicLoaded(true)
      }
    } catch {
      // 如果后端接口不存在或网络异常，不阻塞页面
      // 降级策略：直接使用全量静态路由，保证页面可用
      console.warn('动态菜单获取失败，使用静态路由')
    }

    // 路由已添加完毕，重新导航到目标页面（replace: true 不留下历史记录）
    next({ ...to, replace: true });
  }
});

// 全局路由后置守卫
// 路由跳转完成后执行，用于收尾工作
router.afterEach((to) => {
  // 关闭顶部加载进度条
  NProgress.done()
  // 通知路由监听器，当前路由已变化（用于 tagsView 等组件更新）
  setRouteChange(to);
});
