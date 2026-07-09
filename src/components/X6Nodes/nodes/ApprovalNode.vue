<template>
  <BaseNode
    :node="node"
    :graph="graph"
    :title="nodeData?.name || '人工审批'"
    :subtitle="getSubtitle()"
    icon-text="👤"
    color="#F56C6C"
    :status="status"
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Node, Graph } from '@antv/x6'
import BaseNode from '../BaseNode.vue'

interface ApprovalNodeData {
  nodeType: 'approval'
  name?: string
  approvalConfig?: {
    assigneeType?: 'user' | 'role' | 'department'
    assigneeIds?: number[]
    timeoutMinutes?: number
    timeoutAction?: 'auto_approve' | 'auto_reject' | 'escalate'
  }
}

const props = defineProps({
  node: {
    type: Object as PropType<Node>,
    required: true,
  },
  graph: {
    type: Object as PropType<Graph>,
    required: true,
  },
})

const nodeData = computed<ApprovalNodeData | null>(() => {
  return props.node?.getData() as ApprovalNodeData | null
})

const status = computed(() => {
  return 'idle'
})

const getSubtitle = () => {
  const data = nodeData.value
  if (!data?.approvalConfig) return '等待审批'
  const config = data.approvalConfig
  const assigneeText = config.assigneeType === 'user' ? '指定用户' :
    config.assigneeType === 'role' ? '指定角色' : '指定部门'
  const timeoutText = config.timeoutMinutes ? `${config.timeoutMinutes}分钟超时` : '无超时'
  return `${assigneeText} | ${timeoutText}`
}
</script>
