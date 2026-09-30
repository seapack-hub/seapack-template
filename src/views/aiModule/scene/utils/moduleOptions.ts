/**
 * 场景管理 — 常量定义
 * 注：原硬编码选项已迁移至字典管理（sys_dict）
 * - common_status: 通用状态（启用/禁用）
 * - project_visibility: 项目可见性（公开/私有）
 */

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
