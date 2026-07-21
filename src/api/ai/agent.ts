/**
 * Agent 管理 API
 */
import { request } from '@/utils/axios'
import CacheKey from '@/constants/cache-key'
import type {
  Agent,
  AgentPrompt,
  AgentSkill,
  AgentKnowledge,
  AgentQuery,
  AgentChatRequest,
  AgentChatResponse,
  AgentTraceStep,
  AgentTraceSnapshot,
  AgentTestSession,
  AgentTestChatRequest,
  AgentTestChatResponse,
  AgentTestChatSSEEvent,
} from './types/agent'

export type {
  Agent,
  AgentPrompt,
  AgentSkill,
  AgentKnowledge,
  AgentQuery,
  AgentChatRequest,
  AgentChatResponse,
  AgentTraceStep,
  AgentTraceSnapshot,
  AgentTestSession,
  AgentTestChatRequest,
  AgentTestChatResponse,
  AgentTestChatSSEEvent,
}

const BASE_URL = '/api/ai/agents'

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

  /** 测试对话（含链路追踪） */
  testChat(req: AgentTestChatRequest) {
    return request<any, AgentTestChatResponse>({
      url: `${BASE_URL}/test-chat`,
      method: 'post',
      data: req,
      timeout: 300000,
    })
  },

  /** 测试对话（SSE 流式，POST + ReadableStream） */
  async testChatStream(
    req: AgentTestChatRequest,
    onEvent: (event: AgentTestChatSSEEvent) => void,
  ): Promise<void> {
    currentAbortController?.abort()
    currentAbortController = new AbortController()
    const token = localStorage.getItem(CacheKey.TOKEN)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const response = await fetch(`${BASE_URL}/test-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal: currentAbortController.signal,
    })
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()!
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const raw = line.slice(5).trim()
            if (!raw) continue
            try { onEvent(JSON.parse(raw)) } catch { /* ignore */ }
          }
        }
      }
      // 处理 buffer 中剩余数据
      if (buffer.startsWith('data:')) {
        const raw = buffer.slice(5).trim()
        if (raw) { try { onEvent(JSON.parse(raw)) } catch { /* ignore */ } }
      }
    } finally {
      reader.releaseLock()
    }
  },

  /** 测试会话历史列表 */
  getTestSessions(agentId: number, params?: { pageNum?: number; pageSize?: number }) {
    return request<any, PageResult<AgentTestSession[]>>({
      url: `${BASE_URL}/${agentId}/test-sessions`,
      method: 'get',
      params,
    })
  },

  /** 测试会话详情 */
  getTestSessionDetail(agentId: number, sessionId: number) {
    return request<any, AgentTestSession>({
      url: `${BASE_URL}/${agentId}/test-sessions/${sessionId}`,
      method: 'get',
    })
  },

  /** 删除测试会话 */
  deleteTestSession(agentId: number, sessionId: number) {
    return request<any, any>({
      url: `${BASE_URL}/${agentId}/test-sessions/delete/${sessionId}`,
      method: 'post',
    })
  },
}

// ===== 流式对话控制 =====
let currentAbortController: AbortController | null = null

/** 取消当前进行中的流式测试对话 */
export function abortTestChat() {
  currentAbortController?.abort()
  currentAbortController = null
}
