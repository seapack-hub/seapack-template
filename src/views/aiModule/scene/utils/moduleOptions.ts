/**
 * 场景管理 — 常量定义
 */

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
  isPublic: 1,
  status: 1,
  sortOrder: 0,
}
