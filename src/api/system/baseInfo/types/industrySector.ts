/**
 * 行业分类 - 类型定义
 */

/** 行业分类节点 */
export interface IndustrySector {
  id: number
  code: string
  label: string
  parentId?: number | null
  parentLabel?: string
  nodeLevel: number
  sortOrder: number
  createdAt?: string
  updatedAt?: string
  children?: IndustrySector[]
}

/** 分页查询参数 */
export interface IndustrySectorQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  nodeLevel?: number
  parentId?: number
}
