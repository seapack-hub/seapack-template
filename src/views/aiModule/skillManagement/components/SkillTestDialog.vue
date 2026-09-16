<!--
  技能调试弹窗
  左侧：参数表单（根据技能参数定义动态生成）
  右侧：SSE 流式执行结果（阶段动画 + 响应展示）
-->
<template>
  <el-dialog
    v-model="visible"
    title="技能调试"
    width="1100px"
    top="5vh"
    @closed="onClosed"
  >
    <div class="skill-test-dialog__body">
      <!-- 左侧：参数表单 -->
      <div class="w-360px flex-shrink-0 flex flex-col border border-[var(--el-border-color-lighter)] rounded-8px overflow-hidden">
        <div class="flex items-center gap-6px px-16px py-12px bg-[var(--el-fill-color-lighter)] border-b border-[var(--el-border-color-lighter)]">
          <el-icon class="text-16px color-[var(--el-color-primary)]"><Setting /></el-icon>
          <span class="text-14px font-500 color-[var(--el-text-color-primary)]">测试参数</span>
          <el-tag v-if="skillParams.length" type="info" effect="plain">{{ skillParams.length }} 个</el-tag>
        </div>

        <div class="flex-1 p-16px overflow-hidden">
          <el-scrollbar max-height="380px">
            <div v-if="paramLoading" class="flex items-center justify-center py-40px">
              <el-icon class="is-loading mr-8px"><Loading /></el-icon>
              <span class="text-13px text-[var(--el-text-color-secondary)]">加载参数定义...</span>
            </div>
            <div v-else-if="skillParams.length === 0" class="py-40px">
              <el-empty description="该技能暂无参数定义" :image-size="60" />
            </div>
            <el-form v-else label-width="80px">
              <el-form-item
                v-for="p in skillParams"
                :key="p.paramName"
                :label="p.label"
                :required="p.required === 1"
              >
                <el-input
                  v-if="p.paramType === 'string'"
                  v-model="paramValues[p.paramName]"
                  :placeholder="p.placeholder || `请输入${p.label}`"
                  clearable
                />
                <el-input-number
                  v-else-if="p.paramType === 'number'"
                  v-model="paramValues[p.paramName]"
                  style="width: 100%"
                  controls-position="right"
                />
                <el-switch
                  v-else-if="p.paramType === 'boolean'"
                  v-model="paramValues[p.paramName]"
                />
                <el-select
                  v-else-if="p.paramType === 'select'"
                  v-model="paramValues[p.paramName]"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="opt in parseOptions(p.options)"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
                <JsonEditor
                  v-else-if="p.paramType === 'json'"
                  v-model="paramValues[p.paramName]"
                  height="180px"
                  mode="code"
                />
                <el-input
                  v-else-if="p.paramType === 'text'"
                  v-model="paramValues[p.paramName]"
                  type="textarea"
                  :rows="9"
                  :placeholder="p.placeholder || `请输入${p.label}`"
                  clearable
                />
                <el-input
                  v-else
                  v-model="paramValues[p.paramName]"
                  :placeholder="p.placeholder || `请输入${p.label}`"
                  clearable
                />
              </el-form-item>
            </el-form>
          </el-scrollbar>
        </div>

        <div class="flex gap-8px px-16px py-12px border-t border-[var(--el-border-color-lighter)] bg-[var(--el-bg-color)]">
          <el-button
            v-if="!testing"
            type="primary"
            :loading="testing"
            :disabled="!skill || paramLoading"
            @click="handleTest"
          >
            <el-icon v-if="!testing"><Promotion /></el-icon> 开始测试
          </el-button>
          <el-button
            v-else
            type="danger"
            @click="cancelTest"
          >
            <el-icon><VideoPause /></el-icon> 取消
          </el-button>
          <el-button :disabled="testing" @click="resetState">重置</el-button>
        </div>
      </div>

      <!-- 右侧：执行结果 -->
      <div class="flex-1 flex flex-col p-x-10px border border-solid border-l-2 border-[var(--el-border-color-lighter)] border-l-[var(--el-border-color)] rounded-8px overflow-hidden">
        <el-tabs v-model="activeTab" class="flex-1 flex flex-col overflow-hidden skill-test-dialog__tabs">
          <!-- 请求信息 Tab -->
          <el-tab-pane name="request">
            <template #label>
              <span class="inline-flex items-center gap-4px text-13px">
                <el-icon><InfoFilled /></el-icon> 请求信息
              </span>
            </template>

            <div class="flex flex-col gap-12px">
              <!-- 技能信息 -->
              <div class="border border-solid border-[var(--el-border-color-lighter)] rounded-6px overflow-hidden">
                <div class="px-12px py-6px bg-[var(--el-fill-color-light)] border-b border-[var(--el-border-color-lighter)]">
                  <span class="text-12px text-[var(--el-text-color-secondary)] font-mono">技能信息</span>
                </div>
                <div class="p-12px text-13px">
                  <div class="flex mb-6px">
                    <span class="w-80px text-[var(--el-text-color-secondary)]">名称:</span>
                    <span>{{ skill?.name || '-' }}</span>
                  </div>
                  <div class="flex mb-6px">
                    <span class="w-80px text-[var(--el-text-color-secondary)]">编码:</span>
                    <span class="font-mono">{{ skill?.code || '-' }}</span>
                  </div>
                  <div class="flex mb-6px">
                    <span class="w-80px text-[var(--el-text-color-secondary)]">端点:</span>
                    <span class="font-mono">{{ skill?.endpoint || '-' }}</span>
                  </div>
                  <div class="flex mb-6px">
                    <span class="w-80px text-[var(--el-text-color-secondary)]">类型:</span>
                    <span>{{ skill?.skillType || '-' }}</span>
                  </div>
                  <div class="flex">
                    <span class="w-80px text-[var(--el-text-color-secondary)]">输出:</span>
                    <span>{{ outputTypeLabel }}</span>
                  </div>
                </div>
              </div>

              <!-- 请求参数 -->
              <div class="border border-solid border-[var(--el-border-color-lighter)] rounded-6px overflow-hidden">
                <div class="flex justify-between items-center px-12px py-6px bg-[var(--el-fill-color-light)] border-b border-[var(--el-border-color-lighter)]">
                  <span class="text-12px text-[var(--el-text-color-secondary)] font-mono">请求参数</span>
                  <el-button link size="small" @click="copyJson(paramValues)">
                    <el-icon><CopyDocument /></el-icon> 复制
                  </el-button>
                </div>
                <pre class="m-0 px-16px py-14px text-13px font-mono whitespace-pre-wrap break-all bg-[var(--el-bg-color)] color-[var(--el-text-color-primary)] max-h-260px overflow-auto"><code>{{ JSON.stringify(paramValues, null, 2) || '{}' }}</code></pre>
              </div>
            </div>
          </el-tab-pane>
          <!-- 结果 Tab -->
          <el-tab-pane name="result">
            <template #label>
              <span class="inline-flex items-center gap-4px text-13px">
                <el-icon><Document /></el-icon> 调用结果
              </span>
            </template>

            <div class="flex flex-col gap-10px py-8px">
              <!-- 等待状态：既无阶段也无结果 -->
              <div v-if="!hasAnyPhase && !testResult && !testError" class="flex items-center justify-center h-300px">
                <div class="flex flex-col items-center justify-center py-40 text-center">
                  <el-icon :size="40" color="var(--el-color-info-light-5)" class="mb-12px"><Promotion /></el-icon>
                  <p class="m-0 text-13px text-[var(--el-text-color-secondary)] leading-relaxed max-w-220px">
                    填写参数后点击「开始测试」调用技能接口
                  </p>
                </div>
              </div>

              <!-- 执行进度：阶段时间线（测试中 + 测试完成后均展示） -->
              <div v-if="hasAnyPhase" class="border border-solid border-[var(--el-border-color-lighter)] rounded-6px overflow-hidden">
                <div class="px-12px py-6px bg-[var(--el-fill-color-light)] border-b border-[var(--el-border-color-lighter)]">
                  <span class="text-12px font-mono text-[var(--el-text-color-secondary)]">执行进度</span>
                </div>

                <div class="p-10px">
                  <!-- 计时器：测试中显示 -->
                  <div v-if="testing" class="text-center mb-16px">
                    <div class="text-24px font-300 color-[var(--el-color-primary)] tabular-nums">
                      {{ Math.floor(elapsed / 60) }}:{{ String(elapsed % 60).padStart(2, '0') }}
                    </div>
                    <div class="text-11px color-[var(--el-text-color-secondary)] mt-2px">已耗时</div>
                  </div>

                  <!-- 最终耗时：测试完成后显示 -->
                  <div v-if="!testing && testResult" class="text-center mb-16px">
                    <div class="text-14px color-[var(--el-text-color-success)]">
                      <el-icon class="mr-4px" :size="14" color="var(--el-color-success)"><CircleCheckFilled /></el-icon>
                      完成 · 耗时 {{ testResult.durationMs }}ms
                    </div>
                  </div>
                  <div v-else-if="!testing && testError" class="text-center mb-16px">
                    <div class="text-14px color-[var(--el-color-danger)]">
                      <el-icon class="mr-4px" :size="14"><CircleCloseFilled /></el-icon>
                      失败 · 耗时 {{ Math.floor(elapsed) }}s
                    </div>
                  </div>

                  <!-- 阶段列表 -->
                  <div class="flex flex-col gap-12px">
                    <div
                      v-for="(item, i) in completedPhaseItems"
                      :key="item.key"
                      class="flex items-center gap-10px"
                    >
                      <div
                        class="flex-shrink-0 w-24px h-24px rounded-full flex items-center justify-center transition-all-300"
                        :class="{
                          'bg-[var(--el-color-success-light-7)] color-[var(--el-color-success)]': item.done,
                          'bg-[var(--el-color-primary)] color-white': !item.done,
                          'bg-[var(--el-color-info-light-8)] color-[var(--el-color-info)]': item.pending,
                        }"
                      >
                        <el-icon v-if="item.done" :size="14"><CircleCheckFilled /></el-icon>
                        <el-icon v-else-if="!item.done && !item.pending" :size="14" class="is-loading"><Loading /></el-icon>
                        <span v-else class="text-11px">{{ i + 1 }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span
                          class="text-13px"
                          :class="{
                            'color-[var(--el-color-success)] font-500': item.done,
                            'color-[var(--el-color-primary)] font-600': !item.done && !item.pending,
                            'color-[var(--el-text-color-secondary)]': item.pending,
                          }"
                        >{{ item.label }}</span>
                        <span v-if="item.message" class="text-11px color-[var(--el-text-color-secondary)]">{{ item.message }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 调用结果 -->
              <div v-if="testResult" class="border border-solid border-[var(--el-border-color-lighter)] rounded-6px overflow-hidden">
                <div class="flex justify-between items-center px-12px py-6px bg-[var(--el-fill-color-light)] border-b border-[var(--el-border-color-lighter)]">
                  <span class="text-12px font-mono">
                    <!-- HTTP 类型：状态码 + 方法 + URL -->
                    <template v-if="isHttpResult && testResult.httpMethod">
                      <el-tag :type="testResult.statusCode >= 200 && testResult.statusCode < 300 ? 'success' : 'danger'" size="small" effect="light" class="mr-6px">
                        {{ testResult.statusCode }}
                      </el-tag>
                      <span class="text-[var(--el-text-color-secondary)]">{{ testResult.httpMethod }} {{ testResult.url }}</span>
                    </template>
                    <!-- 非 HTTP 类型：输出类型标签 -->
                    <template v-else>
                      <el-tag size="small" effect="light" class="mr-6px">{{ outputTypeLabel }}</el-tag>
                      <span class="text-[var(--el-text-color-secondary)]">{{ skill?.name || skill?.code }}</span>
                    </template>
                  </span>
                  <el-button link size="small" @click="copyJson(testResult.body)">
                    <el-icon><CopyDocument /></el-icon> 复制
                  </el-button>
                </div>
                <!-- JSON 输出：JsonEditor 树形只读展示 -->
                <div v-if="testResult.outputType === 'json'" style="max-height: 260px; overflow: auto;">
                  <JsonEditor :model-value="testResult.body" mode="tree" :read-only="true" height="245px" />
                </div>
                <!-- Markdown / 流式文本：MarkdownRenderer 渲染 -->
                <div v-else-if="testResult.outputType === 'markdown' || testResult.outputType === 'stream_text'" class="px-16px py-14px max-h-260px overflow-auto">
                  <MarkdownRenderer :content="formattedBody" />
                </div>
                <!-- 文件下载类型 -->
                <div v-else-if="testResult.outputType === 'file'" class="p-16px">
                  <div v-if="fileInfo" class="flex items-center gap-12px p-16px border border-dashed border-[var(--el-border-color)] rounded-6px bg-[var(--el-fill-color-lighter)]">
                    <el-icon :size="32" color="var(--el-color-primary)"><Document /></el-icon>
                    <div class="flex-1">
                      <div class="text-13px font-500">{{ fileInfo.fileName }}</div>
                      <div v-if="fileInfo.fileSize > 0" class="text-12px text-[var(--el-text-color-secondary)] mt-2px">{{ formatFileSize(fileInfo.fileSize) }}</div>
                    </div>
                    <el-button type="primary" size="small" tag="a" :href="fileInfo.url" target="_blank">
                      <el-icon class="mr-4px"><Download /></el-icon>下载
                    </el-button>
                  </div>
                </div>
                <!-- 兜底：其他类型 -->
                <div v-else class="p-16px">
                  <pre class="m-0 px-16px py-14px text-13px font-mono whitespace-pre-wrap break-all bg-[var(--el-bg-color)] color-[var(--el-text-color-primary)] max-h-260px overflow-auto"><code>{{ formattedBody }}</code></pre>
                </div>
              </div>

              <!-- 错误展示 -->
              <div v-if="testError">
                <el-alert :title="testError.message" type="error" show-icon :closable="false" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 调用信息栏 -->
        <transition name="el-fade-in">
          <div v-if="testResult" class="flex items-center gap-12px px-16px py-10px bg-[var(--el-fill-color-lighter)] border-t border-[var(--el-border-color-lighter)]">
            <div v-if="isHttpResult && testResult.statusCode" class="flex flex-col items-center gap-2px">
              <span class="text-11px text-[var(--el-text-color-secondary)]">状态码</span>
              <span class="text-14px font-600 font-mono" :class="testResult.statusCode >= 200 && testResult.statusCode < 300 ? 'color-[var(--el-color-success)]' : 'color-[var(--el-color-danger)]'">{{ testResult.statusCode }}</span>
            </div>
            <el-divider v-if="isHttpResult && testResult.statusCode" direction="vertical" />
            <div v-if="isHttpResult && testResult.httpMethod" class="flex flex-col items-center gap-2px">
              <span class="text-11px text-[var(--el-text-color-secondary)]">请求方式</span>
              <span class="text-14px font-600 color-[var(--el-color-primary)] font-mono">{{ testResult.httpMethod }}</span>
            </div>
            <el-divider v-if="isHttpResult && testResult.httpMethod" direction="vertical" />
            <div class="flex flex-col items-center gap-2px">
              <span class="text-11px text-[var(--el-text-color-secondary)]">输出类型</span>
              <span class="text-14px font-600 color-[var(--el-color-primary)] font-mono">{{ outputTypeLabel }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="flex flex-col items-center gap-2px">
              <span class="text-11px text-[var(--el-text-color-secondary)]">耗时</span>
              <span class="text-14px font-600 color-[var(--el-color-primary)] font-mono">{{ testResult.durationMs }}ms</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { CopyDocument, Setting, Promotion, Document, InfoFilled, CircleCheckFilled, CircleCloseFilled, Loading, VideoPause, Download } from '@element-plus/icons-vue'
import { useSkillTest } from '../utils/useSkillTest'
import { OUTPUT_TYPE_OPTIONS } from '../utils/moduleOptions'
import { SkillAPI } from '@/api/ai/skill'
import type { Skill } from '@/api/ai/skill'
import JsonEditor from '@/components/JsonEditor/index.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer.vue'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  skill: Skill | null
}>()

const {
  testing,
  currentPhase,
  testResult,
  testError,
  phases,
  skillParams,
  paramLoading,
  paramValues,
  loadParams,
  validateParams,
  cancelTest,
  resetState,
} = useSkillTest()

const activeTab = ref('request')

// ===== 阶段动画 =====
const elapsed = ref(0)
let timerHandle: ReturnType<typeof setInterval> | undefined

const phaseDefinitions = [
  { key: 'loading', label: '加载技能配置' },
  { key: 'calling', label: '调用接口' },
  { key: 'complete', label: '完成' },
]

/** 每个阶段收到的消息记录 */
const phaseHistory = ref<Record<string, string>>({})

/** 是否有任何阶段记录（用于控制 Tab 内容展示） */
const hasAnyPhase = computed(() => Object.keys(phaseHistory.value).length > 0)

/** 完整的阶段列表，含状态与消息 */
const completedPhaseItems = computed(() => {
  const activeIdx = currentPhase.value ? phaseDefinitions.findIndex(p => p.key === currentPhase.value!.phase) : -1
  const isFinished = !testing.value && (!!testResult.value || !!testError.value)
  return phaseDefinitions.map((def, i) => {
    const isCurrent = i === activeIdx
    // 测试结束后：所有阶段（含完成）都标记 done
    const done = isFinished
      ? (i <= activeIdx || !!phaseHistory.value[def.key] || def.key === 'complete')
      : (i < activeIdx || (activeIdx >= 0 && i > activeIdx && !!phaseHistory.value[def.key]))
    return {
      key: def.key,
      label: def.label,
      done,
      pending: !isFinished && i > activeIdx && !phaseHistory.value[def.key],
      message: phaseHistory.value[def.key] || (isCurrent && testing.value ? (currentPhase.value?.message || '') : ''),
    }
  })
})

// ===== 结果类型相关 =====
const isHttpResult = computed(() => props.skill?.skillType === 'http')
const outputTypeLabel = computed(() => {
  const t = testResult.value?.outputType
  return OUTPUT_TYPE_OPTIONS.find(o => o.value === t)?.label || t || '-'
})

/** 从 body 中提取文件信息（支持 string URL 或 {url, fileName, fileSize} 对象） */
const fileInfo = computed(() => {
  const body = testResult.value?.body
  if (!body) return null
  if (typeof body === 'string') {
    return { url: body, fileName: body.split('/').pop() || '文件', fileSize: 0 }
  }
  if (typeof body === 'object' && body.url) {
    return { url: body.url, fileName: body.fileName || '文件', fileSize: body.fileSize || 0 }
  }
  return null
})

/** 格式化文件大小 */
function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formattedBody = computed(() => {
  if (!testResult.value?.body) return '无响应数据'
  const outputType = testResult.value?.outputType || 'json'
  if (outputType === 'json') {
    try {
      return JSON.stringify(testResult.value.body, null, 2)
    } catch {
      return String(testResult.value.body)
    }
  }
  // stream_text / markdown / file 等类型直接展示原始内容
  return typeof testResult.value.body === 'string'
    ? testResult.value.body
    : JSON.stringify(testResult.value.body, null, 2)
})

// ===== 参数解析 =====
function parseOptions(options: any): { label: string; value: string }[] {
  if (!options) return []
  if (Array.isArray(options)) return options
  if (typeof options === 'string') {
    try { return JSON.parse(options) } catch { return [] }
  }
  return []
}

// ===== 操作 =====
function handleTest() {
  if (!props.skill) return
  if (testing.value) return

  // 直接在组件层管理 testing 状态，不依赖 async promise 生命周期
  testing.value = true
  currentPhase.value = null
  testResult.value = null
  testError.value = null
  phases.value = []
  phaseHistory.value = {}
  elapsed.value = 0
  timerHandle = setInterval(() => { elapsed.value++ }, 1000)
  activeTab.value = 'result' // 开始测试时切换到结果 Tab

  // 先校验参数
  if (!validateParams()) {
    stopTest()
    return
  }

  // 调用 SSE 流式接口，在回调中直接管理状态
  SkillAPI.testSkillStream(
    props.skill.id!,
    paramValues.value,
    (event: { type: string; [key: string]: any }) => {
      switch (event.type) {
        case 'phase': {
          currentPhase.value = { phase: event.phase, message: event.message }
          // 记录阶段消息历史
          phaseHistory.value[event.phase] = event.message
          if (!phases.value.includes(event.phase)) {
            phases.value.push(event.phase)
          }
          break
        }
        case 'result': {
          testResult.value = {
            outputType: event.outputType || props.skill?.outputType || 'json',
            statusCode: event.statusCode,
            httpMethod: event.httpMethod,
            url: event.url,
            durationMs: event.durationMs,
            body: event.body,
          }
          // 标记完成阶段
          currentPhase.value = { phase: 'complete', message: '执行成功' }
          phaseHistory.value['complete'] = '执行成功'
          // 收到结果后立即停止（不等待 async promise）
          stopTest()
          break
        }
        case 'error': {
          testError.value = { message: event.message }
          stopTest()
          break
        }
      }
    },
  ).catch((err: any) => {
    if (err?.name !== 'AbortError') {
      testError.value = { message: err?.message || '请求异常' }
    }
    stopTest()
  })
}

/** 停止测试：清理计时器 + 重置 testing 状态 */
function stopTest() {
  clearInterval(timerHandle)
  timerHandle = undefined
  testing.value = false
}

async function copyJson(data: any) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// ===== 监听弹窗打开 =====
watch(visible, (val) => {
  if (val && props.skill) {
    loadParams(props.skill)
    // 保持在请求信息 Tab，不自动切换
  }
})

function onClosed() {
  cancelTest()
  resetState()
  phaseHistory.value = {}
  clearInterval(timerHandle)
  timerHandle = undefined
}

onBeforeUnmount(() => {
  clearInterval(timerHandle)
})
</script>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
.skill-test-dialog__body {
  display: flex;
  gap: 16px;
  height: 660px;
}
.skill-test-dialog__tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.skill-test-dialog__tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
}
</style>
