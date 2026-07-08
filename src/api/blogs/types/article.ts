/**
 * 博客文章 - 类型定义
 */

/** 文章数据类型 */
export interface Article {
  id?: number
  title: string
  summary: string
  contentMd: string
  contentHtml: string
  category: string
  tag: string
  tagType: '' | 'success' | 'warning' | 'danger' | 'info'
  coverIcon: string
  coverColor: string
  status: 0 | 1
  viewCount: number
  likeCount: number
  isTop: 0 | 1
  sort: number
  createTime?: string
  updateTime?: string
}

/** 文章查询参数 */
export interface ArticleQuery {
  pageNum?: number
  pageSize?: number
  category?: string
  keyword?: string
  status?: number
  isTop?: number
}
