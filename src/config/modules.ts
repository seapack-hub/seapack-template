// 模块定义：集中管理所有功能模块的元信息，用于侧边栏导航和模块切换器
export interface ModuleDef {
  key: string           // 模块唯一标识，与路由 name 对应
  path: string          // 默认导航路径
  title: string         // 模块名称（中文）
  icon: string          // SPIcon 图标名
  permKey?: string      // 模块级权限标识（可选）
}

export const MODULE_DEFS: ModuleDef[] = [
  { key: 'systemManagement', path: '/systemManagement/dashboard', title: '系统管理', icon: 'setting'},
  { key: 'worldData', path: '/worldData/baseMap', title: '数据世界', icon: 'map'},
  { key: 'bigData', path: '/bigData/bigScreen', title: '数据大屏', icon: 'screen'},
  { key: 'blogsManagement', path: '/blogsManagement/blogs', title: '博客', icon: 'blog' },
]

// 需要全量加载的模块路由 name，用于 startup 注册和 logout 清理
export const MODULE_ROUTE_NAMES = MODULE_DEFS.map(m => m.key)

// 兼容旧路径 → 新路径的重定向映射
export const OLD_PATH_REDIRECTS: Record<string, string> = {
  '/universalTemplate': '/bigData/universalTemplate',
  '/bigScreen': '/bigData/bigScreen',
}
