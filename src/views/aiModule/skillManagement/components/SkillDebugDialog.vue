<!--
  Skill 调试弹窗
  增强版执行测试：参数表单 + Prompt 渲染对比 + LLM 原始请求/响应 + Token 明细
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="Skill 调试"
    width="1200px"
    :close-on-click-modal="false"
    class="skill-debug-dialog"
    @closed="onClosed"
  >
    <div v-loading="loadingParams" class="debug-layout">
      <!-- 左栏：参数 + 补充指令 -->
      <div class="debug-left">
        <!-- 参数卡片 -->
        <div class="debug-card flex-1">
          <div class="card-header">
            <el-icon color="var(--el-color-primary)" :size="16"><EditPen /></el-icon>
            <span class="card-title">输入参数</span>
          </div>
          <div class="card-body">
            <el-form
              v-if="params.length"
              :model="executeParams"
              label-position="top"
              size="default"
              class="param-form"
            >
              <el-form-item
                v-for="p in params"
                :key="p.paramName"
                :label="p.label"
                :required="p.required === 1"
              >
                <el-input
                  v-if="p.paramType === 'string'"
                  v-model="executeParams[p.paramName]"
                  :placeholder="p.placeholder || `请输入${p.label}`"
                  clearable
                />
                <el-input-number
                  v-else-if="p.paramType === 'number'"
                  v-model="executeParams[p.paramName]"
                  :placeholder="p.placeholder"
                  style="width: 100%"
                />
                <el-switch
                  v-else-if="p.paramType === 'boolean'"
                  v-model="executeParams[p.paramName]"
                />
                <el-select
                  v-else-if="p.paramType === 'select' && p.options"
                  v-model="executeParams[p.paramName]"
                  :placeholder="p.placeholder || '请选择'"
                  style="width: 100%"
                  clearable
                >
                  <el-option v-for="opt in p.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
                <JsonEditor
                  v-else-if="p.paramType === 'json'"
                  v-model="executeParams[p.paramName]"
                  mode="code"
                  height="200px"
                />
                <el-input
                  v-else
                  :model-value="executeParams[p.paramName]"
                  :placeholder="p.placeholder || `请输入${p.label}`"
                  type="textarea"
                  clearable
                  @update:model-value="executeParams[p.paramName] = $event"
                />
              </el-form-item>
            </el-form>
            <div v-else class="flex flex-col items-center justify-center py-20 gap-12px">
              <el-empty description="该技能未定义输入参数" :image-size="60" />
            </div>
          </div>
        </div>

        <!-- 补充指令 -->
        <div class="debug-card flex-shrink-0">
          <div class="card-header">
            <el-icon color="var(--el-color-primary)" :size="16"><Message /></el-icon>
            <span class="card-title">补充指令</span>
          </div>
          <div class="card-body py-12px px-16px">
            <el-input
              v-model="userMessage"
              type="textarea"
              :rows="2"
              placeholder="可选：输入额外指令或补充说明..."
              :disabled="executing"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-8px flex-shrink-0">
          <el-button type="primary" :loading="executing" class="flex-1" @click="onDebug">
            <el-icon v-if="!executing"><CaretRight /></el-icon> 调试执行
          </el-button>
          <el-button :disabled="executing" @click="resetParams">重置</el-button>
          <el-button :disabled="!debugResult" text type="primary" @click="logDrawerVisible = true">
            <el-icon><Document /></el-icon> 历史日志
          </el-button>
        </div>
      </div>

      <!-- 右栏：调试结果 -->
      <div class="debug-right">
        <!-- 等待状态 -->
        <div v-if="!debugResult && !executing" class="flex flex-col items-center justify-center h-full text-center">
          <el-icon :size="40" color="var(--el-color-info-light-5)" class="mb-12px"><Promotion /></el-icon>
          <p class="m-0 text-13px text-[var(--el-text-color-secondary)] leading-relaxed max-w-220px">
            填写参数后点击「调试执行」查看完整调用过程
          </p>
        </div>

        <!-- 执行中 -->
        <div v-if="executing" class="flex flex-col gap-20px py-24px items-center">
          <div class="text-center">
            <div class="text-28px font-300 color-[var(--el-color-primary)] tabular-nums">
              {{ Math.floor(elapsed / 60) }}:{{ String(elapsed % 60).padStart(2, '0') }}
            </div>
            <div class="text-12px color-[var(--el-text-color-secondary)] mt-4px">已耗时</div>
          </div>
          <div class="flex flex-col gap-16px px-16px">
            <div
              v-for="(phase, i) in phases"
              :key="i"
              class="flex items-center gap-12px"
              :class="{ 'opacity-40': i > currentPhase }"
            >
              <div
                class="flex-shrink-0 w-28px h-28px rounded-full flex items-center justify-center transition-all-300"
                :class="{
                  'bg-[var(--el-color-primary)] color-white': i === currentPhase,
                  'bg-[var(--el-color-success-light-7)] color-[var(--el-color-success)]': i < currentPhase,
                  'bg-[var(--el-color-info-light-8)] color-[var(--el-color-info)]': i > currentPhase,
                }"
              >
                <el-icon v-if="i < currentPhase" :size="16"><CircleCheckFilled /></el-icon>
                <el-icon v-else-if="i === currentPhase" :size="16" :class="{ 'is-loading': i === 1 }"><component :is="phase.icon" /></el-icon>
                <span v-else class="text-12px">{{ i + 1 }}</span>
              </div>
              <span
                class="text-14px"
                :class="{
                  'font-600 color-[var(--el-color-primary)]': i === currentPhase,
                  'color-[var(--el-color-success)]': i < currentPhase,
                  'color-[var(--el-text-color-secondary)]': i > currentPhase,
                }"
              >{{ phase.label }}</span>
            </div>
          </div>
          <p class="text-center text-12px text-[var(--el-text-color-secondary)] m-0">
            AI 生成通常需要 10~60 秒，请耐心等待
          </p>
        </div>

        <!-- 调试结果 -->
        <div v-if="debugResult && !executing" class="debug-result">
          <!-- 汇总信息 -->
          <div class="result-summary">
            <div class="summary-item">
              <span class="summary-value tabular-nums">{{ debugResult.tokensPrompt }}</span>
              <span class="summary-label">Prompt Token</span>
            </div>
            <div class="summary-divider" />
            <div class="summary-item">
              <span class="summary-value tabular-nums">{{ debugResult.tokensCompletion }}</span>
              <span class="summary-label">Completion Token</span>
            </div>
            <div class="summary-divider" />
            <div class="summary-item">
              <span class="summary-value tabular-nums">{{ formatDuration(debugResult.durationMs) }}</span>
              <span class="summary-label">总耗时</span>
            </div>
            <div class="summary-divider" />
            <div class="summary-item">
              <span class="summary-value tabular-nums">{{ formatDuration(debugResult.durationLlmMs) }}</span>
              <span class="summary-label">LLM 耗时</span>
            </div>
            <div class="summary-divider" />
            <div class="summary-item">
              <span class="summary-value">{{ debugResult.llmModel }}</span>
              <span class="summary-label">模型</span>
            </div>
          </div>

          <!-- Tab 详情 -->
          <el-tabs v-model="resultTab" class="result-tabs">
            <!-- Prompt 渲染对比 -->
            <el-tab-pane name="prompt">
              <template #label><span class="text-12px">Prompt 渲染</span></template>
              <div class="prompt-compare">
                <div class="compare-col">
                  <div class="compare-label">原始模板</div>
                  <pre class="code-block">{{ debugResult.rawPromptTemplate || '无' }}</pre>
                </div>
                <div class="compare-col">
                  <div class="compare-label">渲染结果</div>
                  <pre class="code-block">{{ debugResult.renderedPrompt || '无' }}</pre>
                </div>
              </div>
            </el-tab-pane>

            <!-- LLM 请求体 -->
            <el-tab-pane name="request">
              <template #label><span class="text-12px">LLM 请求</span></template>
              <pre class="code-block full">{{ formatJson(debugResult.llmRequestBody) }}</pre>
            </el-tab-pane>

            <!-- LLM 响应体 -->
            <el-tab-pane name="response">
              <template #label><span class="text-12px">LLM 响应</span></template>
              <pre class="code-block full">{{ formatJson(debugResult.llmResponseBody) }}</pre>
            </el-tab-pane>

            <!-- 输出结果 -->
            <el-tab-pane name="output">
              <template #label><span class="text-12px">输出结果</span></template>
              <pre class="code-block full output-block">{{ debugResult.output || '无' }}</pre>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 调试日志查看器 -->
  <SkillDebugLogDrawer
    v-model:visible="logDrawerVisible"
    :skill-id="props.skillId"
  />
</template>

<script setup lang="ts">
import { EditPen, Document, Message, CaretRight, Loading as IconLoading, Promotion, CircleCheckFilled } from '@element-plus/icons-vue'
import { SkillAPI, type SkillParam, type SkillDebugResponse } from '@/api/ai/skill'
import SkillDebugLogDrawer from './SkillDebugLogDrawer.vue'

const visible = defineModel<boolean>('visible', { required: true })
const dialogVisible = computed({
  get: () => visible.value,
  set: (val: boolean) => { visible.value = val },
})

const props = defineProps<{ skillId: number }>()

const params = ref<SkillParam[]>([])
const executeParams = ref<Record<string, any>>({})
const userMessage = ref('')
const loadingParams = ref(false)
const executing = ref(false)
const debugResult = ref<SkillDebugResponse | null>(null)
const resultTab = ref('prompt')
const logDrawerVisible = ref(false)

// ===== 阶段动画 =====
const elapsed = ref(0)
const currentPhase = ref(0)
let timerHandle: ReturnType<typeof setInterval> | undefined
let phaseHandle: ReturnType<typeof setTimeout> | undefined

const phases = [
  { label: '渲染 Prompt', icon: EditPen },
  { label: '调用 LLM', icon: IconLoading },
  { label: '记录日志', icon: CircleCheckFilled },
]

function startTimer() {
  elapsed.value = 0
  currentPhase.value = 0
  timerHandle = setInterval(() => { elapsed.value++ }, 1000)
  phaseHandle = setTimeout(() => { currentPhase.value = 1 }, 500)
}

function stopTimer() {
  clearInterval(timerHandle)
  clearTimeout(phaseHandle)
  timerHandle = undefined
  phaseHandle = undefined
}

watch(executing, (val) => {
  if (val) {
    startTimer()
  } else {
    currentPhase.value = 2
    setTimeout(() => stopTimer(), 400)
  }
})

onBeforeUnmount(() => stopTimer())
// =====

watch(visible, async (val) => {
  if (val && props.skillId) {
    await fetchParams()
    resetParams()
  }
})

async function fetchParams() {
  loadingParams.value = true
  try {
    params.value = await SkillAPI.getParams(props.skillId) || []
  } finally { loadingParams.value = false }
}

function resetParams() {
  const data: Record<string, any> = {}
  params.value.forEach(p => {
    data[p.paramName] = p.defaultValue ?? (p.paramType === 'boolean' ? false : (p.paramType === 'number' ? 0 : ''))
  })
  executeParams.value = data
  userMessage.value = ''
  debugResult.value = null
  resultTab.value = 'prompt'
}

async function onDebug() {
  executing.value = true
  debugResult.value = null
  try {
    const input: Record<string, any> = {}
    Object.entries(executeParams.value).forEach(([k, v]) => {
      if (v !== '' && v !== undefined) input[k] = v
    })
    const res = await SkillAPI.debug(props.skillId, {
      params: input,
      userMessage: userMessage.value || undefined,
    })
    debugResult.value = res
    resultTab.value = 'prompt'
  } catch (e) {
    ElMessage.error(`调试失败: ${(e as Error).message}`)
  } finally { executing.value = false }
}

function onClosed() {
  params.value = []
  executeParams.value = {}
  userMessage.value = ''
  debugResult.value = null
  resultTab.value = 'prompt'
}

function formatDuration(ms: number): string {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatJson(obj: any): string {
  if (!obj) return '无'
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}
</script>

<style scoped>
.debug-layout {
  display: flex;
  gap: 0;
  height: 520px;
}

.debug-left {
  flex: 0 0 380px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.debug-right {
  flex: 1;
  min-width: 0;
  border-left: 1px solid var(--el-border-color-lighter);
  padding-left: 16px;
  overflow-y: auto;
}

.debug-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  background: var(--el-fill-color-lighter);
  flex-shrink: 0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
}

.card-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  max-height: 320px;
}

.param-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.param-form :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
  padding-bottom: 4px;
}

/* 结果区域 */
.debug-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}
.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.summary-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.summary-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
.summary-divider {
  width: 1px;
  height: 24px;
  background: var(--el-border-color-extra-light);
}

.result-tabs :deep(.el-tabs__header) {
  margin: 0;
}
.result-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
.result-tabs :deep(.el-tabs__content) {
  padding: 0;
}

/* Prompt 对比 */
.prompt-compare {
  display: flex;
  gap: 12px;
  height: 340px;
}
.compare-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.compare-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.code-block {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 6px;
  padding: 10px 12px;
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
  color: var(--el-text-color-primary);
}
.code-block.full {
  height: 340px;
}
.output-block {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>

<style lang="scss">
.skill-debug-dialog .el-dialog__body {
  padding: 16px 20px 20px !important;
}
</style>
