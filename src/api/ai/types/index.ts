/**
 * AI 模块公共类型定义
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}
