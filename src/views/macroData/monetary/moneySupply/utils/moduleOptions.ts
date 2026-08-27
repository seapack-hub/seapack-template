/**
 * 货币供应量看板 — 模块选项与表格列配置
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
  { prop: 'date', label: '月份', width: 100 },
  { prop: 'm0', label: 'M0（万亿）', align: 'center' as const },
  { prop: 'm1', label: 'M1（万亿）', align: 'center' as const },
  { prop: 'm2', label: 'M2（万亿）', align: 'center' as const },
  { prop: 'm0Yoy', label: 'M0 同比（%）', align: 'center' as const },
  { prop: 'm1Yoy', label: 'M1 同比（%）', align: 'center' as const },
  { prop: 'm2Yoy', label: 'M2 同比（%）', align: 'center' as const },
  { prop: 'scissors', label: '剪刀差（%）', align: 'center' as const },
]
