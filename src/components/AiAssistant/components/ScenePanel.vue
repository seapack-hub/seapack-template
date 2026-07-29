<!--
  AiAssistant/ScenePanel.vue — 场景管理面板

  职责：
    1. 场景列表展示与选择
    2. Agent / 编排选择器
    3. 编排步骤进度展示
    4. 返回通用对话

  数据流：
    场景列表 → 选择场景 → 加载 Agent/编排 → 绑定到 chatStore
-->
<template>
  <div class="scene-panel h-full flex flex-col bg-[#f5f7fa] overflow-y-auto">
    <!-- 当前模式状态 -->
    <div class="px-16px pt-16px pb-12px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <div class="flex items-center justify-between mb-8px">
        <span class="text-13px font-600 color-#303133">当前模式</span>
        <el-button v-if="isSceneMode" size="small" text type="primary" @click="backToLLM">
          返回通用
        </el-button>
      </div>
      <el-tag :type="isSceneMode ? 'success' : 'info'" size="small">
        {{ isSceneMode ? `场景: ${currentSceneName}` : '通用 LLM 对话' }}
      </el-tag>
    </div>

    <!-- Agent 选择器：场景模式 + 多个 Agent 时显示 -->
    <div v-if="showAgentSelector" class="px-16px py-12px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <div class="text-13px font-600 color-#303133 mb-8px">选择 Agent</div>
      <el-select
        v-model="selectedAgentId"
        size="small"
        placeholder="选择 Agent"
        class="w-full"
      >
        <el-option
          v-for="a in agents"
          :key="a.id"
          :label="a.agentName || ''"
          :value="a.id || ''"
        />
      </el-select>
    </div>

    <!-- 编排选择器：场景模式 + 多个编排时显示 -->
    <div v-if="showOrchestrationSelector" class="px-16px py-12px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <div class="text-13px font-600 color-#303133 mb-8px">选择编排</div>
      <el-select
        v-model="selectedOrchestrationId"
        size="small"
        placeholder="选择编排"
        class="w-full"
      >
        <el-option
          v-for="o in orchestrations"
          :key="o.id"
          :label="o.name"
          :value="o.id || ''"
        />
      </el-select>
    </div>

    <!-- 编排步骤进度条 -->
    <div v-if="showStepProgress" class="px-16px py-12px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <div class="flex items-center gap-6px text-12px color-#909399 mb-8px">
        <el-icon class="is-loading" :size="14"><Loading /></el-icon>
        <span>编排执行中</span>
      </div>
      <div class="flex flex-col gap-4px">
        <div
          v-for="(step, index) in stepProgressList"
          :key="index"
          class="flex items-center gap-6px text-12px px-8px py-4px rounded-4px bg-#fff"
          :class="step.status"
        >
          <el-icon :size="14">
            <SuccessFilled v-if="step.status === 'success'" />
            <CircleCloseFilled v-else-if="step.status === 'fail'" />
            <Loading v-else-if="step.status === 'running'" class="is-loading" />
            <MoreFilled v-else />
          </el-icon>
          <span class="flex-1">{{ step.stepName }}</span>
          <span v-if="step.durationMs" class="color-#c0c4cc">{{ formatDuration(step.durationMs) }}</span>
        </div>
      </div>
    </div>

    <!-- 场景列表 -->
    <div class="px-16px pt-12px pb-16px">
      <div class="text-13px font-600 color-#303133 mb-8px">可用场景</div>
      <p class="text-12px color-#909399 m-0 mb-12px leading-[1.5]">
        选择场景后自动进入 Agent 或编排模式
      </p>
      <div v-if="loading" class="flex justify-center py-20px">
        <el-icon class="is-loading" :size="24" color="var(--el-color-primary)"><Loading /></el-icon>
      </div>
      <div v-else class="grid grid-cols-2 gap-8px">
        <div
          v-for="scene in scenes"
          :key="scene.id"
          class="scene-card flex flex-col items-center gap-4px px-8px py-12px border rounded-8px cursor-pointer bg-#fff transition-all duration-200"
          :class="currentSceneId === scene.id ? 'active' : ''"
          style="border-color: var(--el-border-color-lighter)"
          @click="selectScene(scene)"
        >
          <Icon :name="scene.icon || 'ChatDotSquare'" :size="22" :color="scene.coverColor || '#409eff'" />
          <span class="text-12px font-500 color-#303133">{{ scene.name }}</span>
          <span class="text-11px color-#909399 text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-full">{{ scene.description || '' }}</span>
        </div>
      </div>
      <el-empty v-if="!loading && scenes.length === 0" description="暂无可用场景" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Loading, SuccessFilled, CircleCloseFilled, MoreFilled } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { useChatExecution, type StepProgress } from '@/hooks/useChatExecution'
import { SceneAPI, type Scene, type SceneAgent } from '@/api/ai/scene'
import { OrchestrationAPI, type Orchestration } from '@/api/ai/orchestration'
import Icon from '@/components/Icon/index.vue'

// ===== Props =====
defineProps<{
  scenes: Scene[]
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

// ===== 场景/Agent/编排 状态 =====
const currentScene = ref<Scene | null>(null)
const agents = ref<SceneAgent[]>([])
const orchestrations = ref<Orchestration[]>([])

const isSceneMode = computed(() => store.isAgentMode || store.isOrchestrationMode)

const currentSceneId = computed(() => {
  if (store.isAgentMode && store.currentAgentBinding) {
    return store.currentAgentBinding.sceneId
  }
  if (store.isOrchestrationMode && store.currentOrchestrationBinding) {
    return store.currentOrchestrationBinding.sceneId
  }
  return null
})

const currentSceneName = computed(() => {
  if (store.isAgentMode && store.currentAgentBinding) {
    return store.currentAgentBinding.sceneName
  }
  if (store.isOrchestrationMode && store.currentOrchestrationBinding) {
    return store.currentOrchestrationBinding.orchestrationName
  }
  return ''
})

const showAgentSelector = computed(() => {
  return isSceneMode.value && agents.value.length > 1 && !store.isOrchestrationMode
})

const showOrchestrationSelector = computed(() => {
  return isSceneMode.value && orchestrations.value.length > 1 && store.isOrchestrationMode
})

const showStepProgress = computed(() => {
  return store.isOrchestrationMode && store.loading && stepProgressList.value.length > 0
})

// ===== 工具函数 =====
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
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
  stepProgressList.value = []
}
</script>

<style scoped lang="scss">
.scene-card {
  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  &.active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: 0 0 0 1px var(--el-color-primary);
  }
}

.running { background: #fdf6ec; color: #e6a23c; }
.success { background: #f0f9eb; color: #67c23a; }
.fail    { background: #fef0f0; color: #f56c6c; }
</style>
