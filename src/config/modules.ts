// 模块定义：集中管理所有功能模块的元信息，用于侧边栏导航、工作台展示和模块切换器
export interface ModuleDef {
  key: string           // 模块唯一标识，与路由 name 对应
  path: string          // 默认导航路径
  title: string         // 模块名称（中文）
  icon: string          // 图标名（传给 <Icon> 组件的 name prop）
  color: string         // 主题色（用于工作台卡片、侧边栏高亮等）
  description: string   // 模块描述（用于工作台卡片展示）
  permKey?: string      // 模块级权限标识（可选）
}

export const MODULE_DEFS: ModuleDef[] = [
  { key: 'systemManagement', path: '/systemManagement/dashboard', title: '系统管理', icon: 'system', color: '#409EFF', description: '用户、部门、菜单权限、系统配置等管理功能', permKey: 'systemManagement' },
  { key: 'blogsManagement', path: '/blogsManagement/blogs', title: '个人博客', icon: 'blog', color: '#E040FB', description: '博客阅读与管理', permKey: 'blogsManagement' },
  { key: 'stockFund', path: '/stockFund/workbench', title: '股票基金', icon: 'stock-fund', color: '#F44336', description: '股票行情、基金信息与行业分类', permKey: 'stockFund' },
  { key: 'aiModule', path: '/aiModule/interaction/rag', title: 'AI交互', icon: 'ai-interaction', color: '#9C27B0', description: 'RAG知识库、智能体交互、图片生成', permKey: 'aiModule' },
  { key: 'workflowModule', path: '/workflow/list', title: '工作流', icon: 'workflow', color: '#00BCD4', description: '可视化工作流编排、执行与监控', permKey: 'workflowModule' },
  { key: 'devTools', path: '/devTools/workbench', title: '开发工具', icon: 'dev-tools', color: '#607D8B', description: '组件封装、图形化、ECharts图表', permKey: 'devTools' },
  { key: 'gis2d', path: '/gis2d/baseMap', title: '二维地图', icon: 'two-d-layers', color: '#26A69A', description: 'OpenLayers 二维地图展示与交互', permKey: 'gis2d' },
  { key: 'gis3d', path: '/gis3d/baseCesium', title: '三维GIS', icon: 'three-d-layers', color: '#7E57C2', description: 'Cesium 三维GIS地图与特效', permKey: 'gis3d' },
  { key: 'bigScreen', path: '/bigScreen', title: '智慧运营', icon: 'big-screen', color: '#FF6D00', description: '智慧运营数据可视化大屏', permKey: 'bigScreen' },
  { key: 'universalTemplate', path: '/universalTemplate', title: '通用大屏', icon: 'universal-template', color: '#F06292', description: '通用大屏模板（Cesium 三维）', permKey: 'universalTemplate' },
]

// 需要全量加载的模块路由 name，用于 startup 注册和 logout 清理
export const MODULE_ROUTE_NAMES = MODULE_DEFS.map(m => m.key)

// 兼容旧路径 → 新路径的重定向映射
export const OLD_PATH_REDIRECTS: Record<string, string> = {
  '/bigData/universalTemplate': '/universalTemplate',
  '/bigData/bigScreen': '/bigScreen',
}
