/**
 * 提示词模板管理 — 常量选项定义
 */

/** 模块选项（从 MODULE_DEFS 派生） */
import { MODULE_DEFS } from '@/config/modules'

export const MODULE_OPTIONS = MODULE_DEFS.map(m => ({
  label: m.title,
  value: m.key,
}))

/** 模板分类选项 */
export const TEMPLATE_CATEGORY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '股票分析', value: 'stock_analysis' },
  { label: '内容生成', value: 'content_gen' },
  { label: '数据问答', value: 'data_qa' },
  { label: '通用', value: 'general' },
]

/** 模板类型选项 */
export const TEMPLATE_TYPE_OPTIONS = [
  { label: '系统预设', value: 1 },
  { label: '用户自定义', value: 2 },
]

/** 输出格式选项 */
export const OUTPUT_FORMAT_OPTIONS = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'JSON', value: 'json' },
  { label: '纯文本', value: 'text' },
  { label: 'HTML', value: 'html' },
]

/** 变量类型选项 */
export const VAR_TYPE_OPTIONS = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: '下拉选择', value: 'select' },
  { label: '日期', value: 'date' },
]

/** 状态筛选选项 */
export const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

/** 分类标签文案 */
export function categoryLabel(category?: string) {
  return TEMPLATE_CATEGORY_OPTIONS.find(o => o.value === category)?.label || category || '-'
}

/** 分类标签颜色映射 */
const CATEGORY_TAG_MAP: Record<string, string> = {
  stock_analysis: 'danger',
  content_gen: '',
  data_qa: 'success',
  general: 'info',
}

/** 分类标签 type */
export function categoryTagType(category?: string): string {
  return CATEGORY_TAG_MAP[category || ''] || 'info'
}
