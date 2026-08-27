/**
 * LPR 利率看板 — 模块选项与表格列配置
 */

/** 时间范围选项 */
export const MONTHS_OPTIONS = [
  { label: '近1年', value: 12 },
  { label: '近3年', value: 36 },
  { label: '近5年', value: 60 },
  { label: '近10年', value: 120 },
]

/** 数据明细表列配置 */
export const DETAIL_COLUMNS = [
  { prop: 'date', label: '统计月份', width: 100 },
  { prop: 'lpr1y', label: '1年期 LPR（%）', align: 'center' as const },
  { prop: 'lpr5y', label: '5年期 LPR（%）', align: 'center' as const },
  { prop: 'change', label: '变动基点（BP）', align: 'center' as const },
]
