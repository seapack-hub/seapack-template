<!--
  AI Agent 执行通用弹框（替代 AiSkillExecutor）

  职责：
    根据 moduleKey + position 从 Scene Store 中过滤绑定的 Agent，
    支持 Agent 选择 + 消息输入 + 流式/非流式执行 + 结果预览。

  使用方式：
    <AiAgentExecutor
      v-model:visible="dialogVisible"
      module-key="stockFund"
      position="detail-toolbar"
      :context="{ stockCode, stockName }"
      @done="handleAiResult"
    />

  数据流：
    useSceneBindings → 过滤绑定 → 选择 Agent → 输入消息 → AgentAPI.chat() → 结果
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1050px"
    :close-on-click-modal="false"
    class="ai-executor-dialog"
    @closed="onClosed"
  >
    <!-- 空状态 -->
    <div v-if="loaded && !bindings.length" class="flex flex-col items-center justify-center py-48">
      <el-empty description="该位置未配置 AI 场景" :image-size="80" />
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center py-48 gap-[10px]">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <p class="m-0 text-[14px] text-[var(--el-text-color-secondary)]">加载场景配置中...</p>
    </div>

    <!-- 正常状态 -->
    <template v-else>
      <!-- 多场景选择器 -->
      <div v-if="bindings.length > 1" class="mb-10">
        <el-radio-group v-model="selectedBinding" size="small">
          <el-radio-button
            v-for="b in bindings"
            :key="b.sceneId"
            :value="b"
          >
            {{ b.sceneName || b.agentName }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 双栏布局 -->
      <div class="flex min-h-[400px]">
        <!-- 左：消息输入 -->
        <div class="flex-1 flex flex-col min-w-0 gap-[10px]">
          <!-- 上下文信息（可选） -->
          <div v-if="contextEntries.length" class="border border-solid border-[var(--el-border-color-lighter)] rounded-8 bg-white">
            <div class="flex items-center gap-[6px] px-16 py-[10px] border-b border-[var(--el-border-color-extra-light)] bg-[var(--el-fill-color-lighter)]">
              <span class="text-[14px] font-600">上下文信息</span>
            </div>
            <div class="px-16 py-12 grid grid-cols-2 gap-8px">
              <div v-for="[key, val] in contextEntries" :key="key" class="flex gap-4px text-[13px]">
                <span class="text-[var(--el-text-color-secondary)] shrink-0">{{ key }}：</span>
                <span class="text-[var(--el-text-color-primary)] truncate">{{ val }}</span>
              </div>
            </div>
          </div>
          <!-- 消息输入 -->
          <div class="flex-1 flex flex-col border border-solid border-[var(--el-border-color-lighter)] rounded-8 bg-white">
            <div class="flex items-center gap-[6px] px-16 py-[10px] border-b border-[var(--el-border-color-extra-light)] bg-[var(--el-fill-color-lighter)]">
              <span class="text-[14px] font-600">指令输入</span>
            </div>
            <div class="flex-1 px-16 py-12">
              <el-input
                v-model="userMessage"
                type="textarea"
                :rows="6"
                placeholder="输入指令或问题..."
                :disabled="executing"
              />
            </div>
          </div>
        </div>

        <!-- 分隔 -->
        <div class="flex-shrink-0 w-[1px] mx-[18px] bg-[var(--el-border-color-lighter)] self-stretch" />

        <!-- 右：执行结果 -->
        <div class="flex-1 flex flex-col border border-solid border-[var(--el-border-color-lighter)] rounded-8 bg-white overflow-hidden">
          <div class="flex items-center justify-between px-16 py-[10px] border-b border-[var(--el-border-color-extra-light)] bg-[var(--el-fill-color-lighter)]">
            <span class="text-[14px] font-600">执行结果</span>
            <div v-if="result" class="flex items-center gap-8px text-[12px] text-[var(--el-text-color-secondary)]">
              <span>耗时 {{ result.durationMs }}ms</span>
              <span>|</span>
              <span>Token {{ result.tokensPrompt + result.tokensCompletion }}</span>
            </div>
          </div>
          <div class="flex-1 overflow-auto p-16">
            <!-- 执行中 -->
            <div v-if="executing" class="flex flex-col items-center justify-center h-100% gap-[10px]">
              <el-icon class="is-loading" :size="28"><Loading /></el-icon>
              <p class="m-0 text-[14px] text-[var(--el-text-color-secondary)]">Agent 执行中...</p>
            </div>
            <!-- 结果 -->
            <div v-else-if="result" class="text-[14px] leading-[1.8] whitespace-pre-wrap" v-html="renderedContent" />
            <!-- 空状态 -->
            <div v-else class="flex flex-col items-center justify-center h-100% text-[var(--el-text-color-placeholder)]">
              <el-icon :size="40"><ChatLineSquare /></el-icon>
              <p class="mt-10px text-[14px]">输入指令后点击执行</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 底部 -->
    <template #footer>
      <div class="flex justify-end gap-[10px]">
        <template v-if="loaded && !bindings.length">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
        <template v-else>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="executing" @click="onExecute">
            <el-icon v-if="!executing"><VideoPlay /></el-icon>执行
          </el-button>
          <el-button v-if="result && !executing" type="success" @click="onConfirm">
            <el-icon><CircleCheck /></el-icon>确认
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Loading, CircleCheck, ChatLineSquare, VideoPlay } from '@element-plus/icons-vue'
import { AgentAPI, type AgentChatResponse } from '@/api/ai/agent'
import { useSceneBindings } from '@/hooks/useSceneBindings'
import type { SceneBindingInfo } from '@/api/ai/scene'

const props = defineProps<{
  moduleKey: string
  positionKey: string
  context?: Record<string, any>
  /** 指定场景 ID，传入时跳过选择器 */
  sceneId?: number
}>()

const emit = defineEmits<{
  done: [result: { content: string; agentName: string; agentId: number; elapsedMs: number }]
  empty: []
}>()

const visible = defineModel<boolean>('visible', { required: true })
const dialogVisible = computed({
  get: () => visible.value,
  set: (val: boolean) => { visible.value = val },
})

const { bindings, loading, loaded } = useSceneBindings(props.moduleKey, props.positionKey)

const selectedBinding = ref<SceneBindingInfo | null>(null)

watch(bindings, (val) => {
  if (val.length === 0) { selectedBinding.value = null; return }
  if (props.sceneId) {
    const found = val.find(b => b.sceneId === props.sceneId)
    selectedBinding.value = found || val[0]
  } else if (!selectedBinding.value) {
    selectedBinding.value = val[0]
  }
}, { immediate: true })

const dialogTitle = computed(() => {
  if (!selectedBinding.value) return 'AI 助手'
  return selectedBinding.value.sceneName || selectedBinding.value.agentName || 'AI 助手'
})

const userMessage = ref('')
const result = ref<AgentChatResponse | null>(null)
const executing = ref(false)

/** 上下文信息条目 */
const contextEntries = computed(() => {
  if (!props.context) return []
  return Object.entries(props.context).filter(([, v]) => v !== undefined && v !== null && v !== '')
})

/** 简单 Markdown 渲染（粗体 + 列表） */
const renderedContent = computed(() => {
  if (!result.value?.content) return ''
  return result.value.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
})

/** 执行 Agent 对话 */
async function onExecute() {
  if (!selectedBinding.value || !userMessage.value.trim()) return
  executing.value = true
  result.value = null
  try {
    const res = await AgentAPI.chat({
      agentId: selectedBinding.value.agentId,
      message: userMessage.value,
    })
    result.value = res
  } catch (e) {
    result.value = {
      content: `执行失败: ${(e as Error).message}`,
      tokensPrompt: 0,
      tokensCompletion: 0,
      durationMs: 0,
    }
  } finally {
    executing.value = false
  }
}

/** 确认结果 */
function onConfirm() {
  if (!result.value || !selectedBinding.value) return
  emit('done', {
    content: result.value.content,
    agentName: selectedBinding.value.agentName,
    agentId: selectedBinding.value.agentId,
    elapsedMs: result.value.durationMs,
  })
  visible.value = false
}

function onClosed() {
  result.value = null
  userMessage.value = ''
}

watch([bindings, loaded], ([b, l]) => {
  if (l && b.length === 0) emit('empty')
})
</script>

<style lang="scss">
.ai-executor-dialog .el-dialog__body {
  padding: 16px 20px 20px !important;
}
</style>
