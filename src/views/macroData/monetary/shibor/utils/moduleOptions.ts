/**
 * SHIBOR 资金面看板 — 模块选项与表格列配置
 */

/** 时间范围选项 */
export const MONTHS_OPTIONS = [
  { label: '近1月', value: 1 },
  { label: '近3月', value: 3 },
  { label: '近6月', value: 6 },
  { label: '近1年', value: 12 },
  { label: '近3年', value: 36 },
]

/** 期限品种常量 */
export const TENOR_CODES = [
  'SHIBOR_ON', 'SHIBOR_1W', 'SHIBOR_2W', 'SHIBOR_1M',
  'SHIBOR_3M', 'SHIBOR_6M', 'SHIBOR_9M', 'SHIBOR_1Y',
] as const

/** 期限中文名映射 */
export const TENOR_LABELS: Record<string, string> = {
  SHIBOR_ON: '隔夜', SHIBOR_1W: '1周', SHIBOR_2W: '2周', SHIBOR_1M: '1月',
  SHIBOR_3M: '3月', SHIBOR_6M: '6月', SHIBOR_9M: '9月', SHIBOR_1Y: '1年',
}
