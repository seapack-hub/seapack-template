/**
 * 博客文章 API 层
 * 提供文章的增删改查接口
 * 后端路径：/api/blog/articles
 */
import { request } from '@/utils/axios.ts'

const BASE_URL = '/api/blog'

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
  viewCount: number       // 阅读数（新增时后端自动初始化为 0）
  likeCount: number       // 点赞数（新增时后端自动初始化为 0）
  isTop: 0 | 1            // 0-不置顶 1-置顶
  sort: number            // 排序号（置顶文章排序用）
  createTime?: string
  updateTime?: string
}

/** 文章查询参数 */
export interface ArticleQuery {
  pageNum?: number
  pageSize?: number
  category?: string       // 分类筛选
  keyword?: string        // 标题/内容关键字
  status?: number         // 0-草稿 1-已发布
  isTop?: number          // 0-不置顶 1-置顶（后端置顶优先排序）
}

export const ArticleAPI = {
  /** 分页查询文章列表（支持 category/status/keyword/isTop 筛选，后端置顶优先排序） */
  getPage(params?: ArticleQuery) {
    return request<any, PageResult<Article[]>>({
      url: `${BASE_URL}/articles`, method: 'get', params,
    })
  },
  /** 根据 ID 查询文章详情（含 contentMd / contentHtml） */
  getDetail(id: number) {
    return request<any, Article>({
      url: `${BASE_URL}/articles/${id}`, method: 'get',
    })
  },
  /** 新增文章（viewCount/likeCount 由后端自动初始化为 0） */
  create(data: Partial<Article>) {
    return request<any, null>({ url: `${BASE_URL}/articles`, method: 'post', data })
  },
  /** 更新文章（后端仅更新非空字段） */
  update(id: number, data: Partial<Article>) {
    return request<any, null>({ url: `${BASE_URL}/articles/${id}`, method: 'put', data })
  },
  /** 删除文章 */
  delete(id: number) {
    return request<any, null>({ url: `${BASE_URL}/articles/${id}`, method: 'delete' })
  },
}
