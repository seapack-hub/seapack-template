<template>
  <div class="x6-canvas-wrapper h-100% w-100% flex flex-col">
    <!-- 工具栏 -->
    <slot name="toolbar">
      <GraphToolbar
        :graph="graph"
        :can-undo="canUndo"
        :can-redo="canRedo"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @zoom-to-fit="handleZoomToFit"
        @undo="handleUndo"
        @redo="handleRedo"
        @export="handleExport"
      />
    </slot>

    <!-- 主体区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 节点面板 -->
      <slot name="stencil">
        <NodeStencil
          v-if="showStencil"
          :graph="graph"
          :groups="stencilGroups"
          :nodes="stencilNodes"
          :title="stencilTitle"
        />
      </slot>

      <!-- 画布区域 -->
      <div ref="containerRef" class="x6-graph-container flex-1 overflow-auto"></div>

      <!-- 属性面板 -->
      <slot name="property">
        <PropertyPanel
          v-if="showPropertyPanel"
          v-model="propertyPanelVisible"
          :node="selectedNode"
          :edge="selectedEdge"
          :is-node="isNode"
        />
      </slot>
    </div>

    <!-- 底部插槽 -->
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Graph, Node, Edge } from '@antv/x6'
import type { StencilGroup, StencilNode, GraphOptions } from './types'
import { useGraph } from './composables/useGraph'
import { useGraphEvents } from './composables/useGraphEvents'
import GraphToolbar from './components/GraphToolbar.vue'
import NodeStencil from './components/NodeStencil.vue'
import PropertyPanel from './components/PropertyPanel.vue'

const props = defineProps({
  // 画布配置
  graphOptions: {
    type: Object as PropType<GraphOptions>,
    default: () => ({}),
  },
  // 节点面板配置
  showStencil: {
    type: Boolean,
    default: true,
  },
  stencilGroups: {
    type: Array as PropType<StencilGroup[]>,
    default: () => [],
  },
  stencilNodes: {
    type: Array as PropType<StencilNode[]>,
    default: () => [],
  },
  stencilTitle: {
    type: String,
    default: '节点',
  },
  // 属性面板配置
  showPropertyPanel: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'graphReady',
  'nodeClick',
  'edgeClick',
  'nodeAdded',
  'nodeRemoved',
  'edgeAdded',
  'edgeRemoved',
  'selectionClear',
  'blankClick',
  'update:selectedNode',
  'update:selectedEdge',
])

const containerRef = ref<HTMLElement | null>(null)
const propertyPanelVisible = ref(true)
const canUndo = ref(false)
const canRedo = ref(false)

// 使用 composable
const {
  graph,
  initGraph,
  destroyGraph,
  getGraphData,
  loadGraphData,
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  zoomIn,
  zoomOut,
  zoomTo,
  fitContent,
  centerContent,
  undo,
  redo,
  exportSVG,
  clearGraph,
  getNodes,
  getEdges,
} = useGraph(containerRef, props.graphOptions)

const {
  selectedNode,
  selectedEdge,
  isNode,
  clearSelection,
  bindEvents,
} = useGraphEvents(graph)

// 监听历史变化
const addHistoryChange = () => {
  if (!graph.value) return
  graph.value.on('history:change', () => {
    canUndo.value = graph.value!.canUndo()
    canRedo.value = graph.value!.canRedo()
  })
}

// 工具栏事件处理
const handleZoomIn = () => zoomIn()
const handleZoomOut = () => zoomOut()
const handleZoomToFit = () => fitContent()
const handleUndo = () => {
  if (canUndo.value) undo()
}
const handleRedo = () => {
  if (canRedo.value) redo()
}
const handleExport = () => {
  exportSVG((dataUri) => {
    const { DataUri } = require('@antv/x6')
    DataUri.downloadDataUri(DataUri.svgToDataUrl(dataUri), '流程图_' + Date.now() + '.svg')
  })
}

// 初始化
onMounted(() => {
  nextTick(() => {
    const graphObj = initGraph(props.graphOptions)
    if (graphObj) {
      bindEvents()
      addHistoryChange()
      emit('graphReady', graphObj)
    }
  })
})

// 暴露方法
defineExpose({
  graph,
  initGraph,
  destroyGraph,
  getGraphData,
  loadGraphData,
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  zoomIn,
  zoomOut,
  zoomTo,
  fitContent,
  centerContent,
  undo,
  redo,
  exportSVG,
  clearGraph,
  getNodes,
  getEdges,
  selectedNode,
  selectedEdge,
  clearSelection,
})
</script>

<style lang="scss" scoped>
.x6-canvas-wrapper {
  --x6-canvas-bg: #f5f5f5;
  --x6-border-color: #e8e8e8;
  --x6-node-selected-color: var(--el-color-primary);
}

.x6-graph-container {
  background-color: var(--x6-canvas-bg);
  background-image: radial-gradient(circle, #d9d9d9 1px, transparent 1px);
  background-size: 20px 20px;
  border: 1px solid var(--x6-border-color);
}
</style>
