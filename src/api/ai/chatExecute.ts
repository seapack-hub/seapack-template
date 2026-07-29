/**
 * chatExecute.ts — 公共对话执行 API
 *
 * 提供统一的 SSE 流式对话执行方法，供 AiAssistant/ChatPanel、
 * Agent 测试对话、编排执行等场景复用。
 *
 * 方法列表：
 *   - executeAgentStream        — Agent 测试对话 SSE 流
 *   - executeOrchestrationStream — 编排执行 SSE 流
 *   - abortChat                  — 取消当前所有进行中的 SSE 请求
 *
 * 使用方式：
 *   import { executeAgentStream, executeOrchestrationStream, abortChat } from '@/api/ai/chatExecute'
 */
import CacheKey from '@/constants/cache-key'
import type { AgentTestChatRequest, AgentTestChatSSEEvent, LlmTestChatSSEEvent } from './types/agent'
import type { OrchestrationExecuteRequest, OrchestrationSSEEvent } from './types/orchestration'
import type { ChatMessage } from './index'

// ===== AbortController 管理 =====
let currentAbortController: AbortController | null = null

/**
 * 取消当前所有进行中的 SSE 流式请求
 */
export function abortChat() {
  currentAbortController?.abort()
  currentAbortController = null
}

/**
 * 通知后端优雅终止当前用户的 LLM 流式对话
 * 后端会发送 stop 事件并正常关闭 SSE 连接
 */
export async function cancelChatStream(): Promise<void> {
  const token = localStorage.getItem(CacheKey.TOKEN)
  try {
    await fetch('/api/chat/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    // 忽略网络错误（仅通知后端，无需 await）
  }
}

/**
 * 获取带认证头的 fetch 配置
 */
function getFetchConfig(body: any, signal?: AbortSignal): RequestInit {
  const token = localStorage.getItem(CacheKey.TOKEN)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  }
}

/**
 * 通用的 SSE 流式读取器
 * 解析 ReadableStream 中的 SSE data 行，逐个回调分发
 *
 * @param url    请求 URL
 * @param body   POST 请求体
 * @param onEvent 事件回调，每解析一个 JSON 事件调用一次
 */
async function readSseStream(
  url: string,
  body: any,
  onEvent: (json: any) => void,
): Promise<void> {
  currentAbortController?.abort()
  currentAbortController = new AbortController()
  const signal = currentAbortController.signal

  const response = await fetch(url, getFetchConfig(body, signal))
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
        const trimmed = line.trim()
        if (trimmed.startsWith('data:')) {
          const raw = trimmed.slice(5).trim()
          if (!raw) continue
          try { onEvent(JSON.parse(raw)) } catch { /* 忽略解析异常 */ }
        }
      }
    }
    // 处理 buffer 中剩余数据
    if (buffer.startsWith('data:')) {
      const raw = buffer.slice(5).trim()
      if (raw) { try { onEvent(JSON.parse(raw)) } catch { /* 忽略 */ } }
    }
  } finally {
    reader.releaseLock()
  }
}

// ===== Agent 流式对话 =====

const AGENT_BASE_URL = '/api/ai/agents'

/**
 * Agent 测试对话（SSE 流式）
 *
 * @param req     请求参数（agentId, message, history）
 * @param onEvent 事件回调，接收 AgentTestChatSSEEvent
 */
export async function executeAgentStream(
  req: AgentTestChatRequest,
  onEvent: (event: AgentTestChatSSEEvent) => void,
): Promise<void> {
  await readSseStream(`${AGENT_BASE_URL}/test-chat`, req, onEvent)
}

// ===== LLM 流式对话 =====

const CHAT_BASE_URL = '/api/chat'

/**
 * LLM 测试对话（SSE 流式，含 token 统计和执行记录）
 *
 * 以 SSE 事件流形式逐 token 返回 AI 回复，完成时推送 token 消耗统计和耗时。
 * 对话记录会自动保存到 ai_execution_session 表中。
 *
 * @param messages  对话消息列表
 * @param namespace 知识库命名空间（可选）
 * @param onEvent   事件回调，接收 LlmTestChatSSEEvent
 */
export async function executeLlmStream(
  messages: ChatMessage[],
  namespace: string | undefined,
  onEvent: (event: LlmTestChatSSEEvent) => void,
): Promise<void> {
  await readSseStream(
    `${CHAT_BASE_URL}/test-chat`,
    { messages, namespace },
    onEvent,
  )
}

// ===== 编排流式执行 =====

const ORCHESTRATION_BASE_URL = '/api/ai/orchestrations'

/**
 * 编排执行（SSE 流式）
 *
 * 支持步骤进度事件（step_start / step_progress / step_done / step_error）
 * 和最终文本输出（content / done / error）。
 *
 * @param req     请求参数（orchestrationId, message, history）
 * @param onEvent 事件回调，接收 OrchestrationSSEEvent
 */
export async function executeOrchestrationStream(
  req: OrchestrationExecuteRequest,
  onEvent: (event: OrchestrationSSEEvent) => void,
): Promise<void> {
  await readSseStream(`${ORCHESTRATION_BASE_URL}/execute-stream`, req, onEvent)
}
