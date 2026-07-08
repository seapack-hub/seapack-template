/**
 * 行业分类树 - 类型定义
 */

export type DimIndustryTree = {
  industryId: string
  industryCode: string
  industryName: string
  parentCode: string
  industryState: number
  description: string
  updateTime: string
  children: DimIndustryTree[]
}
