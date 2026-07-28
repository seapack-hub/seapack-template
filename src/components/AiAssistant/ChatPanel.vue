<!--
  AiAssistant/ChatPanel.vue — 聊天面板

  职责：
    1. 展示消息列表 + 输入框
    2. Agent 模式下显示 Agent 选择器（多 binding 时）
    3. 编排模式下显示编排选择器 + 步骤进度条
    4. 通过 useChatExecution 统一处理 LLM / Agent / 编排 对话

  Props：
    - bindings: 当前页面绑定的 SceneBindingInfo 列表
    - orchestrations: 当前页面场景下的编排列表
    - deploymentConfig: 部署配置覆盖（预留，暂未使用）

  数据流：
    用户输入 → useChatExecution.sendMessage()
              → 根据 session.mode 选择 streamChat / AgentAPI.chat / OrchestrationAPI.executeStream
              → 消息填充到 chatStore
-->
<template>
  <div class="chat-panel">
    <!-- Agent 选择器：Agent 模式 + 多个 binding 时显示 -->
    <div v-if="showAgentSelector" class="agent-selector">
      <span class="selector-label">当前 Agent：</span>
      <el-select
        v-model="selectedAgentId"
        size="small"
        placeholder="选择 Agent"
        style="flex: 1"
      >
        <el-option
          v-for="b in bindings"
          :key="b.agentId"
          :label="b.agentName"
          :value="b.agentId"
        />
      </el-select>
    </div>

    <!-- 编排选择器：编排模式 + 多个编排时显示 -->
    <div v-if="showOrchestrationSelector" class="agent-selector">
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
          :value="o.id"
        />
      </el-select>
    </div>

    <!-- 编排步骤进度条：编排执行中显示 -->
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
          <!-- 角色标签：Agent/编排模式下显示对应名称 -->
          <div class="message-role">
            {{ msg.role === 'user' ? '用户' : displayName }}
          </div>
          <div class="message-content markdown-body" v-html="renderMarkdown(msg.content)" />
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
        :rows="2"
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
import { Promotion, ChatLineSquare, Loading, SuccessFilled, CircleCloseFilled, MoreFilled } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { useChatExecution, type StepProgress } from '@/hooks/useChatExecution'
import MarkdownIt from 'markdown-it'
import type { SceneBindingInfo } from '@/api/ai/scene'
import type { Orchestration } from '@/api/ai/types/orchestration'

// ===== Props =====
const props = defineProps<{
  /** 当前页面绑定的场景列表 */
  bindings: SceneBindingInfo[]
  /** 当前页面场景下的编排列表 */
  orchestrations: Orchestration[]
  /** 部署配置覆盖 */
  deploymentConfig: Record<string, any>
}>()

// ===== 编排步骤进度 =====
const stepProgressList = ref<StepProgress[]>([])

// ===== Store & Composable =====
const store = useChatStore()
const { sendMessage } = useChatExecution((progress) => {
  // 更新步骤进度列表
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

// ===== Agent 选择器 =====
const showAgentSelector = computed(() => {
  return isAgentMode.value && props.bindings.length > 1
})

const isAgentMode = computed(() => store.isAgentMode)

const selectedAgentId = computed({
  get: () => store.currentAgentBinding?.agentId || undefined,
  set: (agentId: number | undefined) => {
    if (!agentId) return
    const binding = props.bindings.find(b => b.agentId === agentId)
    if (binding) {
      store.bindAgent({
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
  },
})

// ===== 编排选择器 =====
const isOrchestrationMode = computed(() => store.isOrchestrationMode)

const showOrchestrationSelector = computed(() => {
  return isOrchestrationMode.value && props.orchestrations.length > 1
})

const selectedOrchestrationId = computed({
  get: () => store.currentOrchestrationBinding?.orchestrationId || undefined,
  set: (orchId: number | undefined) => {
    if (!orchId) return
    const orch = props.orchestrations.find(o => o.id === orchId)
    if (orch) {
      store.bindOrchestration({
        orchestrationId: orch.id!,
        orchestrationName: orch.name,
        orchestrationCode: orch.code,
        orchestrationDescription: orch.description,
        strategy: orch.strategy,
        sceneId: orch.sceneId,
        sceneName: '',
        stepCount: orch.steps?.length ?? 0,
      })
    }
  },
})

/** 是否显示步骤进度条 */
const showStepProgress = computed(() => {
  return isOrchestrationMode.value && store.loading && stepProgressList.value.length > 0
})

// ===== 显示文本 =====
const agentDisplayName = computed(() => {
  if (isAgentMode.value && store.currentAgentBinding) {
    return store.currentAgentBinding.agentName
  }
  if (isOrchestrationMode.value && store.currentOrchestrationBinding) {
    return store.currentOrchestrationBinding.orchestrationName
  }
  return 'AI 助手'
})

const displayName = computed(() => agentDisplayName.value)

const emptyStateText = computed(() => {
  if (isOrchestrationMode.value) return '开始编排对话'
  if (isAgentMode.value) return '开始 Agent 对话'
  return '开始一段新对话'
})

const loadingText = computed(() => {
  if (isOrchestrationMode.value) return '编排执行中...'
  if (isAgentMode.value) return 'Agent 思考中...'
  return 'AI 思考中...'
})

const inputPlaceholder = computed(() => {
  if (isOrchestrationMode.value) return '向编排提问（Enter 发送）'
  if (isAgentMode.value) return '向 Agent 提问（Enter 发送）'
  return '输入问题（Enter 发送，Shift+Enter 换行）'
})

// ===== 工具函数 =====
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// ===== Markdown 渲染 =====
function renderMarkdown(text: string): string {
  return md.render(text)
}

// ===== 发送消息 =====
async function handleSend() {
  const text = inputText.value.trim()
  if (!text || store.loading) return
  inputText.value = ''
  // 发送前清空步骤进度
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

/** Agent/编排选择器区域 */
.agent-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
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

.step-name {
  flex: 1;
}

.step-duration {
  color: #c0c4cc;
}

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

.message-bubble {
  max-width: calc(100% - 36px);
}

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
