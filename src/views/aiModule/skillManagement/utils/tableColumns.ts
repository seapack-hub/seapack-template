/**
 * 技能管理模块 — 表格列配置常量
 *
 * 所有表格的基础列结构集中管理，操作按钮和 slot 模板保留在各自组件中
 */

/** 技能列表表格列（不含操作列，操作列在各组件中组装） */
export const SKILL_LIST_COLUMNS = [
  { label: '技能名称', prop: 'name', minWidth: '140px' },
  { label: '技能编码', prop: 'code', minWidth: '120px' },
  { label: '所属分类', prop: 'categoryName', minWidth: '100px' },
  { label: '技能类型', prop: 'skillType', width: '90px', align: 'center', slotName: 'skillType' },
  { label: 'API端点', prop: 'endpoint', minWidth: '160px', showOverflowTooltip: true },
  { label: '状态', prop: 'status', width: '80px', align: 'center', slotName: 'status' },
  { label: '版本', prop: 'version', width: '80px', align: 'center' },
  { label: '使用次数', prop: 'useCount', width: '100px', align: 'center' },
]

/** 技能参数表格列（不含操作列） */
export const PARAM_LIST_COLUMNS = [
  { label: '参数名', prop: 'paramName', minWidth: 120 },
  { label: '标签', prop: 'label', minWidth: 100 },
  { label: '类型', prop: 'paramType', width: 90, align: 'center', slotName: 'paramType' },
  { label: '必填', prop: 'required', width: 60, align: 'center', slotName: 'isRequired' },
  { label: '默认值', prop: 'defaultValue', minWidth: 120 },
  { label: '排序', prop: 'sortOrder', width: 60, align: 'center' },
]
