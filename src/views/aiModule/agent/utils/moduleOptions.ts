/**
 * Agent 管理 — 常量定义
 */

/** 模型选项列表 */
export const MODEL_OPTIONS = [
  { label: 'DeepSeek Chat', value: 'deepseek-chat' },
  { label: 'DeepSeek Coder', value: 'deepseek-coder' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
  { label: '通义千问', value: 'qwen-plus' },
  { label: 'GLM-4', value: 'glm-4' },
]

/** 输出格式选项 */
export const OUTPUT_FORMAT_OPTIONS = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'JSON', value: 'json' },
  { label: '纯文本', value: 'text' },
  { label: 'HTML', value: 'html' },
]

/** 状态选项 */
export const AGENT_STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

/** 记忆模式选项 */
export const MEMORY_OPTIONS = [
  { label: '关闭', value: 0 },
  { label: '开启', value: 1 },
]

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
