<!--
  Agent 测试面板
  模拟对话 + 查看调用链路
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`Agent 测试 — ${agentName}`"
    size="800px"
    @opened="onOpened"
  >
    <div class="flex flex-col h-[calc(100vh-120px)]">
      <!-- 对话消息列表 -->
      <div ref="messageListRef" class="flex-1 overflow-y-auto p-16px">
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full">
          <el-icon :size="48" color="var(--el-color-info-light-5)"><ChatDotRound /></el-icon>
          <p class="mt-12px text-13px text-[var(--el-text-color-secondary)]">
            发送消息开始与 Agent 对话测试
          </p>
        </div>
        <div v-for="(msg, i) in messages" :key="i" class="message-item" :class="msg.role">
          <div class="message-avatar">
            <span v-if="msg.role === 'user'">U</span>
            <span v-else>A</span>
          </div>
          <div class="max-w-80%">
            <div class="message-text" v-html="msg.content"></div>
            <div v-if="msg.role === 'assistant' && msg.durationMs" class="mt-4px text-11px text-[var(--el-text-color-secondary)] text-right">
              <span>{{ msg.durationMs }}ms</span>
              <span v-if="msg.tokensPrompt">| Token: {{ msg.tokensPrompt }}/{{ msg.tokensCompletion }}</span>
            </div>
          </div>
        </div>
        <!-- 加载中 -->
        <div v-if="chatting" class="message-item assistant">
          <div class="message-avatar"><span>A</span></div>
          <div class="max-w-80%">
            <div class="message-text typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="p-16px border-t border-[var(--el-border-color-lighter)]">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入消息测试 Agent..."
          :disabled="chatting"
          @keydown.enter.ctrl="sendMessage"
        />
        <div class="flex justify-end gap-8px mt-8px">
          <el-button type="primary" :loading="chatting" :disabled="!inputMessage.trim()" @click="sendMessage">
            <el-icon v-if="!chatting"><Promotion /></el-icon> 发送 (Ctrl+Enter)
          </el-button>
          <el-button :disabled="chatting" @click="clearMessages">清空对话</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ChatDotRound, Promotion } from '@element-plus/icons-vue'
import { AgentAPI } from '@/api/ai/agent'

const visible = defineModel<boolean>('visible', { required: true })

defineProps<{
  agentId: number
  agentName: string
}>()

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  durationMs?: number
  tokensPrompt?: number
  tokensCompletion?: number
}

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const chatting = ref(false)
const messageListRef = ref<HTMLElement>()

function onOpened() {
  messages.value = []
  inputMessage.value = ''
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

async function sendMessage() {
  const msg = inputMessage.value.trim()
  if (!msg || chatting.value) return

  messages.value.push({ role: 'user', content: msg })
  inputMessage.value = ''
  chatting.value = true
  scrollToBottom()

  try {
    const history = messages.value.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content,
    }))
    const res = await AgentAPI.chat({
      agentId: useAttrs().agentId as number,
      message: msg,
      history,
    })
    messages.value.push({
      role: 'assistant',
      content: res.content,
      durationMs: res.durationMs,
      tokensPrompt: res.tokensPrompt,
      tokensCompletion: res.tokensCompletion,
    })
  } catch {
    messages.value.push({
      role: 'assistant',
      content: '调用失败，请检查 Agent 配置',
    })
  } finally {
    chatting.value = false
    scrollToBottom()
  }
}

function clearMessages() {
  messages.value = []
}
</script>

<style scoped>
.message-item {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.message-item.user {
  flex-direction: row-reverse;
}
.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.message-item.user .message-avatar {
  background: var(--el-color-primary);
  color: white;
}
.message-item.assistant .message-avatar {
  background: var(--el-color-success);
  color: white;
}
.message-text {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}
.message-item.user .message-text {
  background: var(--el-color-primary);
  color: white;
  border-top-right-radius: 4px;
}
.message-item.assistant .message-text {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border-top-left-radius: 4px;
}
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}
.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-secondary);
  animation: typing 1.4s infinite ease-in-out;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
