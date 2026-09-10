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
import type { AgentTestChatSSEEvent, LlmTestChatSSEEvent } from './types/agent'
import type { OrchestrationExecuteRequest, OrchestrationSSEEvent } from './types/orchestration'
import type { ChatMessage } from './index'

const BASE_URL = '/api'

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
    await fetch('/api/ai/dialog/cancel', {
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
  //中断上一次请求
  currentAbortController?.abort()
  currentAbortController = new AbortController()
  const signal = currentAbortController.signal

  //获取fetch 返回的 response 对象
  const response = await fetch(url, getFetchConfig(body, signal))
  //请求失败
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }
  //拿到可读流 并创建读取器
  const reader = response.body!.getReader()
  //创建文本解码器，将二进制转换成文本
  const decoder = new TextDecoder()
  // 初始化缓冲区，暂存不完整的数据行
  let buffer = ''
  try {
    while (true) {
      //逐块读取 
      //value:当前读取的数据块
      //done:流是否结束
      const { done, value } = await reader.read()

      //流结束，结束循环
      if (done) break

      //解码并追加到缓冲区
      //{ stream: true } 参数,处理多字节字符被截断的情况
      //比如一个中文字符占 3 个字节，可能第一块只收到前 2 个字节，
      //stream: true 会自动缓存，等下一块补齐后再解码
      buffer += decoder.decode(value, { stream: true })

      //按换行符切分,按换行符把 buffer 切成数组
      const lines = buffer.split('\n')
      //取出数组最后一个元素，放回 buffer。
      //因为最后一行可能不完整，不能处理，要留给下一轮拼接。
      buffer = lines.pop()!

      //逐行解析 SSE 事件 
      for (const line of lines) {
        //去掉前后空白字符
        const trimmed = line.trim()
        
        //SSE 协议规定，每条消息以 data: 开头
        if (trimmed.startsWith('data:')) {
          //去掉 data: 前缀（5 个字符），再 trim 掉多余空格，得到纯 JSON 字符串
          const raw = trimmed.slice(5).trim()
          //空行跳过（SSE 协议中 \n\n 表示一个事件结束，可能产生空行）
          if (!raw) continue
          
          try { 
            //把 JSON 字符串解析成对象
            //把解析好的对象通过回调传出去，调用方在这里更新 UI
            onEvent(JSON.parse(raw)) 
          } catch { 
            /* 忽略解析异常 */ 
          }
        }
      }
    }
    // 处理 buffer 中剩余数据
    //循环结束后（done === true），buffer 里可能还剩最后一行数据
    //（因为之前 pop() 把它留在了 buffer 里，没有处理）。
    //这里做最后的兜底：如果 buffer 里还有以 data: 开头的完整内容，就解析并回调。
    if (buffer.startsWith('data:')) {
      const raw = buffer.slice(5).trim()
      if (raw) { 
        try { 
          onEvent(JSON.parse(raw)) 
        } catch {
          /* 忽略 */ 
        } 
      }
    }
  } finally {
    //释放读取器对流的控制权，让流可以被其他消费者使用
    reader.releaseLock()
  }
}

// ===== Agent 流式对话 =====

/**
 * Agent 测试对话（SSE 流式）
 *
 * @param req     请求参数（agentId, message, history）
 * @param onEvent 事件回调，接收 AgentTestChatSSEEvent
 */
export async function executeAgentStream(
  req: { agentId?: number; sceneId?: number; question: string; history?: { role: string; content: string }[] },
  onEvent: (event: AgentTestChatSSEEvent) => void,
): Promise<void> {
  await readSseStream(
    `${BASE_URL}/ai/dialog/agent-stream`,
    { mode: 'agent_stream', ...req },
    onEvent,
  )
}

// ===== LLM 流式对话 =====
/**
 * LLM 测试对话（SSE 流式，含 token 统计和执行记录）
 *
 * 以 SSE 事件流形式逐 token 返回 AI 回复，完成时推送 token 消耗统计和耗时。
 * 对话记录会自动保存到 ai_execution_session 表中。
 *
 * @param messages  对话消息列表
 * @param namespace 知识库命名空间（可选）
 * @param onEvent   事件回调，接收 LlmTestChatSSEEvent
 * @param options   会话定位参数（conversationId / requestId / sceneId，落库用）
 */
export async function executeLlmStream(
  messages: ChatMessage[],
  namespace: string | undefined,
  onEvent: (event: LlmTestChatSSEEvent) => void,
  options?: { conversationId?: string; requestId?: string; sceneId?: number },
): Promise<void> {
  await readSseStream(
    `${BASE_URL}/ai/dialog/stream`,
    {
      mode: 'streaming_llm',
      messages,
      namespace,
      conversationId: options?.conversationId,
      requestId: options?.requestId,
      sceneId: options?.sceneId,
    },
    onEvent,
  )
}

// ===== 编排流式执行 =====

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
  await readSseStream(
    `${BASE_URL}/ai/dialog/orchestration`,
    {
      mode: 'orchestration',
      orchestrationId: req.orchestrationId,
      question: req.message,
      history: req.history,
      context: req.context,
      sceneId: req.sceneId,
      conversationId: req.conversationId,
      requestId: req.requestId,
    },
    onEvent,
  )
}
