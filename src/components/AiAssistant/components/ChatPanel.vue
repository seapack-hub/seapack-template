<!--
  AiAssistant/ChatPanel.vue — 聊天面板

  职责：
    1. 展示消息列表 + 输入框
    2. LLM 模式：直接对话
    3. 场景模式：展示场景选择器 → 选择 Agent → 对话
    4. 支持页面上下文注入和结果回写

  Props：
    - scenes: 所有可用场景列表
    - loading: 场景加载状态

  数据流：
    用户选择场景 → 加载场景的 Agent 列表 → 选择 Agent → 对话
    页面上下文 → 自动注入到消息中
    AI 结果 → 展示操作按钮 → 回写到页面
-->
<template>
  <div class="chat-panel">
    <!-- 场景选择器：LLM 模式下显示（用于切换到场景模式） -->
    <div v-if="!isSceneMode && !loading" class="scene-selector">
      <div class="selector-header">
        <span class="selector-label">选择场景开始专业对话</span>
      </div>
      <div class="scene-grid">
        <div
          v-for="scene in scenes"
          :key="scene.id"
          class="scene-card"
          @click="selectScene(scene)"
        >
          <Icon :name="scene.icon || 'ChatDotSquare'" :size="20" :color="scene.coverColor || '#409eff'" />
          <span class="scene-name">{{ scene.name }}</span>
          <span class="scene-desc">{{ scene.description || '' }}</span>
        </div>
      </div>
    </div>

    <!-- Agent 选择器：场景模式 + 多个 Agent 时显示 -->
    <div v-if="showAgentSelector" class="agent-selector">
      <div class="selector-row">
        <span class="selector-label">当前 Agent：</span>
        <el-select
          v-model="selectedAgentId"
          size="small"
          placeholder="选择 Agent"
          style="flex: 1"
        >
          <el-option
            v-for="a in agents"
            :key="a.id"
            :label="a.agentName || ''"
            :value="a.id || ''"
          />
        </el-select>
        <el-button size="small" text @click="backToLLM">返回通用</el-button>
      </div>
    </div>

    <!-- 编排选择器：场景模式 + 多个编排时显示 -->
    <div v-if="showOrchestrationSelector" class="agent-selector">
      <div class="selector-row">
        <span class="selector-label">当前编排：</span>
        <el-select
          v-model="selectedOrchestrationId"
          size="small"
          placeholder="选择编排"
          style="flex: 1"
        >
          <el-option
            v-for="o in orchestrations"
            :key="o.id"
            :label="o.name"
            :value="o.id || ''"
          />
        </el-select>
      </div>
    </div>

    <!-- 编排步骤进度条 -->
    <div v-if="showStepProgress" class="step-progress">
      <div class="progress-header">
        <el-icon class="is-loading" :size="14"><Loading /></el-icon>
        <span>编排执行中</span>
      </div>
      <div class="steps-list">
        <div
          v-for="(step, index) in stepProgressList"
          :key="index"
          class="step-item"
          :class="step.status"
        >
          <el-icon :size="14">
            <SuccessFilled v-if="step.status === 'success'" />
            <CircleCloseFilled v-else-if="step.status === 'fail'" />
            <Loading v-else-if="step.status === 'running'" class="is-loading" />
            <MoreFilled v-else />
          </el-icon>
          <span class="step-name">{{ step.stepName }}</span>
          <span v-if="step.durationMs" class="step-duration">{{ formatDuration(step.durationMs) }}</span>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div ref="messageContainer" class="chat-messages">
      <!-- 空状态 -->
      <div v-if="store.messages.length === 0" class="empty-state">
        <el-icon :size="40" color="#dcdfe6"><ChatLineSquare /></el-icon>
        <p>{{ emptyStateText }}</p>
        <p class="empty-hint">输入问题后按 Enter 发送</p>
      </div>

      <!-- 消息气泡 -->
      <div
        v-for="(msg, index) in store.messages"
        :key="index"
        class="message-item"
        :class="msg.role"
      >
        <div class="message-avatar">
          <span v-if="msg.role === 'user'">👤</span>
          <span v-else>🤖</span>
        </div>
        <div class="message-bubble">
          <div class="message-role">
            {{ msg.role === 'user' ? '用户' : displayName }}
          </div>
          <div class="message-content markdown-body" v-html="renderMarkdown(msg.content)" />
          <!-- 结果操作按钮（仅 assistant 消息 + 场景模式） -->
          <div v-if="msg.role === 'assistant' && isSceneMode && msg.content" class="message-actions">
            <el-button size="small" text @click="copyResult(msg.content)">
              <el-icon><CopyDocument /></el-icon> 复制
            </el-button>
            <el-button
              v-for="handler in store.resultHandlers"
              :key="handler.name"
              size="small"
              type="primary"
              text
              @click="callHandler(handler.name, msg)"
            >
              {{ handler.name }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="store.loading" class="loading-indicator">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ loadingText }}</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="4"
        :placeholder="inputPlaceholder"
        :disabled="store.loading"
        resize="none"
        @keyup.enter="handleSend"
      />
      <div class="input-actions">
        <el-button type="primary" :loading="store.loading" :icon="Promotion" @click="handleSend">
          {{ store.loading ? '生成中' : '发送' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import {
  Promotion, ChatLineSquare, Loading, SuccessFilled,
  CircleCloseFilled, MoreFilled, CopyDocument
} from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { useChatExecution, type StepProgress } from '@/hooks/useChatExecution'
import { SceneAPI, type Scene, type SceneAgent } from '@/api/ai/scene'
import { OrchestrationAPI, type Orchestration } from '@/api/ai/orchestration'
// Markdown 渲染器
// @ts-ignore
import MarkdownIt from 'markdown-it'
import { ElMessage } from 'element-plus'

// ===== Props =====
const props = defineProps<{
  /** 所有可用场景列表 */
  scenes: Scene[]
  /** 场景加载状态 */
  loading: boolean
}>()

// ===== 编排步骤进度 =====
const stepProgressList = ref<StepProgress[]>([])

// ===== Store & Composable =====
const store = useChatStore()
const { sendMessage } = useChatExecution((progress) => {
  const idx = stepProgressList.value.findIndex(s => s.stepIndex === progress.stepIndex)
  if (idx >= 0) {
    stepProgressList.value[idx] = { ...stepProgressList.value[idx], ...progress }
  } else {
    stepProgressList.value.push(progress)
  }
})
const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

// ===== 状态 =====
const inputText = ref('')
const messageContainer = ref<HTMLElement>()

// ===== 场景/Agent/编排 状态 =====
const currentScene = ref<Scene | null>(null)
const agents = ref<SceneAgent[]>([])
const orchestrations = ref<Orchestration[]>([])

const isSceneMode = computed(() => store.isAgentMode || store.isOrchestrationMode)

const showAgentSelector = computed(() => {
  return isSceneMode.value && agents.value.length > 1 && !store.isOrchestrationMode
})

const showOrchestrationSelector = computed(() => {
  return isSceneMode.value && orchestrations.value.length > 1 && store.isOrchestrationMode
})

const showStepProgress = computed(() => {
  return store.isOrchestrationMode && store.loading && stepProgressList.value.length > 0
})

// ===== 显示文本 =====
const displayName = computed(() => {
  if (store.isAgentMode && store.currentAgentBinding) {
    return store.currentAgentBinding.agentName
  }
  if (store.isOrchestrationMode && store.currentOrchestrationBinding) {
    return store.currentOrchestrationBinding.orchestrationName
  }
  return 'AI 助手'
})

const emptyStateText = computed(() => {
  if (isSceneMode.value) return '开始场景对话'
  return '开始一段新对话'
})

const loadingText = computed(() => {
  if (store.isOrchestrationMode) return '编排执行中...'
  if (store.isAgentMode) return 'Agent 思考中...'
  return 'AI 思考中...'
})

const inputPlaceholder = computed(() => {
  if (isSceneMode.value) return '向 Agent 提问（Enter 发送）'
  return '输入问题（Enter 发送，Shift+Enter 换行）'
})

// ===== 工具函数 =====
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function renderMarkdown(text: string): string {
  return md.render(text)
}

// ===== 选择场景 =====
async function selectScene(scene: Scene) {
  currentScene.value = scene

  // 加载场景的 Agent 列表
  try {
    const sceneDetail = await SceneAPI.getById(scene.id!)
    agents.value = [sceneDetail]
  } catch {
    agents.value = []
  }

  // 加载场景的编排列表
  try {
    orchestrations.value = await OrchestrationAPI.list({ sceneId: scene.id!, status: 1 })
  } catch {
    orchestrations.value = []
  }

  // 如果有编排，优先使用编排模式
  if (orchestrations.value.length > 0) {
    const orch = orchestrations.value[0]
    store.bindOrchestration({
      orchestrationId: orch.id!,
      orchestrationName: orch.name,
      orchestrationCode: orch.code,
      orchestrationDescription: orch.description,
      strategy: orch.strategy,
      sceneId: orch.sceneId,
      sceneName: scene.name || '',
      stepCount: orch.steps?.length ?? 0,
    })
  } else if (agents.value.length > 0) {
    // 否则使用 Agent 模式
    const agent = agents.value.find(a => a.isDefault === 1) || agents.value[0]
    store.bindAgent({
      agentId: agent.agentId!,
      agentName: agent.agentName || '',
      sceneId: scene.id!,
      sceneName: scene.name || '',
    })
  }
}

// ===== Agent 选择器 =====
const selectedAgentId = computed({
  get: () => store.currentAgentBinding?.agentId || undefined,
  set: (agentId: number | undefined) => {
    if (!agentId) return
    const agent = agents.value.find(a => a.agentId === agentId)
    if (agent && currentScene.value) {
      store.bindAgent({
        agentId: agent.agentId!,
        agentName: agent.agentName || '',
        sceneId: currentScene.value.id!,
        sceneName: currentScene.value.name || '',
      })
    }
  },
})

// ===== 编排选择器 =====
const selectedOrchestrationId = computed({
  get: () => store.currentOrchestrationBinding?.orchestrationId || undefined,
  set: (orchId: number | undefined) => {
    if (!orchId) return
    const orch = orchestrations.value.find(o => o.id === orchId)
    if (orch && currentScene.value) {
      store.bindOrchestration({
        orchestrationId: orch.id!,
        orchestrationName: orch.name,
        orchestrationCode: orch.code,
        orchestrationDescription: orch.description,
        strategy: orch.strategy,
        sceneId: orch.sceneId,
        sceneName: currentScene.value.name || '',
        stepCount: orch.steps?.length ?? 0,
      })
    }
  },
})

// ===== 返回 LLM 模式 =====
function backToLLM() {
  if (store.isAgentMode) store.unbindAgent()
  if (store.isOrchestrationMode) store.unbindOrchestration()
  currentScene.value = null
  agents.value = []
  orchestrations.value = []
}

// ===== 结果操作 =====
function copyResult(content: string) {
  navigator.clipboard.writeText(content)
  ElMessage.success('已复制到剪贴板')
}

function callHandler(name: string, msg: { content: string }) {
  store.callResultHandler(name, {
    content: msg.content,
    agentName: displayName.value,
    agentId: store.currentAgentBinding?.agentId || 0,
    elapsedMs: 0,
  })
}

// ===== 发送消息 =====
async function handleSend() {
  const text = inputText.value.trim()
  if (!text || store.loading) return
  inputText.value = ''
  stepProgressList.value = []
  await sendMessage(text)
}

// ===== 自动滚动 =====
function scrollToBottom() {
  nextTick(() => {
    const el = messageContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

watch(() => store.messages.length, scrollToBottom)
watch(() => store.loading, (v) => { if (!v) scrollToBottom() })

onMounted(() => {
  store.ensureSession()
})
</script>

<style scoped lang="scss">
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/** 场景选择器 */
.scene-selector {
  padding: 12px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.selector-header {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 170px;
  overflow-y: auto;
}

.scene-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.scene-name {
  font-size: 12px;
  font-weight: 500;
  color: #303133;
}

.scene-desc {
  font-size: 11px;
  color: #909399;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/** Agent/编排选择器 */
.agent-selector {
  padding: 8px 12px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

/** 编排步骤进度条 */
.step-progress {
  padding: 8px 12px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f5f7fa;

  &.running { color: #e6a23c; background: #fdf6ec; }
  &.success { color: #67c23a; background: #f0f9eb; }
  &.fail    { color: #f56c6c; background: #fef0f0; }
}

.step-name { flex: 1; }
.step-duration { color: #c0c4cc; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  gap: 8px;

  p { margin: 0; font-size: 14px; }
  .empty-hint { font-size: 12px; color: #c0c4cc; }
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  &.assistant { flex-direction: row; }
  &.user { flex-direction: row-reverse; }
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message-bubble { max-width: calc(100% - 36px); }

.message-role {
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;

  .user & { text-align: right; }
}

.message-content {
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 8px;

  .user & {
    background: #ecf5ff;
    color: #303133;
  }
}

/** 消息操作按钮 */
.message-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  font-size: 12px;
  color: #909399;
  margin-left: 36px;
}

.chat-input-area {
  padding: 8px 12px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

:deep(.markdown-body) {
  font-size: 13px; line-height: 1.6; color: #303133;
  code { background: #e8eaed; padding: 1px 4px; border-radius: 3px; font-size: 12px; font-family: 'Courier New', monospace; }
  pre { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow: auto; border: 1px solid #eaeaea; margin: 8px 0; font-size: 12px; code { background: none; padding: 0; } }
  p { margin: 6px 0; }
  ul, ol { padding-left: 18px; margin: 4px 0; }
  blockquote { border-left: 3px solid #409eff; padding-left: 10px; color: #606266; margin: 8px 0; font-size: 12px; }
}
</style>
