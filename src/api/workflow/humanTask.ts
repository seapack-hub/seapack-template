/**
 * 人工任务 API
 */
import { request } from '@/utils/axios'
import type { HumanTask, AnnotationRecord, FeedbackRecord, HumanTaskQuery } from './types'

const BASE_URL = '/api/workflows/humanTasks'

export const HumanTaskAPI = {
  /** 分页查询任务列表 */
  page(query: HumanTaskQuery) {
    return request<any, PageResult<HumanTask[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 查询任务详情 */
  getById(id: number) {
    return request<any, HumanTask>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** 处理任务（审批/驳回/转办） */
  handle(id: number, data: { action: string; result?: any; comment?: string; delegateTo?: number }) {
    return request<any, any>({
      url: `${BASE_URL}/handle/${id}`,
      method: 'post',
      data,
    })
  },

  /** 我的待办任务 */
  myPending(query: { pageNum: number; pageSize: number }) {
    return request<any, PageResult<HumanTask[]>>({
      url: `${BASE_URL}/myPending`,
      method: 'get',
      params: query,
    })
  },
}

const ANNOTATION_URL = '/api/workflows/annotations'

export const AnnotationAPI = {
  /** 分页查询标注记录 */
  page(query: { taskId?: number; instanceId?: number; contentType?: string; pageNum: number; pageSize: number }) {
    return request<any, PageResult<AnnotationRecord[]>>({
      url: `${ANNOTATION_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 新增标注 */
  insert(data: Partial<AnnotationRecord>) {
    return request<any, any>({
      url: `${ANNOTATION_URL}/insert`,
      method: 'post',
      data,
    })
  },
}

const FEEDBACK_URL = '/api/workflows/feedbacks'

export const FeedbackAPI = {
  /** 分页查询反馈记录 */
  page(query: { feedbackType?: string; skillId?: number; pageNum: number; pageSize: number }) {
    return request<any, PageResult<FeedbackRecord[]>>({
      url: `${FEEDBACK_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 新增反馈 */
  insert(data: Partial<FeedbackRecord>) {
    return request<any, any>({
      url: `${FEEDBACK_URL}/insert`,
      method: 'post',
      data,
    })
  },
}
