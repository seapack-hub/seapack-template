/**
 * 技能管理模块 — 模块选项（从 modules.ts MODULE_DEFS 派生）
 * 用于模块绑定弹窗的下拉选择
 */
import { MODULE_DEFS } from '@/config/modules';

/** 模块选项（用于模块绑定弹窗下拉选择） */
export const MODULE_OPTIONS = MODULE_DEFS.map(m => ({
  label: m.title,
  value: m.key,
}))

/** 输出格式选项（用于技能表单选择） */
export const OUTPUT_FORMAT_OPTIONS = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'JSON', value: 'json' },
  { label: '纯文本', value: 'text' },
  { label: 'HTML', value: 'html' },
]

/** 参数类型选项（用于参数表单编辑） */
export const PARAM_TYPE_OPTIONS = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: 'Json', value: 'json' },
]

/** 执行日志状态选项（用于日志筛选） */
export const LOG_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' },
  { label: '超时', value: 'timeout' },
]

/** 技能状态选项（用于技能列表筛选） */
export const SKILL_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]
