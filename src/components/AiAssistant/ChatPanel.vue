<!--
  AiAssistant/ChatPanel.vue — 聊天面板

  职责：
    1. 展示消息列表 + 输入框
    2. Agent 模式下显示 Agent 选择器（多 binding 时）
    3. 通过 useChatExecution 统一处理 LLM / Agent 对话

  Props：
    - bindings: 当前页面绑定的 SceneBindingInfo 列表
    - deploymentConfig: 部署配置覆盖（预留，暂未使用）

  数据流：
    用户输入 → useChatExecution.sendMessage()
              → 根据 session.mode 选择 streamChat / AgentAPI.chat
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

    <!-- 消息列表 -->
    <div ref="messageContainer" class="chat-messages">
      <!-- 空状态 -->
      <div v-if="store.messages.length === 0" class="empty-state">
        <el-icon :size="40" color="#dcdfe6"><ChatLineSquare /></el-icon>
        <p>{{ isAgentMode ? '开始 Agent 对话' : '开始一段新对话' }}</p>
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
          <!-- 角色标签：Agent 模式下 assistant 显示 Agent 名称 -->
          <div class="message-role">
            {{ msg.role === 'user' ? '用户' : agentDisplayName }}
          </div>
          <div class="message-content markdown-body" v-html="renderMarkdown(msg.content)" />
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="store.loading" class="loading-indicator">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ isAgentMode ? 'Agent 思考中...' : 'AI 思考中...' }}</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        :placeholder="isAgentMode ? '向 Agent 提问（Enter 发送）' : '输入问题（Enter 发送，Shift+Enter 换行）'"
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
import { Delete, Promotion, ChatLineSquare, Loading } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { useChatExecution } from '@/hooks/useChatExecution'
import { ElMessageBox, ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import type { SceneBindingInfo } from '@/api/ai/scene'

// ===== Props =====
const props = defineProps<{
  /** 当前页面绑定的场景列表 */
  bindings: SceneBindingInfo[]
  /** 部署配置覆盖 */
  deploymentConfig: Record<string, any>
}>()

// ===== Store & Composable =====
const store = useChatStore()
const { sendMessage } = useChatExecution()
const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

// ===== 状态 =====
const inputText = ref('')
const messageContainer = ref<HTMLElement>()

// ===== Agent 选择器 =====
/**
 * 是否显示 Agent 选择器
 * 条件：Agent 模式 + 有多个 binding（单个时自动绑定，无需选择）
 */
const showAgentSelector = computed(() => {
  return isAgentMode.value && props.bindings.length > 1
})

const isAgentMode = computed(() => store.isAgentMode)

/**
 * Agent 选择器绑定值
 * 读取当前 session 的 agentBinding.agentId，切换时更新绑定
 */
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

/**
 * 消息气泡中 assistant 的显示名称
 * Agent 模式显示 Agent 名称，LLM 模式显示 "AI 助手"
 */
const agentDisplayName = computed(() => {
  if (isAgentMode.value && store.currentAgentBinding) {
    return store.currentAgentBinding.agentName
  }
  return 'AI 助手'
})

// ===== Markdown 渲染 =====
function renderMarkdown(text: string): string {
  return md.render(text)
}

// ===== 发送消息 =====
async function handleSend() {
  const text = inputText.value.trim()
  if (!text || store.loading) return
  inputText.value = ''
  await sendMessage(text)
}

// ===== 清空会话 =====
function handleClear() {
  ElMessageBox.confirm('确定清空当前会话？', '提示', { type: 'info' })
    .then(() => { store.clearMessages(); ElMessage.success('已清空') })
    .catch(() => {})
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

/** Agent 选择器区域 */
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
