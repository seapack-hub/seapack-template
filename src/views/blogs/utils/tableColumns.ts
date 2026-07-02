/** 博客管理 — SpTable 列配置常量（不含操作列和 slot 模板，操作列在各组件中组装） */

/** 项目列表表格列（不含操作列） */
export const PROJECT_LIST_COLUMNS = [
  { label: '项目名称', prop: 'name', minWidth: '180px', showOverflowTooltip: true },
  { label: '描述', prop: 'description', minWidth: '260px', showOverflowTooltip: true },
  { label: '图标', prop: 'icon', minWidth: '80px', align: 'center' },
  { slotName: 'colorPreview' },
  { label: '链接', prop: 'url', minWidth: '200px', showOverflowTooltip: true },
  { label: '排序', prop: 'sort', minWidth: '60px', align: 'center' },
  { slotName: 'status' },
]

/** 文章列表表格列（不含操作列） */
export const ARTICLE_LIST_COLUMNS = [
  { label: '标题', prop: 'title', minWidth: '220px', showOverflowTooltip: true },
  { slotName: 'category' },
  { slotName: 'tag' },
  { label: '阅读', prop: 'viewCount', minWidth: '70px', align: 'center' },
  { slotName: 'status' },
  { slotName: 'isTop' },
  { label: '创建时间', prop: 'createTime', minWidth: '160px', align: 'center' },
]

/** 分类列表表格列（只读，无操作列） */
export const CATEGORY_LIST_COLUMNS = [
  { label: '编码', prop: 'dictCode', minWidth: '120px' },
  { label: '名称', prop: 'dictName', minWidth: '200px', showOverflowTooltip: true },
  { label: '排序', prop: 'orderNum', minWidth: '80px', align: 'center' },
]

/** 标签列表表格列（只读，无操作列） */
export const TAG_LIST_COLUMNS = [
  { label: '标签名', prop: 'dictCode', minWidth: '200px', showOverflowTooltip: true },
  { slotName: 'tagColor' },
  { label: '排序', prop: 'orderNum', minWidth: '80px', align: 'center' },
]
