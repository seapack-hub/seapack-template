/**
 * Agent 管理 — 常量定义
 */

/** 默认 Agent 表单数据 */
export const DEFAULT_AGENT_FORM = {
  name: '',
  code: '',
  avatar: '',
  description: '',
  systemPrompt: '',
  greeting: '',
  modelCode: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2048,
  outputFormat: 'markdown',
  memoryEnabled: 0,
  memoryWindow: 20,
  version: 'v1.0.0',
  status: 1,
  sortOrder: 0,
}
