<template>
  <div ref="stencilRef" class="workflow-stencil h-100% w-260px border-r border-gray-200 bg-white"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Stencil } from '@antv/x6'
import { getAvailableNodeShapes, defaultPorts } from '@/components/X6Nodes'

const props = defineProps({
  graph: {
    type: Object,
    default: null,
  },
})

const stencilRef = ref<HTMLElement | null>(null)
let stencilInstance: Stencil | null = null

// 节点分组配置
const groups = [
  { title: '触发器', name: 'trigger', graphHeight: 100 },
  { title: 'AI动作', name: 'action', graphHeight: 180 },
  { title: '流程控制', name: 'control', graphHeight: 140 },
  { title: '人工节点', name: 'human', graphHeight: 100 },
  { title: '高级', name: 'advanced', graphHeight: 140 },
]

// 节点分组映射
const groupMapping: Record<string, string> = {
  'trigger-node': 'trigger',
  'action-node': 'action',
  'condition-node': 'control',
  'approval-node': 'human',
  'delay-node': 'advanced',
  'sub-workflow-node': 'advanced',
}

// 初始化 Stencil
const initStencil = () => {
  if (!props.graph || !stencilRef.value) return

  stencilInstance = new Stencil({
    title: '工作流节点',
    target: props.graph,
    collapsable: true,
    search(cell, keyword) {
      return (cell as any)?.attrs?.text?.text?.indexOf(keyword) !== -1
    },
    placeholder: '搜索节点',
    notFoundText: '暂未匹配到结果',
    stencilGraphWidth: 260,
    stencilGraphHeight: 0,
    groups,
    layoutOptions: {
      columns: 2,
      columnWidth: 115,
      rowHeight: 60,
    },
  })

  stencilRef.value.appendChild(stencilInstance.container)

  // 加载节点
  loadNodes()
}

// 加载节点到 Stencil
const loadNodes = () => {
  if (!props.graph || !stencilInstance) return

  const nodeShapes = getAvailableNodeShapes()
  const groupedNodes: Record<string, any[]> = {}

  nodeShapes.forEach((shape) => {
    const group = groupMapping[shape.shape] || 'action'
    if (!groupedNodes[group]) {
      groupedNodes[group] = []
    }

    const node = (props.graph as any).createNode({
      shape: shape.shape,
      width: 200,
      height: 60,
      data: { nodeType: shape.shape.replace('-node', ''), name: shape.label },
      ports: { ...defaultPorts },
    })

    groupedNodes[group].push(node)
  })

  Object.entries(groupedNodes).forEach(([group, nodes]) => {
    stencilInstance!.load(nodes, group)
  })
}

onMounted(() => {
  initStencil()
})

onBeforeUnmount(() => {
  if (stencilInstance) {
    stencilInstance.container.remove()
    stencilInstance = null
  }
})
</script>

<style lang="scss" scoped>
.workflow-stencil {
  :deep(.x6-widget-stencil) {
    background-color: #ffffff !important;
  }

  :deep(.x6-widget-stencil-title) {
    background-color: #fafafa !important;
    border-bottom: 1px solid #e8e8e8;
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.x6-widget-stencil-group-title) {
    background-color: #fafafa !important;
    border-bottom: 1px solid #eaeaea;
    font-size: 12px;
  }
}
</style>
