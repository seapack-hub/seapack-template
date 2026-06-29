/**
 * 博客项目 API 层
 * 提供开源项目的增删改查接口
 * 后端路径：/api/blog/projects
 */
import { request } from '@/utils/axios.ts'

const BASE_URL = '/api/blog'

/** 项目数据类型 */
export interface Project {
  id?: number
  name: string            // 项目名称
  description: string     // 项目描述
  icon: string            // SPIcon 图标名
  color: string           // 图标颜色
  bgColor: string         // 图标背景色
  url: string             // 项目链接
  sort: number            // 排序号（后端按 sort ASC 排序）
  status: 0 | 1           // 0-隐藏 1-显示
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

export const ProjectAPI = {
  /** 分页查询项目列表（支持 status/keyword 筛选，后端按 sort ASC 排序） */
  getPage(params?: ProjectQuery) {
    return request<any, PageResult<Project[]>>({
      url: `${BASE_URL}/projects`, method: 'get', params,
    })
  },
  /** 根据 ID 查询项目详情 */
  getDetail(id: number) {
    return request<any, Project>({
      url: `${BASE_URL}/projects/${id}`, method: 'get',
    })
  },
  /** 新增项目 */
  create(data: Partial<Project>) {
    return request<any, null>({ url: `${BASE_URL}/projects`, method: 'post', data })
  },
  /** 更新项目 */
  update(id: number, data: Partial<Project>) {
    return request<any, null>({ url: `${BASE_URL}/projects/${id}`, method: 'put', data })
  },
  /** 删除项目 */
  delete(id: number) {
    return request<any, null>({ url: `${BASE_URL}/projects/${id}`, method: 'delete' })
  },
}
