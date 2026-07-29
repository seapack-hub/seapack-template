/**
 * AI 模块公共类型定义
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  /** 提示词 token 数（仅 assistant 消息有值） */
  tokensPrompt?: number
  /** 补全 token 数（仅 assistant 消息有值） */
  tokensCompletion?: number
}
