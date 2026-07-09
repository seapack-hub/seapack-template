<template>
  <div class="x6-toolbar h-48px flex items-center bg-white border-b border-gray-200 px-16px gap-8px">
    <!-- 左侧插槽 -->
    <slot name="left" />

    <!-- 工具组 -->
    <div class="toolbar-group flex items-center gap-4px px-8px border-r border-gray-200">
      <el-tooltip content="放大" placement="top">
        <div class="toolbar-btn" :class="{ disabled: false }" @click="handleZoomIn">
          <el-icon :size="18"><ZoomIn /></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="缩小" placement="top">
        <div class="toolbar-btn" @click="handleZoomOut">
          <el-icon :size="18"><ZoomOut /></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="适配" placement="top">
        <div class="toolbar-btn" @click="handleFitContent">
          <el-icon :size="18"><FullScreen /></el-icon>
        </div>
      </el-tooltip>
    </div>

    <div class="toolbar-group flex items-center gap-4px px-8px border-r border-gray-200">
      <el-tooltip content="撤销" placement="top">
        <div class="toolbar-btn" :class="{ disabled: !canUndo }" @click="handleUndo">
          <el-icon :size="18"><RefreshLeft /></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip content="重做" placement="top">
        <div class="toolbar-btn" :class="{ disabled: !canRedo }" @click="handleRedo">
          <el-icon :size="18"><RefreshRight /></el-icon>
        </div>
      </el-tooltip>
    </div>

    <div class="toolbar-group flex items-center gap-4px px-8px border-r border-gray-200">
      <el-tooltip content="导出SVG" placement="top">
        <div class="toolbar-btn" @click="handleExport">
          <el-icon :size="18"><Download /></el-icon>
        </div>
      </el-tooltip>
    </div>

    <!-- 中间插槽 -->
    <slot name="center" />

    <div class="flex-1" />

    <!-- 右侧插槽 -->
    <slot name="right" />
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { Graph, DataUri } from '@antv/x6'
import {
  ZoomIn,
  ZoomOut,
  FullScreen,
  RefreshLeft,
  RefreshRight,
  Download,
} from '@element-plus/icons-vue'

const props = defineProps({
  graph: {
    type: Object as PropType<Graph>,
    default: null,
  },
  canUndo: {
    type: Boolean,
    default: false,
  },
  canRedo: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['zoom-in', 'zoom-out', 'zoom-to-fit', 'undo', 'redo', 'export'])

const handleZoomIn = () => {
  emit('zoom-in')
  props.graph?.zoom(0.2)
}

const handleZoomOut = () => {
  emit('zoom-out')
  props.graph?.zoom(-0.2)
}

const handleFitContent = () => {
  emit('zoom-to-fit')
  props.graph?.zoomToFit({ padding: 20 })
}

const handleUndo = () => {
  if (!props.canUndo) return
  emit('undo')
  props.graph?.undo()
}

const handleRedo = () => {
  if (!props.canRedo) return
  emit('redo')
  props.graph?.redo()
}

const handleExport = () => {
  emit('export')
  if (!props.graph) return

  const cells = props.graph.getCells()
  let contentBBox = null

  if (cells.length > 0) {
    contentBBox = props.graph.getCellsBBox(cells)
    if (!contentBBox || contentBBox.width <= 0 || contentBBox.height <= 0) {
      const nodes = props.graph.getNodes()
      const edges = props.graph.getEdges()
      if (nodes.length > 0 || edges.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        nodes.forEach((node) => {
          const pos = node.position()
          const size = node.size()
          minX = Math.min(minX, pos.x)
          minY = Math.min(minY, pos.y)
          maxX = Math.max(maxX, pos.x + size.width)
          maxY = Math.max(maxY, pos.y + size.height)
        })
        edges.forEach((edge) => {
          const vertices = edge.getVertices() || []
          vertices.forEach((v) => {
            minX = Math.min(minX, v.x)
            minY = Math.min(minY, v.y)
            maxX = Math.max(maxX, v.x)
            maxY = Math.max(maxY, v.y)
          })
        })
        if (minX !== Infinity) {
          contentBBox = {
            x: minX - 20,
            y: minY - 20,
            width: maxX - minX + 40,
            height: maxY - minY + 40,
          }
        }
      }
    }
  }

  const SAFE_PADDING = 40
  const exportBBox = contentBBox
    ? {
        x: contentBBox.x - SAFE_PADDING,
        y: contentBBox.y - SAFE_PADDING,
        width: contentBBox.width + SAFE_PADDING * 2,
        height: contentBBox.height + SAFE_PADDING * 2,
      }
    : {
        x: 0,
        y: 0,
        width: props.graph.container.clientWidth || 800,
        height: props.graph.container.clientHeight || 600,
      }

  props.graph.toSVG(
    (dataUri) => {
      DataUri.downloadDataUri(DataUri.svgToDataUrl(dataUri), '流程图_' + Date.now() + '.svg')
    },
    {
      preserveDimensions: true,
      viewBox: exportBBox,
    },
  )
}
</script>

<style lang="scss" scoped>
.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #606266;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &:active {
    background-color: var(--el-fill-color);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
    }
  }
}
</style>
