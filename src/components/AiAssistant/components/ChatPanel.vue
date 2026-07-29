<!--
  AiAssistant/ChatPanel.vue — 纯对话面板

  职责：
    1. 展示消息列表 + 输入框（职责单一）
    2. LLM / Agent / 编排模式均可在此对话
    3. 结果操作按钮（copy / 自定义 handler）

  不包含：
    - 场景选择（→ ScenePanel）
    - Agent/编排选择（→ ScenePanel）
    - 页面上下文（→ SettingsPanel）
-->
<template>
  <div class="chat-panel h-full flex flex-col bg-[#f5f7fa]">
    <!-- 消息列表 -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto px-12px">
      <div class="py-8px">
        <!-- 空状态 -->
        <div v-if="store.messages.length === 0" class="flex flex-col items-center justify-center py-60px color-#909399 gap-8px">
          <el-icon :size="40" color="#dcdfe6"><ChatLineSquare /></el-icon>
          <p class="m-0 text-14px">{{ emptyStateText }}</p>
          <p class="m-0 text-12px color-#c0c4cc">输入问题后按 Enter 发送</p>
        </div>

        <!-- 消息气泡 -->
        <div
          v-for="(msg, index) in store.messages"
          :key="index"
          class="flex gap-8px mb-16px"
          :class="msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'"
        >
          <!-- 头像 -->
          <div
            class="w-32px h-32px rounded-full flex items-center justify-center shrink-0 mt-4px"
            :class="msg.role === 'user' ? 'bg-[var(--el-color-primary)] text-white' : 'bg-[var(--el-color-success)] text-white'"
          >
            <Icon v-if="msg.role === 'user'" name="user" size="24" />
            <Icon v-else name="robot" size="24" />
          </div>

          <!-- 内容区域 -->
          <div :class="msg.role === 'assistant' ? 'w-[90%]' : 'max-w-[70%]'">
            <!-- 角色名 -->
            <div class="text-11px color-#909399 mb-4px" :class="msg.role === 'user' ? 'text-right' : ''">
              {{ msg.role === 'user' ? '用户' : displayName }}
            </div>

            <!-- LLM 步骤时间线：仅在最后一条 assistant 消息中展示 -->
            <div v-if="msg.role === 'assistant' && index === store.messages.length - 1 && llmSteps.length > 0" class="mb-6px">
              <div class="step-timeline">
                <div v-for="(step, si) in llmSteps" :key="si" class="flex gap-6px mb-2px">
                  <div class="flex flex-col items-center w-18px shrink-0">
                    <div class="w-18px h-18px rounded-full flex items-center justify-center" :class="'step-dot--' + step.status">
                      <el-icon v-if="step.status === 'running'" class="is-loading" :size="14"><Loading /></el-icon>
                      <el-icon v-else-if="step.status === 'success'" :size="14"><CircleCheckFilled /></el-icon>
                      <el-icon v-else-if="step.status === 'skip'" :size="14"><Minus /></el-icon>
                      <el-icon v-else-if="step.status === 'fail'" :size="14"><CircleCloseFilled /></el-icon>
                    </div>
                  </div>
                  <div class="min-h-20px flex items-center gap-6px">
                    <span class="text-12px font-500" :class="step.status === 'running' ? 'color-[var(--el-color-primary)]' : ''">
                      {{ step.stepName }}
                    </span>
                    <span v-if="step.status === 'running'" class="text-11px color-[var(--el-color-primary)]">执行中</span>
                    <span v-else-if="step.durationMs != null" class="text-11px color-[var(--el-text-color-secondary)] tabular-nums">{{ step.durationMs }}ms</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 消息正文：用户纯文本，助手 Markdown 渲染 -->
            <div
              v-if="msg.content && msg.role === 'user'"
              class="msg-bubble user text-13px leading-[1.7]"
            >{{ msg.content }}</div>
            <MarkdownRenderer
              v-else-if="msg.content && msg.role === 'assistant'"
              :content="msg.content"
              class="msg-bubble assistant"
            />

            <!-- 元信息行：token / 复制（终止的对话不展示） -->
            <div v-if="msg.role === 'assistant' && (msg.tokensPrompt != null || msg.content) && !msg.content.includes('**对话已终止**')" class="msg-meta-row">
              <span v-if="msg.tokensPrompt != null" class="tabular-nums">
                Token {{ msg.tokensPrompt }}/{{ msg.tokensCompletion }}
              </span>
              <el-button link size="small" class="!text-11px !p-0" @click="copyResult(msg.content)">
                <el-icon :size="12"><CopyDocument /></el-icon>
              </el-button>
            </div>

            <!-- 结果操作按钮（场景模式下显示已注册的 handler） -->
            <div v-if="msg.role === 'assistant' && isSceneMode && msg.content && store.resultHandlers.length > 0" class="flex gap-4px mt-6px">
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

            <!-- 查看链路按钮 -->
            <div
              v-if="msg.role === 'assistant' && index === store.messages.length - 1 && store.currentTrace"
              class="flex gap-4px mt-6px"
            >
              <el-button size="small" type="primary" text @click="emit('viewTrace')">
                <el-icon :size="12" style="vertical-align: -2px; margin-right: 2px"><Connection /></el-icon>
                查看链路
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="px-12px py-8px" style="border-top: 1px solid var(--el-border-color-light)">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="3"
        :placeholder="inputPlaceholder"
        :disabled="store.loading"
        resize="none"
        @keyup.enter="handleSend"
      />
      <div class="flex items-center justify-between mt-6px">
        <el-button
          v-if="store.loading"
          size="small"
          @click="handleStop"
        >
          <el-icon :size="14" style="margin-right: 2px"><CircleCloseFilled /></el-icon>
          停止
        </el-button>
        <span v-else />
        <div class="flex items-center gap-6px">
          <el-button size="small" :icon="Delete" @click="handleClear">清空</el-button>
          <el-button
            type="primary"
            size="small"
            :icon="Promotion"
            :disabled="store.loading || !inputText.trim()"
            @click="handleSend"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import {
  Promotion, ChatLineSquare, Loading, CircleCheckFilled,
  CopyDocument, Connection, Delete, CircleCloseFilled, Minus
} from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { useChatExecution } from '@/hooks/useChatExecution'
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ===== Emits =====
const emit = defineEmits<{
  viewTrace: []
}>()

// ===== Store & Composable =====
const store = useChatStore()
const { sendMessage, abort, llmSteps } = useChatExecution()

// ===== 状态 =====
const inputText = ref('')
const messageContainer = ref<HTMLElement>()

// ===== 计算属性 =====
const isSceneMode = computed(() => store.isAgentMode || store.isOrchestrationMode)

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

const inputPlaceholder = computed(() => {
  if (isSceneMode.value) return '向 Agent 提问（Enter 发送）'
  return '输入问题（Enter 发送，Shift+Enter 换行）'
})

// ===== 操作 =====
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

function handleSend() {
  const text = inputText.value.trim()
  if (!text || store.loading) return
  inputText.value = ''
  sendMessage(text)
}

function handleStop() {
  abort()
}

function handleClear() {
  ElMessageBox.confirm('确定清空当前会话的所有消息吗？', '提示', { type: 'info' })
    .then(() => { store.clearMessages(); ElMessage.success('会话已清空') })
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
.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-word;
  white-space: pre-wrap;
}
.msg-bubble.user {
  background: var(--el-color-primary-light-8);
  color: var(--el-text-color-primary);
  border-top-right-radius: 4px;
}
.msg-bubble.assistant {
  background: #fff;
  color: var(--el-text-color-primary);
  border-top-left-radius: 4px;
  width: 100%;
  white-space: normal;
}

.msg-meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.step-timeline {
  padding: 4px 0;
}
.step-dot--running {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}
.step-dot--success {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}
.step-dot--skip {
  background: var(--el-color-warning-light-8);
  color: var(--el-color-warning);
}
.step-dot--fail {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}

:deep(.chat-input .el-textarea__inner) {
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  padding: 8px 10px;
  transition: border-color 0.2s;
}
:deep(.chat-input .el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
}
</style>
