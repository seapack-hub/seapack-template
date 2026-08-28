/**
 * 宏观数据管理模块 — 表格列配置常量
 *
 * 所有表格的基础列结构集中管理，操作列和 slot 模板保留在 index.vue 中
 */

/** 月频表格列（含第二数值） */
export const MONTHLY_COLUMNS = [
  { label: '日期', prop: 'statDate', minWidth: '120', slotName: 'statDate' },
  { label: '指标编码', prop: 'indicatorCode', minWidth: '140' },
  { label: '指标值', prop: 'metricValue', align: 'center' as const, slotName: 'metricValue' },
  { label: '第二数值', prop: 'metricValue2', align: 'center' as const, slotName: 'metricValue2' },
  { label: '环比变化', prop: 'momChange', align: 'center' as const, slotName: 'momChange' },
  { label: '来源', prop: 'source', minWidth: '100' },
  { label: '操作', prop: 'operate', minWidth: '140', slotName: 'operate' },
]

/** 日频/周频表格列（无第二数值） */
export const DEFAULT_COLUMNS = [
  { label: '日期', prop: 'statDate', minWidth: '120', slotName: 'statDate' },
  { label: '指标编码', prop: 'indicatorCode', minWidth: '100' },
  { label: '指标值', prop: 'metricValue', align: 'center' as const, slotName: 'metricValue' },
  { label: '环比变化', prop: 'momChange', align: 'center' as const, slotName: 'momChange' },
  { label: '来源', prop: 'source', minWidth: '140' },
  { label: '操作', prop: 'operate', minWidth: '140', slotName: 'operate' },
]
