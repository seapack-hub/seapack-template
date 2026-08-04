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

/** 备用颜色列表（当模型不在颜色映射中时使用） */
export const CHART_COLORS = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#b37feb',
  '#00b2a9',
  '#f759ab',
  '#36cfc9',
  '#597ef7',
  '#9254de',
  '#ff7a45',
]

/** 根据模型名称获取颜色（支持动态颜色） */
export function getModelColor(name: string, index: number): string {
  if (MODEL_COLOR_MAP[name]) {
    return MODEL_COLOR_MAP[name]
  }
  return CHART_COLORS[index % CHART_COLORS.length]
}
