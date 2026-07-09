<template>
  <div ref="stencilRef" class="x6-stencil h-100% w-260px border-r border-gray-200 bg-white"></div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Graph, Stencil } from '@antv/x6'
import type { StencilGroup, StencilNode } from '../types'

const props = defineProps({
  graph: {
    type: Object as PropType<Graph>,
    default: null,
  },
  groups: {
    type: Array as PropType<StencilGroup[]>,
    default: () => [],
  },
  nodes: {
    type: Array as PropType<StencilNode[]>,
    default: () => [],
  },
  title: {
    type: String,
    default: '节点',
  },
  searchPlaceholder: {
    type: String,
    default: '通过名称查询',
  },
})

const stencilRef = ref<HTMLElement | null>(null)
let stencilInstance: Stencil | null = null

const initStencil = () => {
  if (!props.graph || !stencilRef.value) return

  // 销毁旧实例
  if (stencilInstance) {
    stencilInstance.container.remove()
  }

  const defaultGroups: StencilGroup[] = props.groups.length > 0
    ? props.groups
    : [{ title: '基础节点', name: 'basic-node', graphHeight: 250 }]

  stencilInstance = new Stencil({
    title: props.title,
    target: props.graph,
    collapsable: true,
    search(cell, keyword) {
      return (cell as any)?.attrs?.text?.text?.indexOf(keyword) !== -1
    },
    placeholder: props.searchPlaceholder,
    notFoundText: '暂未匹配到结果',
    stencilGraphWidth: 260,
    stencilGraphHeight: 0,
    groups: defaultGroups,
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

const loadNodes = () => {
  if (!props.graph || !stencilInstance) return

  const groupedNodes: Record<string, any[]> = {}

  props.nodes.forEach((nodeConfig) => {
    const group = (nodeConfig as any).group || 'basic-node'
    if (!groupedNodes[group]) {
      groupedNodes[group] = []
    }
    const node = props.graph!.createNode({
      shape: nodeConfig.shape,
      label: nodeConfig.label,
      width: nodeConfig.width,
      height: nodeConfig.height,
      attrs: nodeConfig.attrs,
      ports: nodeConfig.ports || { items: [] },
      data: nodeConfig.data,
    })
    groupedNodes[group].push(node)
  })

  Object.entries(groupedNodes).forEach(([group, nodes]) => {
    stencilInstance!.load(nodes, group)
  })
}

watch(
  () => props.graph,
  () => {
    nextTick(() => {
      initStencil()
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (stencilInstance) {
    stencilInstance.container.remove()
    stencilInstance = null
  }
})
</script>

<style lang="scss" scoped>
.x6-stencil {
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
