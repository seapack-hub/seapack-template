/**
 * 工作流定义 API
 */
import { request } from '@/utils/axios'
import type { WorkflowDefinition, WorkflowQuery } from './types'

const BASE_URL = '/api/workflows'

export const WorkflowAPI = {
  /** 分页查询工作流列表 */
  page(query: WorkflowQuery) {
    return request<any, PageResult<WorkflowDefinition[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 全量工作流列表 */
  list(params?: { categoryId?: number; status?: number }) {
    return request<any, WorkflowDefinition[]>({
      url: `${BASE_URL}/all`,
      method: 'get',
      params,
    })
  },

  /** 查询工作流详情 */
  getById(id: number) {
    return request<any, WorkflowDefinition>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** 新增工作流 */
  insert(data: Partial<WorkflowDefinition>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** 编辑工作流 */
  update(id: number, data: Partial<WorkflowDefinition>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** 删除工作流 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'delete',
    })
  },

  /** 复制工作流 */
  copy(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/copy/${id}`,
      method: 'post',
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

  /** 保存工作流定义（含画布数据） */
  saveDefinition(id: number, data: {
    nodes: any[]
    edges: any[]
    nodeConfigs: any[]
    edgeConfigs: any[]
    variables: any[]
    viewport: any
  }) {
    return request<any, any>({
      url: `${BASE_URL}/saveDefinition/${id}`,
      method: 'post',
      data,
    })
  },

  /** 获取工作流定义 */
  getDefinition(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/getDefinition/${id}`,
      method: 'get',
    })
  },

  /** 执行工作流 */
  run(id: number, data?: { inputParams?: Record<string, any> }) {
    return request<any, any>({
      url: `${BASE_URL}/run/${id}`,
      method: 'post',
      data,
      timeout: 300000,
    })
  },

  /** 调试工作流 */
  debug(id: number, data?: { inputParams?: Record<string, any> }) {
    return request<any, any>({
      url: `${BASE_URL}/debug/${id}`,
      method: 'post',
      data,
      timeout: 300000,
    })
  },
}

// 重新导出子模块，方便从 @/api/workflow 统一导入
export { WorkflowInstanceAPI } from './instance'
export { WorkflowVersionAPI } from './version'
export { WorkflowCategoryAPI } from './category'
export { HumanTaskAPI, AnnotationAPI, FeedbackAPI } from './humanTask'
export { ScheduleAPI } from './schedule'
export { StatsAPI } from './stats'

export type {
  WorkflowDefinition,
  WorkflowQuery,
  WorkflowInstance,
  WorkflowNodeLog,
  WorkflowVersion,
  WorkflowCategory,
  HumanTask,
  AnnotationRecord,
  FeedbackRecord,
  HumanTaskQuery,
  WorkflowSchedule,
  ScheduleQuery,
  WorkflowStats,
  StatsQuery,
  StatsOverview,
} from './types'
