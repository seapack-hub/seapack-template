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

/** 渐变色预设 */
export const COVER_COLOR_PRESETS = [
  { label: '蓝色', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { label: '绿色', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { label: '橙色', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { label: '紫色', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { label: '红色', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { label: '青色', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
]

/** 默认场景表单数据 */
export const DEFAULT_SCENE_FORM = {
  name: '',
  code: '',
  icon: '',
  coverColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  description: '',
  moduleKey: '',
  isPublic: 1,
  status: 1,
  sortOrder: 0,
}
