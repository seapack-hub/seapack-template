<!--
  AiAssistant/index.vue — 全局悬浮 AI 助手

  职责：
    1. 渲染可拖拽的 FAB 按钮和侧边 Drawer
    2. 4-Tab 布局：对话 / 会话 / 链路 / 设置
    3. 对话 Tab 内置场景选择器

  数据流：
    FAB 点击 → 打开 Drawer（FAB 隐藏）
    对话 Tab → 场景选择 + 消息列表 + 输入框
    会话 Tab → 会话列表管理
    链路 Tab → Agent 链路追踪可视化
    设置 Tab → 页面上下文 + 结果回写配置
-->
<template>
  <div class="ai-assistant-wrapper">
    <!-- FAB 悬浮按钮：可拖拽，抽屉打开时隐藏 -->
    <div
      v-show="!drawerVisible"
      ref="dragEl"
      class="ai-trigger pos-fixed z-9999 flex items-center justify-center cursor-pointer color-white shadow-lg transition-all duration-300"
      :style="fabStyle"
      title="AI 助手"
      @mousedown="startDrag"
      @click="drawerVisible = true"
    >
      <Icon name="ai-interaction" :size="24" color="#fff" />
      <span v-if="isSceneMode && currentSceneName" class="agent-badge pos-absolute l-1/2 -translate-x-1/2 whitespace-nowrap text-11px color-white px-6px py-2px rounded-4px" style="background: rgba(0,0,0,0.6); top: calc(100% + 4px)">
        {{ currentSceneName }}
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
      <div class="assistant-container h-full flex flex-col" style="background: #f5f7ff">
        <!-- 顶部标题栏 -->
        <div class="assistant-header h-52px px-16px flex items-center justify-between flex-shrink-0" style="border-bottom: 1px solid var(--el-border-color-light); background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)">
          <div class="flex items-center gap-8px">
            <div class="w-28px h-28px rounded-8px flex items-center justify-center" style="background: linear-gradient(135deg, #409eff, #337ecc)">
              <Icon name="ai-interaction" :size="16" color="#fff" />
            </div>
            <span class="text-15px font-600 color-#303133">AI 助手</span>
          </div>
          <div class="flex items-center gap-8px">
            <el-tag
              v-if="isSceneMode"
              size="small"
              type="success"
            >
              <span class="flex items-center gap-4px">
                <el-icon :size="12"><Connection /></el-icon>
                {{ currentSceneName }}
              </span>
            </el-tag>
            <el-button text :icon="Close" class="!text-#909399 hover:!text-#303133" @click="drawerVisible = false" />
          </div>
        </div>

        <!-- Tab 导航 -->
        <el-tabs v-model="activeTab" class="assistant-tabs flex-shrink-0 px-16px" style="border-bottom: 1px solid var(--el-border-color-light)">
          <el-tab-pane label="对话" name="chat" />
          <el-tab-pane label="会话" name="sessions" />
          <el-tab-pane label="链路" name="trace" />
          <el-tab-pane label="设置" name="settings" />
        </el-tabs>

        <!-- Tab 内容区 -->
        <div class="flex-1 overflow-hidden">
          <ChatPanel
            v-if="activeTab === 'chat'"
            @view-trace="handleViewTrace"
          />
          <SessionList v-else-if="activeTab === 'sessions'" />
          <div v-else-if="activeTab === 'trace'" class="h-full overflow-y-auto px-16px py-12px">
            <AgentTraceDetail v-if="currentTrace" :snapshot="currentTrace" />
            <el-empty v-else description="暂无链路数据" :image-size="80" />
          </div>
          <SettingsPanel v-else />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { Close, Connection } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { AgentAPI, type AgentTraceSnapshot } from '@/api/ai/agent'
import ChatPanel from './components/ChatPanel.vue'
import SessionList from './components/SessionList.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import AgentTraceDetail from '@/views/aiModule/agent/components/AgentTraceDetail.vue'
import Icon from '@/components/Icon/index.vue'
import { ElMessage } from 'element-plus'

const chatStore = useChatStore()

const drawerVisible = ref(false)
const activeTab = ref('chat')
const currentTrace = ref<AgentTraceSnapshot | null>(null)

const isSceneMode = computed(() => chatStore.isSceneMode)
const currentSceneName = computed(() => chatStore.currentSceneBinding?.sceneName || '')

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

function handleOpen() {
  chatStore.ensureSession()
}

/**
 * 解析 trace_snapshot（兼容字符串 / 对象，兼容多种字段命名）
 *
 * API 返回格式：
 *   { model, route, tokensPrompt, tokensCompletion, ... }
 *
 * AgentTraceDetail 期望格式：
 *   { totalTokensPrompt, totalTokensCompletion, totalTokens: { prompt, completion }, ... }
 */
function parseTrace(raw: any): AgentTraceSnapshot | null {
  if (!raw) return null
  let parsed: any
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }

  // 字段映射：tokensPrompt → totalTokensPrompt, tokensCompletion → totalTokensCompletion
  const tokensPrompt = parsed.tokensPrompt ?? parsed.totalTokensPrompt ?? parsed.totalTokens?.prompt ?? 0
  const tokensCompletion = parsed.tokensCompletion ?? parsed.totalTokensCompletion ?? parsed.totalTokens?.completion ?? 0

  return {
    ...parsed,
    totalTokensPrompt: tokensPrompt,
    totalTokensCompletion: tokensCompletion,
    totalTokens: { prompt: tokensPrompt, completion: tokensCompletion },
    totalDurationMs: parsed.totalDurationMs || 0,
    steps: parsed.steps || [],
  }
}

/**
 * 查看链路：优先使用当前链路，否则按 requestId 精确查询该轮链路，最后回退到最近历史会话
 */
async function handleViewTrace(requestId?: string) {
  // 1. 优先使用当前链路数据（刚刚完成的对话）
  if (chatStore.currentTrace) {
    currentTrace.value = chatStore.currentTrace
    activeTab.value = 'trace'
    return
  }

  // 2. 按消息ID精确查询该轮完整链路（点击消息气泡查看详情）
  if (requestId) {
    try {
      const detail = await AgentAPI.getSessionByRequestId(requestId)
      const trace = parseTrace(detail?.traceSnapshot)
      if (trace) currentTrace.value = trace
    } catch {
      ElMessage.error('获取链路详情失败')
    }
    activeTab.value = 'trace'
    return
  }

  // 3. 回退：查询最近的历史会话链路
  const session = chatStore.currentSession
  if (!session || !session.sceneBinding) {
    activeTab.value = 'trace'
    return
  }

  try {
    // 查询该场景最近的编排执行会话（场景模式对话落库为 orchestration 类型）
    const res = await AgentAPI.getOrchestrationSessions(session.sceneBinding.sceneId, { pageNum: 1, pageSize: 1 })
    if (res.list && res.list.length > 0) {
      const detail = await AgentAPI.getOrchestrationSessionDetail(session.sceneBinding.sceneId, res.list[0].id!)
      const trace = parseTrace(detail?.traceSnapshot)
      if (trace) currentTrace.value = trace
    }
  } catch {
    ElMessage.error('获取链路详情失败')
  }
  activeTab.value = 'trace'
}

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
  :deep(.el-tabs__header) { margin: 0; }
  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__item) {
    font-size: 13px;
    height: 40px;
    line-height: 40px;
    &:hover { color: var(--el-color-primary); }
    &.is-active { font-weight: 600; }
  }
  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 3px 3px 0 0;
  }
}
</style>
