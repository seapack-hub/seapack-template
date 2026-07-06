<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { Loading, Document, Promotion, Coin, Timer, CircleCheckFilled, Connection } from '@element-plus/icons-vue'

const props = defineProps<{
  result: AiExecuteResult | null
  executing: boolean
}>()

const elapsed = ref(0)
const currentPhase = ref(0)
let timerHandle: ReturnType<typeof setInterval> | undefined
let phaseHandle: ReturnType<typeof setTimeout> | undefined

const phases = [
  { label: '连接 AI 服务', icon: Connection },
  { label: 'AI 生成中', icon: Loading },
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

watch(() => props.executing, (val) => {
  if (val) {
    startTimer()
  } else {
    currentPhase.value = 2
    setTimeout(() => stopTimer(), 400)
  }
})

onUnmounted(() => stopTimer())
</script>

<template>
  <div class="flex-1 flex flex-col min-w-0 border border-solid border-[var(--el-border-color-lighter)] rounded-8 bg-white">
    <!-- 标题栏 -->
    <div class="flex items-center gap-[6px] px-16 py-[10px] border-b border-[var(--el-border-color-extra-light)] bg-[var(--el-fill-color-lighter)]">
      <el-icon color="var(--el-color-primary)" :size="16"><Document /></el-icon>
      <span class="text-[14px] font-600">执行结果</span>
    </div>

    <!-- 内容区 -->
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
            :class="{
              'opacity-40': i > currentPhase,
            }"
          >
            <!-- 状态图标 -->
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

            <!-- 标签 -->
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

        <!-- 底部提示 -->
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
</template>

<style scoped>
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
