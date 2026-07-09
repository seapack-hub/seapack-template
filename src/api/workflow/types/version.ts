import type { WorkflowNodeConfig, WorkflowEdgeConfig, WorkflowVariable } from './workflow'

/** 工作流版本历史 */
export interface WorkflowVersion {
  id?: number
  workflowId: number
  version: number
  nodes?: any[]
  edges?: any[]
  nodeConfigs?: WorkflowNodeConfig[]
  edgeConfigs?: WorkflowEdgeConfig[]
  variables?: WorkflowVariable[]
  viewport?: any
  changeLog?: string
  createdBy?: number
  createdByName?: string
  createdAt?: string
}
