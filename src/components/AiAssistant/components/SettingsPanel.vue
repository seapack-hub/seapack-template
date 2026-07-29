<!--
  AiAssistant/SettingsPanel.vue — 设置面板

  职责：
    1. 页面上下文展示与注入
    2. 结果回写配置（已注册的 resultHandler 列表）
    3. Agent/编排绑定信息展示
-->
<template>
  <div class="settings-panel h-full flex flex-col bg-[#f5f7fa] overflow-y-auto">
    <!-- 页面信息 -->
    <div class="px-16px pt-16px pb-12px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <div class="text-13px font-600 color-#303133 mb-12px">当前页面</div>
      <div class="flex flex-col gap-8px">
        <div class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">页面名称</span>
          <span class="text-13px color-#303133">{{ routeName }}</span>
        </div>
        <div class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">路由路径</span>
          <span class="text-12px font-mono bg-#fff px-6px py-2px rounded-4px color-#303133 border" style="border-color: var(--el-border-color-lighter); word-break: break-all">{{ routePath }}</span>
        </div>
        <div v-if="routeDescription" class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">页面描述</span>
          <span class="text-13px color-#303133">{{ routeDescription }}</span>
        </div>
      </div>
    </div>

    <!-- Agent 绑定信息 -->
    <div v-if="isAgentMode && agentBinding" class="px-16px py-12px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <div class="text-13px font-600 color-#303133 mb-12px">Agent 信息</div>
      <div class="flex flex-col gap-8px">
        <div class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">Agent 名称</span>
          <span class="text-13px color-#303133">{{ agentBinding.agentName }}</span>
        </div>
        <div class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">所属场景</span>
          <span class="text-13px color-#303133">{{ agentBinding.sceneName }}</span>
        </div>
        <div v-if="agentBinding.agentModel" class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">模型覆盖</span>
          <span class="text-12px font-mono bg-#fff px-6px py-2px rounded-4px color-#303133 border" style="border-color: var(--el-border-color-lighter)">{{ agentBinding.agentModel }}</span>
        </div>
        <div v-if="agentBinding.agentTemperature != null" class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">温度覆盖</span>
          <span class="text-13px color-#303133">{{ agentBinding.agentTemperature }}</span>
        </div>
        <div v-if="agentBinding.knowledgeIds?.length" class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">关联知识库</span>
          <span class="text-13px color-#303133">{{ agentBinding.knowledgeIds.length }} 个</span>
        </div>
      </div>
    </div>

    <!-- 编排绑定信息 -->
    <div v-if="isOrchestrationMode && orchestrationBinding" class="px-16px py-12px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <div class="text-13px font-600 color-#303133 mb-12px">编排信息</div>
      <div class="flex flex-col gap-8px">
        <div class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">编排名称</span>
          <span class="text-13px color-#303133">{{ orchestrationBinding.orchestrationName }}</span>
        </div>
        <div class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">编排编码</span>
          <span class="text-12px font-mono bg-#fff px-6px py-2px rounded-4px color-#303133 border" style="border-color: var(--el-border-color-lighter)">{{ orchestrationBinding.orchestrationCode }}</span>
        </div>
        <div v-if="orchestrationBinding.orchestrationDescription" class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">编排描述</span>
          <span class="text-13px color-#303133">{{ orchestrationBinding.orchestrationDescription }}</span>
        </div>
        <div class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">执行策略</span>
          <span class="text-13px color-#303133">{{ strategyLabel(orchestrationBinding.strategy) }}</span>
        </div>
        <div class="flex flex-col gap-2px">
          <span class="text-11px color-#909399">步骤数量</span>
          <span class="text-13px color-#303133">{{ orchestrationBinding.stepCount }} 步</span>
        </div>
      </div>
    </div>

    <!-- 页面上下文 -->
    <div class="px-16px pt-12px pb-12px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <div class="text-13px font-600 color-#303133 mb-8px">页面上下文</div>
      <p class="text-12px color-#909399 m-0 mb-8px leading-[1.5]">将当前页面信息发送给 AI，获取更精准的帮助。</p>
      <div class="flex flex-col gap-6px mb-12px">
        <div v-for="(ctx, i) in contextList" :key="i" class="flex items-center gap-6px text-12px color-#606266 bg-#fff px-10px py-6px rounded-6px border hover:bg-#f5f7fa transition-colors duration-150" style="border-color: var(--el-border-color-lighter)">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ ctx }}</span>
        </div>
      </div>
      <el-button type="primary" size="small" class="w-full" @click="sendContext">
        将页面上下文发送给 AI
      </el-button>
    </div>

    <!-- 结果回写配置 -->
    <div class="px-16px pt-12px pb-16px">
      <div class="text-13px font-600 color-#303133 mb-8px">结果回写</div>
      <p class="text-12px color-#909399 m-0 mb-8px leading-[1.5]">页面注册的结果处理器，AI 回复后可快速操作。</p>
      <div v-if="store.resultHandlers.length > 0" class="flex flex-col gap-6px">
        <div
          v-for="handler in store.resultHandlers"
          :key="handler.name"
          class="flex items-center gap-8px text-12px color-#606266 bg-#fff px-10px py-6px rounded-6px border"
          style="border-color: var(--el-border-color-lighter)"
        >
          <el-icon color="var(--el-color-success)"><CircleCheckFilled /></el-icon>
          <span class="flex-1">{{ handler.name }}</span>
          <el-tag size="small" type="success" effect="plain">已注册</el-tag>
        </div>
      </div>
      <el-empty v-else description="当前页面未注册结果处理器" :image-size="40" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { InfoFilled, CircleCheckFilled } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useRouteListener } from '@/hooks/useRouteListener'
import { useChatStore } from '@/store/modules/chat'

const store = useChatStore()
const route = useRoute()
const { listenerRouteChange } = useRouteListener()

// ===== 绑定信息 =====
const isAgentMode = computed(() => store.isAgentMode)
const agentBinding = computed(() => store.currentAgentBinding)
const isOrchestrationMode = computed(() => store.isOrchestrationMode)
const orchestrationBinding = computed(() => store.currentOrchestrationBinding)

// ===== 策略标签 =====
const strategyMap: Record<string, string> = {
  sequential: '顺序执行',
  parallel: '并行执行',
  llm_tool: 'LLM 决策',
  auto: '自动选择',
}

function strategyLabel(strategy: string): string {
  return strategyMap[strategy] || strategy
}

// ===== 页面上下文 =====
const routeName = ref('')
const routePath = ref('')
const routeDescription = ref('')
const contextList = ref<string[]>([])

function updateContext() {
  const meta = route.meta as Record<string, any>
  routeName.value = (meta.title as string) || (route.name as string) || '未知页面'
  routePath.value = route.path
  routeDescription.value = (meta.description as string) || ''

  contextList.value = [
    `当前页面：${routeName.value}`,
    `路由路径：${routePath.value}`,
    routeDescription.value ? `页面描述：${routeDescription.value}` : '',
    isAgentMode.value && agentBinding.value
      ? `当前 Agent：${agentBinding.value.agentName}（${agentBinding.value.sceneName}）`
      : '',
    isOrchestrationMode.value && orchestrationBinding.value
      ? `当前编排：${orchestrationBinding.value.orchestrationName}（${orchestrationBinding.value.orchestrationCode}，${strategyLabel(orchestrationBinding.value.strategy)}）`
      : '',
  ].filter(Boolean)
}

listenerRouteChange(() => {
  updateContext()
}, true)

function sendContext() {
  const text = `我正在访问「${routeName.value}」页面（${routePath.value}），请根据这个页面上下文提供帮助。`
  store.addMessage({ role: 'user', content: text })
}
</script>
