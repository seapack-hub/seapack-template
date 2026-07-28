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
      class="ai-trigger pos-fixed z-9999 flex items-center justify-center cursor-pointer color-white shadow-lg transition-all duration-300"
      :style="fabStyle"
      title="AI 助手"
      @mousedown="startDrag"
      @click="drawerVisible = true"
    >
      <Icon name="ai-interaction" :size="24" color="#fff" />
      <!-- 场景模式标签 -->
      <span v-if="isSceneMode && currentScene" class="agent-badge pos-absolute l-1/2 -translate-x-1/2 whitespace-nowrap text-11px color-white px-6px py-2px rounded-4px" style="background: rgba(0,0,0,0.6); top: calc(100% + 4px)">
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
      <div class="assistant-container h-full flex flex-col" style="background: #f5f7fa">
        <!-- 顶部标题栏 -->
        <div class="assistant-header h-52px px-16px flex items-center justify-between flex-shrink-0" style="border-bottom: 1px solid var(--el-border-color-light); background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)">
          <div class="flex items-center gap-8px">
            <div class="w-28px h-28px rounded-8px flex items-center justify-center" style="background: linear-gradient(135deg, #409eff, #337ecc)">
              <Icon name="ai-interaction" :size="16" color="#fff" />
            </div>
            <span class="text-15px font-600 color-#303133">AI 助手</span>
          </div>
          <div class="flex items-center gap-8px">
            <!-- 模式切换标签 -->
            <el-tag
              size="small"
              :type="isSceneMode ? 'success' : 'info'"
              class="cursor-pointer transition-opacity duration-200 hover:opacity-80"
              @click="toggleMode"
            >
              <span class="flex items-center gap-4px">
                <el-icon :size="12">
                  <Connection v-if="isSceneMode" />
                  <ChatDotSquare v-else />
                </el-icon>
                {{ isSceneMode ? `场景: ${currentScene?.name}` : '通用对话' }}
              </span>
            </el-tag>
            <el-button text :icon="Close" class="!text-#909399 hover:!text-#303133" @click="drawerVisible = false" />
          </div>
        </div>

        <!-- Tab 导航 -->
        <el-tabs v-model="activeTab" class="assistant-tabs flex-shrink-0 px-16px" style="border-bottom: 1px solid var(--el-border-color-light)">
          <el-tab-pane label="聊天" name="chat" />
          <el-tab-pane label="会话" name="sessions" />
          <el-tab-pane label="上下文" name="context" />
        </el-tabs>

        <!-- Tab 内容区 -->
        <div class="flex-1 overflow-hidden">
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
import { ChatDotSquare, Close, Connection } from '@element-plus/icons-vue'
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
  background: isSceneMode.value ? 'linear-gradient(135deg, #67c23a, #529b2e)' : 'linear-gradient(135deg, #409eff, #337ecc)',
  width: '44px',
  height: '44px',
  top: '300px',
  right: '0',
  borderRadius: '8px 0 0 8px',
}))
</script>

<style scoped lang="scss">
.ai-trigger {
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.4);

  &:hover {
    box-shadow: 0 6px 28px rgba(64, 158, 255, 0.6);
    transform: translateX(-2px);
  }
}

.assistant-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: 13px;
    height: 40px;
    line-height: 40px;

    &:hover {
      color: var(--el-color-primary);
    }

    &.is-active {
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 3px 3px 0 0;
  }
}

</style>
