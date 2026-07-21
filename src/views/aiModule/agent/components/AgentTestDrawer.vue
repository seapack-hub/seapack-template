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
                <!-- 步骤时间线（最后一条 assistant 消息展示，和正文共存） -->
                <div v-if="msg.role === 'assistant' && i === messages.length - 1 && steps.length > 0" class="step-timeline">
                  <div v-for="(step, si) in steps" :key="si" class="step-tl-item">
                    <div class="step-tl-line-left">
                      <div v-if="step.status === 'running'" class="step-tl-dot dot-running">
                        <el-icon class="is-loading" :size="14"><Loading /></el-icon>
                      </div>
                      <div v-else-if="step.status === 'success'" class="step-tl-dot dot-success">
                        <el-icon :size="14"><CircleCheckFilled /></el-icon>
                      </div>
                      <div v-else-if="step.status === 'fail'" class="step-tl-dot dot-fail">
                        <el-icon :size="14"><CircleCloseFilled /></el-icon>
                      </div>
                      <div v-else class="step-tl-dot dot-skip">
                        <el-icon :size="14"><RemoveFilled /></el-icon>
                      </div>
                      <div v-if="si < steps.length - 1" class="step-tl-line" />
                    </div>
                    <div class="step-tl-content">
                      <span :class="['step-tl-name', step.status === 'running' ? 'text-[var(--el-color-primary)]' : '']">{{ step.stepName }}</span>
                      <span v-if="step.status === 'running'" class="step-tl-status">执行中...</span>
                      <span v-else class="step-tl-time">{{ step.durationMs }}ms</span>
                    </div>
                  </div>
                  <div v-if="msg.content" class="step-tl-divider" />
                </div>
                <div v-if="msg.content" class="message-text" v-html="msg.content"></div>
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
            <!-- 加载中（无步骤时用三点） -->
            <div v-if="chatting && !messages[messages.length - 1]?.content && steps.length === 0" class="message-item assistant">
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
              <el-button v-if="chatting" @click="cancelChat">取消</el-button>
              <el-button type="primary" :loading="chatting" :disabled="!inputMessage.trim() && !chatting" @click="sendMessage">
                <el-icon v-if="!chatting"><Promotion /></el-icon> {{ chatting ? '生成中...' : '发送' }}
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
              <span class="text-14px font-600">会话链路</span>
              <el-tag v-if="activeSessionId" size="small" type="info">历史记录</el-tag>
              <el-tag v-else size="small" type="success">最近一次</el-tag>
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
              v-for="session in displaySessions"
              :key="session.id"
              class="session-item"
              :class="{ 'is-active': activeSessionId === session.id }"
              @click="loadSessionDetail(session)"
            >
              <div class="session-content">
                <div class="text-13px color-[var(--el-text-color-primary)] line-clamp-1">{{ session.userMessage }}</div>
                <div class="flex items-center gap-8px mt-4px flex-wrap">
                  <el-tag :type="session.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ session.status === 'success' ? '成功' : session.status === 'timeout' ? '超时' : '失败' }}
                  </el-tag>
                  <span v-if="session.modelName" class="text-11px text-[var(--el-text-color-secondary)]">{{ session.modelName }}</span>
                  <span class="text-11px text-[var(--el-text-color-secondary)] tabular-nums">{{ formatDuration(session.totalDurationMs) }}</span>
                  <span class="text-11px text-[var(--el-text-color-secondary)]">Token: {{ session.tokensTotal || ((session.tokensPrompt || 0) + (session.tokensCompletion || 0)) }}</span>
                  <span v-if="session.retryCount && session.retryCount > 0" class="text-11px text-[var(--el-color-warning)]">重试{{ session.retryCount }}次</span>
                  <span class="text-11px text-[var(--el-text-color-secondary)]">{{ session.createdAt }}</span>
                </div>
                <div v-if="session.errorMessage" class="mt-4px text-11px text-[var(--el-color-danger)] line-clamp-1">
                  {{ session.errorMessage }}
                </div>
              </div>
              <el-button link type="danger" size="small" @click.stop="handleDeleteSession(session)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <!-- 展开/收起按钮 -->
            <div v-if="testSessions.length > defaultSessionLimit" class="session-toggle" @click="showAllSessions = !showAllSessions">
              <span class="text-12px text-[var(--el-color-primary)]">
                {{ showAllSessions ? '收起' : `查看全部 (${testSessions.length})` }}
              </span>
              <el-icon :class="{ 'rotate-180': showAllSessions }" class="text-[var(--el-color-primary)] transition-transform"><ArrowDown /></el-icon>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
import { ChatDotRound, Promotion, Connection, Delete, ArrowDown, Loading, CircleCheckFilled, CircleCloseFilled, RemoveFilled } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { AgentAPI, type AgentTraceSnapshot, type AgentTestSession, type AgentTestChatSSEEvent } from '@/api/ai/agent'
import CacheKey from '@/constants/cache-key'
import AgentTraceDetail from './AgentTraceDetail.vue'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  agentId: number
  agentName: string
}>()

const activeTab = ref('chat')
const showAllSessions = ref(false)
const defaultSessionLimit = 5

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

// ===== 步骤进度（流式） =====
interface StepProgress {
  stepName: string
  status: 'running' | 'success' | 'fail' | 'skip'
  durationMs?: number
}
const steps = ref<StepProgress[]>([])

// ===== 流式控制 =====
let currentAbortController: AbortController | null = null

// ===== 历史会话 =====
const testSessions = ref<AgentTestSession[]>([])
const activeSessionId = ref<number | undefined>()

const displaySessions = computed(() => {
  if (showAllSessions.value) return testSessions.value
  return testSessions.value.slice(0, defaultSessionLimit)
})

function onOpened() {
  messages.value = []
  inputMessage.value = ''
  currentTrace.value = null
  steps.value = []
  activeTab.value = 'chat'
  fetchTestSessions()
}

onUnmounted(() => {
  currentAbortController?.abort()
  currentAbortController = null
})

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
  steps.value = []
  scrollToBottom()

  // 先创建占位消息，后续通过 length-1 获取 reactive 代理
  messages.value.push({ role: 'assistant', content: '' })

  const history = messages.value.slice(0, -1).map(m => ({
    role: m.role,
    content: m.content,
  }))

  // 内联 SSE 流式处理（参考 streamChat 模式）
  currentAbortController?.abort()
  currentAbortController = new AbortController()

  try {
    const token = localStorage.getItem(CacheKey.TOKEN)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch('/api/ai/agents/test-chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        agentId: props.agentId,
        message: msg,
        history,
      }),
      signal: currentAbortController.signal,
    })

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }
    if (!response.body) {
      throw new Error('响应体为空，无法读取流')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.replace(/^data:\s*/, '')
          if (!jsonStr) continue
          try {
            const event: AgentTestChatSSEEvent = JSON.parse(jsonStr)
            handleSSEEvent(event)
          } catch {
            // 忽略解析失败的行
          }
        }
      }
    }

    // 处理 buffer 剩余
    if (buffer.trim().startsWith('data:')) {
      const jsonStr = buffer.trim().replace(/^data:\s*/, '')
      if (jsonStr) {
        try {
          const event: AgentTestChatSSEEvent = JSON.parse(jsonStr)
          handleSSEEvent(event)
        } catch { /* ignore */ }
      }
    }
  } catch (e: any) {
    const lastMsg = messages.value[messages.value.length - 1]
    if (e.name === 'AbortError') {
      if (lastMsg?.role === 'assistant') lastMsg.content += '\n\n[已取消]'
    } else {
      if (lastMsg?.role === 'assistant') lastMsg.content = '调用失败，请检查 Agent 配置'
      console.error(e)
    }
  } finally {
    chatting.value = false
    activeSessionId.value = undefined
    scrollToBottom()
  }
}

function clearMessages() {
  messages.value = []
  currentTrace.value = null
  activeSessionId.value = undefined
  steps.value = []
}

function handleSSEEvent(event: AgentTestChatSSEEvent) {
  // 必须通过 messages.value 访问以确保获取 reactive 代理
  const lastMsg = messages.value[messages.value.length - 1]
  if (lastMsg?.role !== 'assistant') return

  switch (event.type) {
    case 'step_start':
      steps.value.push({ stepName: event.stepName || '', status: 'running' })
      scrollToBottom()
      break
    case 'step_done': {
      const last = steps.value[steps.value.length - 1]
      if (last) {
        // skip 视为成功（跳过但无错误）
        last.status = (event.status === 'skip' ? 'success' : (event.status as any)) || 'success'
        last.durationMs = event.durationMs
      }
      scrollToBottom()
      break
    }
    case 'content':
      lastMsg.content += event.text || ''
      scrollToBottom()
      break
    case 'done': {
      // LLM 调用没有 step_done，done 事件代表它已完成
      const llmStep = steps.value.find(s => s.status === 'running')
      if (llmStep) {
        llmStep.status = 'success'
        llmStep.durationMs = event.totalDurationMs
      }
      lastMsg.durationMs = event.totalDurationMs
      lastMsg.tokensPrompt = event.tokensPrompt
      lastMsg.tokensCompletion = event.tokensCompletion
      if (event.traceSnapshot) {
        const raw = event.traceSnapshot
        lastMsg.traceSnapshot = typeof raw === 'string' ? JSON.parse(raw) : raw
        currentTrace.value = lastMsg.traceSnapshot
      }
      activeSessionId.value = undefined
      fetchTestSessions()
      break
    }
    case 'error':
      lastMsg.content += `\n\n错误: ${event.message}`
      scrollToBottom()
      break
  }
}

function cancelChat() {
  currentAbortController?.abort()
  currentAbortController = null
}

function viewTrace(snapshot: AgentTraceSnapshot) {
  currentTrace.value = snapshot
  activeSessionId.value = undefined
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
    // traceSnapshot 可能是 JSON 字符串，需要解析
    let trace: AgentTraceSnapshot | null = null
    if (detail.traceSnapshot) {
      const raw = detail.traceSnapshot as any
      trace = typeof raw === 'string' ? JSON.parse(raw) : raw
    }
    // 若解析后仍无真实数据，从 session 顶层字段构建
    if (!trace || !trace.totalDurationMs) {
      trace = {
        steps: trace?.steps || [],
        totalDurationMs: detail.totalDurationMs || trace?.totalDurationMs || 0,
        totalTokens: {
          prompt: detail.tokensPrompt || trace?.totalTokens?.prompt || 0,
          completion: detail.tokensCompletion || trace?.totalTokens?.completion || 0,
        },
      }
    }
    currentTrace.value = trace
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

/* ===== 步骤时间线（嵌入 assistant 消息内） ===== */
.step-timeline {
  padding: 12px 14px 4px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.step-tl-item {
  display: flex;
  gap: 10px;
  min-height: 36px;
}
.step-tl-line-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}
.step-tl-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dot-running {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}
.dot-success {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}
.dot-fail {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}
.dot-skip {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}
.step-tl-line {
  width: 2px;
  flex: 1;
  min-height: 8px;
  background: var(--el-border-color-lighter);
}
.step-tl-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
  min-height: 28px;
}
.step-tl-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.step-tl-status {
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: 500;
}
.step-tl-time {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}
.step-tl-divider {
  height: 1px;
  background: var(--el-border-color-extra-light);
  margin: 6px 0 4px 30px;
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
  padding-bottom: 30px;
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

.session-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.session-toggle:hover {
  background: var(--el-fill-color-lighter);
}

.rotate-180 {
  transform: rotate(180deg);
}
.transition-transform {
  transition: transform 0.2s;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
