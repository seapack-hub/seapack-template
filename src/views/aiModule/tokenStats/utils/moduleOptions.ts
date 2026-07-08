/**
 * Token 用量统计 — 常量定义
 */

/** 时间范围选项 */
export const DATE_RANGE_OPTIONS = [
  { label: '近 7 天', value: 7 },
  { label: '近 30 天', value: 30 },
]

/** 模型费用单价（元/1K tokens） */
export const MODEL_COST_MAP: Record<string, { input: number; output: number }> = {
  'deepseek-chat': { input: 0.001, output: 0.002 },
  'deepseek-coder': { input: 0.001, output: 0.002 },
  'gpt-4o': { input: 0.018, output: 0.054 },
  'gpt-4o-mini': { input: 0.0015, output: 0.006 },
  'qwen-plus': { input: 0.004, output: 0.012 },
  'glm-4': { input: 0.1, output: 0.1 },
}

/** 模型颜色映射 */
export const MODEL_COLOR_MAP: Record<string, string> = {
  'deepseek-chat': '#409EFF',
  'deepseek-coder': '#67C23A',
  'gpt-4o': '#E6A23C',
  'gpt-4o-mini': '#F56C6C',
  'qwen-plus': '#909399',
  'glm-4': '#b37feb',
}
