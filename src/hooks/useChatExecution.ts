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

/** 步骤详情项 */
export interface StepDetailItem {
  detailType: string
  data?: Record<string, any>
}

/** 步骤进度信息 */
export interface StepProgress {
  stepIndex: number
  stepName: string
  stepType?: string
  status: 'running' | 'success' | 'fail' | 'skip'
  durationMs?: number
  progressList?: string[]
  detailList?: StepDetailItem[]
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
            // 路由开始
            case 'routing':
              llmSteps.value.push({
                stepIndex: 0,
                stepName: '路由分析',
                stepType: 'routing',
                status: 'running',
              })
              break

            // 路由结果
            case 'route_result': {
              const routeStep = llmSteps.value.find(s => s.stepType === 'routing')
              if (routeStep) {
                routeStep.status = 'success'
                // 路由信息放入 progressList，不重命名步骤
                if (!routeStep.progressList) routeStep.progressList = []
                const routeLabels: Record<string, string> = {
                  orchestration: '编排执行',
                  agent: 'Agent 对话',
                  llm: '通用 LLM',
                  dynamic_orchestration: '动态编排',
                }
                const routeLabel = routeLabels[event.route || ''] || event.message
                if (routeLabel) routeStep.progressList.push(`→ ${routeLabel}`)
                const agentNames = event.agents?.map(a => a.name).filter(Boolean).join(', ')
                if (agentNames) routeStep.progressList.push(`Agent: ${agentNames}`)
                if (event.strategy) routeStep.progressList.push(`策略: ${event.strategy === 'parallel' ? '并行' : '顺序'}`)
              }
              break
            }

            // Agent 选择
            case 'agent_select': {
              const routeStep = llmSteps.value.find(s => s.stepType === 'routing')
              if (routeStep && event.agents && event.agents.length > 0) {
                // 不重命名步骤，信息放入 progressList
                if (!routeStep.progressList) routeStep.progressList = []
                const names = event.agents.map(a => a.name).join(', ')
                routeStep.progressList.push(`已选择: ${names}`)
                routeStep.progressList.push(`策略: ${event.strategy === 'parallel' ? '并行' : '顺序'}`)
                if (event.fallback) routeStep.progressList.push('(自动降级)')
              }
              break
            }

            // 步骤开始
            case 'step_start':
              llmSteps.value.push({
                stepIndex: event.stepIndex ?? llmSteps.value.length + 1,
                stepName: event.stepName || '',
                stepType: event.stepType || event.stepName,
                status: 'running',
              })
              break

            // 步骤进度消息
            case 'step_progress': {
              // 后端 skill 执行器硬编码 stepIndex=0 且无 stepType，需兜底到 running 步骤
              const step = event.stepType
                ? llmSteps.value.find(s => s.stepType === event.stepType)
                : event.stepIndex != null && event.stepIndex > 0
                  ? llmSteps.value.find(s => s.stepIndex === event.stepIndex && s.stepType !== 'routing')
                  : llmSteps.value.find(s => s.status === 'running')
              if (step && event.message) {
                if (!step.progressList) step.progressList = []
                step.progressList.push(event.message)
              }
              break
            }

            // 步骤详情
            case 'step_detail': {
              // 映射 detailType→stepType（后端 skill 执行器硬编码 stepIndex=0 且无 stepType）
              const mappedStepType = event.detailType === 'skill_params' || event.detailType === 'skill_result'
                ? 'skill_execution'
                : event.stepType
              const step = mappedStepType
                ? llmSteps.value.find(s => s.stepType === mappedStepType)
                : event.stepIndex != null && event.stepIndex > 0
                  ? llmSteps.value.find(s => s.stepIndex === event.stepIndex && s.stepType !== 'routing')
                  : llmSteps.value.find(s => s.status === 'running')
              if (step) {
                if (!step.detailList) step.detailList = []
                const data: Record<string, any> = {}
                const stdKeys = new Set(['type', 'stepIndex', 'detailType'])
                for (const [key, val] of Object.entries(event)) {
                  if (!stdKeys.has(key)) data[key] = val
                }
                step.detailList.push({
                  detailType: event.detailType || 'unknown',
                  data,
                })
              }
              break
            }

            // 步骤完成
            case 'step_done': {
              const step = event.stepType
                ? llmSteps.value.find(s => s.stepType === event.stepType)
                : llmSteps.value.find(s => s.stepIndex === event.stepIndex && s.stepType !== 'routing')
              if (step) {
                step.status = event.status || 'success'
                step.durationMs = event.durationMs
              }
              break
            }

            // 步骤错误
            case 'step_error': {
              const step = event.stepType
                ? llmSteps.value.find(s => s.stepType === event.stepType)
                : llmSteps.value.find(s => s.stepIndex === event.stepIndex && s.stepType !== 'routing')
              if (step) {
                step.status = 'fail'
                step.durationMs = event.durationMs
              }
              break
            }

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
              // 标记所有进行中的步骤为完成
              llmSteps.value.forEach(s => {
                if (s.status === 'running') {
                  s.status = 'success'
                  s.durationMs = s.durationMs || event.totalDurationMs
                }
              })
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
