<!--
  AiAssistant/index.vue — 全局悬浮 AI 助手

  职责：
    1. 渲染可拖拽的 FAB 按钮和侧边 Drawer
    2. 根据当前路由的 meta.aiPosition 自动加载场景绑定
    3. 将 binding 和 deploymentConfig 传递给子组件
    4. 根据 deploymentConfig 覆盖 UI（标题/图标/宽度/颜色）

  数据流：
    路由 meta.aiPosition → useRouteAiPosition → useSceneBindings → bindings
    bindings[].deploymentConfig → 覆盖 Drawer UI
    bindings → ChatPanel（Agent 选择器 + 对话模式）
-->
<template>
  <div class="ai-assistant-wrapper">
    <!-- FAB 悬浮按钮：可拖拽，根据 deploymentConfig 覆盖图标/颜色/提示 -->
    <!-- display_mode='hidden' 时隐藏 FAB（可通过路由参数等方式触发打开） -->
    <div
      v-if="showFab"
      ref="dragEl"
      class="ai-trigger"
      :style="fabStyle"
      :title="fabTooltip"
      @mousedown="startDrag"
      @click="drawerVisible = true"
    >
      <Icon :name="fabIcon" :size="30" color="#fff" />
      <!-- 当处于 Agent 模式时，显示 Agent 名称标签 -->
      <span v-if="isAgentMode && currentAgentName" class="agent-badge">
        {{ currentAgentName }}
      </span>
    </div>

    <!-- 侧边 Drawer：展示聊天/会话/上下文三个 Tab -->
    <el-drawer
      v-model="drawerVisible"
      :size="drawerSize"
      :with-header="false"
      direction="rtl"
      @open="handleOpen"
    >
      <div class="assistant-container">
        <!-- 顶部标题栏 -->
        <div class="assistant-header">
          <div class="header-left">
            <el-icon size="18" :color="headerColor"><ChatDotSquare /></el-icon>
            <span class="header-title">{{ headerTitle }}</span>
          </div>
          <div class="header-right">
            <!-- 模式切换标签：有 Agent 或编排绑定时可切换 -->
            <el-tag
              v-if="hasModeTag"
              size="small"
              :type="modeTagType"
              class="mode-tag"
              @click="toggleMode"
            >
              {{ modeTagText }}
            </el-tag>
            <el-button text :icon="Close" @click="drawerVisible = false" />
          </div>
        </div>

        <!-- Tab 导航 -->
        <el-tabs v-model="activeTab" class="assistant-tabs">
          <el-tab-pane label="聊天" name="chat" />
          <el-tab-pane label="会话" name="sessions" />
          <el-tab-pane label="上下文" name="context" />
        </el-tabs>

        <!-- Tab 内容区 -->
        <div class="assistant-body">
          <ChatPanel
            v-if="activeTab === 'chat'"
            :bindings="activeBindings"
            :orchestrations="orchestrations"
            :deployment-config="deploymentConfig"
          />
          <SessionList v-else-if="activeTab === 'sessions'" />
          <ContextPanel v-else />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { ChatDotSquare, Close } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { useRouteAiPosition } from '@/hooks/useRouteAiPosition'
import { useSceneBindings } from '@/hooks/useSceneBindings'
import { OrchestrationAPI } from '@/api/ai/orchestration'
import type { Orchestration } from '@/api/ai/types/orchestration'
import ChatPanel from './ChatPanel.vue'
import SessionList from './SessionList.vue'
import ContextPanel from './ContextPanel.vue'

const chatStore = useChatStore()
const { aiPosition } = useRouteAiPosition()

// ===== Drawer 状态 =====
const drawerVisible = ref(false)
const activeTab = ref('chat')

// ===== 场景绑定 =====
// 根据当前路由的 aiPosition 动态加载绑定的 Agent 列表
// 未配置 aiPosition 的页面传入空字符串，useSceneBindings 内部返回空数组
const currentModuleKey = computed(() => aiPosition.value?.moduleKey || '')
const currentPositionKey = computed(() => aiPosition.value?.positionKey || '')

// 始终调用（Vue composable 不能条件调用），空值由 hook 内部处理
// 传入 computed 引用而非 .value 快照，确保路由重定向后仍能响应
const { bindings: activeBindings, loading: bindingsLoading } = useSceneBindings(
  currentModuleKey,
  currentPositionKey,
)

/** 当前页面是否有 Agent 绑定（决定是否显示模式切换按钮） */
const hasAgentBindings = computed(() => activeBindings.value.length > 0)

// ===== 编排列表 =====
/** 当前页面场景下的编排列表 */
const orchestrations = ref<Orchestration[]>([])
/** 是否有编排（决定是否显示编排切换按钮） */
const hasOrchestrations = computed(() => orchestrations.value.length > 0)

/** 加载编排列表（根据第一个 binding 的 sceneId） */
async function loadOrchestrations() {
  if (!activeBindings.value.length) {
    orchestrations.value = []
    return
  }
  const sceneId = activeBindings.value[0]?.sceneId
  if (!sceneId) {
    orchestrations.value = []
    return
  }
  try {
    orchestrations.value = await OrchestrationAPI.list({ sceneId, status: 1 })
  } catch {
    orchestrations.value = []
  }
}

// 当 binding 加载完成后，自动加载编排列表
watch(() => activeBindings.value, () => {
  loadOrchestrations()
}, { immediate: true })

// ===== deploymentConfig（部署配置覆盖） =====
// 从 binding 中提取 deploymentConfig，用于覆盖 Drawer 的 UI 展示
const deploymentConfig = computed(() => {
  if (!activeBindings.value.length) return {}
  // 优先取 default binding，否则取第一个
  const defaultBinding = activeBindings.value.find(b => b.isDefault === 1)
  return defaultBinding?.deploymentConfig || activeBindings.value[0]?.deploymentConfig || {}
})

// ===== UI 覆盖（基于 deploymentConfig） =====
/** 是否显示 FAB 按钮（display_mode: 'hidden' 时隐藏） */
const showFab = computed(() => {
  const displayMode = deploymentConfig.value.display_mode
  // 'hidden' = 隐藏 FAB，其余情况均显示
  return displayMode !== 'hidden'
})
/** Drawer 标题 */
const headerTitle = computed(() => deploymentConfig.value.header_title || 'AI 助手')
/** Drawer 宽度 */
const drawerSize = computed(() => deploymentConfig.value.drawer_size || '500px')
/** 主题色 */
const headerColor = computed(() => deploymentConfig.value.header_color || '#409eff')
/** FAB 图标名 */
const fabIcon = computed(() => deploymentConfig.value.icon || 'robot')
/** FAB 悬浮提示 */
const fabTooltip = computed(() => deploymentConfig.value.tooltip || 'AI 助手')
/** FAB 按钮样式（支持自定义颜色） */
const fabStyle = computed(() => ({
  background: deploymentConfig.value.fab_color || '#409eff',
}))

// ===== 模式状态 =====
/** 当前会话是否为 Agent 模式 */
const isAgentMode = computed(() => chatStore.isAgentMode)
/** 当前会话是否为编排模式 */
const isOrchestrationMode = computed(() => chatStore.isOrchestrationMode)
/** 当前绑定的 Agent 名称 */
const currentAgentName = computed(() => chatStore.currentAgentBinding?.agentName)
/** 当前绑定的编排名称 */
const currentOrchestrationName = computed(() => chatStore.currentOrchestrationBinding?.orchestrationName)

/** 是否显示模式切换标签 */
const hasModeTag = computed(() => hasAgentBindings.value || hasOrchestrations.value)

/** 模式标签文本 */
const modeTagText = computed(() => {
  if (isOrchestrationMode.value) return `编排: ${currentOrchestrationName.value}`
  if (isAgentMode.value) return `Agent: ${currentAgentName.value}`
  return '通用对话'
})

/** 模式标签类型 */
const modeTagType = computed(() => {
  if (isOrchestrationMode.value) return 'warning'
  if (isAgentMode.value) return 'success'
  return 'info'
})

// ===== 模式切换 =====
/**
 * 切换对话模式
 * - LLM → Agent → Orchestration → LLM 循环切换
 * - 根据可用资源决定跳过哪些模式
 */
function toggleMode() {
  if (isOrchestrationMode.value) {
    // Orchestration → LLM：解绑编排
    chatStore.unbindOrchestration()
  } else if (isAgentMode.value) {
    if (hasOrchestrations.value) {
      // Agent → Orchestration：解绑 Agent，绑定第一个编排
      chatStore.unbindAgent()
      const orch = orchestrations.value[0]
      chatStore.bindOrchestration({
        orchestrationId: orch.id!,
        orchestrationName: orch.name,
        orchestrationCode: orch.code,
        orchestrationDescription: orch.description,
        strategy: orch.strategy,
        sceneId: orch.sceneId,
        sceneName: '',
        stepCount: orch.steps?.length ?? 0,
      })
    } else {
      // Agent → LLM：解绑 Agent
      chatStore.unbindAgent()
    }
  } else if (activeBindings.value.length > 0) {
    // LLM → Agent：绑定默认 Agent（isDefault=1），否则取第一个
    const binding = activeBindings.value.find(b => b.isDefault === 1) || activeBindings.value[0]
    chatStore.bindAgent({
      agentId: binding.agentId,
      agentName: binding.agentName,
      sceneId: binding.sceneId,
      sceneName: binding.sceneName,
      agentModel: binding.agentModel,
      agentTemperature: binding.agentTemperature,
      agentMaxTokens: binding.agentMaxTokens,
      agentSystemPrompt: binding.agentSystemPrompt,
      knowledgeIds: binding.knowledgeIds,
    })
  }
}

// ===== FAB 拖拽 =====
const dragEl = ref<HTMLElement>()
const position = ref({ x: 0, y: 0 })
let startPos = { x: 0, y: 0 }
let mouseStart = { x: 0, y: 0 }

function startDrag(e: MouseEvent) {
  if (!dragEl.value) return
  mouseStart = { x: e.clientX, y: e.clientY }
  startPos = { ...position.value }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  position.value = {
    x: startPos.x + e.clientX - mouseStart.x,
    y: startPos.y + e.clientY - mouseStart.y,
  }
}

function stopDrag() {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

onBeforeUnmount(stopDrag)

// ===== Drawer 打开时初始化 =====
function handleOpen() {
  chatStore.ensureSession()
}

// ===== 路由变化时的处理 =====
// 当路由变化到没有 aiPosition 的页面时，自动切回 LLM 模式
watch(() => aiPosition.value, (newPos) => {
  if (!newPos) {
    if (isAgentMode.value) chatStore.unbindAgent()
    if (isOrchestrationMode.value) chatStore.unbindOrchestration()
  }
})
</script>

<style scoped lang="scss">
.ai-trigger {
  width: 44px;
  height: 44px;
  background: #409eff;
  position: fixed;
  top: 300px;
  right: 0;
  border-radius: 6px 0 0 6px;
  z-index: 1000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.5);
  }
}

/** Agent 模式标签，显示在 FAB 按钮下方 */
.agent-badge {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}

.assistant-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.assistant-header {
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

/** 模式切换标签 */
.mode-tag {
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.assistant-tabs {
  flex-shrink: 0;
  padding: 0 16px;

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: 13px;
    height: 36px;
    line-height: 36px;
  }
}

.assistant-body {
  flex: 1;
  overflow: hidden;
}
</style>
