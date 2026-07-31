/**
 * AI 模块公共类型定义
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  /** 消息ID（前端生成，每条消息唯一，用于链路追踪定位） */
  requestId?: string
  /** 提示词 token 数（仅 assistant 消息有值） */
  tokensPrompt?: number
  /** 补全 token 数（仅 assistant 消息有值） */
  tokensCompletion?: number
}
