/**
 * useChatExecution — 统一对话执行 composable
 *
 * 根据当前会话的 mode 自动选择对话接口：
 *   - 'llm'          → streamChat()（SSE 流式，直接调用 LLM）
 *   - 'agent'        → AgentAPI.testChatStream()（SSE 流式，通过 Agent 配置调用 LLM）
 *   - 'orchestration' → OrchestrationAPI.executeStream()（SSE 流式，多 Agent 编排执行）
 *
 * 支持：
 *   - 流式输出：三种模式均为逐字流式
 *   - 请求取消：通过 AbortController 取消进行中的请求
 *   - Token 消耗统计：Agent 和编排模式下返回 tokenUsage
 *   - 编排步骤进度：通过 onStepProgress 回调通知调用方
 *
 * 使用方式：
 *   const { sendMessage, abort, tokenUsage } = useChatExecution()
 *   await sendMessage('你好')
 */
import { ref } from 'vue'
import { useChatStore, type Session } from '@/store/modules/chat'
import { streamChat } from '@/api/ai/index'
import { AgentAPI, abortTestChat } from '@/api/ai/agent'
import { OrchestrationAPI } from '@/api/ai/orchestration'
import type { AgentTestChatSSEEvent } from '@/api/ai/types/agent'
import type { OrchestrationSSEEvent } from '@/api/ai/types/orchestration'

/** 编排步骤进度信息 */
export interface StepProgress {
  stepIndex: number
  stepName: string
  status: 'running' | 'success' | 'fail' | 'skip'
  message?: string
  output?: string
  durationMs?: number
}

export function useChatExecution(onStepProgress?: (progress: StepProgress) => void) {
  const chatStore = useChatStore()

  /** 当前请求的 AbortController（仅 LLM 模式使用） */
  let abortController: AbortController | null = null

  /** Agent/编排模式最近一次的 Token 消耗 */
  const tokenUsage = ref<{ prompt: number; completion: number } | null>(null)

  /**
   * 发送消息，根据当前会话模式自动选择对话接口
   *
   * @param text 用户输入的消息文本
   */
  async function sendMessage(text: string) {
    const session = chatStore.currentSession
    if (!session) return

    // 添加用户消息到会话
    chatStore.addMessage({ role: 'user', content: text })
    chatStore.loading = true
    // 重置 token 统计
    tokenUsage.value = null
    // 添加空的 assistant 消息，后续流式填充内容
    chatStore.addMessage({ role: 'assistant', content: '' })

    // 根据模式选择对话接口
    if (session.mode === 'orchestration' && session.orchestrationBinding) {
      await sendOrchestrationMessage(text, session)
    } else if (session.mode === 'agent' && session.agentBinding) {
      await sendAgentMessage(text, session)
    } else {
      await sendLlmMessage()
    }
  }

  /**
   * LLM 模式：通过 streamChat 进行 SSE 流式对话
   * 消息逐块追加到会话中
   */
  async function sendLlmMessage() {
    abortController = new AbortController()
    const contextMessages = chatStore.getContextMessages()
    await streamChat(
      contextMessages,
      // 流式追加 AI 回复的每个 chunk
      (chunk) => chatStore.updateLastMessage(chunk),
      // 流式结束
      () => {
        chatStore.loading = false
        abortController = null
      },
      // 错误处理
      (err) => {
        // 忽略 AbortError（用户主动取消）
        if (err.name !== 'AbortError') {
          chatStore.updateLastMessage(`\n\n[错误: ${err.message}]`)
        }
        chatStore.loading = false
        abortController = null
      },
      // 传入知识库命名空间（用于 RAG 检索范围限定）
      chatStore.namespace,
    )
  }

  /**
   * Agent 模式：通过 AgentAPI.testChatStream 进行 SSE 流式对话
   * Agent 会自动携带提示词模板、知识库、技能等配置
   * 回复逐字流式展示，并在完成时返回 trace 和 token 统计
   *
   * @param text 用户输入的消息文本
   * @param session 当前会话对象
   */
  async function sendAgentMessage(text: string, session: Session) {
    try {
      const binding = session.agentBinding!
      await AgentAPI.testChatStream(
        {
          agentId: binding.agentId,
          message: text,
          history: chatStore.messages.slice(0, -2).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        },
        // 处理 SSE 事件
        (event: AgentTestChatSSEEvent) => {
          switch (event.type) {
            // 文本片段：逐字追加到消息
            case 'content':
              if (event.text) {
                chatStore.updateLastMessage(event.text)
              }
              break

            // 对话完成：记录 token 统计
            case 'done':
              chatStore.loading = false
              // 提取 token 消耗（兼容两种格式）
              if (event.tokens) {
                tokenUsage.value = event.tokens
              } else if (event.tokensPrompt != null || event.tokensCompletion != null) {
                tokenUsage.value = {
                  prompt: event.tokensPrompt || 0,
                  completion: event.tokensCompletion || 0,
                }
              }
              break

            // 错误
            case 'error':
              chatStore.updateLastMessage(`\n\n[错误: ${event.message || '未知错误'}]`)
              chatStore.loading = false
              break
          }
        },
      )
    } catch (err) {
      chatStore.updateLastMessage(`\n\n[错误: ${(err as Error).message}]`)
      chatStore.loading = false
    }
  }

  /**
   * 编排模式：通过 OrchestrationAPI.executeStream 进行 SSE 流式多 Agent 编排
   * 支持步骤进度事件（step_start/step_progress/step_done/step_error）和最终文本输出
   *
   * @param text 用户输入的消息文本
   * @param session 当前会话对象
   */
  async function sendOrchestrationMessage(text: string, session: Session) {
    try {
      const binding = session.orchestrationBinding!
      await OrchestrationAPI.executeStream(
        {
          orchestrationId: binding.orchestrationId,
          message: text,
          history: chatStore.messages.slice(0, -2).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        },
        // 处理 SSE 事件
        (event: OrchestrationSSEEvent) => {
          switch (event.type) {
            // 步骤开始
            case 'step_start':
              onStepProgress?.({
                stepIndex: event.stepIndex ?? 0,
                stepName: event.stepName ?? '',
                status: 'running',
                message: event.message,
              })
              break

            // 步骤进度
            case 'step_progress':
              onStepProgress?.({
                stepIndex: event.stepIndex ?? 0,
                stepName: event.stepName ?? '',
                status: 'running',
                message: event.message,
              })
              break

            // 步骤完成
            case 'step_done':
              onStepProgress?.({
                stepIndex: event.stepIndex ?? 0,
                stepName: event.stepName ?? '',
                status: event.status ?? 'success',
                output: event.output,
                durationMs: event.durationMs,
                message: event.message,
              })
              break

            // 步骤错误
            case 'step_error':
              onStepProgress?.({
                stepIndex: event.stepIndex ?? 0,
                stepName: event.stepName ?? '',
                status: 'fail',
                message: event.errorMessage ?? event.message,
              })
              break

            // 文本片段：逐字追加到消息
            case 'content':
              if (event.text) {
                chatStore.updateLastMessage(event.text)
              }
              break

            // 完成
            case 'done':
              chatStore.loading = false
              if (event.tokens) {
                tokenUsage.value = event.tokens
              }
              break

            // 错误
            case 'error':
              chatStore.updateLastMessage(`\n\n[错误: ${event.errorMessage || '未知错误'}]`)
              chatStore.loading = false
              break
          }
        },
      )
    } catch (err) {
      chatStore.updateLastMessage(`\n\n[错误: ${(err as Error).message}]`)
      chatStore.loading = false
    }
  }

  /**
   * 取消当前进行中的对话请求
   * LLM 模式通过 AbortController 取消 fetch
   * Agent/编排模式通过 abortTestChat() 取消 SSE 流
   */
  function abort() {
    // 取消 LLM 模式的 fetch 请求
    abortController?.abort()
    abortController = null
    // 取消 Agent/编排模式的 SSE 流
    abortTestChat()
    chatStore.loading = false
  }

  return { sendMessage, abort, tokenUsage }
}
