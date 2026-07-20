/**
 * Agent 管理 - 类型定义
 */

/** Agent 实体 */
export interface Agent {
  id?: number
  /** 助手名称 */
  name: string
  /** 助手编码，唯一标识 */
  code: string
  /** 头像（emoji 或图片 URL） */
  avatar?: string
  /** 助手描述 */
  description?: string
  /** 系统提示词 */
  systemPrompt: string
  /** 开场白 */
  greeting?: string
  /** 默认模型编码 */
  modelCode?: string
  /** 模型温度 0-2 */
  temperature?: number
  /** 最大输出 token 数 */
  maxTokens?: number
  /** 输出格式 */
  outputFormat?: string
  /** 是否开启对话记忆 */
  memoryEnabled?: number
  /** 记忆窗口大小 */
  memoryWindow?: number
  /** 配置版本号 */
  version?: string
  /** 状态：1启用 0禁用 */
  status?: number
  /** 排序号 */
  sortOrder?: number
  /** 使用次数 */
  useCount?: number
  createdBy?: number
  createdAt?: string
  updatedAt?: string
}

/** Agent 关联提示词模板 */
export interface AgentPrompt {
  id?: number
  agentId?: number
  templateId?: number
  /** 模板名称（查询时 JOIN 返回） */
  templateName?: string
  /** 模板编码（查询时 JOIN 返回） */
  templateCode?: string
  /** 1=主模板 0=辅助模板 */
  isPrimary?: number
  /** 1启用 0禁用 */
  enabled?: number
  sortOrder?: number
  createdAt?: string
}

/** Agent 关联技能 */
export interface AgentSkill {
  id?: number
  agentId?: number
  skillId?: number
  /** 技能名称（查询时 JOIN 返回） */
  skillName?: string
  /** 技能编码（查询时 JOIN 返回） */
  skillCode?: string
  enabled?: number
  isPrimary?: number
  sortOrder?: number
  createdAt?: string
}

/** Agent 关联知识库 */
export interface AgentKnowledge {
  id?: number
  agentId?: number
  knowledgeId?: number
  /** 知识库名称（查询时 JOIN 返回） */
  knowledgeName?: string
  enabled?: number
  /** 每次检索返回片段数 */
  retrievalCount?: number
  sortOrder?: number
  createdAt?: string
}

/** Agent 分页查询参数 */
export interface AgentQuery {
  pageNum: number
  pageSize: number
  status?: number
  keyword?: string
}

/** Agent 对话请求 */
export interface AgentChatRequest {
  agentId: number
  message: string
  /** 对话历史（可选，用于记忆模式） */
  history?: { role: 'user' | 'assistant'; content: string }[]
}

/** Agent 对话响应 */
export interface AgentChatResponse {
  /** 助手回复内容 */
  content: string
  /** 提示词 token 数 */
  tokensPrompt: number
  /** 补全 token 数 */
  tokensCompletion: number
  /** 执行耗时（毫秒） */
  durationMs: number
}

// ===== 测试会话 & 链路追踪 =====

/** 链路追踪步骤 */
export interface AgentTraceStep {
  stepIndex: number
  stepType: 'prompt_assembly' | 'knowledge_retrieval' | 'skill_execution' | 'llm_call'
  stepName: string
  status: 'success' | 'fail' | 'skip'
  durationMs: number
  input?: string
  output?: string | string[]
  metadata?: Record<string, any>
}

/** 链路追踪快照 */
export interface AgentTraceSnapshot {
  steps: AgentTraceStep[]
  totalDurationMs: number
  totalTokens: { prompt: number; completion: number }
}

/** 测试会话实体（对应 ai_execution_session 表） */
export interface AgentTestSession {
  id?: number
  /** 业务类型：agent/skill/prompt/scene/knowledge */
  bizType?: string
  /** 业务ID（关联具体实体） */
  bizId?: number
  /** 业务名称（冗余，方便查询） */
  bizName?: string
  /** 会话ID，用于关联多轮对话 */
  sessionId?: string
  /** 外部请求幂等键 */
  requestId?: string
  /** 重试次数 */
  retryCount?: number
  /** 用户输入消息 */
  userMessage: string
  /** 对话历史（JSON数组） */
  historyMessages?: string
  /** 输出结果 */
  outputResult?: string
  /** 完整调用链路快照（JSON） */
  traceSnapshot?: AgentTraceSnapshot
  /** 总耗时（毫秒） */
  totalDurationMs?: number
  /** 提示词 Token 数 */
  tokensPrompt?: number
  /** 补全 Token 数 */
  tokensCompletion?: number
  /** 总 Token 数 */
  tokensTotal?: number
  /** 使用的模型 */
  modelName?: string
  /** 状态：success/fail/timeout */
  status?: string
  /** 逻辑删除：0-未删除，1-已删除 */
  isDeleted?: number
  /** 错误信息 */
  errorMessage?: string
  /** 操作人 */
  createdBy?: number
  /** 操作时间 */
  createdAt?: string
}

/** 测试对话请求（含链路追踪） */
export interface AgentTestChatRequest {
  agentId: number
  message: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}

/** 测试对话响应（含链路追踪） */
export interface AgentTestChatResponse {
  content: string
  tokensPrompt: number
  tokensCompletion: number
  durationMs: number
  /** 链路追踪快照 */
  traceSnapshot: AgentTraceSnapshot
}
