<!--
  Agent 链路追踪详情组件
  可视化展示完整调用链路：提示词组装 → 知识库检索 → 技能调用 → LLM 调用
-->
<template>
  <div class="trace-detail">
    <!-- 空状态 -->
    <div v-if="!snapshot" class="flex flex-col items-center justify-center py-40 text-center">
      <el-icon :size="48" color="var(--el-color-info-light-5)"><Connection /></el-icon>
      <p class="mt-12px text-13px text-[var(--el-text-color-secondary)]">
        发送消息后将在此展示完整调用链路
      </p>
    </div>

    <!-- 有追踪数据 -->
    <div v-else class="trace-content">
      <!-- 汇总信息 -->
      <div class="trace-summary">
        <div class="summary-item">
          <span class="summary-value tabular-nums">{{ formatDuration(snapshot.totalDurationMs) }}</span>
          <span class="summary-label">总耗时</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-value tabular-nums">{{ snapshot.totalTokens?.prompt || 0 }}</span>
          <span class="summary-label">Prompt Token</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-value tabular-nums">{{ snapshot.totalTokens?.completion || 0 }}</span>
          <span class="summary-label">Completion Token</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-item">
          <span class="summary-value tabular-nums">{{ snapshot.steps?.length || 0 }}</span>
          <span class="summary-label">执行步骤</span>
        </div>
      </div>

      <!-- 步骤时间线 -->
      <div class="trace-timeline">
        <div
          v-for="(step, idx) in snapshot.steps"
          :key="idx"
          class="trace-step"
          :class="[`step-${step.status}`]"
        >
          <!-- 时间线连接线 -->
          <div class="step-line">
            <div
              class="step-dot"
              :class="[`dot-${step.status}`]"
            >
              <el-icon v-if="step.status === 'success'" :size="14"><CircleCheckFilled /></el-icon>
              <el-icon v-else-if="step.status === 'fail'" :size="14"><CircleCloseFilled /></el-icon>
              <el-icon v-else-if="step.status === 'skip'" :size="14"><RemoveFilled /></el-icon>
              <span v-else class="text-11px font-600">{{ step.stepIndex }}</span>
            </div>
            <div v-if="idx < (snapshot.steps?.length || 0) - 1" class="step-connector" />
          </div>

          <!-- 步骤内容 -->
          <div class="step-body" @click="toggleExpand(idx)">
            <div class="step-header">
              <div class="flex items-center gap-8px flex-1 min-w-0">
                <el-tag :type="getStepTypeTag(step.stepType)" size="small" effect="plain" class="flex-shrink-0">
                  {{ getStepTypeLabel(step.stepType) }}
                </el-tag>
                <span class="text-14px font-600 color-[var(--el-text-color-primary)] truncate">{{ step.stepName }}</span>
              </div>
              <div class="flex items-center gap-8px">
                <el-tag :type="step.status === 'success' ? 'success' : step.status === 'fail' ? 'danger' : 'info'" size="small">
                  {{ step.status === 'success' ? '成功' : step.status === 'fail' ? '失败' : '跳过' }}
                </el-tag>
                <span class="text-12px text-[var(--el-text-color-secondary)] tabular-nums">{{ formatDuration(step.durationMs) }}</span>
                <el-icon class="expand-icon" :class="{ 'is-expanded': expandedSteps.has(idx) }"><ArrowDown /></el-icon>
              </div>
            </div>

            <!-- 展开详情 -->
            <Transition name="expand">
              <div v-if="expandedSteps.has(idx)" class="step-detail">
                <!-- Input -->
                <div v-if="step.input" class="detail-section">
                  <div class="detail-label">输入</div>
                  <pre class="detail-code">{{ formatJsonOrText(step.input) }}</pre>
                </div>
                <!-- Output -->
                <div v-if="step.output" class="detail-section">
                  <div class="detail-label">输出</div>
                  <pre class="detail-code">{{ formatJsonOrText(step.output) }}</pre>
                </div>
                <!-- Metadata -->
                <div v-if="step.metadata && Object.keys(step.metadata).length > 0" class="detail-section">
                  <div class="detail-label">元数据</div>
                  <div class="metadata-grid">
                    <div v-for="(val, key) in step.metadata" :key="key" class="metadata-item">
                      <span class="metadata-key">{{ key }}</span>
                      <span class="metadata-value tabular-nums">{{ formatMetadataValue(val) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleCheckFilled, CircleCloseFilled, RemoveFilled, Connection, ArrowDown } from '@element-plus/icons-vue'
import type { AgentTraceSnapshot, AgentTraceStep } from '@/api/ai/agent'

defineProps<{
  snapshot: AgentTraceSnapshot | null
}>()

const expandedSteps = ref(new Set<number>())

function toggleExpand(idx: number) {
  const s = new Set(expandedSteps.value)
  if (s.has(idx)) {
    s.delete(idx)
  } else {
    s.add(idx)
  }
  expandedSteps.value = s
}

function formatDuration(ms: number): string {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function getStepTypeTag(type: string): string {
  const map: Record<string, string> = {
    prompt_assembly: 'primary',
    knowledge_retrieval: 'success',
    skill_execution: 'warning',
    llm_call: 'danger',
  }
  return map[type] || 'info'
}

function getStepTypeLabel(type: string): string {
  const map: Record<string, string> = {
    prompt_assembly: '提示词',
    knowledge_retrieval: '知识库',
    skill_execution: '技能',
    llm_call: 'LLM',
  }
  return map[type] || type
}

function formatJsonOrText(val: any): string {
  if (typeof val === 'string') {
    try {
      return JSON.stringify(JSON.parse(val), null, 2)
    } catch {
      return val
    }
  }
  if (Array.isArray(val)) {
    return val.map((v, i) => `[${i + 1}] ${typeof v === 'string' ? v : JSON.stringify(v, null, 2)}`).join('\n\n')
  }
  return JSON.stringify(val, null, 2)
}

function formatMetadataValue(val: any): string {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
</script>

<style scoped>
.trace-detail {
  padding: 0;
}

.trace-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  margin-bottom: 16px;
}
.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.summary-value {
  font-size: 18px;
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
  height: 28px;
  background: var(--el-border-color-extra-light);
}

.trace-timeline {
  display: flex;
  flex-direction: column;
}

.trace-step {
  display: flex;
  gap: 12px;
  min-height: 48px;
}

.step-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28px;
  flex-shrink: 0;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.dot-success {
  background: var(--el-color-success-light-7);
  color: var(--el-color-success);
}
.dot-fail {
  background: var(--el-color-danger-light-7);
  color: var(--el-color-danger);
}
.dot-skip {
  background: var(--el-color-info-light-8);
  color: var(--el-color-info);
}

.step-connector {
  width: 2px;
  flex: 1;
  min-height: 8px;
  background: var(--el-border-color-lighter);
}

.step-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.step-body:hover {
  background: var(--el-fill-color-lighter);
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  gap: 8px;
}

.expand-icon {
  transition: transform 0.2s;
  color: var(--el-text-color-secondary);
}
.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.step-detail {
  padding: 0 8px 4px;
  overflow: hidden;
}

.detail-section {
  margin-bottom: 8px;
}
.detail-section:last-child {
  margin-bottom: 0;
}
.detail-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.detail-code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 6px;
  padding: 10px 12px;
  margin: 0;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--el-text-color-primary);
  max-height: 200px;
  overflow-y: auto;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 6px;
}
.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: var(--el-fill-color);
  border-radius: 4px;
}
.metadata-key {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.metadata-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
