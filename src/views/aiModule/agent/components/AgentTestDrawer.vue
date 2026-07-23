<!--
  Agent 测试面板（重构版）
  外壳组件：Tab 切换 + 数据管理，子组件各自独立
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`Agent 测试 — ${agentName}`"
    size="860px"
    @opened="onOpened"
  >
    <el-tabs v-model="activeTab" class="test-tabs h-full flex flex-col">
      <!-- Tab 1: 对话 -->
      <el-tab-pane name="chat" class="flex-1 overflow-hidden">
        <template #label>
          <span class="inline-flex items-center gap-4px">
            <el-icon><ChatDotRound /></el-icon> 对话
          </span>
        </template>
        <ChatPanel
          :agent-id="agentId"
          @view-trace="viewTrace"
          @trace-update="onTraceUpdate"
        />
      </el-tab-pane>

      <!-- Tab 2: 链路追踪 -->
      <el-tab-pane name="trace" class="flex-1 overflow-hidden">
        <template #label>
          <span class="inline-flex items-center gap-4px">
            <el-icon><Connection /></el-icon> 链路追踪
          </span>
        </template>
        <TracePanel
          :trace="currentTrace"
          :sessions="testSessions"
          :active-session-id="activeSessionId"
          @load-session="loadSessionDetail"
          @delete-session="handleDeleteSession"
        />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
import { ChatDotRound, Connection } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { AgentAPI, type AgentTraceSnapshot, type AgentTestSession } from '@/api/ai/agent'
import ChatPanel from './test-chat/ChatPanel.vue'
import TracePanel from './test-chat/TracePanel.vue'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  agentId: number
  agentName: string
}>()

const activeTab = ref('chat')
const currentTrace = ref<AgentTraceSnapshot | null>(null)
const testSessions = ref<AgentTestSession[]>([])
const activeSessionId = ref<number | undefined>()

async function onOpened() {
  currentTrace.value = null
  activeSessionId.value = undefined
  activeTab.value = 'chat'
  await fetchTestSessions()
  // 无当前链路数据时，默认加载第一条历史测试记录的追踪链路
  if (!currentTrace.value && testSessions.value.length > 0) {
    loadSessionDetail(testSessions.value[0], false)
  }
}

function viewTrace(snapshot: AgentTraceSnapshot) {
  currentTrace.value = snapshot
  activeSessionId.value = undefined
  activeTab.value = 'trace'
}

function onTraceUpdate(snapshot: AgentTraceSnapshot) {
  currentTrace.value = snapshot
  activeSessionId.value = undefined
  fetchTestSessions()
}

// ===== 历史会话 =====

async function fetchTestSessions() {
  try {
    const res = await AgentAPI.getTestSessions(props.agentId, { pageNum: 1, pageSize: 999 })
    testSessions.value = res.list || []
  } catch { /* 忽略 */ }
}

async function loadSessionDetail(session: AgentTestSession, switchTab = true) {
  activeSessionId.value = session.id
  try {
    const detail = await AgentAPI.getTestSessionDetail(props.agentId, session.id!)
    let trace: AgentTraceSnapshot | null = null
    if (detail.traceSnapshot) {
      const raw = detail.traceSnapshot as any
      trace = typeof raw === 'string' ? JSON.parse(raw) : raw
    }
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
    if (switchTab) {
      activeTab.value = 'trace'
    }
  } catch {
    if (switchTab) {
      ElMessage.error('获取详情失败')
    }
  }
}

async function handleDeleteSession(session: AgentTestSession) {
  await ElMessageBox.confirm('确认删除该测试记录？', '提示', { type: 'warning' })
  try {
    await AgentAPI.deleteTestSession(props.agentId, session.id!)
    ElMessage.success('删除成功')
    await fetchTestSessions()
    if (activeSessionId.value === session.id) {
      currentTrace.value = null
      activeSessionId.value = undefined
    }
  } catch { /* handled */ }
}
</script>

<style scoped>
.test-tabs :deep(.el-tabs__header) { margin: 0; }
.test-tabs :deep(.el-tabs__nav-wrap::after) { height: 1px; }
.test-tabs :deep(.el-tabs__content) { padding: 0; height: calc(100vh - 160px); overflow: hidden; }
.test-tabs :deep(.el-tab-pane) { height: 100%; }
</style>
