<template>
  <div class="step-timeline">
    <TransitionGroup name="step" tag="div">
      <div v-for="(step, si) in steps" :key="stepKey(step, si)" class="step-item" :style="{ '--i': si }">
        <div class="step-dot-col">
          <div class="step-dot" :class="step.status">
            <el-icon v-if="step.status === 'running'" class="is-loading" :size="16"><Loading /></el-icon>
            <el-icon v-else-if="step.status === 'success'" :size="16"><CircleCheckFilled /></el-icon>
            <el-icon v-else-if="step.status === 'fail'" :size="16"><CircleCloseFilled /></el-icon>
            <el-icon v-else :size="16"><RemoveFilled /></el-icon>
          </div>
          <div v-if="si < steps.length - 1" class="step-line" />
        </div>

        <div class="step-content">
          <div class="step-info">
            <span class="step-name" :class="{ 'is-running': step.status === 'running' }">{{ step.stepName }}</span>
            <el-tag v-if="step.stepType" size="small" :type="getStepTypeTag(step.stepType) as any" effect="plain" class="step-type-tag">
              {{ getStepTypeLabel(step.stepType) }}
            </el-tag>
            <span v-if="step.status === 'running'" class="step-status">执行中</span>
            <span v-else-if="step.durationMs != null" class="step-time">{{ step.durationMs }}ms</span>
          </div>

          <div v-if="step.progressList && step.progressList.length > 0" class="step-progress-list">
            <div v-for="(msg, pi) in step.progressList" :key="pi" class="step-progress-item">
              <el-icon :size="16" class="text-el-color-info shrink-0 mt-2px"><InfoFilled /></el-icon>
              <span class="step-progress-text">{{ msg }}</span>
            </div>
          </div>

          <div v-if="step.detailList && step.detailList.length > 0" class="step-detail-list">
            <div v-for="(detail, di) in step.detailList" :key="di" class="step-detail-item">
              <template v-if="detail.detailType === 'agent_prompt'">
                <div class="detail-header">
                  <el-tag size="small" type="primary" effect="plain">基础提示词</el-tag>
                  <span class="detail-sub">{{ detail.data?.contentLength }} 字符</span>
                </div>
                <pre class="detail-code">{{ truncateText(detail.data?.content, 200) }}</pre>
              </template>

              <template v-else-if="detail.detailType === 'template_loaded'">
                <div class="detail-header">
                  <el-tag size="small" type="success" effect="plain">模板</el-tag>
                  <span class="detail-name">{{ detail.data?.templateName }}</span>
                  <span class="detail-sub">ID: {{ detail.data?.templateId }}</span>
                  <span class="detail-sub">{{ detail.data?.contentLength }} 字符</span>
                </div>
                <pre class="detail-code">{{ detail.data?.contentPreview }}</pre>
              </template>

              <template v-else-if="detail.detailType === 'knowledge_result'">
                <div class="detail-header">
                  <el-tag size="small" type="warning" effect="plain">知识库</el-tag>
                  <span class="detail-name">{{ detail.data?.knowledgeName }}</span>
                  <span class="detail-sub">命中 {{ detail.data?.foundCount }} 条</span>
                </div>
                <div v-if="detail.data?.chunks && detail.data.chunks.length > 0" class="knowledge-chunks">
                  <div v-for="(chunk, ci) in detail.data.chunks" :key="ci" class="knowledge-chunk">
                    <div class="chunk-preview">{{ chunk.contentPreview }}</div>
                    <div class="chunk-score">相关度: {{ (chunk.score * 100).toFixed(1) }}%</div>
                  </div>
                </div>
              </template>

              <template v-else-if="detail.detailType === 'skill_params'">
                <div class="detail-header">
                  <el-tag size="small" type="warning" effect="plain">参数</el-tag>
                  <span class="detail-name">{{ detail.data?.skillName }}</span>
                </div>
                <pre class="detail-code">{{ formatJson(detail.data?.params) }}</pre>
              </template>

              <template v-else-if="detail.detailType === 'skill_result' && detail.data?.status === 'success'">
                <div class="detail-header">
                  <el-tag size="small" type="success" effect="plain">结果</el-tag>
                  <span class="detail-name">{{ detail.data?.skillName }}</span>
                  <el-tag size="small" type="success" effect="plain" class="detail-url" :title="detail.data?.httpMethod + ' ' + detail.data?.url">
                    {{ detail.data?.httpMethod }} {{ detail.data?.url }}
                  </el-tag>
                </div>
                <pre class="detail-code">{{ detail.data?.resultPreview }}</pre>
              </template>

              <template v-else-if="detail.detailType === 'skill_result' && detail.data?.status === 'failed'">
                <div class="detail-header">
                  <el-tag size="small" type="danger" effect="plain">失败</el-tag>
                  <span class="detail-name">{{ detail.data?.skillName }}</span>
                </div>
                <div class="detail-error">{{ detail.data?.errorMessage }}</div>
              </template>

              <template v-else>
                <div class="detail-header">
                  <el-tag size="small" effect="plain">{{ detail.detailType }}</el-tag>
                </div>
                <pre class="detail-code">{{ formatJson(detail.data) }}</pre>
              </template>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <div v-if="showDivider" class="step-divider" />
  </div>
</template>

<script setup lang="ts">
import { Loading, CircleCheckFilled, CircleCloseFilled, RemoveFilled, InfoFilled } from '@element-plus/icons-vue'

export interface StepDetailItem {
  detailType: string
  data?: Record<string, any>
}

export interface StepProgress {
  stepName: string
  stepType?: string
  status: 'running' | 'success' | 'fail' | 'skip'
  durationMs?: number
  progressList?: string[]
  detailList?: StepDetailItem[]
}

defineProps<{
  steps: StepProgress[]
  showDivider?: boolean
}>()

function stepKey(step: StepProgress, index: number): string {
  return step.stepType || `step-${index}`
}

function getStepTypeTag(type: string): '' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, '' | 'success' | 'warning' | 'danger' | 'info'> = {
    prompt_assembly: '',
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

function truncateText(text: string | undefined, maxLen: number): string {
  if (!text) return ''
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
}

function formatJson(data: any): string {
  if (data === undefined || data === null) return ''
  if (typeof data === 'string') return data
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}
</script>

<style scoped>
.step-enter-active {
  animation: stepIn 0.3s ease-out both;
  animation-delay: calc(var(--i, 0) * 80ms);
}
.step-leave-active {
  animation: stepOut 0.2s ease-in both;
}
@keyframes stepIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes stepOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-4px); }
}
.step-detail-enter-active {
  animation: detailIn 0.25s ease-out both;
}
@keyframes detailIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-timeline { padding: 4px 0 2px; }
.step-item { display: flex; gap: 8px; }
.step-dot-col {
  display: flex; flex-direction: column; align-items: center;
  width: 18px; flex-shrink: 0;
}
.step-dot {
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.step-dot.running { background: var(--el-color-primary-light-8); color: var(--el-color-primary); }
.step-dot.success { background: var(--el-color-success-light-8); color: var(--el-color-success); }
.step-dot.fail { background: var(--el-color-danger-light-8); color: var(--el-color-danger); }
.step-dot.skip { background: var(--el-color-success-light-8); color: var(--el-color-success); }
.step-line { width: 2px; flex: 1; min-height: 6px; background: var(--el-border-color-lighter); }
.step-content { flex: 1; min-width: 0; padding-bottom: 6px; }
.step-info { display: flex; align-items: center; gap: 6px; min-height: 20px; flex-wrap: wrap; }
.step-name { 
  font-size: 12px; 
  font-weight: 500; 
  color: var(--el-text-color-primary); 
}
.step-name.is-running { 
  color: var(--el-color-primary); 
}
.step-type-tag { margin: 0; }
.step-status { font-size: 11px; color: var(--el-color-primary); font-weight: 500; }
.step-time { font-size: 11px; color: var(--el-text-color-secondary); font-variant-numeric: tabular-nums; }

.step-progress-list { margin-top: 4px; padding-left: 2px; }
.step-progress-item { display: flex; align-items: flex-start; gap: 4px; margin-bottom: 2px; }
.step-progress-text { font-size: 11px; color: var(--el-text-color-secondary); line-height: 16px; }

.step-detail-list { margin-top: 6px; padding-left: 2px; display: flex; flex-direction: column; gap: 6px; }
.step-detail-item {
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 6px; padding: 8px 10px; background: var(--el-fill-color-blank);
}
.detail-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.detail-url {
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 11px; vertical-align: middle;
}
.detail-name { font-size: 12px; font-weight: 500; color: var(--el-text-color-primary); }
.detail-sub { font-size: 11px; color: var(--el-text-color-secondary); }
.detail-code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px; line-height: 1.5; color: var(--el-text-color-regular);
  background: var(--el-fill-color); border: 1px solid var(--el-border-color-extra-light);
  border-radius: 4px; padding: 6px 8px; margin: 6px 0 0;
  overflow-x: auto; white-space: pre-wrap; word-break: break-all;
  max-height: 150px; overflow-y: auto;
}
.detail-error { margin-top: 4px; font-size: 12px; color: var(--el-color-danger); line-height: 1.5; }

.knowledge-chunks { margin-top: 6px; display: flex; flex-direction: column; gap: 4px; }
.knowledge-chunk {
  padding: 6px 8px; background: var(--el-fill-color);
  border-radius: 4px; border: 1px solid var(--el-border-color-extra-light);
}
.chunk-preview { font-size: 11px; color: var(--el-text-color-regular); line-height: 1.5; white-space: pre-wrap; word-break: break-all; }
.chunk-score { font-size: 10px; color: var(--el-text-color-secondary); margin-top: 2px; }

.step-divider { height: 1px; background: var(--el-border-color-extra-light); margin: 4px 0 4px 26px; }
</style>
