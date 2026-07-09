/**
 * 工作流版本 API
 */
import { request } from '@/utils/axios'
import type { WorkflowVersion } from './types'

const BASE_URL = '/api/workflows'

export const WorkflowVersionAPI = {
  /** 版本列表 */
  list(workflowId: number) {
    return request<any, WorkflowVersion[]>({
      url: `${BASE_URL}/${workflowId}/versions/all`,
      method: 'get',
    })
  },

  /** 版本详情 */
  getById(workflowId: number, version: number) {
    return request<any, WorkflowVersion>({
      url: `${BASE_URL}/${workflowId}/versions/detail/${version}`,
      method: 'get',
    })
  },

  /** 创建版本 */
  create(workflowId: number, data: { changeLog?: string }) {
    return request<any, any>({
      url: `${BASE_URL}/${workflowId}/versions/insert`,
      method: 'post',
      data,
    })
  },

  /** 回滚到指定版本 */
  rollback(workflowId: number, version: number) {
    return request<any, any>({
      url: `${BASE_URL}/${workflowId}/versions/rollback/${version}`,
      method: 'post',
    })
  },
}
