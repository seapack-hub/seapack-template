<script setup lang="ts">
import { Loading, Document, Promotion, Coin, Timer } from '@element-plus/icons-vue'
import type { SkillExecuteResult } from '@/api/ai/skill'

defineProps<{
  result: SkillExecuteResult | null
  executing: boolean
}>()
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

      <!-- 执行中 -->
      <div v-if="executing" class="flex flex-col items-center justify-center py-40 gap-[10px]">
        <el-icon class="is-loading" :size="28"><Loading /></el-icon>
        <p class="m-0 text-[13px] text-[var(--el-text-color-secondary)]">AI 生成中...</p>
      </div>

      <!-- 结果 -->
      <div v-if="result && !executing" class="flex flex-col h-full">
        <!-- 元信息 -->
        <div class="flex items-center gap-16 px-[12px] py-[6px] mb-[10px] rounded-6 bg-[var(--el-fill-color-light)] text-[12px] text-[var(--el-text-color-secondary)]">
          <span class="inline-flex items-center gap-[4px]">
            <el-icon :size="14"><Coin /></el-icon>
            Token: {{ result.tokensPrompt || '-' }} / {{ result.tokensCompletion || '-' }}
          </span>
          <span class="inline-flex items-center gap-[4px]">
            <el-icon :size="14"><Timer /></el-icon>
            耗时: {{ result.durationMs ? `${result.durationMs}ms` : '-' }}
          </span>
        </div>

        <!-- 结果文本框 -->
        <div class="flex-1 result-textarea">
          <el-input
            :model-value="result.content"
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
</style>
