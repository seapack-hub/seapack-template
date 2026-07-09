// X6Nodes 工作流节点组件
export { default as BaseNode } from './BaseNode.vue'
export { default as TriggerNode } from './nodes/TriggerNode.vue'
export { default as ActionNode } from './nodes/ActionNode.vue'
export { default as ConditionNode } from './nodes/ConditionNode.vue'
export { default as ApprovalNode } from './nodes/ApprovalNode.vue'
export { default as DelayNode } from './nodes/DelayNode.vue'
export { default as SubWorkflowNode } from './nodes/SubWorkflowNode.vue'

// 工具函数
export {
  registerWorkflowNodes,
  getNodeRegistration,
  createNodeConfig,
  getAvailableNodeShapes,
  defaultPorts,
} from './utils/registerNodes'

// Types
export type { WorkflowNodeShape } from './utils/registerNodes'
export type {
  WorkflowNodeDataBase,
  TriggerNodeData,
  ActionNodeData,
  ConditionNodeData,
  ApprovalNodeData,
  DelayNodeData,
  SubWorkflowNodeData,
  WorkflowNodeData,
  WorkflowEdgeData,
  WorkflowVariable,
} from './types'
