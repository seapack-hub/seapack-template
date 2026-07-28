/**
 * AI 助手位置管理 API
 *
 * 后端控制器：AiPositionController（/ai/positions）
 * 注：所有修改/删除操作统一使用 POST，URL 以 /update、/delete、/status 结尾
 */
import { request } from '@/utils/axios'
import type { AiPosition, AiPositionQuery } from './types/position'

export type { AiPosition, AiPositionQuery }

const BASE_URL = '/api/ai/positions'

export const PositionAPI = {
  /** GET /ai/positions/all — 全量已启用位置（下拉选择用、缓存用） */
  list(params?: { status?: number }) {
    return request<any, AiPosition[]>({
      url: `${BASE_URL}/all`,
      method: 'get',
      params,
    })
  },

  /** GET /ai/positions/page/list — 分页查询位置列表（管理用） */
  page(query: AiPositionQuery) {
    const { pageNum, pageSize, ...rest } = query
    return request<any, PageResult<AiPosition[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: { pageNum, pageSize, ...rest },
    })
  },

  /** GET /ai/positions/detail/{id} — 查询位置详情 */
  getById(id: number) {
    return request<any, AiPosition>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** POST /ai/positions/insert — 新增位置 */
  insert(data: Partial<AiPosition>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** POST /ai/positions/update — 编辑位置 */
  update(id: number, data: Partial<AiPosition>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** POST /ai/positions/delete/{id} — 删除位置 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'post',
    })
  },

  /** POST /ai/positions/updateStatus/{id} — 启停切换 */
  updateStatus(id: number, status: number) {
    return request<any, any>({
      url: `${BASE_URL}/updateStatus/${id}`,
      method: 'post',
      data: { status },
    })
  },

  /** GET /ai/positions/modules — 获取所有已启用的模块列表（去重） */
  getModules() {
    return request<any, { moduleKey: string; label: string }[]>({
      url: `${BASE_URL}/modules`,
      method: 'get',
    })
  },
}
