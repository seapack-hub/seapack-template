/**
 * 博客文章 API 层
 * 提供文章的增删改查接口
 */
import { request } from '@/utils/axios.ts'

const BASE_URL = '/api/blogs'

/** 文章数据类型 */
export interface Article {
  id?: number
  title: string           // 文章标题
  summary: string         // 摘要
  contentMd: string       // Markdown 正文
  contentHtml: string     // 渲染后的 HTML
  category: string        // 分类 key（关联 dictType=blog_category）
  tag: string             // 标签名
  tagType: '' | 'success' | 'warning' | 'danger' | 'info'  // 标签颜色类型
  coverIcon: string       // 封面 Emoji 图标
  coverColor: string      // 封面渐变色
  status: 0 | 1           // 0-草稿 1-已发布
  viewCount: number       // 阅读数
  likeCount: number       // 点赞数
  isTop: 0 | 1            // 0-不置顶 1-置顶
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
}

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
