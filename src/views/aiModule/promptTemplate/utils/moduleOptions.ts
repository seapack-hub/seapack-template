/**
 * 提示词模板管理 — 常量选项定义
 * 注：原硬编码选项已迁移至字典管理（sys_dict）
 * - template_category: 提示词模板分类
 * - template_type: 提示词模板类型
 * - template_var_type: 模板变量类型
 * - ai_output_format: AI输出格式
 */

/** 模板分类选项 */
export const TEMPLATE_CATEGORY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '股票分析', value: 'stock_analysis' },
  { label: '内容生成', value: 'content_gen' },
  { label: '数据问答', value: 'data_qa' },
  { label: '通用', value: 'general' },
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
