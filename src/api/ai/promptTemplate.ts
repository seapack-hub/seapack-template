/**
 * 提示词模板管理 API
 */
import { request } from '@/utils/axios'
import type { AiExecuteResult } from './types/common'
import type {
  PromptTemplate,
  TemplateVariable,
  PromptTemplateQuery,
  PromptPreviewRequest,
} from './types/promptTemplate'

export type {
  PromptTemplate,
  TemplateVariable,
  PromptTemplateQuery,
  PromptPreviewRequest,
}

const BASE_URL = '/api/ai/prompt-templates'

export const PromptTemplateAPI = {
  /** 分页查询模板列表 */
  page(query: PromptTemplateQuery) {
    return request<any, PageResult<PromptTemplate[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 全量模板列表（下拉选择用） */
  list() {
    return request<any, PromptTemplate[]>({
      url: `${BASE_URL}/all`,
      method: 'get',
    })
  },

  /** 查询模板详情（含变量列表） */
  getById(id: number) {
    return request<any, PromptTemplate>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** 新增模板 */
  insert(data: Partial<PromptTemplate>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** 编辑模板 */
  update(id: number, data: Partial<PromptTemplate>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** 删除模板 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'delete',
    })
  },

  /** 复制模板（创建副本） */
  copy(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/copy/${id}`,
      method: 'post',
    })
  },

  /** 增加使用次数 */
  incrementUse(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/incrementUse/${id}`,
      method: 'put',
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

  // ===== 变量管理（预留，后端变量随模板整体保存） =====

  /** 获取模板变量列表 */
  getVariables(templateId: number) {
    return request<any, TemplateVariable[]>({
      url: `${BASE_URL}/detail/${templateId}`,
      method: 'get',
    })
  },

  /** 执行（填变量 → 渲染 Prompt → 调用 LLM） */
  preview(req: PromptPreviewRequest) {
    return request<any, AiExecuteResult>({
      url: `${BASE_URL}/execute`,
      method: 'post',
      data: req,
      timeout: 300000,
    })
  },
}
