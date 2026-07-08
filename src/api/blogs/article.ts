/**
 * 博客文章 API 层
 */
import { request } from '@/utils/axios.ts'
import type { Article, ArticleQuery } from './types/article'

export type { Article, ArticleQuery }

const BASE_URL = '/api/blog'

export const ArticleAPI = {
  /** 分页查询文章列表 */
  getPage(params?: ArticleQuery) {
    return request<any, PageResult<Article[]>>({
      url: `${BASE_URL}/articles`, method: 'get', params,
    })
  },
  /** 根据 ID 查询文章详情 */
  getDetail(id: number) {
    return request<any, Article>({
      url: `${BASE_URL}/articles/${id}`, method: 'get',
    })
  },
  /** 新增文章 */
  create(data: Partial<Article>) {
    return request<any, null>({ url: `${BASE_URL}/articles`, method: 'post', data })
  },
  /** 更新文章 */
  update(id: number, data: Partial<Article>) {
    return request<any, null>({ url: `${BASE_URL}/articles/${id}`, method: 'put', data })
  },
  /** 删除文章 */
  delete(id: number) {
    return request<any, null>({ url: `${BASE_URL}/articles/${id}`, method: 'delete' })
  },
}
