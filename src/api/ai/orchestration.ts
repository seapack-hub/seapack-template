/**
 * 编排管理 API
 *
 * 后端控制器：OrchestrationController（/ai/orchestrations）
 * 注：所有修改/删除操作统一使用 POST，URL 以 /update、/delete、/status 结尾
 */
import { request } from '@/utils/axios'
import type {
  Orchestration,
  OrchestrationQuery,
  OrchestrationStep,
} from './types/orchestration'

export type {
  Orchestration,
  OrchestrationQuery,
  OrchestrationStep,
}

const BASE_URL = '/api/ai/orchestrations'

export const OrchestrationAPI = {
  // ===== 编排 CRUD =====

  /** GET /ai/orchestrations/list — 查询场景下的编排列表 */
  list(query: OrchestrationQuery) {
    return request<any, Orchestration[]>({
      url: `${BASE_URL}/list`,
      method: 'get',
      params: query,
    })
  },

  /** GET /ai/orchestrations/detail/{id} — 查询编排详情（含步骤） */
  getById(id: number) {
    return request<any, Orchestration>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** POST /ai/orchestrations/insert — 新增编排（含步骤） */
  insert(data: Partial<Orchestration>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/orchestrations/update — 编辑编排（含步骤） */
  update(id: number, data: Partial<Orchestration>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** POST /ai/orchestrations/delete/{id} — 删除编排（级联删除步骤） */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'post',
    })
  },

  /** POST /ai/orchestrations/updateStatus/{id} — 启停切换 */
  updateStatus(id: number, status: number) {
    return request<any, any>({
      url: `${BASE_URL}/updateStatus/${id}`,
      method: 'post',
      data: { status },
    })
  },

  /** POST /ai/orchestrations/copy/{id} — 复制编排（含步骤） */
  copy(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/copy/${id}`,
      method: 'post',
    })
  },

  // ===== 步骤管理 =====

  /** GET /ai/orchestrations/{orchId}/steps — 查询编排的所有步骤 */
  getSteps(orchId: number) {
    return request<any, OrchestrationStep[]>({
      url: `${BASE_URL}/${orchId}/steps`,
      method: 'get',
    })
  },

  /** POST /ai/orchestrations/{orchId}/steps — 新增步骤 */
  addStep(orchId: number, data: Partial<OrchestrationStep>) {
    return request<any, any>({
      url: `${BASE_URL}/${orchId}/steps`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/orchestrations/{orchId}/steps/{id}/update — 更新步骤 */
  updateStep(orchId: number, id: number, data: Partial<OrchestrationStep>) {
    return request<any, any>({
      url: `${BASE_URL}/${orchId}/steps/${id}/update`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/orchestrations/{orchId}/steps/{id}/delete — 删除步骤 */
  deleteStep(orchId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${orchId}/steps/${id}/delete`,
      method: 'post',
    })
  },

  /** POST /ai/orchestrations/{orchId}/steps/sort — 批量更新步骤排序 */
  sortSteps(orchId: number, sortedIds: number[]) {
    return request<any, any>({
      url: `${BASE_URL}/${orchId}/steps/sort`,
      method: 'post',
      data: { sortedIds },
    })
  },
}
