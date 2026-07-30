/**
 * useChatExecution — 统一对话执行 composable
 *
 * 根据当前会话模式自动选择对话接口：
 *   - 'llm'   → executeLlmStream()（SSE 流式，直接调用 LLM）
 *   - 'scene' → executeOrchestrationStream()（SSE 流式，传 sceneId，后端自动路由编排）
 *
 * 支持：
 *   - 流式输出：两种模式均为逐字流式
 *   - 步骤进度：LLM 模式和场景模式均支持步骤进度事件
 *   - 请求取消：通过 AbortController 取消进行中的请求
 *   - Token 消耗统计：场景模式下返回 tokenUsage
 *   - 链路追踪：场景模式下返回 traceSnapshot
 */
import { ref } from 'vue'
import { useChatStore, type Session } from '@/store/modules/chat'
import { executeOrchestrationStream, executeLlmStream, abortChat, cancelChatStream } from '@/api/ai/chatExecute'
import type { OrchestrationSSEEvent } from '@/api/ai/types/orchestration'
import type { LlmTestChatSSEEvent } from '@/api/ai/types/agent'

/** 步骤进度信息 */
export interface StepProgress {
  stepIndex: number
  stepName: string
  stepType?: string
  status: 'running' | 'success' | 'fail' | 'skip'
  durationMs?: number
}

export function useChatExecution() {
  const chatStore = useChatStore()

  /** 最近一次的 Token 消耗 */
  const tokenUsage = ref<{ prompt: number; completion: number } | null>(null)

  /** LLM 模式步骤进度列表 */
  const llmSteps = ref<StepProgress[]>([])

  /**
   * 发送消息，根据当前会话模式自动选择对话接口
   */
  async function sendMessage(text: string) {
    const session = chatStore.currentSession
    if (!session) return

    chatStore.addMessage({ role: 'user', content: text })
    chatStore.loading = true
    tokenUsage.value = null
    llmSteps.value = []
    chatStore.clearCurrentTrace()
    chatStore.addMessage({ role: 'assistant', content: '' })

    if (session.mode === 'scene' && session.sceneBinding) {
      await sendSceneMessage(text, session)
    } else {
      await sendLlmMessage()
    }
  }

  /**
   * LLM 模式：直接调用 LLM
   */
  async function sendLlmMessage() {
    const contextMessages = chatStore.getContextMessages()
    try {
      await executeLlmStream(
        contextMessages,
        chatStore.namespace,
        (event: LlmTestChatSSEEvent) => {
          switch (event.type) {
            case 'step_start':
              llmSteps.value.push({
                stepIndex: event.stepIndex ?? 1,
                stepName: event.stepName || '',
                stepType: event.stepType,
                status: 'running',
              })
              break

            case 'step_done':
              const step = llmSteps.value.find(s => s.stepType === event.stepType)
              if (step) {
                step.status = (event.status as any) || 'success'
                step.durationMs = event.durationMs
              }
              break

            case 'content':
              if (event.text) chatStore.updateLastMessage(event.text)
              break

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
              const runningStep = llmSteps.value.find(s => s.status === 'running')
              if (runningStep) {
                runningStep.status = 'success'
                runningStep.durationMs = event.durationMs || event.totalDurationMs
              }
              break

            case 'stop':
              llmSteps.value.forEach(s => {
                if (s.status === 'running') s.status = 'skip'
              })
              {
                const msgs = chatStore.messages
                const lastMsg = msgs[msgs.length - 1]
                if (lastMsg && lastMsg.role === 'assistant') {
                  lastMsg.content = lastMsg.content
                    ? `${lastMsg.content}\n\n---\n\n**当前对话已终止**`
                    : '**当前对话已终止**'
                }
              }
              break

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
   * 场景模式：发送 sceneId，后端自动路由到合适的编排执行
   */
  async function sendSceneMessage(text: string, session: Session) {
    const binding = session.sceneBinding!
    try {
      await executeOrchestrationStream(
        {
          orchestrationId: binding.sceneId, // 后端根据 sceneId 路由到对应编排
          message: text,
          history: chatStore.messages.slice(0, -2).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        } as any, // 后端支持 sceneId 字段
        (event: OrchestrationSSEEvent) => {
          switch (event.type) {
            // 步骤开始
            case 'step_start':
              llmSteps.value.push({
                stepIndex: event.stepIndex ?? llmSteps.value.length + 1,
                stepName: event.stepName || '',
                stepType: event.stepName,
                status: 'running',
              })
              break

            // 步骤完成
            case 'step_done':
              {
                const step = llmSteps.value.find(s => s.stepIndex === event.stepIndex)
                if (step) {
                  step.status = event.status || 'success'
                  step.durationMs = event.durationMs
                }
              }
              break

            // 步骤错误
            case 'step_error':
              {
                const step = llmSteps.value.find(s => s.stepIndex === event.stepIndex)
                if (step) {
                  step.status = 'fail'
                  step.durationMs = event.durationMs
                }
              }
              break

            // 流式文本输出
            case 'content':
              if (event.text) chatStore.updateLastMessage(event.text)
              break

            // 用户终止
            case 'stop':
              llmSteps.value.forEach(s => {
                if (s.status === 'running') s.status = 'skip'
              })
              {
                const msgs = chatStore.messages
                const lastMsg = msgs[msgs.length - 1]
                if (lastMsg && lastMsg.role === 'assistant') {
                  lastMsg.content = lastMsg.content
                    ? `${lastMsg.content}\n\n---\n\n**当前对话已终止**`
                    : '**当前对话已终止**'
                }
              }
              break

            // 对话完成
            case 'done':
              chatStore.loading = false
              // Token 统计
              if (event.tokens) {
                tokenUsage.value = event.tokens
                chatStore.setLastMessageTokens(event.tokens.prompt, event.tokens.completion)
              }
              // 链路追踪
              if ((event as any).traceSnapshot) {
                const raw = (event as any).traceSnapshot
                const snapshot = typeof raw === 'string' ? JSON.parse(raw) : raw
                chatStore.setCurrentTrace(snapshot)
              }
              // 标记最后一步完成
              {
                const runningStep = llmSteps.value.find(s => s.status === 'running')
                if (runningStep) {
                  runningStep.status = 'success'
                  runningStep.durationMs = event.totalDurationMs
                }
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
   */
  async function abort() {
    cancelChatStream()
    await new Promise(resolve => setTimeout(resolve, 500))
    abortChat()
    chatStore.loading = false

    let stepped = false
    llmSteps.value.forEach(s => {
      if (s.status === 'running') {
        s.status = 'skip'
        stepped = true
      }
    })
    if (stepped) {
      const msgs = chatStore.messages
      const lastMsg = msgs[msgs.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        if (!lastMsg.content.includes('对话已终止')) {
          lastMsg.content = lastMsg.content
            ? `${lastMsg.content}\n\n---\n\n**当前对话已终止**`
            : '**当前对话已终止**'
        }
      }
    }
  }

  return { sendMessage, abort, tokenUsage, llmSteps }
}
