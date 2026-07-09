import { register } from '@antv/x6-vue-shape'

// 导入节点组件
import TriggerNode from '../nodes/TriggerNode.vue'
import ActionNode from '../nodes/ActionNode.vue'
import ConditionNode from '../nodes/ConditionNode.vue'
import ApprovalNode from '../nodes/ApprovalNode.vue'
import DelayNode from '../nodes/DelayNode.vue'
import SubWorkflowNode from '../nodes/SubWorkflowNode.vue'

/** 工作流节点类型 */
export type WorkflowNodeShape =
  | 'trigger-node'
  | 'action-node'
  | 'condition-node'
  | 'approval-node'
  | 'delay-node'
  | 'sub-workflow-node'

/** 节点注册配置 */
interface NodeRegistration {
  shape: WorkflowNodeShape
  component: any
  width: number
  height: number
  ports?: any
}

/** 默认连接桩配置 */
const defaultPorts = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          style: { visibility: 'hidden' },
        },
      },
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          style: { visibility: 'hidden' },
        },
      },
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          style: { visibility: 'hidden' },
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#8f8f8f',
          strokeWidth: 1,
          fill: '#fff',
          style: { visibility: 'hidden' },
        },
      },
    },
  },
  items: [
    { group: 'top' },
    { group: 'bottom' },
    { group: 'left' },
    { group: 'right' },
  ],
}

/** 节点注册列表 */
const nodeRegistrations: NodeRegistration[] = [
  {
    shape: 'trigger-node',
    component: TriggerNode,
    width: 200,
    height: 60,
  },
  {
    shape: 'action-node',
    component: ActionNode,
    width: 200,
    height: 60,
  },
  {
    shape: 'condition-node',
    component: ConditionNode,
    width: 200,
    height: 70,
  },
  {
    shape: 'approval-node',
    component: ApprovalNode,
    width: 200,
    height: 60,
  },
  {
    shape: 'delay-node',
    component: DelayNode,
    width: 180,
    height: 56,
  },
  {
    shape: 'sub-workflow-node',
    component: SubWorkflowNode,
    width: 200,
    height: 60,
  },
]

/** 注册所有工作流节点 */
export function registerWorkflowNodes() {
  nodeRegistrations.forEach((registration) => {
    register({
      shape: registration.shape,
      component: registration.component,
      width: registration.width,
      height: registration.height,
    })
  })
}

/** 获取节点注册配置 */
export function getNodeRegistration(shape: WorkflowNodeShape): NodeRegistration | undefined {
  return nodeRegistrations.find((r) => r.shape === shape)
}

/** 创建节点的便捷函数 */
export function createNodeConfig(
  shape: WorkflowNodeShape,
  options: {
    x: number
    y: number
    data?: Record<string, any>
    label?: string
  },
) {
  const registration = getNodeRegistration(shape)
  if (!registration) {
    console.error(`Unknown node shape: ${shape}`)
    return null
  }

  return {
    shape,
    x: options.x,
    y: options.y,
    width: registration.width,
    height: registration.height,
    label: options.label,
    data: options.data,
    ports: { ...defaultPorts },
  }
}

/** 获取所有可用的工作流节点形状 */
export function getAvailableNodeShapes(): Array<{ shape: WorkflowNodeShape; label: string; color: string }> {
  return [
    { shape: 'trigger-node', label: '触发器', color: '#67C23A' },
    { shape: 'action-node', label: 'AI动作', color: '#409EFF' },
    { shape: 'condition-node', label: '条件分支', color: '#E6A23C' },
    { shape: 'approval-node', label: '人工审批', color: '#F56C6C' },
    { shape: 'delay-node', label: '延时', color: '#909399' },
    { shape: 'sub-workflow-node', label: '子工作流', color: '#9B59B6' },
  ]
}

export { defaultPorts }
