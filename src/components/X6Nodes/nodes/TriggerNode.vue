<template>
  <BaseNode
    :node="node"
    :graph="graph"
    :title="nodeData?.name || '触发器'"
    :subtitle="getSubtitle()"
    icon-text="⚡"
    color="#67C23A"
    :status="status"
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Node, Graph } from '@antv/x6'
import BaseNode from '../BaseNode.vue'

interface TriggerNodeData {
  nodeType: 'start' | 'api' | 'schedule' | 'event'
  name?: string
  triggerType?: 'cron' | 'interval' | 'api' | 'event'
  cronExpression?: string
  webhookUrl?: string
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

const nodeData = computed<TriggerNodeData | null>(() => {
  return props.node?.getData() as TriggerNodeData | null
})

const status = computed(() => {
  // 可以从 node log 数据中读取状态
  return 'idle'
})

const getSubtitle = () => {
  const data = nodeData.value
  if (!data) return '定时触发'
  switch (data.triggerType) {
    case 'cron': return `Cron: ${data.cronExpression || '未设置'}`
    case 'interval': return '间隔触发'
    case 'api': return 'API触发'
    case 'event': return '事件触发'
    default: return '手动触发'
  }
}
</script>
