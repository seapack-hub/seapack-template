/** 工作流节点业务数据基础类型 */
export interface WorkflowNodeDataBase {
  nodeType: string
  name: string
  description?: string
  inputVars?: string[]
  outputVars?: string[]
  timeoutSeconds?: number
}

/** 触发器节点数据 */
export interface TriggerNodeData extends WorkflowNodeDataBase {
  nodeType: 'start' | 'api' | 'schedule' | 'event'
  triggerType?: 'cron' | 'interval' | 'api' | 'event'
  cronExpression?: string
  intervalSeconds?: number
  webhookUrl?: string
  eventKey?: string
}

/** 动作节点数据 */
export interface ActionNodeData extends WorkflowNodeDataBase {
  nodeType: 'skill' | 'http_request' | 'sql_query' | 'llm_call'
  skillConfig?: {
    skillId: number
    skillName?: string
    skillParams?: Record<string, any>
    inputMapping?: Record<string, string>
    outputMapping?: Record<string, string>
  }
  httpConfig?: {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    bodyTemplate?: string
    timeout?: number
    retryPolicy?: {
      maxRetries: number
      backoffMs: number
    }
  }
  sqlConfig?: {
    database?: string
    query?: string
    params?: Record<string, any>
  }
  llmConfig?: {
    modelCode?: string
    promptTemplate?: string
    temperature?: number
    maxTokens?: number
    systemPrompt?: string
  }
}

/** 条件分支节点数据 */
export interface ConditionNodeData extends WorkflowNodeDataBase {
  nodeType: 'condition'
  conditionConfig?: {
    expression?: string
    branches?: Array<{
      label: string
      edgeId: string
      expression?: string
    }>
  }
}

/** 人工审批节点数据 */
export interface ApprovalNodeData extends WorkflowNodeDataBase {
  nodeType: 'approval'
  approvalConfig?: {
    assigneeType?: 'user' | 'role' | 'department' | 'expression'
    assigneeIds?: number[]
    assigneeExpression?: string
    timeoutMinutes?: number
    timeoutAction?: 'auto_approve' | 'auto_reject' | 'escalate'
    formFields?: Array<{
      name: string
      label: string
      type: string
      required?: boolean
    }>
  }
}

/** 延时节点数据 */
export interface DelayNodeData extends WorkflowNodeDataBase {
  nodeType: 'delay'
  delayConfig?: {
    delayType?: 'fixed' | 'dynamic'
    delayValue?: number
    delayExpression?: string
  }
}

/** 子工作流节点数据 */
export interface SubWorkflowNodeData extends WorkflowNodeDataBase {
  nodeType: 'sub_workflow'
  subWorkflowConfig?: {
    workflowId?: number
    workflowName?: string
    inputMapping?: Record<string, string>
    outputMapping?: Record<string, string>
  }
}

/** 所有工作流节点数据类型 */
export type WorkflowNodeData =
  | TriggerNodeData
  | ActionNodeData
  | ConditionNodeData
  | ApprovalNodeData
  | DelayNodeData
  | SubWorkflowNodeData

/** 边业务数据 */
export interface WorkflowEdgeData {
  edgeType: 'default' | 'conditional' | 'exception'
  conditionExpression?: string
  priority?: number
  label?: string
}

/** 工作流变量定义 */
export interface WorkflowVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'file'
  defaultValue?: any
  scope: 'input' | 'output' | 'global'
  description?: string
  required: boolean
}
