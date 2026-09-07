// 定义表格列配置类型
export type columnsType = Array<{
  // 列类型
  columnType?: 'operate' | string
  // 插槽名称
  slotName?: string
  // 字典类型
  dictType?: string
  // 补充说明
  tips?: string
  // 操作列整体权限标识（控制整列显隐）
  permission?: string
  // 按钮配置（操作列使用）
  buttons?: any[]
  // 其他 el-table-column 属性
  [key: string]: any
}>