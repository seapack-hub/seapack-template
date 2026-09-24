/**
 * 编排管理 - 类型定义
 */

/** 编排策略枚举 */
export type OrchestrationStrategy = 'sequential' | 'parallel' | 'supervisor' | 'crew' | 'dynamic'

/** 节点类型 */
export type NodeType = 'agent' | 'condition' | 'aggregate' | 'handoff'

/** 输入来源模式 */
export type InputMode = 'user_input' | 'prev_output' | 'shared_state' | 'supervisor_instruction'

/** 输出去向 */
export type OutputTarget = 'next_step' | 'supervisor' | 'shared_state' | 'all_peers'

/** 编排策略选项 */
export const STRATEGY_OPTIONS: { value: OrchestrationStrategy; label: string; description: string }[] = [
  { value: 'sequential', label: '顺序执行', description: '按步骤序号依次执行，支持条件分支跳转' },
  { value: 'parallel',   label: '并行执行', description: '所有步骤同时执行，最终合并结果' },
  { value: 'supervisor', label: 'Supervisor 总控调度', description: '一个总控 Agent 通过工具动态选择 Worker Agent 执行任务' },
  { value: 'crew',       label: 'Crew 角色协作', description: '多个 Agent 自主分工协作，通过委托工具传递任务' },
  { value: 'dynamic',    label: 'Dynamic 动态规划', description: 'LLM 根据用户问题动态选择 Agent 并生成执行计划' },
]

/** 节点类型选项 */
export const NODE_TYPE_OPTIONS: { value: NodeType; label: string; description: string }[] = [
  { value: 'agent',     label: 'Agent 执行', description: '执行指定 Agent 的完整流程' },
  { value: 'condition', label: '条件判断',   description: '根据表达式判断结果，决定跳转到哪个步骤' },
  { value: 'aggregate', label: '结果汇总',   description: '汇总所有已执行步骤的输出' },
  { value: 'handoff',   label: '任务交接',   description: '将任务移交给其他 Agent 或流程' },
]

/** 输入来源选项 */
export const INPUT_MODE_OPTIONS: { value: InputMode; label: string; description: string }[] = [
  { value: 'user_input',            label: '用户原始输入',       description: '使用用户的原始问题作为输入' },
  { value: 'prev_output',           label: '上一步输出',         description: '使用前一个步骤的输出结果' },
  { value: 'shared_state',          label: '共享状态',           description: '从运行时共享状态中读取' },
  { value: 'supervisor_instruction', label: 'Supervisor 指令',  description: '使用 Supervisor 下发的指令' },
]

/** 输出去向选项 */
export const OUTPUT_TARGET_OPTIONS: { value: OutputTarget; label: string; description: string }[] = [
  { value: 'next_step',    label: '下一步',       description: '输出传递给下一个步骤' },
  { value: 'supervisor',   label: '回传 Supervisor', description: '输出回传给 Supervisor Agent' },
  { value: 'shared_state', label: '写入共享状态',   description: '输出写入运行时共享状态' },
  { value: 'all_peers',    label: '广播',           description: '输出广播给所有参与的 Agent' },
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
  /** Supervisor Agent ID（supervisor 模式下必填） */
  supervisorAgentId?: number
  /** Agent 间最大协作轮次（默认5） */
  maxRounds?: number
  /** 上下文传递策略：text_only / structured / shared_state */
  contextStrategy?: string
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
  /** 节点类型：agent / condition / aggregate / handoff */
  nodeType?: NodeType
  /** 关联AgentID（agent 节点必填） */
  agentId?: number
  /** Agent名称（JOIN返回） */
  agentName?: string
  /** Agent编码（JOIN返回） */
  agentCode?: string
  /** 输入映射：${step_1.output} 或 state:plan */
  inputMapping?: string
  /** 输入来源模式 */
  inputMode?: InputMode
  /** 输出去向 */
  outputTarget?: OutputTarget
  /** 执行条件表达式 */
  condition?: string
  /** 条件为真时跳转到的 step_index（condition 节点有效） */
  branchTrueStep?: number
  /** 条件为假时跳转到的 step_index（condition 节点有效） */
  branchFalseStep?: number
  /** 节点描述（供动态规划时 LLM 理解） */
  description?: string
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
  orchestrationId?: number
  /** 用户输入消息 */
  message: string
  /** 对话历史 */
  history?: { role: 'user' | 'assistant'; content: string }[]
  /** 上下文变量（可选，用于 input_mapping 引用） */
  context?: Record<string, any>
  /** 场景ID（前端传入，落库 scene_id） */
  sceneId?: number
  /** 对话ID：进入对话界面时生成一次，同一会话的所有轮次共享 */
  conversationId?: string
  /** 消息ID：每条消息唯一，精确定位某一轮对话 */
  requestId?: string
}

/** 编排执行SSE事件 */
export interface OrchestrationSSEEvent {
  /** 事件类型 */
  type: 'step_start' | 'step_progress' | 'step_done' | 'step_error' | 'step_detail' | 'content' | 'done' | 'error' | 'stop' | 'routing' | 'route_result' | 'agent_select'
  /** 步骤索引 */
  stepIndex?: number
  /** 步骤名称 */
  stepName?: string
  /** 步骤类型（prompt_assembly/knowledge_retrieval/skill_execution/llm_call） */
  stepType?: string
  /** 步骤状态 */
  status?: 'success' | 'fail' | 'skip'
  /** 步骤耗时 ms */
  durationMs?: number
  /** 步骤输出结果 */
  output?: string
  /** 进度消息 */
  message?: string
  /** 详情类型（step_detail事件） */
  detailType?: string
  /** step_detail：详情数据 */
  data?: Record<string, any>
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
  /** 路由/route_result/agent_select：路由目标（agent/llm/orchestration/dynamic_orchestration） */
  route?: string
  /** 路由/agent_select：Agent列表 */
  agents?: { id: number; name: string; reason?: string }[]
  /** 路由/agent_select：执行策略 */
  strategy?: string
  /** route_result：编排名称 */
  orchestrationName?: string
  /** route_result：步骤数 */
  stepCount?: number
  /** route_result/agent_select：是否降级 */
  fallback?: boolean
}
