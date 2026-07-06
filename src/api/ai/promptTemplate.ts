/**
 * 提示词模板管理 API
 */
import { request } from '@/utils/axios'

const BASE_URL = '/api/ai/prompt-templates'

/** 提示词模板实体 */
export interface PromptTemplate {
  id?: number
  /** 模板名称 */
  name: string
  /** 模板编码，唯一标识 */
  code: string
  /** 模板类型：1=系统预设 2=用户自定义 */
  type?: number
  /** 分类：stock_analysis / content_gen / data_qa / general */
  category?: string
  /** 模板正文，支持 {{变量名}} 占位符 */
  content: string
  /** 变量定义 */
  variables?: TemplateVariable[]
  /** 描述 */
  description?: string
  /** 输出格式：markdown/json/text/html */
  outputFormat?: string
  /** 版本号 */
  version?: string
  /** 被引用次数 */
  useCount?: number
  /** 状态：1启用 0禁用 */
  status?: number
  createdBy?: number
  createdAt?: string
  updatedAt?: string
}

/** 模板变量定义 */
export interface TemplateVariable {
  id?: number
  templateId?: number
  /** 变量名，对应 content 中的 {{var_name}} */
  varName: string
  /** 显示标签，如"股票代码" */
  label: string
  /** 变量类型：string/number/boolean/select/date */
  varType: string
  /** 是否必填：1是 0否 */
  required?: number
  /** 默认值 */
  defaultValue?: string
  /** select 类型选项列表 */
  options?: { label: string; value: string }[]
  /** 输入提示 */
  placeholder?: string
  /** 排序号 */
  sortOrder?: number
}

/** 分页查询参数 */
export interface PromptTemplateQuery {
  pageNum: number
  pageSize: number
  /** 分类筛选 */
  category?: string
  /** 状态筛选 */
  status?: number
  /** 关键词搜索（名称/编码） */
  keyword?: string
}

/** 执行预览请求 */
export interface PromptPreviewRequest {
  /** 模板 ID */
  templateId: number
  /** 变量值键值对 */
  params: Record<string, any>
  /** 用户补充消息 */
  userMessage?: string
}

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
