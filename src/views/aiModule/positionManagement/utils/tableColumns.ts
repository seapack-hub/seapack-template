/**
 * 位置管理 — 表格列配置
 */

/** 位置列表表格列（不含操作列） */
export const POSITION_LIST_COLUMNS = [
  { label: '位置名称', prop: 'label', minWidth: '140px' },
  { label: '模块标识', prop: 'moduleKey', minWidth: '160px', slotName: 'moduleKey' },
  { label: '位置编码', prop: 'positionKey', minWidth: '160px', slotName: 'positionKey' },
  { label: '描述', prop: 'description', minWidth: '220px', showOverflowTooltip: true },
  { label: '组件名', prop: 'component', minWidth: '140px' },
  { label: '排序', prop: 'sortOrder', width: '70px', align: 'center' },
  { label: '状态', prop: 'status', width: '90px', align: 'center', slotName: 'status' },
]
