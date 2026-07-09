<template>
  <div ref="stencilRef" class="workflow-stencil h-100% w-260px border-r border-gray-200 bg-white"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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

const groups = [
  { title: '触发器', name: 'trigger', graphHeight: 100 },
  { title: 'AI动作', name: 'action', graphHeight: 180 },
  { title: '流程控制', name: 'control', graphHeight: 140 },
  { title: '人工节点', name: 'human', graphHeight: 100 },
  { title: '高级', name: 'advanced', graphHeight: 140 },
]

const groupMapping: Record<string, string> = {
  'trigger-node': 'trigger',
  'action-node': 'action',
  'condition-node': 'control',
  'approval-node': 'human',
  'delay-node': 'advanced',
  'sub-workflow-node': 'advanced',
}

const initStencil = () => {
  if (!props.graph || !stencilRef.value) return

  stencilInstance = new Stencil({
    title: '节点面板',
    target: props.graph,
    collapsable: false,
    search(cell, keyword) {
      return (cell as any)?.attrs?.text?.text?.indexOf(keyword) !== -1
    },
    placeholder: '搜索节点...',
    notFoundText: '暂未匹配到结果',
    stencilGraphWidth: 300,
    stencilGraphHeight: 120,
    groups,
    layoutOptions: {
      columns: 2,
      columnWidth: 140,
      rowHeight: 60,
    },
  })

  stencilRef.value.appendChild(stencilInstance.container)
  loadNodes()
  // setTimeout(() => {
  //   loadNodes()
  // }, 0)
}

const loadNodes = () => {
  if (!props.graph || !stencilInstance) return

  const nodeShapes = getAvailableNodeShapes()
  const groupedNodes: Record<string, any[]> = {}

  nodeShapes.forEach((shape) => {
    const group = groupMapping[shape.shape] || 'action'
    if (!groupedNodes[group]) groupedNodes[group] = []

    const node = (props.graph as any).createNode({
      shape: shape.shape,
      width: 120,
      height: 50,
      data: { nodeType: shape.shape.replace('-node', ''), name: shape.label },
      ports: { ...defaultPorts },
    })
    groupedNodes[group].push(node)
  })

  Object.entries(groupedNodes).forEach(([group, nodes]) => {
    stencilInstance!.load(nodes, group)
  })
}

watch(
  () => props.graph,
  (newGraph) => {
    if (newGraph) initStencil()
  },
)

onMounted(() => {
  if (props.graph) initStencil()
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
    .x6-widget-stencil-search{
      //
    }
    // 内容区滚动
    .x6-widget-stencil-content{
      padding: 15px 0 0 0;
      border: none !important;
      flex: 1 !important;
      overflow-y: auto !important;
      // 分组内容区：左右 padding 防止节点裁剪
      .x6-widget-stencil-group{
        background-color: transparent !important;
        // 分组标题
        .x6-widget-stencil-group-title{
          background-color: #f5f7fa !important;
          border-bottom: 1px solid #ebeef5 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          color: #606266 !important;
          margin: 0 !important;
        }
        .x6-widget-stencil-group-content{
          .x6-graph{
            padding: 10px !important;
          }
        }
      }
    }

    .x6-widget-stencil-content::-webkit-scrollbar{
      width: 4px;
    }

    .x6-widget-stencil-content::-webkit-scrollbar-thumb{
      background: #dcdfe6;
      border-radius: 2px;
    }

    .x6-widget-stencil-content::-webkit-scrollbar-track{
      background: transparent;
    }

  }
}

// 隐藏 X6 自带标题（title: '' 会渲染一个空标题栏）
:deep(.x6-widget-stencil-title) {
  //display: none !important;
}

// 搜索框：用作分组标题区的顶部工具栏
:deep(.x6-widget-stencil-search) {
  padding: 8px !important;
  margin: 0 !important;
  border-bottom: 1px solid #e4e7ed !important;
  background: #fafbfc !important;
}

:deep(.x6-widget-stencil-search input) {
  width: 100% !important;
  height: 30px !important;
  border-radius: 4px !important;
  font-size: 12px !important;
  background: #fff !important;
  border: 1px solid #dcdfe6 !important;
  padding: 0 8px !important;
  box-sizing: border-box !important;

  &::placeholder {
    color: #a8abb2 !important;
  }

  &:focus {
    border-color: #409eff !important;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1) !important;
    outline: none !important;
  }
}
</style>
