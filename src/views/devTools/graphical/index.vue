<template>
  <div class="graphical-body h-100% w-100% flex flex-col">
    <X6Canvas
      :graph-options="graphOptions"
      :stencil-groups="stencilGroups"
      :stencil-nodes="stencilNodes"
      stencil-title="流程图"
      :show-property-panel="true"
      @graph-ready="onGraphReady"
    />
  </div>
</template>

<script setup lang="ts">
import { Graph, Shape } from '@antv/x6'
import { X6Canvas } from '@/components/X6Canvas'
import type { StencilGroup, StencilNode, GraphOptions } from '@/components/X6Canvas'
import { registerBaseNode, loadStencil } from './components/utils'

// 画布配置
const graphOptions: GraphOptions = {
  grid: true,
  autoResize: true,
  connecting: {
    router: 'manhattan',
    connector: {
      name: 'rounded',
      args: { radius: 8 },
    },
    anchor: 'center',
    connectionPoint: 'anchor',
    allowBlank: false,
    snap: { radius: 20 },
    createEdge() {
      return new Shape.Edge({
        attrs: {
          line: {
            stroke: '#A2B1C3',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
        zIndex: 0,
      })
    },
    validateConnection({ targetMagnet }) {
      return !!targetMagnet
    },
  },
}

// 节点面板分组
const stencilGroups: StencilGroup[] = [
  {
    title: '基础节点',
    name: 'basic-node',
    graphHeight: 250,
  },
  {
    title: '图片节点',
    name: 'image-node',
    graphHeight: 380,
    layoutOptions: {
      rowHeight: 110,
    },
  },
]

// 预置节点（由 utils.ts 中的 loadStencil 加载）
const stencilNodes: StencilNode[] = []

// Graph 就绪回调
const onGraphReady = (graph: Graph) => {
  // 注册基础节点
  registerBaseNode()
  // 加载预置节点到 Stencil
  const stencil = (graph as any).stencil
  if (stencil) {
    loadStencil(graph, stencil)
  }
}
</script>

<style lang="scss" scoped>
.graphical-body {
  .flow-chart-container,
  .sidebar-stencil {
    border: 1px solid #e8e8e8;
    box-sizing: border-box;
  }
}
</style>
