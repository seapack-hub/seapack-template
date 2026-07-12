/**
 * 场景管理 — 常量定义
 */
import type { RouteRecordRaw } from 'vue-router'
import { RouterView } from 'vue-router'
import { getRawModuleRoutes } from '@/router/index'

/** 状态选项 */
export const SCENE_STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

/** 可见性选项 */
export const SCENE_PUBLIC_OPTIONS = [
  { label: '公开', value: 1 },
  { label: '私有', value: 0 },
]

/** el-color-picker 预定义色块 */
export const PREDEFINE_COLORS = [
  '#667eea', '#11998e', '#f5576c', '#7c3aed',
  '#ef4444', '#06b6d4', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

/** 默认场景表单数据 */
export const DEFAULT_SCENE_FORM = {
  name: '',
  code: '',
  icon: '',
  coverColor: '#667eea',
  description: '',
  moduleKey: '',
  isPublic: 1,
  status: 1,
  sortOrder: 0,
}

interface CascaderNode {
  value: string
  label: string
  children?: CascaderNode[]
  /** 纯叶子节点，没有 children */
  leaf?: boolean
}

/** 从路由定义构建级联选择器选项（只包含叶子节点） */
export function getModuleCascaderOptions() {
  const routes = getRawModuleRoutes()
  const result: CascaderNode[] = []

  for (const route of routes) {
    const node = toCascaderNode(route)
    if (node) result.push(node)
  }

  return result
}

function toCascaderNode(
  route: RouteRecordRaw,
  parentPath = '',
): CascaderNode | null {
  const meta = route.meta || {}
  if (meta.hidden) return null

  const path = route.path.startsWith('/') ? route.path : parentPath ? `${parentPath}/${route.path}` : route.path
  const label = meta.description || ''

  // 有 children 且 component 不是 layout → 中级目录（RouterView）
  if (route.children?.length && route.component === RouterView) {
    const children = route.children
      .map(c => toCascaderNode(c, path))
      .filter(Boolean) as CascaderNode[]
    if (!children.length) return null
    return { value: path, label, children }
  }

  // 无 children → 叶子节点（实际页面）
  if (!route.children?.length && route.component && route.component !== RouterView && label) {
    return { value: path, label, leaf: true }
  }

  // 有 children 且 component 是 layout 或其他 → 模块根容器，展平 children
  if (route.children?.length) {
    const children = route.children
      .map(c => toCascaderNode(c, path))
      .filter(Boolean) as CascaderNode[]
    if (!children.length) return null
    // 单个子节点直接提升
    if (children.length === 1) return children[0]
    return { value: path, label, children }
  }

  return null
}
