<template>
  <div class="context-panel h-full flex flex-col bg-[#f5f7fa] overflow-y-auto">
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
          <span class="text-12px font-mono bg-#fff px-6px py-2px rounded-4px color-#303133 break-all border" style="border-color: var(--el-border-color-lighter); word-break: break-all">{{ routePath }}</span>
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
    <div class="px-16px pt-12px pb-16px">
      <div class="text-13px font-600 color-#303133 mb-12px">页面上下文</div>
      <p class="text-12px color-#909399 m-0 mb-12px leading-[1.5]">将当前页面信息发送给 AI，获取更精准的帮助。</p>
      <div class="flex flex-col gap-6px mb-12px">
        <div v-for="(ctx, i) in contextList" :key="i" class="flex items-center gap-6px text-12px color-#606266 bg-#fff px-10px py-6px rounded-6px border hover:bg-#f5f7fa transition-colors duration-150" style="border-color: var(--el-border-color-lighter)">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ ctx }}</span>
        </div>
      </div>
      <el-button type="primary" class="w-full" @click="sendContext">
        将页面上下文发送给 AI
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { useRouteListener } from '@/hooks/useRouteListener';
import { useChatStore } from '@/store/modules/chat';

const store = useChatStore();
const route = useRoute();
const { listenerRouteChange } = useRouteListener();

/** 当前会话是否为 Agent 模式 */
const isAgentMode = computed(() => store.isAgentMode);
/** 当前绑定的 Agent 信息 */
const agentBinding = computed(() => store.currentAgentBinding);

/** 当前会话是否为编排模式 */
const isOrchestrationMode = computed(() => store.isOrchestrationMode);
/** 当前绑定的编排信息 */
const orchestrationBinding = computed(() => store.currentOrchestrationBinding);

/** 策略标签映射 */
const strategyMap: Record<string, string> = {
  sequential: '顺序执行',
  parallel: '并行执行',
  llm_tool: 'LLM 决策',
  auto: '自动选择',
}

function strategyLabel(strategy: string): string {
  return strategyMap[strategy] || strategy
}

const routeName = ref('');
const routePath = ref('');
const routeDescription = ref('');
const contextList = ref<string[]>([]);

function updateContext() {
  const meta = route.meta as Record<string, any>;
  routeName.value = (meta.title as string) || route.name as string || '未知页面';
  routePath.value = route.path;
  routeDescription.value = (meta.description as string) || '';

  contextList.value = [
    `当前页面：${routeName.value}`,
    `路由路径：${routePath.value}`,
    routeDescription.value ? `页面描述：${routeDescription.value}` : '',
    // Agent 模式下追加 Agent 信息到上下文
    isAgentMode.value && agentBinding.value
      ? `当前 Agent：${agentBinding.value.agentName}（${agentBinding.value.sceneName}）`
      : '',
    // 编排模式下追加编排信息到上下文
    isOrchestrationMode.value && orchestrationBinding.value
      ? `当前编排：${orchestrationBinding.value.orchestrationName}（${orchestrationBinding.value.orchestrationCode}，${strategyLabel(orchestrationBinding.value.strategy)}）`
      : '',
  ].filter(Boolean);
}

listenerRouteChange(() => {
  updateContext();
}, true);

function sendContext() {
  const text = `我正在访问「${routeName.value}」页面（${routePath.value}），请根据这个页面上下文提供帮助。`;
  store.addMessage({ role: 'user', content: text });
}
</script>
