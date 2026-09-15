<template>
  <div class="step-timeline">
    <div
      v-for="(step, idx) in steps"
      :key="step.stepIndex"
      class="step-item"
    >
      <!-- 状态图标 -->
      <div class="step-icon" :class="`step-icon--${step.status}`">
        <el-icon v-if="step.status === 'running'" class="is-loading" :size="14"><Loading /></el-icon>
        <el-icon v-else-if="step.status === 'success'" :size="14"><CircleCheck /></el-icon>
        <el-icon v-else-if="step.status === 'fail'" :size="14"><CircleClose /></el-icon>
        <el-icon v-else-if="step.status === 'skip'" :size="14"><RemoveFilled /></el-icon>
        <span v-else class="step-num">{{ idx + 1 }}</span>
      </div>

      <!-- 连接线 -->
      <div v-if="idx < steps.length - 1" class="step-line" :class="`step-line--${step.status}`" />

      <!-- 内容 -->
      <div class="step-content">
        <div class="step-header">
          <span class="step-name">{{ step.stepName }}</span>
          <span v-if="step.durationMs != null" class="step-duration">{{ formatMs(step.durationMs) }}</span>
        </div>

        <!-- 进度消息 -->
        <div v-if="step.progressList?.length" class="step-progress">
          <div v-for="(msg, i) in step.progressList" :key="`p-${i}`" class="step-progress-item">
            <span class="step-dot" />
            <span>{{ msg }}</span>
          </div>
        </div>

        <!-- 技能/知识库详情 -->
        <div v-if="step.detailList?.length" class="step-details">
          <template v-for="(detail, i) in step.detailList" :key="`d-${i}`">
            <!-- 技能参数 -->
            <div v-if="detail.detailType === 'skill_params' && hasData(detail.data)" class="detail-block">
              <div class="detail-tag detail-tag--params" @click="toggleDetail(keyOf(step, i))">
                <el-tag size="small" type="warning" effect="plain">参数</el-tag>
                <span class="detail-name">{{ detail.data?.skillName }}</span>
                <el-icon class="detail-arrow" :class="{ expanded: expandedDetails[keyOf(step, i)] }"><ArrowDown /></el-icon>
              </div>
              <div v-if="expandedDetails[keyOf(step, i)]" class="detail-content">
                <pre class="detail-pre">{{ formatJson(detail.data?.params || detail.data?.extractedParams) }}</pre>
              </div>
            </div>

            <!-- 技能结果 - 成功 -->
            <div v-else-if="detail.detailType === 'skill_result' && detail.data?.status === 'success'" class="detail-block">
              <div class="detail-tag detail-tag--result" @click="toggleDetail(keyOf(step, i))">
                <el-tag size="small" type="success" effect="plain">结果</el-tag>
                <span class="detail-name">{{ detail.data?.skillName }}</span>
                <el-tag v-if="detail.data?.httpMethod" size="small" type="info" effect="plain" class="ml-4px">{{ detail.data.httpMethod }}</el-tag>
                <el-icon class="detail-arrow" :class="{ expanded: expandedDetails[keyOf(step, i)] }"><ArrowDown /></el-icon>
              </div>
              <div v-if="expandedDetails[keyOf(step, i)]" class="detail-content">
                <pre class="detail-pre">{{ detail.data?.resultPreview || formatJson(detail.data?.result) }}</pre>
              </div>
            </div>

            <!-- 技能结果 - 失败 -->
            <div v-else-if="detail.detailType === 'skill_result' && detail.data?.status !== 'success'" class="detail-block detail-block--error">
              <div class="detail-tag detail-tag--error">
                <el-tag size="small" type="danger" effect="plain">失败</el-tag>
                <span class="detail-name">{{ detail.data?.skillName }}</span>
              </div>
              <div v-if="detail.data?.errorMessage" class="detail-content">
                <div class="detail-error">{{ detail.data.errorMessage }}</div>
              </div>
            </div>

            <!-- 知识库检索结果 -->
            <div v-else-if="detail.detailType === 'knowledge_result'" class="detail-block">
              <div class="detail-tag detail-tag--knowledge">
                <el-tag size="small" type="success" effect="plain">知识库</el-tag>
                <span class="detail-name">{{ detail.data?.knowledgeName || '检索结果' }}</span>
                <span v-if="detail.data?.foundCount != null" class="detail-meta">命中 {{ detail.data.foundCount }} 条</span>
              </div>
            </div>

            <!-- Agent 提示词 -->
            <div v-else-if="detail.detailType === 'agent_prompt'" class="detail-block">
              <div class="detail-tag detail-tag--prompt" @click="toggleDetail(keyOf(step, i))">
                <el-tag size="small" type="primary" effect="plain">提示词</el-tag>
                <span class="detail-name">Agent 基础提示词</span>
                <span v-if="detail.data?.contentLength" class="detail-meta">{{ detail.data.contentLength }} 字符</span>
                <el-icon class="detail-arrow" :class="{ expanded: expandedDetails[keyOf(step, i)] }"><ArrowDown /></el-icon>
              </div>
              <div v-if="expandedDetails[keyOf(step, i)] && detail.data?.content" class="detail-content">
                <pre class="detail-pre detail-pre--text">{{ truncateText(detail.data.content, 500) }}</pre>
              </div>
            </div>

            <!-- 提示词模板 -->
            <div v-else-if="detail.detailType === 'template_loaded'" class="detail-block">
              <div class="detail-tag detail-tag--template" @click="toggleDetail(keyOf(step, i))">
                <el-tag size="small" type="info" effect="plain">模板</el-tag>
                <span class="detail-name">{{ detail.data?.templateName || '提示词模板' }}</span>
                <el-icon class="detail-arrow" :class="{ expanded: expandedDetails[keyOf(step, i)] }"><ArrowDown /></el-icon>
              </div>
              <div v-if="expandedDetails[keyOf(step, i)] && (detail.data?.content || detail.data?.contentPreview)" class="detail-content">
                <pre class="detail-pre detail-pre--text">{{ truncateText(detail.data.contentPreview || detail.data.content, 500) }}</pre>
              </div>
            </div>

            <!-- 通用详情 -->
            <div v-else-if="hasData(detail.data)" class="detail-block">
              <div class="detail-tag" @click="toggleDetail(keyOf(step, i))">
                <el-tag size="small" effect="plain">{{ detail.detailType }}</el-tag>
                <el-icon class="detail-arrow" :class="{ expanded: expandedDetails[keyOf(step, i)] }"><ArrowDown /></el-icon>
              </div>
              <div v-if="expandedDetails[keyOf(step, i)]" class="detail-content">
                <pre class="detail-pre">{{ formatJson(detail.data) }}</pre>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading, CircleCheck, CircleClose, RemoveFilled, ArrowDown } from '@element-plus/icons-vue';
import type { StepProgress } from './useStockAnalysis';

defineProps<{ steps: StepProgress[] }>();

/** 折叠状态管理 */
const expandedDetails = ref<Record<string, boolean>>({});

function toggleDetail(key: string) {
  expandedDetails.value[key] = !expandedDetails.value[key];
}

function keyOf(step: StepProgress, i: number): string {
  return `${step.stepIndex}-${i}`;
}

function hasData(data: any): boolean {
  if (!data) return false;
  if (typeof data === 'object' && Object.keys(data).length === 0) return false;
  return true;
}

function truncateText(text: string | undefined, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatJson(obj: any): string {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}
</script>

<style scoped lang="scss">
.step-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 4px 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  position: relative;
}

.step-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
  font-size: 12px;

  &--running {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
  &--success {
    background: #f0f9eb;
    color: #67c23a;
  }
  &--fail {
    background: #fef0f0;
    color: #f56c6c;
  }
  &--skip {
    background: #f4f4f5;
    color: #909399;
  }
}

.step-num {
  font-size: 11px;
  font-weight: 600;
  color: #909399;
}

.step-line {
  position: absolute;
  left: 11px;
  top: 24px;
  bottom: -4px;
  width: 2px;
  background: var(--el-border-color-lighter);

  &--success { background: #67c23a; }
  &--running { background: var(--el-color-primary-light-5); }
  &--fail { background: #f56c6c; }
}

.step-content {
  margin-left: 10px;
  padding-bottom: 12px;
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 24px;
}

.step-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.step-duration {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.step-progress {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-progress-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 20px;
}

.step-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--el-border-color);
  flex-shrink: 0;
  margin-top: 8px;
}

// ===== 详情区块 =====
.step-details {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-block {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.detail-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;

  &:hover {
    background: #f5f7fa;
  }

  &--params { }
  &--result { }
  &--error { }
  &--knowledge { }
  &--prompt { }
  &--template { }
}

.detail-name {
  font-size: 12px;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-meta {
  margin-left: auto;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.detail-error {
  padding: 8px 12px;
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.6;
}

.detail-block--error {
  border-color: #fde2e2;
  background: #fef0f0;
}

.detail-arrow {
  margin-left: auto;
  transition: transform 0.2s;
  color: var(--el-text-color-secondary);

  &.expanded {
    transform: rotate(180deg);
  }
}

.detail-content {
  border-top: 1px solid var(--el-border-color-lighter);
  background: #fafbfc;
  max-height: 300px;
  overflow: auto;
}

.detail-pre {
  margin: 0;
  padding: 8px 12px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-all;

  &--text {
    color: var(--el-text-color-secondary);
  }
}

.detail-text {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
