/**
 * 系统字典 - 类型定义
 */

/** 字典类型（从 sys_dict_type 表查询） */
export interface DictTypeInfo {
  id: number
  dictType: string
  dictName: string
  remark?: string
  orderNum: number
  status: string
  count?: number // 值数量（listWithCount 接口返回）
  gmtCreate?: string
  gmtModified?: string
}

/** 字典值（从 sys_dict 表查询） */
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
