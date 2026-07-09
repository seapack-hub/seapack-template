<template>
  <BaseNode
    :node="node"
    :graph="graph"
    :title="nodeData?.name || 'AI动作'"
    :subtitle="getSubtitle()"
    :icon-text="getIcon()"
    :color="getColor()"
    :status="status"
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Node, Graph } from '@antv/x6'
import BaseNode from '../BaseNode.vue'

interface ActionNodeData {
  nodeType: 'skill' | 'http_request' | 'sql_query' | 'llm_call'
  name?: string
  skillConfig?: {
    skillId: number
    skillName?: string
  }
  httpConfig?: {
    url?: string
    method?: string
  }
  llmConfig?: {
    modelCode?: string
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

const nodeData = computed<ActionNodeData | null>(() => {
  return props.node?.getData() as ActionNodeData | null
})

const status = computed(() => {
  return 'idle'
})

const getIcon = () => {
  const data = nodeData.value
  if (!data) return '🤖'
  switch (data.nodeType) {
    case 'skill': return '🤖'
    case 'http_request': return '🌐'
    case 'sql_query': return '🗄️'
    case 'llm_call': return '🧠'
    default: return '⚡'
  }
}

const getColor = () => {
  return '#409EFF'
}

const getSubtitle = () => {
  const data = nodeData.value
  if (!data) return 'AI技能调用'
  switch (data.nodeType) {
    case 'skill': return data.skillConfig?.skillName || 'AI技能'
    case 'http_request': return data.httpConfig?.method || 'HTTP请求'
    case 'sql_query': return 'SQL查询'
    case 'llm_call': return data.llmConfig?.modelCode || 'LLM调用'
    default: return '动作节点'
  }
}
</script>
