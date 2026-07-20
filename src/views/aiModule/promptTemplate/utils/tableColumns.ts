/**
 * 提示词模板管理 — 表格列配置
 */

/** 模板列表表格列（不含操作列） */
export const TEMPLATE_LIST_COLUMNS = [
  { label: '模板名称', prop: 'name', minWidth: '140px' },
  { label: '模板编码', prop: 'code', minWidth: '120px' },
  { label: '分类', prop: 'category', minWidth: '100px', align: 'center', slotName: 'category' },
  { label: '用途', prop: 'description', minWidth: '200px' },
  { label: '输出格式', prop: 'outputFormat', width: '100px', align: 'center' },
  { label: '版本', prop: 'version', width: '80px', align: 'center' },
  { label: '使用次数', prop: 'useCount', width: '90px', align: 'center' },
  { label: '状态', prop: 'status', width: '90px', align: 'center', slotName: 'status' },
]

/** 变量列表表格列（不含操作列） */
export const VARIABLE_LIST_COLUMNS = [
  { label: '变量名', prop: 'varName', minWidth: '120px' },
  { label: '标签', prop: 'label', minWidth: '100px' },
  { label: '类型', prop: 'varType', width: '90px', align: 'center', slotName: 'varType' },
  { label: '必填', prop: 'required', width: '60px', align: 'center', slotName: 'required' },
  { label: '默认值', prop: 'defaultValue', minWidth: '100px' },
  { label: '排序', prop: 'sortOrder', width: '60px', align: 'center' },
]
