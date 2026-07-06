<!--
  提示词预览/测试弹框
  左侧：变量表单 + 用户补充消息
  右侧：渲染后的完整 Prompt + LLM 调用结果（含执行阶段动画）
-->
<template>
  <el-dialog
    v-model="visible"
    title="模板预览与测试"
    width="1100px"
    top="5vh"
    @closed="onClosed"
  >
    <div class="preview-container">
      <!-- 左侧：变量表单 -->
      <div class="preview-left">
        <div class="section-header">
          <el-icon class="section-icon"><EditPen /></el-icon>
          <span class="section-title">填写变量</span>
          <el-tag v-if="variables.length" type="info" effect="plain">{{ variables.length }} 个</el-tag>
        </div>

        <div class="var-form-wrapper">
          <el-scrollbar max-height="380px">
            <el-form label-width="80px">
              <div v-if="variables.length === 0" class="empty-vars">
                <el-empty description="该模板暂无变量" :image-size="60" />
              </div>
              <el-form-item
                v-for="v in variables"
                :key="v.varName"
                :label="v.label"
                :required="v.required === 1"
              >
                <el-input
                  v-if="v.varType === 'string' || v.varType === 'date'"
                  v-model="varValues[v.varName]"
                  :placeholder="v.placeholder || `请输入${v.label}`"
                  clearable
                />
                <el-input-number
                  v-else-if="v.varType === 'number'"
                  v-model="varValues[v.varName]"
                  style="width: 100%"
                />
                <el-switch
                  v-else-if="v.varType === 'boolean'"
                  v-model="varValues[v.varName]"
                />
                <el-select
                  v-else-if="v.varType === 'select'"
                  v-model="varValues[v.varName]"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in v.options || []"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="补充消息">
                <el-input
                  v-model="userMessage"
                  type="textarea"
                  :rows="3"
                  placeholder="可选，附加在提示词之后"
                />
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </div>

        <div class="action-bar">
          <el-button type="primary" :loading="previewing" :disabled="calling" @click="handlePreview">
            <el-icon v-if="!previewing"><View /></el-icon> 预览渲染
          </el-button>
          <el-button type="success" :loading="calling" :disabled="previewing" @click="handleCallLLM">
            <el-icon v-if="!calling"><Promotion /></el-icon> 调用 LLM
          </el-button>
        </div>
      </div>

      <!-- 右侧：渲染结果 + LLM 输出 -->
      <div class="preview-right">
        <el-tabs v-model="activeTab" class="result-tabs">
          <el-tab-pane name="prompt">
            <template #label>
              <span class="tab-label">
                <el-icon><Document /></el-icon> 渲染后的 Prompt
              </span>
            </template>
            <div class="code-block">
              <div class="code-block-header">
                <span class="code-lang">Prompt</span>
                <el-button link size="small" :disabled="!renderedPrompt" @click="copyText(renderedPrompt)">
                  <el-icon><CopyDocument /></el-icon> 复制
                </el-button>
              </div>
              <pre class="code-content"><code>{{ renderedPrompt || '点击「预览渲染」查看完整提示词' }}</code></pre>
            </div>
          </el-tab-pane>
          <el-tab-pane name="output">
            <template #label>
              <span class="tab-label">
                <el-icon><ChatDotRound /></el-icon> LLM 输出
              </span>
            </template>

            <!-- 等待状态 -->
            <div v-if="!llmOutput && !calling" class="empty-output">
              <div class="flex flex-col items-center justify-center py-40 text-center">
                <el-icon :size="40" color="var(--el-color-info-light-5)" class="mb-[12px]"><Promotion /></el-icon>
                <p class="m-0 text-[13px] text-[var(--el-text-color-secondary)] leading-relaxed max-w-[220px]">
                  填写变量后点击「调用 LLM」查看生成结果
                </p>
              </div>
            </div>

            <!-- 执行中：阶段状态 -->
            <div v-if="calling" class="executing-panel">
              <!-- 计时器 -->
              <div class="text-center mb-[20px]">
                <div class="text-[32px] font-300 color-[var(--el-color-primary)] tabular-nums">
                  {{ Math.floor(elapsed / 60) }}:{{ String(elapsed % 60).padStart(2, '0') }}
                </div>
                <div class="text-[12px] color-[var(--el-text-color-secondary)] mt-[4px]">已耗时</div>
              </div>

              <!-- 阶段时间线 -->
              <div class="flex flex-col gap-[16px] px-[24px]">
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

              <p class="text-center text-[12px] text-[var(--el-text-color-secondary)] m-0 mt-[20px]">
                AI 生成通常需要 10~60 秒，请耐心等待
              </p>
            </div>

            <!-- 结果 -->
            <div v-if="llmOutput && !calling" class="result-panel">
              <div class="code-block">
                <div class="code-block-header">
                  <span class="code-lang">Output</span>
                  <el-button link size="small" @click="copyText(llmOutput)">
                    <el-icon><CopyDocument /></el-icon> 复制
                  </el-button>
                </div>
                <pre class="code-content"><code>{{ llmOutput }}</code></pre>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 调用信息 -->
        <transition name="el-fade-in">
          <div v-if="callInfo" class="call-info-bar">
            <div class="info-item">
              <span class="info-label">耗时</span>
              <span class="info-value">{{ callInfo.durationMs }}ms</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">输入 Token</span>
              <span class="info-value">{{ callInfo.tokensPrompt }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="info-item">
              <span class="info-label">输出 Token</span>
              <span class="info-value">{{ callInfo.tokensCompletion }}</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { EditPen, View, Promotion, Document, ChatDotRound, CopyDocument, Loading as IconLoading, CircleCheckFilled, Connection } from '@element-plus/icons-vue'
import { PromptTemplateAPI, type PromptTemplate, type TemplateVariable } from '@/api/ai/promptTemplate'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  template: PromptTemplate | null
}>()

/** 解析 options（可能是 JSON 字符串或数组） */
function parseOptions(options: any): { label: string; value: string }[] {
  if (!options) return []
  if (Array.isArray(options)) return options
  if (typeof options === 'string') {
    try { return JSON.parse(options) } catch { return [] }
  }
  return []
}

const variables = computed<TemplateVariable[]>(() => {
  const vars = props.template?.variables || []
  return vars.map(v => ({ ...v, options: parseOptions(v.options) }))
})
const varValues = ref<Record<string, any>>({})
const userMessage = ref('')
const renderedPrompt = ref('')
const llmOutput = ref('')
const activeTab = ref('prompt')
const previewing = ref(false)
const calling = ref(false)
const callInfo = ref<{ durationMs: number; tokensPrompt: number; tokensCompletion: number } | null>(null)

// ===== 执行阶段动画 =====
const elapsed = ref(0)
const currentPhase = ref(0)
let timerHandle: ReturnType<typeof setInterval> | undefined
let phaseHandle: ReturnType<typeof setTimeout> | undefined

const phases = [
  { label: '连接 AI 服务', icon: Connection },
  { label: 'AI 生成中', icon: IconLoading },
  { label: '处理结果', icon: CircleCheckFilled },
]

function startPhases() {
  elapsed.value = 0
  currentPhase.value = 0
  timerHandle = setInterval(() => { elapsed.value++ }, 1000)
  phaseHandle = setTimeout(() => { currentPhase.value = 1 }, 800)
}

function stopPhases() {
  currentPhase.value = 2
  setTimeout(() => {
    clearInterval(timerHandle)
    clearTimeout(phaseHandle)
    timerHandle = undefined
    phaseHandle = undefined
  }, 400)
}

onBeforeUnmount(() => {
  clearInterval(timerHandle)
  clearTimeout(phaseHandle)
})

/** 监听弹窗打开，初始化变量默认值 */
watch(visible, (val) => {
  if (val && props.template) {
    const defaults: Record<string, any> = {}
    variables.value.forEach(v => {
      defaults[v.varName] = v.defaultValue || ''
    })
    varValues.value = defaults
    renderedPrompt.value = ''
    llmOutput.value = ''
    callInfo.value = null
    activeTab.value = 'prompt'
  }
})

/** 渲染模板（变量替换） */
function renderTemplate(content: string, values: Record<string, any>): string {
  let result = content
  for (const [key, val] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val ?? '')
  }
  return result
}

/** 预览渲染（不调用 LLM，只做变量替换） */
async function handlePreview() {
  if (!props.template?.content) {
    ElMessage.warning('模板内容为空')
    return
  }
  previewing.value = true
  try {
    renderedPrompt.value = renderTemplate(props.template.content, varValues.value)
    activeTab.value = 'prompt'
  } finally {
    previewing.value = false
  }
}

/** 调用 LLM 测试 */
async function handleCallLLM() {
  if (!props.template?.id) {
    ElMessage.warning('模板 ID 不存在')
    return
  }
  calling.value = true
  callInfo.value = null
  llmOutput.value = ''
  activeTab.value = 'output'
  startPhases()
  try {
    const res = await PromptTemplateAPI.preview({
      templateId: props.template.id,
      params: varValues.value,
      userMessage: userMessage.value || undefined,
    })
    renderedPrompt.value = res.renderedPrompt || ''
    llmOutput.value = res.output || ''
    callInfo.value = {
      durationMs: res.durationMs,
      tokensPrompt: res.tokensPrompt,
      tokensCompletion: res.tokensCompletion,
    }
  } catch {
    ElMessage.error('LLM 调用失败')
  } finally {
    stopPhases()
    calling.value = false
  }
}

/** 复制文本到剪贴板 */
async function copyText(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

function onClosed() {
  renderedPrompt.value = ''
  llmOutput.value = ''
  callInfo.value = null
  clearInterval(timerHandle)
  clearTimeout(phaseHandle)
  timerHandle = undefined
  phaseHandle = undefined
}
</script>

<style scoped>
.preview-container {
  display: flex;
  gap: 16px;
  min-height: 520px;
}

/* ===== 左侧面板 ===== */
.preview-left {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section-icon {
  font-size: 16px;
  color: var(--el-color-primary);
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.var-form-wrapper {
  flex: 1;
  padding: 16px;
  overflow: hidden;
}

.empty-vars {
  padding: 40px 0;
}

.action-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

/* ===== 右侧面板 ===== */
.preview-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.result-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.result-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.result-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: auto;
  padding: 12px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

/* ===== 代码块 ===== */
.code-block {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.code-lang {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: 'Fira Code', Consolas, monospace;
}

.code-content {
  margin: 0;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.8;
  font-family: 'Fira Code', Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  max-height: 400px;
  overflow: auto;
}

.empty-output {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

/* ===== 执行中面板 ===== */
.executing-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 300px;
  padding: 20px 0;
}

.result-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ===== 调用信息栏 ===== */
.call-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--el-fill-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.info-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-color-primary);
  font-family: 'Fira Code', Consolas, monospace;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
