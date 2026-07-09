// 模块定义：集中管理所有功能模块的元信息，用于侧边栏导航和模块切换器
export interface ModuleDef {
  key: string           // 模块唯一标识，与路由 name 对应
  path: string          // 默认导航路径
  title: string         // 模块名称（中文）
  icon: string          // 图标名（传给 <Icon> 组件的 name prop）
  permKey?: string      // 模块级权限标识（可选）
}

export const MODULE_DEFS: ModuleDef[] = [
  { key: 'systemManagement', path: '/systemManagement/dashboard', title: '系统管理', icon: 'system', permKey: 'systemManagement' },
  { key: 'blogsManagement', path: '/blogsManagement/blogs', title: '个人博客', icon: 'blogs', permKey: 'blogsManagement' },
  { key: 'stockFund', path: '/stockFund/workbench', title: '股票基金', icon: 'trend-charts', permKey: 'stockFund' },
  { key: 'aiModule', path: '/aiModule/interaction/rag', title: 'AI交互', icon: 'ai-interaction', permKey: 'aiModule' },
  { key: 'devTools', path: '/devTools/workbench', title: '开发工具', icon: 'tool', permKey: 'devTools' },
  { key: 'gis2d', path: '/gis2d/baseMap', title: '二维地图', icon: 'two-d-layers', permKey: 'gis2d' },
  { key: 'gis3d', path: '/gis3d/baseCesium', title: '三维GIS', icon: 'three-d-layers', permKey: 'gis3d' },
  { key: 'bigScreen', path: '/bigScreen', title: '智慧运营', icon: 'screen', permKey: 'bigScreen' },
  { key: 'universalTemplate', path: '/universalTemplate', title: '通用大屏', icon: 'basic-dashboard', permKey: 'universalTemplate' },
]

// 需要全量加载的模块路由 name，用于 startup 注册和 logout 清理
export const MODULE_ROUTE_NAMES = MODULE_DEFS.map(m => m.key)

// 兼容旧路径 → 新路径的重定向映射
export const OLD_PATH_REDIRECTS: Record<string, string> = {
  '/bigData/universalTemplate': '/universalTemplate',
  '/bigData/bigScreen': '/bigScreen',
}
