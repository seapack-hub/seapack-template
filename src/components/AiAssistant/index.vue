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
    <div
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
            <!-- 模式切换标签：有 Agent 绑定时可切换 -->
            <el-tag
              v-if="hasAgentBindings"
              size="small"
              :type="isAgentMode ? 'success' : 'info'"
              class="mode-tag"
              @click="toggleMode"
            >
              {{ isAgentMode ? `Agent: ${currentAgentName}` : '通用对话' }}
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
// 未配置 aiPosition 的页面返回空数组（降级为纯 LLM 模式）
const currentModuleKey = computed(() => aiPosition.value?.moduleKey || '')
const currentPositionKey = computed(() => aiPosition.value?.positionKey || '')

// 仅当有有效的 aiPosition 时才调用 useSceneBindings
const { bindings: activeBindings, loading: bindingsLoading } = currentModuleKey.value
  ? useSceneBindings(currentModuleKey.value, currentPositionKey.value)
  : { bindings: ref([]), loading: ref(false) }

/** 当前页面是否有 Agent 绑定（决定是否显示模式切换按钮） */
const hasAgentBindings = computed(() => activeBindings.value.length > 0)

// ===== deploymentConfig（部署配置覆盖） =====
// 从 binding 中提取 deploymentConfig，用于覆盖 Drawer 的 UI 展示
const deploymentConfig = computed(() => {
  if (!activeBindings.value.length) return {}
  // 优先取 default binding，否则取第一个
  const defaultBinding = activeBindings.value.find(b => b.isDefault === 1)
  return defaultBinding?.deploymentConfig || activeBindings.value[0]?.deploymentConfig || {}
})

// ===== UI 覆盖（基于 deploymentConfig） =====
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

// ===== Agent 模式状态 =====
/** 当前会话是否为 Agent 模式 */
const isAgentMode = computed(() => chatStore.isAgentMode)
/** 当前绑定的 Agent 名称 */
const currentAgentName = computed(() => chatStore.currentAgentBinding?.agentName)

// ===== 模式切换 =====
/**
 * 切换对话模式
 * - LLM → Agent：自动绑定第一个 Agent
 * - Agent → LLM：解绑 Agent
 */
function toggleMode() {
  if (isAgentMode.value) {
    // Agent → LLM：解绑
    chatStore.unbindAgent()
  } else if (activeBindings.value.length === 1) {
    // 只有一个 binding，直接绑定（无需选择器）
    const b = activeBindings.value[0]
    chatStore.bindAgent({
      agentId: b.agentId,
      agentName: b.agentName,
      sceneId: b.sceneId,
      sceneName: b.sceneName,
      agentModel: b.agentModel,
      agentTemperature: b.agentTemperature,
      agentMaxTokens: b.agentMaxTokens,
      agentSystemPrompt: b.agentSystemPrompt,
      knowledgeIds: b.knowledgeIds,
    })
  }
  // 多个 binding 时，由 ChatPanel 内部的 Agent 选择器处理
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
  if (!newPos && isAgentMode.value) {
    chatStore.unbindAgent()
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
