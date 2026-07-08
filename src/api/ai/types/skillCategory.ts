/**
 * 技能分类 - 类型定义
 */

/** 技能分类实体 */
export interface SkillCategory {
  id?: number
  /** 分类名称 */
  name: string
  /** 分类编码，唯一 */
  code: string
  /** 图标 SVG 文件名 */
  icon?: string
  /** 描述 */
  description?: string
  /** 排序号 */
  sortOrder?: number
  /** 状态：1启用 0禁用 */
  status?: number
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/** 技能分类分页查询参数 */
export interface SkillCategoryQuery {
  pageNum: number
  pageSize: number
  /** 关键词搜索（名称/编码） */
  keyword?: string
  /** 状态筛选 */
  status?: number
}
