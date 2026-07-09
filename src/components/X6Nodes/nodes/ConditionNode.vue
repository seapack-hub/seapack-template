<template>
  <BaseNode
    :node="node"
    :graph="graph"
    :title="nodeData?.name || '条件分支'"
    :subtitle="getSubtitle()"
    icon-text="🔀"
    color="#E6A23C"
    :status="status"
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Node, Graph } from '@antv/x6'
import BaseNode from '../BaseNode.vue'

interface ConditionNodeData {
  nodeType: 'condition'
  name?: string
  conditionConfig?: {
    expression?: string
    branches?: Array<{
      label: string
      edgeId: string
    }>
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

const nodeData = computed<ConditionNodeData | null>(() => {
  return props.node?.getData() as ConditionNodeData | null
})

const status = computed(() => {
  return 'idle'
})

const getSubtitle = () => {
  const data = nodeData.value
  if (!data?.conditionConfig) return '条件判断'
  const branchCount = data.conditionConfig.branches?.length || 0
  return `${branchCount}个分支 | ${data.conditionConfig.expression || '未设置条件'}`
}
</script>
