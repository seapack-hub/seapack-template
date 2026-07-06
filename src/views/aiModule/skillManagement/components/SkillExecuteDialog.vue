<!--
  技能执行测试弹窗

  参考 AiSkillExecutor 的卡片式双栏布局：
  - 左侧：参数表单 + 补充指令
  - 右侧：执行结果（含阶段动画）
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="技能执行测试"
    width="1050px"
    :close-on-click-modal="false"
    class="skill-execute-dialog"
    @closed="onClosed"
  >
    <div v-loading="loadingParams" class="flex gap-0">
      <!-- 左：参数表单 + 补充指令 -->
      <div class="flex-1 flex flex-col min-w-0 gap-[10px]">
        <!-- 参数卡片 -->
        <div class="flex-1 flex flex-col min-w-0 border border-solid border-[var(--el-border-color-lighter)] rounded-8 bg-white">
          <div class="flex items-center gap-[6px] px-16 py-[10px] border-b border-[var(--el-border-color-extra-light)] bg-[var(--el-fill-color-lighter)] rounded-t-8">
            <el-icon color="var(--el-color-primary)" :size="16"><EditPen /></el-icon>
            <span class="text-[14px] font-600">输入参数</span>
          </div>
          <div class="flex-1 overflow-y-auto px-16 py-12 max-h-[420px]">
            <!-- 有参数 -->
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

              <div class="flex gap-[10px] pt-[10px] border-t border-[var(--el-border-color-extra-light)]">
                <el-button type="primary" :loading="executing" @click="onExecute">
                  <el-icon><CaretRight /></el-icon>执行
                </el-button>
                <el-button :disabled="executing" @click="resetParams">重置</el-button>
              </div>
            </el-form>

            <!-- 无参数 -->
            <div v-else class="flex flex-col items-center justify-center py-[20px] gap-[12px]">
              <el-empty description="该技能未定义输入参数" :image-size="60" />
              <el-button type="primary" :loading="executing" @click="onExecute">
                <el-icon><CaretRight /></el-icon>执行
              </el-button>
            </div>
          </div>
        </div>

        <!-- 补充指令 -->
        <div class="flex-shrink-0 border border-solid border-[var(--el-border-color-lighter)] rounded-8 bg-white">
          <div class="flex items-center gap-[6px] px-16 py-[10px] border-b border-[var(--el-border-color-extra-light)] bg-[var(--el-fill-color-lighter)] rounded-t-8">
            <el-icon color="var(--el-color-primary)" :size="16"><Message /></el-icon>
            <span class="text-[14px] font-600">补充指令</span>
          </div>
          <div class="px-16 py-12">
            <el-input
              v-model="userMessage"
              type="textarea"
              :rows="3"
              placeholder="可选：输入额外指令或补充说明..."
              :disabled="executing"
            />
          </div>
        </div>
      </div>

      <!-- 分隔竖线 -->
      <div class="flex-shrink-0 w-[1px] mx-[18px] bg-[var(--el-border-color-lighter)] self-stretch" />

      <!-- 右：执行结果 -->
      <div class="flex-1 flex flex-col min-w-0 border border-solid border-[var(--el-border-color-lighter)] rounded-8 bg-white">
        <div class="flex items-center gap-[6px] px-16 py-[10px] border-b border-[var(--el-border-color-extra-light)] bg-[var(--el-fill-color-lighter)] rounded-t-8">
          <el-icon color="var(--el-color-primary)" :size="16"><Document /></el-icon>
          <span class="text-[14px] font-600">执行结果</span>
        </div>
        <div class="flex-1 overflow-y-auto px-16 py-12 max-h-[420px]">
          <!-- 等待状态 -->
          <div v-if="!result && !executing" class="flex flex-col items-center justify-center py-40 text-center">
            <el-icon :size="40" color="var(--el-color-info-light-5)" class="mb-[12px]"><Promotion /></el-icon>
            <p class="m-0 text-[13px] text-[var(--el-text-color-secondary)] leading-relaxed max-w-[220px]">
              填写参数后点击"执行"查看 AI 生成结果
            </p>
          </div>

          <!-- 执行中：阶段状态 -->
          <div v-if="executing" class="flex flex-col gap-[20px] py-[24px]">
            <!-- 计时器 -->
            <div class="text-center">
              <div class="text-[28px] font-300 color-[var(--el-color-primary)] tabular-nums">
                {{ Math.floor(elapsed / 60) }}:{{ String(elapsed % 60).padStart(2, '0') }}
              </div>
              <div class="text-[12px] color-[var(--el-text-color-secondary)] mt-[4px]">已耗时</div>
            </div>

            <!-- 阶段时间线 -->
            <div class="flex flex-col gap-[16px] px-[16px]">
              <div
                v-for="(phase, i) in phases"
                :key="i"
                class="flex items-center gap-[12px]"
                :class="{ 'opacity-40': i > currentPhase }"
              >
                <div
                  class="flex-shrink-0 w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all-300"
                  :class="{
                    'bg-[var(--el-color-primary)] color-white': i === currentPhase,
                    'bg-[var(--el-color-success-light-7)] color-[var(--el-color-success)]': i < currentPhase,
                    'bg-[var(--el-color-info-light-8)] color-[var(--el-color-info)]': i > currentPhase,
                  }"
                >
                  <el-icon v-if="i < currentPhase" :size="16"><CircleCheckFilled /></el-icon>
                  <el-icon v-else-if="i === currentPhase" :size="16" :class="{ 'is-loading': i === 1 }"><component :is="phase.icon" /></el-icon>
                  <span v-else class="text-[12px]">{{ i + 1 }}</span>
                </div>
                <span
                  class="text-[14px]"
                  :class="{
                    'font-600 color-[var(--el-color-primary)]': i === currentPhase,
                    'color-[var(--el-color-success)]': i < currentPhase,
                    'color-[var(--el-text-color-secondary)]': i > currentPhase,
                  }"
                >{{ phase.label }}</span>
              </div>
            </div>

            <p class="text-center text-[12px] text-[var(--el-text-color-secondary)] m-0">
              AI 生成通常需要 10~60 秒，请耐心等待
            </p>
          </div>

          <!-- 结果 -->
          <div v-if="result && !executing" class="flex flex-col h-full">
            <!-- 元信息 -->
            <div class="flex items-center gap-16 px-[12px] py-[6px] mb-[10px] rounded-6 bg-[var(--el-fill-color-light)] text-[12px] text-[var(--el-text-color-secondary)]">
              <span class="inline-flex items-center gap-[4px]">
                <el-icon :size="14"><Coin /></el-icon>
                Token: {{ result.tokensPrompt }} / {{ result.tokensCompletion }}
              </span>
              <span class="inline-flex items-center gap-[4px]">
                <el-icon :size="14"><Timer /></el-icon>
                耗时: {{ result.durationMs }}ms
              </span>
              <span v-if="result.logId" class="inline-flex items-center gap-[4px]">
                日志: #{{ result.logId }}
              </span>
            </div>

            <!-- 结果文本框 -->
            <div class="flex-1 result-textarea">
              <el-input
                :model-value="result.output"
                type="textarea"
                :rows="14"
                readonly
                :autosize="{ minRows: 8, maxRows: 22 }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { EditPen, Document, Message, CaretRight, Loading as IconLoading, Promotion, CircleCheckFilled, Coin, Timer, Connection } from '@element-plus/icons-vue'
import { SkillAPI, type SkillParam } from '@/api/ai/skill'

const visible = defineModel<boolean>('visible', { required: true })
const dialogVisible = computed({
  get: () => visible.value,
  set: (val: boolean) => { visible.value = val },
})

const props = defineProps<{ skillId: number }>()

const params = ref<SkillParam[]>([])
const executeParams = ref<Record<string, any>>({})
const userMessage = ref('')
const result = ref<AiExecuteResult | null>(null)
const loadingParams = ref(false)
const executing = ref(false)

// ===== 阶段动画 =====
const elapsed = ref(0)
const currentPhase = ref(0)
let timerHandle: ReturnType<typeof setInterval> | undefined
let phaseHandle: ReturnType<typeof setTimeout> | undefined

const phases = [
  { label: '连接 AI 服务', icon: Connection },
  { label: 'AI 生成中', icon: IconLoading },
  { label: '处理结果', icon: CircleCheckFilled },
]

function startTimer() {
  elapsed.value = 0
  currentPhase.value = 0
  timerHandle = setInterval(() => { elapsed.value++ }, 1000)
  phaseHandle = setTimeout(() => { currentPhase.value = 1 }, 800)
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
  result.value = null
}

async function onExecute() {
  executing.value = true
  result.value = null
  try {
    const input: Record<string, any> = {}
    Object.entries(executeParams.value).forEach(([k, v]) => {
      if (v !== '' && v !== undefined) input[k] = v
    })
    const res = await SkillAPI.execute(props.skillId, {
      params: input,
      userMessage: userMessage.value || undefined,
    })
    result.value = res
  } catch (e) {
    result.value = {
      renderedPrompt: '',
      output: `执行失败: ${(e as Error).message}`,
      tokensPrompt: 0,
      tokensCompletion: 0,
      durationMs: 0,
    }
  } finally { executing.value = false }
}

function onClosed() {
  params.value = []
  executeParams.value = {}
  userMessage.value = ''
  result.value = null
}
</script>

<style scoped>
.param-form :deep(.el-form-item) {
  margin-bottom: 16px;
}
.param-form :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
  padding-bottom: 4px;
}
.result-textarea :deep(.el-textarea) {
  height: 100%;
}
.result-textarea :deep(.el-textarea__inner) {
  height: 100% !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  border-radius: 6px;
  resize: none;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>

<!-- el-dialog Teleport 到 body，必须用非 scoped 样式才能命中 -->
<style lang="scss">
.skill-execute-dialog .el-dialog__body {
  padding: 16px 20px 20px !important;
}
</style>
