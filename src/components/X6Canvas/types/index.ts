import type { Node, Edge, Graph } from '@antv/x6'

/** 节点分组配置 */
export interface StencilGroup {
  title: string
  name: string
  graphHeight?: number
  layoutOptions?: Record<string, any>
}

/** 预置节点数据 */
export interface StencilNode {
  shape: string
  label: string
  attrs?: Record<string, any>
  ports?: PortConfig
  data?: Record<string, any>
  width?: number
  height?: number
}

/** 连接桩配置 */
export interface PortConfig {
  groups?: Record<string, PortGroupConfig>
  items?: PortItemConfig[]
}

export interface PortGroupConfig {
  position: string
  attrs?: Record<string, any>
}

export interface PortItemConfig {
  group: string
  id?: string
}

/** 图表数据 */
export interface GraphData {
  cells: CellData[]
}

export interface CellData {
  id?: string
  shape: string
  [key: string]: any
}

/** 节点配置 */
export interface NodeConfig {
  id?: string
  shape: string
  x: number
  y: number
  width?: number
  height?: number
  label?: string
  attrs?: Record<string, any>
  data?: Record<string, any>
  ports?: PortConfig
  zIndex?: number
}

/** 边配置 */
export interface EdgeConfig {
  id?: string
  source: string | { cell: string; port?: string }
  target: string | { cell: string; port?: string }
  label?: string
  attrs?: Record<string, any>
  router?: Record<string, any>
  connector?: Record<string, any>
  labels?: EdgeLabel[]
  vertices?: { x: number; y: number }[]
  data?: Record<string, any>
}

/** 边标签 */
export interface EdgeLabel {
  attrs?: Record<string, any>
  position?: {
    distance?: number
    offset?: { x: number; y: number }
  }
}

/** 画布选项 */
export interface GraphOptions {
  grid?: boolean | { size: number; visible: boolean }
  autoResize?: boolean | HTMLElement
  connecting?: {
    router?: string | Record<string, any>
    connector?: string | Record<string, any>
    anchor?: string
    connectionPoint?: string
    allowBlank?: boolean
    snap?: { radius: number }
    createEdge?: () => Edge
    validateConnection?: (args: any) => boolean
  }
  background?: { color?: string }
  panning?: boolean | { enabled: boolean; modifiers?: string[] }
  mousewheel?: boolean | { enabled: boolean; modifiers?: string[]; factor?: number }
}

/** 工具栏事件 */
export interface ToolbarEvents {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomToFit?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onExport?: () => void
  onSave?: () => void
  onRun?: () => void
}

/** 属性面板配置 */
export interface PropertyPanelProps {
  node: Node | null
  edge: Edge | null
  isNode: boolean
}

/** X6Canvas组件事件 */
export interface CanvasEmits {
  (e: 'graphReady', graph: Graph): void
  (e: 'nodeClick', node: Node): void
  (e: 'edgeClick', edge: Edge): void
  (e: 'nodeAdded', node: Node): void
  (e: 'nodeRemoved', node: Node): void
  (e: 'edgeAdded', edge: Edge): void
  (e: 'edgeRemoved', edge: Edge): void
  (e: 'selectionClear'): void
  (e: 'blankClick'): void
}
