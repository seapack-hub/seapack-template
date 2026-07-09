import type { Graph } from '@antv/x6'
import { Snapline, History, Export } from '@antv/x6'

/**
 * Graph 插件管理 Composable
 * 管理 Snapline、History、Export 等插件
 */
export function useGraphPlugins(graphObj: Graph) {
  /** 安装 Snapline 插件（对齐辅助线） */
  function useSnapline(options?: { enabled?: boolean; sharp?: boolean }) {
    graphObj.use(
      new Snapline({
        enabled: options?.enabled ?? true,
        sharp: options?.sharp ?? true,
      }),
    )
  }

  /** 安装 History 插件（撤销/重做） */
  function useHistory(options?: { enabled?: boolean }) {
    graphObj.use(
      new History({
        enabled: options?.enabled ?? true,
      }),
    )
  }

  /** 安装 Export 插件（导出SVG） */
  function useExport() {
    graphObj.use(new Export())
  }

  /** 安装所有默认插件 */
  function useDefaultPlugins() {
    useSnapline()
    useHistory()
    useExport()
  }

  /** 撤销 */
  function undo() {
    graphObj.undo()
  }

  /** 重做 */
  function redo() {
    graphObj.redo()
  }

  /** 是否可以撤销 */
  function canUndo() {
    return graphObj.canUndo()
  }

  /** 是否可以重做 */
  function canRedo() {
    return graphObj.canRedo()
  }

  return {
    useSnapline,
    useHistory,
    useExport,
    useDefaultPlugins,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
