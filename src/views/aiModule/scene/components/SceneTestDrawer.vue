<!--
  SceneTestDrawer.vue — 场景测试面板
  优先使用编排模式，无编排时自动回退到 Agent 测试模式
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`场景测试 — ${sceneName}`"
    size="860px"
    @opened="onOpened"
  >
    <!-- 编排/Agent 模式选择器 -->
    <div v-if="orchestrations.length > 0 && fallbackAgentId" class="mode-bar px-16px pt-8px pb-4px flex items-center gap-8px">
      <span class="text-12px color-#999">测试模式：</span>
      <el-radio-group v-model="testMode" size="small" @change="onModeChange">
        <el-radio-button value="orchestration">编排模式</el-radio-button>
        <el-radio-button value="agent">Agent 模式</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 编排选择器（编排模式下有多个编排时） -->
    <div v-if="testMode === 'orchestration' && orchestrations.length > 1" class="orch-selector px-16px pt-4px pb-4px">
      <span class="text-12px color-#999 mr-8px">选择编排：</span>
      <el-select
        v-model="selectedOrchId"
        size="small"
        style="width: 240px"
        @change="onOrchChange"
      >
        <el-option
          v-for="o in orchestrations"
          :key="o.id"
          :label="o.name"
          :value="o.id!"
        />
      </el-select>
    </div>

    <el-tabs v-model="activeTab" class="test-tabs h-full flex flex-col">
      <!-- Tab 1: 对话 -->
      <el-tab-pane name="chat" class="flex-1 overflow-hidden">
        <template #label>
          <span class="inline-flex items-center gap-4px">
            <el-icon><ChatDotRound /></el-icon> 对话
          </span>
        </template>
        <!-- 编排模式 -->
        <ChatPanel
          v-if="testMode === 'orchestration' && selectedOrchId"
          :orchestration-id="selectedOrchId"
          :scene-id="sceneId"
          @view-trace="viewTrace"
          @trace-update="onTraceUpdate"
        />
        <!-- Agent 回退模式 -->
        <ChatPanel
          v-else-if="testMode === 'agent' && fallbackAgentId"
          :agent-id="fallbackAgentId"
          @view-trace="viewTrace"
          @trace-update="onTraceUpdate"
        />
        <el-empty v-else description="该场景暂未配置编排或 Agent" class="h-full flex-center" />
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
import { OrchestrationAPI, type Orchestration } from '@/api/ai/orchestration'
import { SceneAPI } from '@/api/ai/scene'
import ChatPanel from '@/views/aiModule/agent/components/test-chat/ChatPanel.vue'
import TracePanel from '@/views/aiModule/agent/components/test-chat/TracePanel.vue'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  sceneId: number
  sceneName: string
}>()

const activeTab = ref('chat')
const currentTrace = ref<AgentTraceSnapshot | null>(null)
const testSessions = ref<AgentTestSession[]>([])
const activeSessionId = ref<number | undefined>()

// ===== 模式与编排 =====
type TestMode = 'orchestration' | 'agent'
const testMode = ref<TestMode>('orchestration')
const orchestrations = ref<Orchestration[]>([])
const selectedOrchId = ref<number | undefined>()

// ===== Agent 回退 =====
const fallbackAgentId = ref<number | undefined>()

async function onOpened() {
  currentTrace.value = null
  activeSessionId.value = undefined
  activeTab.value = 'chat'
  selectedOrchId.value = undefined
  fallbackAgentId.value = undefined
  orchestrations.value = []

  // 1. 加载场景下的编排列表
  try {
    const list = await OrchestrationAPI.list({ sceneId: props.sceneId, status: 1 })
    orchestrations.value = list || []
  } catch { /* 忽略 */ }

  // 2. 加载场景关联的 Agent（用于回退）
  try {
    const agents = await SceneAPI.getAgents(props.sceneId)
    if (agents && agents.length > 0) {
      const defaultAgent = agents.find(a => a.isDefault === 1)
      const first = defaultAgent || agents[0]
      fallbackAgentId.value = first.agentId!
    }
  } catch { /* 忽略 */ }

  // 3. 确定初始模式
  if (orchestrations.value.length > 0) {
    testMode.value = 'orchestration'
    selectedOrchId.value = orchestrations.value[0].id!
    await fetchOrchestrationSessions()
    if (!currentTrace.value && testSessions.value.length > 0) {
      loadOrchestrationSessionDetail(testSessions.value[0], false)
    }
  } else if (fallbackAgentId.value) {
    testMode.value = 'agent'
    await fetchAgentSessions()
    if (!currentTrace.value && testSessions.value.length > 0) {
      loadAgentSessionDetail(testSessions.value[0], false)
    }
  }
}

function onModeChange() {
  currentTrace.value = null
  activeSessionId.value = undefined
  testSessions.value = []
  activeTab.value = 'chat'

  if (testMode.value === 'orchestration' && selectedOrchId.value) {
    fetchOrchestrationSessions()
  } else if (testMode.value === 'agent' && fallbackAgentId.value) {
    fetchAgentSessions()
  }
}

function onOrchChange() {
  currentTrace.value = null
  activeSessionId.value = undefined
  testSessions.value = []
  fetchOrchestrationSessions()
}

function viewTrace(snapshot: AgentTraceSnapshot) {
  currentTrace.value = snapshot
  activeSessionId.value = undefined
  activeTab.value = 'trace'
}

function onTraceUpdate(snapshot: AgentTraceSnapshot) {
  currentTrace.value = snapshot
  activeSessionId.value = undefined
  if (testMode.value === 'orchestration') {
    fetchOrchestrationSessions()
  } else {
    fetchAgentSessions()
  }
}

// ===== 历史会话 — 编排模式 =====

async function fetchOrchestrationSessions() {
  if (!selectedOrchId.value) return
  try {
    const res = await AgentAPI.getOrchestrationSessions(selectedOrchId.value, { pageNum: 1, pageSize: 999 })
    testSessions.value = res.list || []
  } catch { /* 忽略 */ }
}

async function loadOrchestrationSessionDetail(session: AgentTestSession, switchTab = true) {
  if (!selectedOrchId.value) return
  activeSessionId.value = session.id
  try {
    const detail = await AgentAPI.getOrchestrationSessionDetail(selectedOrchId.value, session.id!)
    currentTrace.value = parseTraceSnapshot(detail)
    if (switchTab) activeTab.value = 'trace'
  } catch {
    if (switchTab) ElMessage.error('获取详情失败')
  }
}

// ===== 历史会话 — Agent 模式 =====

async function fetchAgentSessions() {
  if (!fallbackAgentId.value) return
  try {
    const res = await AgentAPI.getTestSessions(fallbackAgentId.value, { pageNum: 1, pageSize: 999 })
    testSessions.value = res.list || []
  } catch { /* 忽略 */ }
}

async function loadAgentSessionDetail(session: AgentTestSession, switchTab = true) {
  if (!fallbackAgentId.value) return
  activeSessionId.value = session.id
  try {
    const detail = await AgentAPI.getTestSessionDetail(fallbackAgentId.value, session.id!)
    currentTrace.value = parseTraceSnapshot(detail)
    if (switchTab) activeTab.value = 'trace'
  } catch {
    if (switchTab) ElMessage.error('获取详情失败')
  }
}

// ===== 公共 =====

function parseTraceSnapshot(detail: any): AgentTraceSnapshot | null {
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
  return trace
}

async function loadSessionDetail(session: AgentTestSession, switchTab = true) {
  if (testMode.value === 'orchestration') {
    await loadOrchestrationSessionDetail(session, switchTab)
  } else {
    await loadAgentSessionDetail(session, switchTab)
  }
}

async function handleDeleteSession(session: AgentTestSession) {
  const bizId = testMode.value === 'orchestration' ? selectedOrchId.value : fallbackAgentId.value
  if (!bizId) return
  await ElMessageBox.confirm('确认删除该测试记录？', '提示', { type: 'warning' })
  try {
    await AgentAPI.deleteTestSession(bizId, session.id!)
    ElMessage.success('删除成功')
    if (testMode.value === 'orchestration') {
      await fetchOrchestrationSessions()
    } else {
      await fetchAgentSessions()
    }
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
