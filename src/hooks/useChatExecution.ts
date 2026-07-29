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
import { executeAgentStream, executeLlmStream, executeOrchestrationStream, abortChat, cancelChatStream } from '@/api/ai/chatExecute'
import type { AgentTestChatSSEEvent, LlmTestChatSSEEvent } from '@/api/ai/types/agent'
import type { OrchestrationSSEEvent } from '@/api/ai/types/orchestration'

/** 编排步骤进度信息（LLM 模式也可复用） */
export interface StepProgress {
  stepIndex: number
  stepName: string
  stepType?: string
  status: 'running' | 'success' | 'fail' | 'skip'
  message?: string
  output?: string
  durationMs?: number
}

export function useChatExecution(onStepProgress?: (progress: StepProgress) => void) {
  const chatStore = useChatStore()

  /** 最近一次的 Token 消耗（LLM/Agent/编排模式均会记录） */
  const tokenUsage = ref<{ prompt: number; completion: number } | null>(null)

  /** LLM 模式步骤进度列表（step_start / step_done 事件驱动） */
  const llmSteps = ref<StepProgress[]>([])

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
    // 重置 token 统计、LLM 步骤和链路追踪
    tokenUsage.value = null
    llmSteps.value = []
    chatStore.clearCurrentTrace()
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
   * LLM 模式：通过 executeLlmStream 进行 SSE 流式对话（含 token 统计和执行记录）
   * 消息逐块追加到会话中，完成时记录 token 消耗
   */
  async function sendLlmMessage() {
    const contextMessages = chatStore.getContextMessages()
    try {
      await executeLlmStream(
        contextMessages,
        chatStore.namespace,
        // 处理 SSE 事件
        (event: LlmTestChatSSEEvent) => {
          switch (event.type) {
            // 步骤开始
            case 'step_start':
              llmSteps.value.push({
                stepIndex: event.stepIndex ?? 1,
                stepName: event.stepName || '',
                stepType: event.stepType,
                status: 'running',
              })
              break

            // 步骤完成
            case 'step_done':
              const step = llmSteps.value.find(s => s.stepType === event.stepType)
              if (step) {
                step.status = (event.status as any) || 'success'
                step.durationMs = event.durationMs
              }
              break

            // 文本片段：逐字追加到消息
            case 'content':
              if (event.text) {
                chatStore.updateLastMessage(event.text)
              }
              break

            // 对话完成：记录 token 统计，标记 LLM 步骤为完成
            case 'done':
              chatStore.loading = false
              if (event.tokens) {
                tokenUsage.value = event.tokens
                chatStore.setLastMessageTokens(event.tokens.prompt, event.tokens.completion)
              } else if (event.tokensPrompt != null || event.tokensCompletion != null) {
                tokenUsage.value = {
                  prompt: event.tokensPrompt || 0,
                  completion: event.tokensCompletion || 0,
                }
                chatStore.setLastMessageTokens(event.tokensPrompt || 0, event.tokensCompletion || 0)
              }
              // 兜底：如果 step_done 未触发，在 done 时标记运行中的步骤为完成
              const runningStep = llmSteps.value.find(s => s.status === 'running')
              if (runningStep) {
                runningStep.status = 'success'
                runningStep.durationMs = event.durationMs || event.totalDurationMs
              }
              break

            // 用户终止（后端收到取消信号后发送）
            case 'stop':
              // 标记所有运行中的步骤为中止
              llmSteps.value.forEach(s => {
                if (s.status === 'running') s.status = 'skip'
              })
              // 标记助手消息为终止
              {
                const msgs = chatStore.messages
                const lastMsg = msgs[msgs.length - 1]
                if (lastMsg && lastMsg.role === 'assistant') {
                  lastMsg.content = lastMsg.content
                    ? `${lastMsg.content}\n\n---\n\n**对话已终止**`
                    : '**对话已终止**'
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
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        chatStore.loading = false
        return
      }
      chatStore.updateLastMessage(`\n\n[错误: ${(err as Error).message}]`)
      chatStore.loading = false
    }
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
      await executeAgentStream(
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

            // 对话完成：记录 token 统计，并持久化到消息中
            case 'done':
              chatStore.loading = false
              // 提取 token 消耗（兼容两种格式），并持久化到消息中
              if (event.tokens) {
                tokenUsage.value = event.tokens
                chatStore.setLastMessageTokens(event.tokens.prompt, event.tokens.completion)
              } else if (event.tokensPrompt != null || event.tokensCompletion != null) {
                tokenUsage.value = {
                  prompt: event.tokensPrompt || 0,
                  completion: event.tokensCompletion || 0,
                }
                chatStore.setLastMessageTokens(event.tokensPrompt || 0, event.tokensCompletion || 0)
              }
              // 提取链路追踪快照（可能是 JSON 字符串或已解析的对象）
              if (event.traceSnapshot) {
                const raw = event.traceSnapshot
                const snapshot = typeof raw === 'string' ? JSON.parse(raw) : raw
                chatStore.setCurrentTrace(snapshot)
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
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        chatStore.loading = false
        return
      }
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
      await executeOrchestrationStream(
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
                chatStore.setLastMessageTokens(event.tokens.prompt, event.tokens.completion)
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
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        chatStore.loading = false
        return
      }
      chatStore.updateLastMessage(`\n\n[错误: ${(err as Error).message}]`)
      chatStore.loading = false
    }
  }

  /**
   * 取消当前进行中的对话请求
   * 1. 先通知后端优雅终止（发送 stop 事件后正常关闭 SSE）
   * 2. 等一小段时间让后端有时间发送 stop 事件
   * 3. 若后端未响应则强制中止 fetch 连接
   * 4. 本地兜底：标记运行中的步骤为中止
   */
  async function abort() {
    // 1. 通知后端优雅终止
    cancelChatStream()

    // 2. 等一段窗口期让后端发送 stop 事件
    await new Promise(resolve => setTimeout(resolve, 500))

    // 3. 强制中止 fetch 连接
    abortChat()
    chatStore.loading = false

    // 4. 本地兜底：标记运行中的 LLM 步骤为中止
    let stepped = false
    llmSteps.value.forEach(s => {
      if (s.status === 'running') {
        s.status = 'skip'
        stepped = true
      }
    })
    // 助手消息标记为终止（若 stop 事件已处理，不会重复添加）
    if (stepped) {
      const msgs = chatStore.messages
      const lastMsg = msgs[msgs.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        if (!lastMsg.content.includes('对话已终止')) {
          lastMsg.content = lastMsg.content
            ? `${lastMsg.content}\n\n---\n\n**对话已终止**`
            : '**对话已终止**'
        }
      }
    }
  }

  return { sendMessage, abort, tokenUsage, llmSteps }
}
