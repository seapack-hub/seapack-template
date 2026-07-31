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

/** 链路追踪步骤（编排执行步骤无 stepType/metadata，使用 agentId/agentName/model/tokens 顶层字段） */
export interface AgentTraceStep {
  stepIndex: number
  stepType?: 'prompt_assembly' | 'knowledge_retrieval' | 'skill_execution' | 'llm_call' | string
  stepName: string
  status: 'success' | 'fail' | 'skip' | string
  durationMs: number
  input?: string
  output?: string | string[]
  metadata?: Record<string, any>
  /** 编排步骤：关联 Agent ID */
  agentId?: number
  /** 编排步骤：Agent 名称 */
  agentName?: string
  /** 编排步骤：使用的模型 */
  model?: string
  /** 编排步骤：提示词 Token 数 */
  tokensPrompt?: number
  /** 编排步骤：补全 Token 数 */
  tokensCompletion?: number
}

/** 链路追踪快照（新方案结构） */
export interface AgentTraceSnapshot {
  /** 链路类型：agent / orchestration / llm */
  route?: 'agent' | 'orchestration' | 'llm' | string
  /** 链路名称（Agent 名 / 编排名） */
  agentName?: string
  /** 编排名（编排执行） */
  orchestrationName?: string
  /** 执行策略（编排执行） */
  strategy?: string
  /** 使用的模型 */
  model?: string
  /** 系统提示词长度（单 Agent 对话） */
  systemPromptLength?: number
  /** 提示词 Token 数（新方案顶层字段） */
  tokensPrompt?: number
  /** 补全 Token 数（新方案顶层字段） */
  tokensCompletion?: number
  /** 编排执行：总提示词 Token 数 */
  totalTokensPrompt?: number
  /** 编排执行：总补全 Token 数 */
  totalTokensCompletion?: number
  /** 调用链路步骤列表 */
  steps?: AgentTraceStep[]
  /** 总耗时（毫秒） */
  totalDurationMs?: number
  /** Token 汇总（旧结构兼容） */
  totalTokens?: { prompt: number; completion: number }
}

/** 测试会话实体（对应 ai_execution_session 表） */
export interface AgentTestSession {
  id?: number
  /** 业务类型：agent/orchestration/chat/skill/prompt/knowledge */
  bizType?: string
  /** 业务ID（关联具体实体，通用对话为0） */
  bizId?: number
  /** 业务名称（冗余，方便查询） */
  bizName?: string
  /** 对话ID：同一会话的所有轮次共享（前端生成） */
  conversationId?: string
  /** 场景ID：关联 ai_scene 表 */
  sceneId?: number
  /** 会话ID（旧字段，兼容保留） */
  sessionId?: string
  /** 消息ID：每条消息唯一（前端生成），精确定位某一轮对话 */
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

// ===== SSE 流式事件 =====

/**
 * 步骤详情信息（来自 step_detail 事件）
 * 统一格式：{ stepIndex, detailType, data: {...} }
 * data 内部字段根据 detailType 不同而不同
 */
export interface StepDetail {
  /** 详情类型：
   * - agent_prompt: Agent 基础提示词
   * - template_loaded: 加载的提示词模板
   * - knowledge_result: 知识库检索结果
   * - skill_params: 技能调用参数
   * - skill_result: 技能调用结果
   */
  detailType: string
  /** 详情数据（根据 detailType 结构不同） */
  data?: Record<string, any>
}

/** LLM 测试对话 SSE 流式事件 */
export interface LlmTestChatSSEEvent {
  type: 'step_start' | 'step_done' | 'content' | 'done' | 'error' | 'stop'
  /** step_start / step_done：步骤索引 */
  stepIndex?: number
  /** step_start / step_done：步骤类型 */
  stepType?: string
  /** step_start / step_done：步骤名称 */
  stepName?: string
  /** step_done：步骤状态 */
  status?: 'success' | 'fail' | 'skip'
  /** step_done：步骤耗时 ms */
  durationMs?: number
  /** content：文本片段 */
  text?: string
  /** done：token 统计 */
  tokens?: { prompt: number; completion: number }
  /** done：提示词 token 数（兼容格式） */
  tokensPrompt?: number
  /** done：补全 token 数（兼容格式） */
  tokensCompletion?: number
  /** done：总耗时 ms */
  totalDurationMs?: number
  /** done：使用的模型 */
  model?: string
  /** error：错误消息 */
  message?: string
}

/** 测试对话 SSE 流式事件 */
export interface AgentTestChatSSEEvent {
  type: 'step_start' | 'step_progress' | 'step_detail' | 'step_done' | 'content' | 'done' | 'error' | 'stop'
  /** 步骤索引 */
  stepIndex?: number
  /** step_start / step_done：步骤类型（prompt_assembly / knowledge_retrieval / skill_execution / llm_call） */
  stepType?: string
  /** step_start / step_done：步骤名称 */
  stepName?: string
  /** step_done：步骤状态 */
  status?: 'success' | 'fail' | 'skip'
  /** step_done：步骤耗时 ms */
  durationMs?: number
  /** step_progress：进度消息文本 */
  message?: string
  /** step_detail：详情类型 */
  detailType?: string
  /** step_detail：详情数据（扁平字段，后端直接发送到顶层） */
  data?: Record<string, any>
  /** content：文本片段 */
  text?: string
  /** done：完整链路快照 */
  traceSnapshot?: AgentTraceSnapshot
  /** done：token 统计（后端实际格式） */
  tokens?: { prompt: number; completion: number }
  /** done：提示词 token 数（兼容格式） */
  tokensPrompt?: number
  /** done：补全 token 数（兼容格式） */
  tokensCompletion?: number
  /** done：总耗时 ms */
  totalDurationMs?: number
}
