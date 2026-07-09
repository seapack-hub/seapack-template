import type { Ref } from 'vue'
import type { Graph, Node, Edge } from '@antv/x6'

/**
 * Graph 事件管理 Composable
 * 管理事件监听和选中状态
 */
export function useGraphEvents(graph: Ref<Graph | null>) {
  const selectedNode = ref<Node | null>(null)
  const selectedEdge = ref<Edge | null>(null)
  const isNode = ref(false)

  let selectedNodeTools: Node | null = null

  /** 清除选中状态 */
  function clearSelection() {
    if (selectedNodeTools) {
      selectedNodeTools.removeTools()
      selectedNodeTools = null
      selectedNode.value = null
      isNode.value = false
    }
    if (selectedEdge.value) {
      selectedEdge.value = null
      isNode.value = false
    }
  }

  /** 选中节点 */
  function selectNode(node: Node) {
    clearSelection()
    selectedNode.value = node
    selectedNodeTools = node
    isNode.value = true
  }

  /** 选中边 */
  function selectEdge(edge: Edge) {
    clearSelection()
    selectedEdge.value = edge
    isNode.value = false
  }

  /** 绑定事件 */
  function bindEvents() {
    if (!graph.value) return

    // 节点悬停 - 显示/隐藏连接桩
    graph.value.on('node:mouseenter', ({ view }) => {
      if (!view || !view.graph || view.graph !== graph.value) return
      togglePorts(view, true)
    })

    graph.value.on('node:mouseleave', ({ view }) => {
      if (!view || !view.graph || view.graph !== graph.value) return
      togglePorts(view, false)
    })

    // 节点添加
    graph.value.on('node:added', ({ node }) => {
      // 触发事件
    })

    // 节点点击
    graph.value.on('node:click', ({ node, e }) => {
      e.stopPropagation()
      if (selectedNodeTools === node) {
        clearSelection()
        return
      }
      selectNode(node)
      // 添加删除按钮和边界高亮
      node.addTools([
        {
          name: 'button-remove',
          args: {
            distance: 8,
            offset: { x: 110, y: 15 },
            onClick: () => {
              node.remove()
              clearSelection()
            },
          },
        },
        {
          name: 'boundary',
          args: {
            attrs: {
              fill: '#7c68fc',
              stroke: '#333',
              'stroke-width': 1,
              'fill-opacity': 0.2,
            },
          },
        },
      ])
    })

    // 节点删除
    graph.value.on('node:removed', () => {
      selectedNode.value = null
      isNode.value = false
    })

    // 空白区域点击
    graph.value.on('blank:click', () => {
      clearSelection()
    })

    // 边添加
    graph.value.on('edge:added', ({ edge }) => {
      selectedEdge.value = edge
      isNode.value = false
    })

    // 边点击
    graph.value.on('edge:click', ({ edge }) => {
      selectedEdge.value = edge
      isNode.value = false
      clearSelection()
    })

    // 边删除
    graph.value.on('edge:removed', () => {
      selectedEdge.value = null
      isNode.value = false
    })
  }

  /** 解绑事件 */
  function unbindEvents() {
    if (!graph.value) return
    graph.value.off('node:mouseenter')
    graph.value.off('node:mouseleave')
    graph.value.off('node:added')
    graph.value.off('node:click')
    graph.value.off('node:removed')
    graph.value.off('blank:click')
    graph.value.off('edge:added')
    graph.value.off('edge:click')
    graph.value.off('edge:removed')
  }

  /** 切换连接桩可见性 */
  function togglePorts(cellView: any, show: boolean) {
    if (!cellView?.container) return
    const ports = cellView.container.querySelectorAll<HTMLElement>('.x6-port-body')
    ports.forEach((port: HTMLElement) => {
      port.style.visibility = show ? 'visible' : 'hidden'
      port.style.transition = 'visibility 0.15s ease'
    })
  }

  // 生命周期
  onBeforeUnmount(() => {
    unbindEvents()
    clearSelection()
  })

  return {
    selectedNode,
    selectedEdge,
    isNode,
    clearSelection,
    selectNode,
    selectEdge,
    bindEvents,
    unbindEvents,
  }
}
