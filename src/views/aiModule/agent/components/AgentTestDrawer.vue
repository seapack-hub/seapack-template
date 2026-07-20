<!--
  Agent 测试面板（增强版）
  模拟对话 + 调用链路追踪 + 历史记录
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`Agent 测试 — ${agentName}`"
    size="860px"
    @opened="onOpened"
  >
    <el-tabs v-model="activeTab" class="test-tabs">
      <!-- Tab 1: 对话 -->
      <el-tab-pane name="chat">
        <template #label>
          <span class="inline-flex items-center gap-4px">
            <el-icon><ChatDotRound /></el-icon> 对话
          </span>
        </template>
        <div class="chat-container">
          <!-- 消息列表 -->
          <div ref="messageListRef" class="message-list">
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
                <div v-if="msg.role === 'assistant' && msg.durationMs" class="mt-4px flex items-center justify-end gap-8px text-11px text-[var(--el-text-color-secondary)]">
                  <span>{{ msg.durationMs }}ms</span>
                  <span v-if="msg.tokensPrompt">| Token: {{ msg.tokensPrompt }}/{{ msg.tokensCompletion }}</span>
                  <el-button
                    v-if="msg.traceSnapshot"
                    link
                    type="primary"
                    size="small"
                    class="!text-11px"
                    @click="viewTrace(msg.traceSnapshot!)"
                  >
                    查看链路
                  </el-button>
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
          <div class="input-area">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入消息测试 Agent... (Ctrl+Enter 发送)"
              :disabled="chatting"
              @keydown.enter.ctrl="sendMessage"
            />
            <div class="flex justify-end gap-8px mt-8px">
              <el-button type="primary" :loading="chatting" :disabled="!inputMessage.trim()" @click="sendMessage">
                <el-icon v-if="!chatting"><Promotion /></el-icon> 发送
              </el-button>
              <el-button :disabled="chatting" @click="clearMessages">清空对话</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 链路追踪 -->
      <el-tab-pane name="trace">
        <template #label>
          <span class="inline-flex items-center gap-4px">
            <el-icon><Connection /></el-icon> 链路追踪
          </span>
        </template>
        <div class="trace-container">
          <!-- 当前会话追踪 -->
          <div v-if="currentTrace" class="mb-16px">
            <div class="flex items-center justify-between mb-12px">
              <span class="text-14px font-600">当前会话链路</span>
              <el-tag size="small" type="info">最近一次</el-tag>
            </div>
            <AgentTraceDetail :snapshot="currentTrace" />
          </div>
          <div v-else class="flex flex-col items-center justify-center py-40 text-center">
            <el-icon :size="40" color="var(--el-color-info-light-5)"><Connection /></el-icon>
            <p class="mt-12px text-13px text-[var(--el-text-color-secondary)]">
              发送消息后自动记录调用链路
            </p>
          </div>

          <!-- 历史会话列表 -->
          <el-divider v-if="currentTrace" content-position="left">
            <span class="text-12px text-[var(--el-text-color-secondary)]">历史测试记录</span>
          </el-divider>
          <div v-if="testSessions.length > 0" class="session-list">
            <div
              v-for="session in testSessions"
              :key="session.id"
              class="session-item"
              :class="{ 'is-active': activeSessionId === session.id }"
              @click="loadSessionDetail(session)"
            >
              <div class="session-content">
                <div class="text-13px color-[var(--el-text-color-primary)] line-clamp-1">{{ session.userMessage }}</div>
                <div class="flex items-center gap-8px mt-4px">
                  <el-tag :type="session.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ session.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                  <span class="text-11px text-[var(--el-text-color-secondary)] tabular-nums">{{ formatDuration(session.totalDurationMs) }}</span>
                  <span class="text-11px text-[var(--el-text-color-secondary)]">Token: {{ (session.tokensPrompt || 0) + (session.tokensCompletion || 0) }}</span>
                  <span class="text-11px text-[var(--el-text-color-secondary)]">{{ session.createdAt }}</span>
                </div>
              </div>
              <el-button link type="danger" size="small" @click.stop="handleDeleteSession(session)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
import { ChatDotRound, Promotion, Connection, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { AgentAPI, type AgentTraceSnapshot, type AgentTestSession } from '@/api/ai/agent'
import AgentTraceDetail from './AgentTraceDetail.vue'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  agentId: number
  agentName: string
}>()

const activeTab = ref('chat')

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  durationMs?: number
  tokensPrompt?: number
  tokensCompletion?: number
  traceSnapshot?: AgentTraceSnapshot
}

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const chatting = ref(false)
const messageListRef = ref<HTMLElement>()

// ===== 链路追踪 =====
const currentTrace = ref<AgentTraceSnapshot | null>(null)

// ===== 历史会话 =====
const testSessions = ref<AgentTestSession[]>([])
const activeSessionId = ref<number | undefined>()

function onOpened() {
  messages.value = []
  inputMessage.value = ''
  currentTrace.value = null
  activeTab.value = 'chat'
  fetchTestSessions()
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
    // 使用带链路追踪的 test-chat 接口
    const res = await AgentAPI.testChat({
      agentId: props.agentId as number,
      message: msg,
      history,
    })
    messages.value.push({
      role: 'assistant',
      content: res.content,
      durationMs: res.durationMs,
      tokensPrompt: res.tokensPrompt,
      tokensCompletion: res.tokensCompletion,
      traceSnapshot: res.traceSnapshot,
    })
    // 更新当前链路
    currentTrace.value = res.traceSnapshot || null
    // 刷新历史列表
    await fetchTestSessions()
  } catch(e) {
    console.error(e)
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
  currentTrace.value = null
}

function viewTrace(snapshot: AgentTraceSnapshot) {
  currentTrace.value = snapshot
  activeTab.value = 'trace'
}

// ===== 历史会话 =====

async function fetchTestSessions() {
  try {
    const res = await AgentAPI.getTestSessions(props.agentId as number, { pageNum: 1, pageSize: 20 })
    testSessions.value = res.list || []
  } catch {
    // 忽略，后端可能未实现
  }
}

async function loadSessionDetail(session: AgentTestSession) {
  activeSessionId.value = session.id
  try {
    const detail = await AgentAPI.getTestSessionDetail(props.agentId as number, session.id!)
    currentTrace.value = detail.traceSnapshot || null
    activeTab.value = 'trace'
  } catch {
    ElMessage.error('获取详情失败')
  }
}

async function handleDeleteSession(session: AgentTestSession) {
  await ElMessageBox.confirm('确认删除该测试记录？', '提示', { type: 'warning' })
  try {
    await AgentAPI.deleteTestSession(props.agentId as number, session.id!)
    ElMessage.success('删除成功')
    await fetchTestSessions()
    if (activeSessionId.value === session.id) {
      currentTrace.value = null
      activeSessionId.value = undefined
    }
  } catch {
    // handled
  }
}

function formatDuration(ms?: number): string {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
</script>

<style scoped>
.test-tabs :deep(.el-tabs__header) {
  margin: 0;
}
.test-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
.test-tabs :deep(.el-tabs__content) {
  padding: 0;
  height: calc(100vh - 160px);
  overflow: hidden;
}
.test-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.input-area {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

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

/* 链路追踪 Tab */
.trace-container {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.session-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.session-item:hover {
  background: var(--el-fill-color-lighter);
}
.session-item.is-active {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}
.session-content {
  flex: 1;
  min-width: 0;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
