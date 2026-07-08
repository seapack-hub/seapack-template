/**
 * 博客项目 API 层
 */
import { request } from '@/utils/axios.ts'
import type { Project, ProjectQuery } from './types/project'

export type { Project, ProjectQuery }

const BASE_URL = '/api/blog'

export const ProjectAPI = {
  /** 分页查询项目列表 */
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
