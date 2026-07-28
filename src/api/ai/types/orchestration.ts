/**
 * 编排管理 - 类型定义
 */

/** 编排策略枚举 */
export type OrchestrationStrategy = 'sequential' | 'parallel' | 'llm_tool' | 'auto'

/** 编排策略选项 */
export const STRATEGY_OPTIONS: { value: OrchestrationStrategy; label: string; description: string }[] = [
  { value: 'sequential', label: '顺序执行', description: '按步骤序号依次执行，上一步输出作为下一步输入' },
  { value: 'parallel',   label: '并行执行', description: '所有步骤同时执行，最终合并结果' },
  { value: 'llm_tool',   label: 'LLM决策',  description: '由LLM判断调用哪些Agent及执行顺序' },
  { value: 'auto',       label: '自动选择',  description: '单Agent时顺序执行，多Agent时并行执行' },
]

/** 编排主实体 */
export interface Orchestration {
  id?: number
  /** 关联场景ID */
  sceneId: number
  /** 编排名称 */
  name: string
  /** 编排编码（场景内唯一） */
  code: string
  /** 编排描述 */
  description?: string
  /** 执行策略 */
  strategy: OrchestrationStrategy
  /** 状态：1启用 0禁用 */
  status?: number
  /** 排序号 */
  sortOrder?: number
  /** 创建人 */
  createdBy?: number
  createdAt?: string
  updatedAt?: string
  /** 步骤列表（查询时填充） */
  steps?: OrchestrationStep[]
}

/** 编排步骤实体 */
export interface OrchestrationStep {
  id?: number
  /** 关联编排ID */
  orchestrationId?: number
  /** 步骤序号（从1开始） */
  stepIndex: number
  /** 步骤名称 */
  stepName: string
  /** 关联AgentID */
  agentId: number
  /** Agent名称（JOIN返回） */
  agentName?: string
  /** Agent编码（JOIN返回） */
  agentCode?: string
  /** 输入映射：${step_1.output} */
  inputMapping?: string
  /** 执行条件 */
  condition?: string
  /** 失败重试次数 */
  retryCount?: number
  /** 超时时间（毫秒） */
  timeoutMs?: number | null
  /** 状态：1启用 0禁用 */
  status?: number
  /** 排序号 */
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

/** 编排查询参数 */
export interface OrchestrationQuery {
  sceneId: number
  keyword?: string
  status?: number
}

/** 编排执行请求 */
export interface OrchestrationExecuteRequest {
  orchestrationId: number
  /** 用户输入消息 */
  message: string
  /** 对话历史 */
  history?: { role: 'user' | 'assistant'; content: string }[]
  /** 上下文变量（可选，用于 input_mapping 引用） */
  context?: Record<string, any>
}

/** 编排执行SSE事件 */
export interface OrchestrationSSEEvent {
  /** 事件类型 */
  type: 'step_start' | 'step_progress' | 'step_done' | 'step_error' | 'content' | 'done' | 'error'
  /** 步骤索引 */
  stepIndex?: number
  /** 步骤名称 */
  stepName?: string
  /** 步骤状态 */
  status?: 'success' | 'fail' | 'skip'
  /** 步骤耗时 ms */
  durationMs?: number
  /** 步骤输出结果 */
  output?: string
  /** 进度消息 */
  message?: string
  /** 文本片段（content事件） */
  text?: string
  /** 完成事件：最终结果 */
  result?: string
  /** 完成事件：总耗时 */
  totalDurationMs?: number
  /** 完成事件：token统计 */
  tokens?: { prompt: number; completion: number }
  /** 错误事件：错误信息 */
  errorMessage?: string
}
