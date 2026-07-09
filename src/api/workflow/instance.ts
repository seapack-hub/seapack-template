/**
 * 工作流实例 API
 */
import { request } from '@/utils/axios'
import type { WorkflowInstance, WorkflowNodeLog } from './types'

const BASE_URL = '/api/workflows'

export const WorkflowInstanceAPI = {
  /** 分页查询实例列表 */
  page(query: { workflowId?: number; status?: number; keyword?: string; pageNum: number; pageSize: number }) {
    return request<any, PageResult<WorkflowInstance[]>>({
      url: `${BASE_URL}/instances/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 查询实例详情 */
  getById(id: number) {
    return request<any, WorkflowInstance>({
      url: `${BASE_URL}/instances/detail/${id}`,
      method: 'get',
    })
  },

  /** 节点执行日志 */
  getNodeLogs(instanceId: number) {
    return request<any, WorkflowNodeLog[]>({
      url: `${BASE_URL}/instances/logs/${instanceId}`,
      method: 'get',
    })
  },

  /** 取消执行 */
  cancel(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/instances/cancel/${id}`,
      method: 'post',
    })
  },

  /** 暂停执行 */
  pause(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/instances/pause/${id}`,
      method: 'post',
    })
  },

  /** 恢复执行 */
  resume(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/instances/resume/${id}`,
      method: 'post',
    })
  },
}
