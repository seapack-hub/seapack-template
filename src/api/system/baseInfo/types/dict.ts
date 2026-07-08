/**
 * 系统字典 - 类型定义
 */

/** 系统字典 */
export interface Dict {
  id: number
  dictType: string
  dictCode: string
  dictName: string
  orderNum: number
  status: string
  remark?: string
  gmtCreate?: string
  gmtModified?: string
}

/** 字典分页查询参数 */
export interface DictQuery {
  pageNum?: number
  pageSize?: number
  dictType?: string
  keyword?: string
  status?: string
}
