/**
 * Agent 管理 API
 */
import { request } from '@/utils/axios'

const BASE_URL = '/api/ai/agents'

// ===== 实体类型 =====

/** Agent 实体 */
export interface Agent {
  id?: number
  /** 助手名称 */
  name: string
  /** 助手编码，唯一标识 */
  code: string
  /** 头像（emoji 或图片 URL） */
  avatar?: string
  /** 助手描述 */
  description?: string
  /** 系统提示词 */
  systemPrompt: string
  /** 开场白 */
  greeting?: string
  /** 默认模型编码 */
  modelCode?: string
  /** 模型温度 0-2 */
  temperature?: number
  /** 最大输出 token 数 */
  maxTokens?: number
  /** 输出格式 */
  outputFormat?: string
  /** 是否开启对话记忆 */
  memoryEnabled?: number
  /** 记忆窗口大小 */
  memoryWindow?: number
  /** 配置版本号 */
  version?: string
  /** 状态：1启用 0禁用 */
  status?: number
  /** 排序号 */
  sortOrder?: number
  /** 使用次数 */
  useCount?: number
  createdBy?: number
  createdAt?: string
  updatedAt?: string
}

/** Agent 关联提示词模板 */
export interface AgentPrompt {
  id?: number
  agentId?: number
  templateId?: number
  /** 模板名称（查询时 JOIN 返回） */
  templateName?: string
  /** 模板编码（查询时 JOIN 返回） */
  templateCode?: string
  /** 1=主模板 0=辅助模板 */
  isPrimary?: number
  /** 1启用 0禁用 */
  enabled?: number
  sortOrder?: number
  createdAt?: string
}

/** Agent 关联技能 */
export interface AgentSkill {
  id?: number
  agentId?: number
  skillId?: number
  /** 技能名称（查询时 JOIN 返回） */
  skillName?: string
  /** 技能编码（查询时 JOIN 返回） */
  skillCode?: string
  enabled?: number
  isPrimary?: number
  sortOrder?: number
  createdAt?: string
}

/** Agent 关联知识库 */
export interface AgentKnowledge {
  id?: number
  agentId?: number
  knowledgeId?: number
  /** 知识库名称（查询时 JOIN 返回） */
  knowledgeName?: string
  enabled?: number
  /** 每次检索返回片段数 */
  retrievalCount?: number
  sortOrder?: number
  createdAt?: string
}

/** Agent 分页查询参数 */
export interface AgentQuery {
  pageNum: number
  pageSize: number
  status?: number
  keyword?: string
}

/** Agent 对话请求 */
export interface AgentChatRequest {
  agentId: number
  message: string
  /** 对话历史（可选，用于记忆模式） */
  history?: { role: 'user' | 'assistant'; content: string }[]
}

/** Agent 对话响应 */
export interface AgentChatResponse {
  /** 助手回复内容 */
  content: string
  /** 提示词 token 数 */
  tokensPrompt: number
  /** 补全 token 数 */
  tokensCompletion: number
  /** 执行耗时（毫秒） */
  durationMs: number
}

// ===== API 方法 =====

export const AgentAPI = {
  /** 分页查询 Agent 列表 */
  page(query: AgentQuery) {
    return request<any, PageResult<Agent[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: query,
    })
  },

  /** 全量 Agent 列表 */
  list() {
    return request<any, Agent[]>({
      url: `${BASE_URL}/all`,
      method: 'get',
    })
  },

  /** 查询 Agent 详情 */
  getById(id: number) {
    return request<any, Agent>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** 新增 Agent */
  insert(data: Partial<Agent>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** 编辑 Agent */
  update(id: number, data: Partial<Agent>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** 删除 Agent */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'delete',
    })
  },

  /** 复制 Agent */
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

  /** 增加使用次数 */
  incrementUse(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/incrementUse/${id}`,
      method: 'put',
    })
  },

  // ===== 关联管理：提示词模板 =====

  /** 获取 Agent 关联的提示词模板列表 */
  getPrompts(agentId: number) {
    return request<any, AgentPrompt[]>({
      url: `${BASE_URL}/${agentId}/prompts`,
      method: 'get',
    })
  },

  /** 添加关联提示词模板 */
  addPrompt(agentId: number, data: Partial<AgentPrompt>) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/prompts`,
      method: 'post',
      data,
    })
  },

  /** 更新关联提示词模板 */
  updatePrompt(agentId: number, id: number, data: Partial<AgentPrompt>) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/prompts/${id}`,
      method: 'put',
      data,
    })
  },

  /** 删除关联提示词模板 */
  deletePrompt(agentId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/prompts/${id}`,
      method: 'delete',
    })
  },

  // ===== 关联管理：技能 =====

  /** 获取 Agent 关联的技能列表 */
  getSkills(agentId: number) {
    return request<any, AgentSkill[]>({
      url: `${BASE_URL}/${agentId}/skills`,
      method: 'get',
    })
  },

  /** 添加关联技能 */
  addSkill(agentId: number, data: Partial<AgentSkill>) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/skills`,
      method: 'post',
      data,
    })
  },

  /** 更新关联技能 */
  updateSkill(agentId: number, id: number, data: Partial<AgentSkill>) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/skills/${id}`,
      method: 'put',
      data,
    })
  },

  /** 删除关联技能 */
  deleteSkill(agentId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/skills/${id}`,
      method: 'delete',
    })
  },

  // ===== 关联管理：知识库 =====

  /** 获取 Agent 关联的知识库列表 */
  getKnowledgeList(agentId: number) {
    return request<any, AgentKnowledge[]>({
      url: `${BASE_URL}/${agentId}/knowledge`,
      method: 'get',
    })
  },

  /** 添加关联知识库 */
  addKnowledge(agentId: number, data: Partial<AgentKnowledge>) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/knowledge`,
      method: 'post',
      data,
    })
  },

  /** 更新关联知识库 */
  updateKnowledge(agentId: number, id: number, data: Partial<AgentKnowledge>) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/knowledge/${id}`,
      method: 'put',
      data,
    })
  },

  /** 删除关联知识库 */
  deleteKnowledge(agentId: number, id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/knowledge/${id}`,
      method: 'delete',
    })
  },

  // ===== 测试对话 =====

  /** 发送对话消息 */
  chat(req: AgentChatRequest) {
    return request<any, AgentChatResponse>({
      url: `${BASE_URL}/chat`,
      method: 'post',
      data: req,
      timeout: 300000,
    })
  },
}
