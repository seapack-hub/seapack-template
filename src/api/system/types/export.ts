/**
 * 导出功能 - 类型定义
 */

export interface ExportHeader {
  /** 表头显示名（必填） */
  label: string
  /** 数据字段key（必填，需与dataList中key一致） */
  field: string
  /** 列宽（字符数，1-50） */
  width?: number
  /** 格式：'date:yyyy-MM-dd' | 'number:#,##0.00' */
  format?: string
  bold?: boolean
  align?: 'left' | 'center' | 'right'
}

export interface ExportRequest {
  /** 文件名（1-100字符，仅中英文/数字/下划线/短横线） */
  fileName: string
  /** 工作表名（默认Sheet1） */
  sheetName?: string
  headers: ExportHeader[]
  /** 每项的key需与headers.field匹配 */
  dataList: Record<string, any>[]
  /** 是否自动列宽（默认true） */
  autoWidth?: boolean
  /** 操作人（用于备注） */
  creator?: string
}
