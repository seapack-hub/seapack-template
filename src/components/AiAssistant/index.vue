<!--
  AiAssistant/index.vue — 全局悬浮 AI 助手

  职责：
    1. 渲染可拖拽的 FAB 按钮和侧边 Drawer
    2. 支持两种模式：纯 LLM 对话 / 场景模式
    3. 场景模式下展示场景列表，用户选择场景后再对话
    4. 支持页面上下文注入和结果回写

  数据流：
    FAB 点击 → 打开 Drawer
    用户选择模式 → LLM 模式直接对话 / 场景模式选择场景
    页面可选注入 pageContext → 增强对话上下文
    页面可注册 resultHandler → AI 结果回写页面
-->
<template>
  <div class="ai-assistant-wrapper">
    <!-- FAB 悬浮按钮：可拖拽 -->
    <div
      ref="dragEl"
      class="ai-trigger"
      :style="fabStyle"
      title="AI 助手"
      @mousedown="startDrag"
      @click="drawerVisible = true"
    >
      <Icon name="ai-interaction" :size="30" color="#fff" />
      <!-- 场景模式标签 -->
      <span v-if="isSceneMode && currentScene" class="agent-badge">
        {{ currentScene.name }}
      </span>
    </div>

    <!-- 侧边 Drawer -->
    <el-drawer
      v-model="drawerVisible"
      size="800px"
      :with-header="false"
      direction="rtl"
      @open="handleOpen"
    >
      <div class="assistant-container">
        <!-- 顶部标题栏 -->
        <div class="assistant-header">
          <div class="header-left">
            <el-icon size="18" color="#409eff"><ChatDotSquare /></el-icon>
            <span class="header-title">AI 助手</span>
          </div>
          <div class="header-right">
            <!-- 模式切换标签 -->
            <el-tag
              size="small"
              :type="isSceneMode ? 'success' : 'info'"
              class="mode-tag"
              @click="toggleMode"
            >
              {{ isSceneMode ? `场景: ${currentScene?.name}` : '通用对话' }}
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
            :scenes="scenes"
            :loading="scenesLoading"
          />
          <SessionList v-else-if="activeTab === 'sessions'" />
          <ContextPanel v-else />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { ChatDotSquare, Close } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { SceneAPI, type Scene } from '@/api/ai/scene'
import ChatPanel from './components/ChatPanel.vue'
import SessionList from './components/SessionList.vue'
import ContextPanel from './components/ContextPanel.vue'
import Icon from '@/components/Icon/index.vue'

const chatStore = useChatStore()

// ===== Drawer 状态 =====
const drawerVisible = ref(false)
const activeTab = ref('chat')

// ===== 场景列表 =====
const scenes = ref<Scene[]>([])
const scenesLoading = ref(false)

/** 加载所有启用的场景 */
async function loadScenes() {
  scenesLoading.value = true
  try {
    scenes.value = await SceneAPI.list()
  } catch {
    scenes.value = []
  } finally {
    scenesLoading.value = false
  }
}

// ===== 模式状态 =====
/** 当前会话是否为场景模式（agent 或 orchestration） */
const isSceneMode = computed(() =>
  chatStore.isAgentMode || chatStore.isOrchestrationMode
)

/** 当前场景信息 */
const currentScene = computed(() => {
  if (chatStore.isAgentMode && chatStore.currentAgentBinding) {
    return { name: chatStore.currentAgentBinding.sceneName }
  }
  if (chatStore.isOrchestrationMode && chatStore.currentOrchestrationBinding) {
    return { name: chatStore.currentOrchestrationBinding.orchestrationName }
  }
  return null
})

// ===== 模式切换 =====
/**
 * 切换对话模式
 * - LLM → 场景模式：显示场景选择（由 ChatPanel 处理）
 * - 场景模式 → LLM：解绑 Agent/编排
 */
function toggleMode() {
  if (isSceneMode.value) {
    // 场景模式 → LLM
    if (chatStore.isAgentMode) chatStore.unbindAgent()
    if (chatStore.isOrchestrationMode) chatStore.unbindOrchestration()
  }
  // LLM → 场景模式：由 ChatPanel 中的场景选择器处理
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
  // 首次打开时加载场景列表
  if (scenes.value.length === 0) {
    loadScenes()
  }
}

// ===== FAB 按钮样式 =====
const fabStyle = computed(() => ({
  background: isSceneMode.value ? '#67c23a' : '#409eff',
}))
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
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.5);
  }
}

/** 场景模式标签 */
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
