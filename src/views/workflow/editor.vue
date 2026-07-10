<template>
  <div class="workflow-editor h-100% w-100% flex flex-col">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <!-- 左侧：返回 + 名称 -->
      <div class="toolbar-left">
        <el-button text size="small" @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-input
          v-model="workflowName"
          class="w-200px"
          placeholder="工作流名称"
          size="small"
          @blur="handleNameChange"
        />
        <el-tree-select
          v-model="workflowData.categoryId"
          :data="categoryOptions"
          :props="{ label: 'name', children: 'children' }" value-key="id"
          check-strictly
          clearable
          placeholder="选择分类"
          size="small"
          style="width: 150px"
        />
        <el-tag v-if="workflowData.version" type="info" size="small">v{{ workflowData.version }}</el-tag>
      </div>

      <!-- 中间：保存/运行/调试 -->
      <div class="toolbar-center">
        <el-button :loading="saving" size="small" @click="handleSave">
          <el-icon><Check /></el-icon>保存
        </el-button>
        <el-button type="primary" :loading="running" size="small" @click="handleRun">
          <el-icon><VideoPlay /></el-icon>运行
        </el-button>
        <el-button :loading="debugging" size="small" @click="handleDebug">
          <el-icon><Monitor /></el-icon>调试
        </el-button>
        <el-button size="small" @click="showVersionHistory = true">
          <el-icon><Clock /></el-icon>版本
        </el-button>
        <el-button size="small" @click="showVariableEditor = true">
          <el-icon><Setting /></el-icon>变量
        </el-button>
      </div>

      <!-- 右侧：缩放控件 -->
      <div class="toolbar-right">
        <el-tooltip content="放大" placement="top">
          <div class="toolbar-btn" @click="graph?.zoomIn()">
            <el-icon :size="16"><ZoomIn /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="缩小" placement="top">
          <div class="toolbar-btn" @click="graph?.zoomOut()">
            <el-icon :size="16"><ZoomOut /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="适配" placement="top">
          <div class="toolbar-btn" @click="graph?.zoomContent()">
            <el-icon :size="16"><FullScreen /></el-icon>
          </div>
        </el-tooltip>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="editor-body">
      <!-- 工作流节点面板 -->
      <div class="editor-panel editor-stencil">
        <WorkflowStencil :graph="graph as any" />
      </div>

      <!-- 画布区域 -->
      <div ref="containerRef" class="editor-canvas"></div>

      <!-- 属性面板 -->
      <div class="editor-panel editor-properties">
        <PropertyPanel
          v-model="propertyPanelVisible"
          :node="selectedNode"
          :edge="selectedEdge"
          :is-node="isNode"
        >
          <template #node-property="{ node }">
            <WorkflowNodeProperty :node="node" />
          </template>
          <template #edge-property="{ edge }">
            <WorkflowEdgeProperty :edge="edge" />
          </template>
        </PropertyPanel>
      </div>
    </div>

    <!-- 版本历史对话框 -->
    <VersionHistoryDialog
      v-model="showVersionHistory"
      :workflow-id="workflowId"
      @restore="handleRestoreVersion"
    />

    <!-- 变量编辑器对话框 -->
    <VariableEditorDialog
      v-model="showVariableEditor"
      v-model:variables="workflowVariables"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Check, VideoPlay, Monitor, Clock, Setting,
  ZoomIn, ZoomOut, FullScreen,
} from '@element-plus/icons-vue'
import { Graph, Shape, Snapline, History, Export } from '@antv/x6'
import { registerWorkflowNodes, getAvailableNodeShapes } from '@/components/X6Nodes'
import type { WorkflowNodeData, WorkflowVariable } from '@/components/X6Nodes'
import { WorkflowAPI, WorkflowVersionAPI, WorkflowCategoryAPI } from '@/api/workflow'
import type { WorkflowDefinition, WorkflowCategory } from '@/api/workflow/types'
import WorkflowStencil from './components/WorkflowStencil.vue'
import PropertyPanel from '@/components/X6Canvas/components/PropertyPanel.vue'
import WorkflowNodeProperty from './components/WorkflowNodeProperty.vue'
import WorkflowEdgeProperty from './components/WorkflowEdgeProperty.vue'
import VersionHistoryDialog from './components/VersionHistoryDialog.vue'
import VariableEditorDialog from './components/VariableEditorDialog.vue'

const route = useRoute()
const router = useRouter()
const workflowId = computed(() => Number(route.params.id) || 0)

// 状态
const graph = ref<Graph | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const selectedNode = ref<any>(null)
const selectedEdge = ref<any>(null)
const isNode = ref(false)
const propertyPanelVisible = ref(true)
const saving = ref(false)
const running = ref(false)
const debugging = ref(false)
const showVersionHistory = ref(false)
const showVariableEditor = ref(false)

// 工作流数据
const workflowName = ref('')
const workflowData = reactive<Partial<WorkflowDefinition>>({})
const workflowVariables = ref<WorkflowVariable[]>([])
const categoryOptions = ref<WorkflowCategory[]>([])

const loadCategories = async () => {
  try {
    categoryOptions.value = await WorkflowCategoryAPI.list()
  } catch {}
}

// 节点选中状态
let selectedNodeTools: any = null

/** 初始化画布 */
const initGraph = () => {
  if (!containerRef.value) return

  // 注册工作流节点
  registerWorkflowNodes()

  const graphObj = new Graph({
    container: containerRef.value,
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
          data: { edgeType: 'default', priority: 0 },
        })
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet
      },
    },
  })

  // 添加事件监听
  addMonitorEvent(graphObj)

  // 使用插件
  graphObj.use(new Snapline({ enabled: true, sharp: true }))
  graphObj.use(new History({ enabled: true }))
  graphObj.use(new Export())

  graph.value = graphObj
}

/** 添加事件监听 */
const addMonitorEvent = (graphObj: Graph) => {
  let currentSelectedNode: any = null

  const clearSelection = () => {
    if (currentSelectedNode) {
      currentSelectedNode.removeTools()
      currentSelectedNode = null
      selectedNode.value = null
      isNode.value = false
    }
  }

  // 节点悬停 - 显示/隐藏连接桩
  graphObj.on('node:mouseenter', ({ view }: any) => {
    if (!view?.container) return
    const ports = view.container.querySelectorAll('.x6-port-body')
    ports.forEach((port: HTMLElement) => {
      port.style.visibility = 'visible'
      port.style.transition = 'visibility 0.15s ease'
    })
  })

  graphObj.on('node:mouseleave', ({ view }: any) => {
    if (!view?.container) return
    const ports = view.container.querySelectorAll('.x6-port-body')
    ports.forEach((port: HTMLElement) => {
      port.style.visibility = 'hidden'
    })
  })

  // 节点点击
  graphObj.on('node:click', ({ node, e }: any) => {
    e.stopPropagation()
    if (currentSelectedNode === node) {
      clearSelection()
      return
    }
    clearSelection()
    currentSelectedNode = node
    selectedNode.value = node
    isNode.value = true

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

  graphObj.on('node:removed', () => {
    selectedNode.value = null
    isNode.value = false
  })

  graphObj.on('blank:click', () => {
    clearSelection()
  })

  // 边点击
  graphObj.on('edge:click', ({ edge }: any) => {
    clearSelection()
    selectedEdge.value = edge
    isNode.value = false
  })

  graphObj.on('edge:removed', () => {
    selectedEdge.value = null
    isNode.value = false
  })
}

/** 返回列表 */
const handleBack = () => {
  router.push('/workflow/list')
}

/** 名称变更 */
const handleNameChange = () => {
  workflowData.name = workflowName.value
}

/** 保存工作流 */
const handleSave = async () => {
  if (!graph.value) return

  saving.value = true
  try {
    const graphData = graph.value.toJSON() as any
    const cells = graphData.cells || []
    const nodes = cells.filter((c: any) => !c.source && !c.target)
    const edges = cells.filter((c: any) => c.source && c.target)

    // 提取节点业务配置
    const nodeConfigs = nodes
      .filter((n: any) => n.data)
      .map((n: any) => ({
        nodeId: n.id,
        nodeType: n.data?.nodeType || 'unknown',
        name: n.data?.name || n.label || '',
        config: n.data?.config || n.data,
        inputVars: n.data?.inputVars || [],
        outputVars: n.data?.outputVars || [],
        timeoutSeconds: n.data?.timeoutSeconds,
      }))

    // 提取边业务配置
    const edgeConfigs = edges
      .filter((e: any) => e.data)
      .map((e: any) => ({
        edgeId: e.id,
        edgeType: e.data?.edgeType || 'default',
        conditionExpression: e.data?.conditionExpression,
        priority: e.data?.priority || 0,
        label: e.data?.label,
      }))

    const viewport = {
      zoom: graph.value.zoom(),
      scrollX: 0,
      scrollY: 0,
    }

    const saveData = {
      nodes,
      edges,
      nodeConfigs,
      edgeConfigs,
      variables: workflowVariables.value,
      viewport,
    }

    if (workflowId.value) {
      await WorkflowAPI.update(workflowId.value, {
        ...workflowData,
        ...saveData,
      } as any)
    } else {
      const newId = await WorkflowAPI.insert({
        ...workflowData,
        ...saveData,
      } as any)
      workflowData.id = newId
      router.replace(`/workflow/editor/${newId}`)
    }

    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

/** 运行工作流 */
const handleRun = async () => {
  if (!workflowId.value) {
    ElMessage.warning('请先保存工作流')
    return
  }

  running.value = true
  try {
    const instanceId = await WorkflowAPI.run(workflowId.value)
    ElMessage.success(`工作流已启动，实例ID: ${instanceId}`)
  } catch (error) {
    ElMessage.error('运行失败')
  } finally {
    running.value = false
  }
}

/** 调试工作流 */
const handleDebug = async () => {
  if (!workflowId.value) {
    ElMessage.warning('请先保存工作流')
    return
  }

  debugging.value = true
  try {
    const instanceId = await WorkflowAPI.debug(workflowId.value)
    ElMessage.success(`调试已启动，实例ID: ${instanceId}`)
  } catch (error) {
    ElMessage.error('调试失败')
  } finally {
    debugging.value = false
  }
}

/** 恢复版本 */
const handleRestoreVersion = (data: any) => {
  if (data.nodes && graph.value) {
    graph.value.fromJSON({ cells: [...data.nodes, ...data.edges] })
    if (data.variables) {
      workflowVariables.value = data.variables
    }
    ElMessage.success('版本已恢复')
  }
}

/** 加载工作流数据 */
const loadWorkflow = async () => {
  if (!workflowId.value) return

  try {
    const data = await WorkflowAPI.getById(workflowId.value)
    Object.assign(workflowData, data)
    workflowName.value = data.name || ''
    workflowVariables.value = data.variables || []

    // 加载画布数据
    if (data.nodes && data.edges && graph.value) {
      const cells = [...(data.nodes || []), ...(data.edges || [])]
      graph.value.fromJSON({ cells })

      // 恢复视口
      if (data.viewport) {
        graph.value.zoomTo(data.viewport.zoom || 1)
      }
    }
  } catch (error) {
    ElMessage.error('加载工作流失败')
  }
}

// 生命周期
onMounted(() => {
  // 隐藏全局设置齿轮按钮
  const handleBtn = document.querySelector('.handle-button') as HTMLElement
  if (handleBtn) handleBtn.style.display = 'none'

  initGraph()
  loadWorkflow()
  loadCategories()
})

onBeforeUnmount(() => {
  // 恢复全局设置齿轮按钮
  const handleBtn = document.querySelector('.handle-button') as HTMLElement
  if (handleBtn) handleBtn.style.display = ''

  if (graph.value) {
    graph.value.dispose()
    graph.value = null
  }
})
</script>

<style lang="scss" scoped>
.workflow-editor {
  background: #f0f2f5;
}

/* 工具栏 */
.editor-toolbar {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  z-index: 10;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-center {
  margin: 0 auto;
}

/* 主体区域 */
.editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 两侧面板 */
.editor-panel {
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  position: relative;
  z-index: 5;
  min-width: 0;
}

.editor-stencil {
  width: 300px;
  border-right: 1px solid #e4e7ed;
  background: #fff;
  overflow: hidden;
}

.editor-properties {
  width: 300px;
  border-left: 1px solid #e4e7ed;
  background: #fff;
}

/* 画布区域 */
.editor-canvas {
  flex: 1;
  overflow: hidden;
  background-color: #f8f9fb;
  background-image: radial-gradient(circle, #d4d4d4 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
}

/* 缩放按钮 */
.toolbar-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #606266;

  &:hover {
    background-color: #ecf5ff;
    color: #409eff;
  }

  &:active {
    background-color: #d9ecff;
  }
}
</style>
