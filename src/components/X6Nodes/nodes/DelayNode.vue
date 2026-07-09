<template>
  <BaseNode
    :node="node"
    :graph="graph"
    :title="nodeData?.name || '延时'"
    :subtitle="getSubtitle()"
    icon-text="⏱️"
    color="#909399"
    :status="status"
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Node, Graph } from '@antv/x6'
import BaseNode from '../BaseNode.vue'

interface DelayNodeData {
  nodeType: 'delay'
  name?: string
  delayConfig?: {
    delayType?: 'fixed' | 'dynamic'
    delayValue?: number
    delayExpression?: string
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

const nodeData = computed<DelayNodeData | null>(() => {
  return props.node?.getData() as DelayNodeData | null
})

const status = computed(() => {
  return 'idle'
})

const getSubtitle = () => {
  const data = nodeData.value
  if (!data?.delayConfig) return '延时执行'
  const config = data.delayConfig
  if (config.delayType === 'fixed') {
    const value = config.delayValue || 0
    if (value < 60) return `${value}秒`
    if (value < 3600) return `${Math.floor(value / 60)}分钟`
    return `${Math.floor(value / 3600)}小时`
  }
  return '动态延时'
}
</script>
