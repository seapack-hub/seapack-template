import { Graph, Shape } from '@antv/x6'
import type { Ref } from 'vue'
import type { GraphOptions, GraphData, NodeConfig, EdgeConfig } from '../types'

/**
 * Graph 核心 Composable
 * 管理 Graph 实例的初始化、销毁、数据操作和视图操作
 */
export function useGraph(
  containerRef: Ref<HTMLElement | null>,
  options?: GraphOptions,
) {
  const graph = shallowRef<Graph | null>(null)

  /** 初始化 Graph */
  function initGraph(opts?: GraphOptions) {
    if (graph.value) {
      graph.value.dispose()
    }
    if (!containerRef.value) return

    const defaultOptions: GraphOptions = {
      grid: { size: 20, visible: true },
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
      ...opts,
    }

    const graphObj = new Graph({
      container: containerRef.value,
      ...defaultOptions,
    })

    graph.value = graphObj
    return graphObj
  }

  /** 销毁 Graph */
  function destroyGraph() {
    if (graph.value) {
      graph.value.dispose()
      graph.value = null
    }
  }

  /** 获取图表数据 */
  function getGraphData(): GraphData | null {
    if (!graph.value) return null
    return graph.value.toJSON() as GraphData
  }

  /** 加载图表数据 */
  function loadGraphData(data: GraphData) {
    if (!graph.value) return
    graph.value.fromJSON(data)
  }

  /** 添加节点 */
  function addNode(config: NodeConfig) {
    if (!graph.value) return null
    return graph.value.addNode(config)
  }

  /** 移除节点 */
  function removeNode(id: string) {
    if (!graph.value) return
    const node = graph.value.getCellById(id)
    if (node) {
      graph.value.removeNode(id)
    }
  }

  /** 添加边 */
  function addEdge(config: EdgeConfig) {
    if (!graph.value) return null
    return graph.value.addEdge(config)
  }

  /** 移除边 */
  function removeEdge(id: string) {
    if (!graph.value) return
    graph.value.removeEdge(id)
  }

  /** 缩放 */
  function zoomIn(delta = 0.2) {
    graph.value?.zoom(delta)
  }

  function zoomOut(delta = -0.2) {
    graph.value?.zoom(delta)
  }

  function zoomTo(factor: number) {
    graph.value?.zoom(factor)
  }

  /** 适配内容 */
  function fitContent(padding = 20) {
    graph.value?.zoomToFit({ padding })
  }

  /** 居中内容 */
  function centerContent() {
    graph.value?.centerContent()
  }

  /** 撤销 */
  function undo() {
    graph.value?.undo()
  }

  /** 重做 */
  function redo() {
    graph.value?.redo()
  }

  /** 导出 SVG */
  function exportSVG(callback: (dataUri: string) => void, options?: any) {
    if (!graph.value) return
    const cells = graph.value.getCells()
    let contentBBox = null

    if (cells.length > 0) {
      contentBBox = graph.value.getCellsBBox(cells)
      if (!contentBBox || contentBBox.width <= 0 || contentBBox.height <= 0) {
        const nodes = graph.value.getNodes()
        const edges = graph.value.getEdges()
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
          width: graph.value.container.clientWidth || 800,
          height: graph.value.container.clientHeight || 600,
        }

    graph.value.toSVG(
      (dataUri) => {
        callback(dataUri)
      },
      {
        preserveDimensions: true,
        viewBox: exportBBox,
        ...options,
      },
    )
  }

  /** 清空画布 */
  function clearGraph() {
    if (!graph.value) return
    graph.value.clearCells()
  }

  /** 获取所有节点 */
  function getNodes() {
    return graph.value?.getNodes() || []
  }

  /** 获取所有边 */
  function getEdges() {
    return graph.value?.getEdges() || []
  }

  /** 根据ID获取节点 */
  function getNodeById(id: string) {
    return graph.value?.getCellById(id) || null
  }

  // 生命周期
  onBeforeUnmount(() => {
    destroyGraph()
  })

  return {
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
    getNodeById,
  }
}
