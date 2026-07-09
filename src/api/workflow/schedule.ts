/**
 * 工作流调度 API
 */
import { request } from '@/utils/axios'
import type { WorkflowSchedule, ScheduleQuery } from './types'

const BASE_URL = '/api/workflows/schedules'

export const ScheduleAPI = {
  /** 分页查询调度列表 */
  page(query: ScheduleQuery) {
    return request<any, PageResult<WorkflowSchedule[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 查询调度详情 */
  getById(id: number) {
    return request<any, WorkflowSchedule>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** 新增调度 */
  insert(data: Partial<WorkflowSchedule>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** 编辑调度 */
  update(id: number, data: Partial<WorkflowSchedule>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** 删除调度 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'delete',
    })
  },

  /** 启停切换 */
  updateStatus(id: number, status: number) {
    return request<any, any>({
      url: `${BASE_URL}/updateStatus/${id}`,
      method: 'put',
      data: { status },
    })
  },

  /** 立即执行一次 */
  trigger(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/trigger/${id}`,
      method: 'post',
    })
  },
}
