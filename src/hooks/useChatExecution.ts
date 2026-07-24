/**
 * useChatExecution — 统一对话执行 composable
 *
 * 根据当前会话的 mode 自动选择对话接口：
 *   - 'llm'   → streamChat()（SSE 流式，直接调用 LLM）
 *   - 'agent' → AgentAPI.chat()（同步，通过 Agent 配置调用 LLM）
 *
 * 使用方式：
 *   const { sendMessage, abort } = useChatExecution()
 *   await sendMessage('你好')
 */
import { useChatStore, type Session } from '@/store/modules/chat'
import { streamChat } from '@/api/ai/index'
import { AgentAPI } from '@/api/ai/agent'

export function useChatExecution() {
  const chatStore = useChatStore()

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
    // 添加空的 assistant 消息，后续流式/同步填充内容
    chatStore.addMessage({ role: 'assistant', content: '' })

    // 根据模式选择对话接口
    if (session.mode === 'agent' && session.agentBinding) {
      await sendAgentMessage(session)
    } else {
      await sendLlmMessage()
    }
  }

  /**
   * LLM 模式：通过 streamChat 进行 SSE 流式对话
   * 消息逐块追加到会话中
   */
  async function sendLlmMessage() {
    const contextMessages = chatStore.getContextMessages()
    await streamChat(
      contextMessages,
      // 流式追加 AI 回复的每个 chunk
      (chunk) => chatStore.updateLastMessage(chunk),
      // 流式结束
      () => { chatStore.loading = false },
      // 错误处理
      (err) => {
        chatStore.updateLastMessage(`\n\n[错误: ${err.message}]`)
        chatStore.loading = false
      },
      // 传入知识库命名空间（用于 RAG 检索范围限定）
      chatStore.namespace,
    )
  }

  /**
   * Agent 模式：通过 AgentAPI.chat 进行同步对话
   * Agent 会自动携带提示词模板、知识库、技能等配置
   *
   * 后续可升级为 AgentAPI.testChatStream 实现流式回复
   */
  async function sendAgentMessage(session: Session) {
    try {
      const binding = session.agentBinding!
      const res = await AgentAPI.chat({
        agentId: binding.agentId,
        message: chatStore.messages[chatStore.messages.length - 2]?.content || '',
        // 传入历史消息，让 Agent 具备多轮记忆能力
        history: chatStore.messages.slice(0, -2).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      })
      // 将 Agent 回复填充到最后一条空消息
      chatStore.updateLastMessage(res.content)
      chatStore.loading = false
    } catch (err) {
      chatStore.updateLastMessage(`\n\n[错误: ${(err as Error).message}]`)
      chatStore.loading = false
    }
  }

  /** 取消当前进行中的对话请求 */
  function abort() {
    // streamChat 无 abort 机制，后续可扩展
    chatStore.loading = false
  }

  return { sendMessage, abort }
}
