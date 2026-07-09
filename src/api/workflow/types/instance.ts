/** 工作流执行实例 */
export interface WorkflowInstance {
  id?: number
  workflowId: number
  workflowVersion?: number
  workflowName?: string
  status?: number
  triggerType?: string
  inputParams?: Record<string, any>
  outputResult?: Record<string, any>
  currentNodeId?: string
  totalNodes?: number
  completedCount?: number
  startedAt?: string
  finishedAt?: string
  durationMs?: number
  errorMessage?: string
  createdBy?: number
  createdByName?: string
  createdAt?: string
}

/** 工作流节点执行日志 */
export interface WorkflowNodeLog {
  id?: number
  instanceId: number
  nodeId: string
  nodeType: string
  nodeName?: string
  status?: number
  inputData?: Record<string, any>
  outputData?: Record<string, any>
  errorMessage?: string
  retryCount?: number
  executorType?: string
  executorRef?: string
  startedAt?: string
  completedAt?: string
  durationMs?: number
}
