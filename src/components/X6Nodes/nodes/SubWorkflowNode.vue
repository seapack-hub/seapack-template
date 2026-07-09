<template>
  <BaseNode
    :node="node"
    :graph="graph"
    :title="nodeData?.name || '子工作流'"
    :subtitle="getSubtitle()"
    icon-text="📦"
    color="#9B59B6"
    :status="status"
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Node, Graph } from '@antv/x6'
import BaseNode from '../BaseNode.vue'

interface SubWorkflowNodeData {
  nodeType: 'sub_workflow'
  name?: string
  subWorkflowConfig?: {
    workflowId?: number
    workflowName?: string
    inputMapping?: Record<string, string>
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

const nodeData = computed<SubWorkflowNodeData | null>(() => {
  return props.node?.getData() as SubWorkflowNodeData | null
})

const status = computed(() => {
  return 'idle'
})

const getSubtitle = () => {
  const data = nodeData.value
  if (!data?.subWorkflowConfig) return '未配置工作流'
  return data.subWorkflowConfig.workflowName || `工作流ID: ${data.subWorkflowConfig.workflowId || '未设置'}`
}
</script>
