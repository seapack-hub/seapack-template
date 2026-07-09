import type { PageQuery } from '@/api/ai/types/common'

/** 工作流定义 */
export interface WorkflowDefinition {
  id?: number
  name: string
  code: string
  description?: string
  categoryId?: number
  categoryName?: string
  version?: number
  status?: number

  // X6画布视觉数据
  nodes?: any[]
  edges?: any[]

  // 业务配置数据
  nodeConfigs?: WorkflowNodeConfig[]
  edgeConfigs?: WorkflowEdgeConfig[]

  // 工作流级配置
  variables?: WorkflowVariable[]
  viewport?: { zoom: number; scrollX: number; scrollY: number }

  // 元数据
  createdBy?: number
  createdByName?: string
  createdAt?: string
  updatedAt?: string
}

/** 节点业务配置 */
export interface WorkflowNodeConfig {
  nodeId: string
  nodeType: string
  name: string
  config?: Record<string, any>
  inputVars?: string[]
  outputVars?: string[]
  timeoutSeconds?: number
}

/** 边业务配置 */
export interface WorkflowEdgeConfig {
  edgeId: string
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

/** 工作流查询参数 */
export interface WorkflowQuery extends PageQuery {
  keyword?: string
  status?: number
  categoryId?: number
}
