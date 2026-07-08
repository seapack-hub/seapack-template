/**
 * 博客项目 - 类型定义
 */

/** 项目数据类型 */
export interface Project {
  id?: number
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  url: string
  sort: number
  status: 0 | 1
  createTime?: string
  updateTime?: string
}

/** 项目查询参数 */
export interface ProjectQuery {
  pageNum?: number
  pageSize?: number
  keyword?: string
  status?: number
}
