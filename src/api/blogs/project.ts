/**
 * 博客项目 API 层
 * 提供开源项目的增删改查接口
 */
import { request } from '@/utils/axios.ts'

const BASE_URL = '/api/blogs'

/** 项目数据类型 */
export interface Project {
  id?: number
  name: string            // 项目名称
  description: string     // 项目描述
  icon: string            // SPIcon 图标名
  color: string           // 图标颜色
  bgColor: string         // 图标背景色
  url: string             // 项目链接
  sort: number            // 排序号
  status: 0 | 1           // 0-隐藏 1-显示
  createTime?: string
  updateTime?: string
}

export const ProjectAPI = {
  /** 获取项目列表 */
  getList() {
    return request<any, Project[]>({
      url: `${BASE_URL}/projects`, method: 'get',
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
