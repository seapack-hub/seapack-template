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
            <div class="step-dot" :class="[`dot-${step.status}`]">
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
                <el-tag :type="getStepTypeTag(step.stepType) as any" size="small" effect="plain" class="flex-shrink-0">
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
                <!-- 技能调用 - 特殊处理 -->
                <template v-if="step.stepType === 'skill_execution'">
                  <!-- 技能汇总信息 -->
                  <div v-if="step.metadata" class="skill-summary">
                    <div class="skill-summary-item">
                      <span class="skill-summary-label">技能总数</span>
                      <span class="skill-summary-value tabular-nums">{{ getSkillCount(step) }}</span>
                    </div>
                    <div class="skill-summary-item">
                      <span class="skill-summary-label">执行成功</span>
                      <span class="skill-summary-value tabular-nums text-[var(--el-color-success)]">{{ getExecutedCount(step) }}</span>
                    </div>
                  </div>
                  <!-- 解析后的技能列表 -->
                  <div v-if="parseSkillResults(step.output as string).length > 0" class="skill-list">
                    <div
                      v-for="(skill, sIdx) in parseSkillResults(step.output as string)"
                      :key="sIdx"
                      class="skill-card"
                      :class="[skill.success ? 'skill-success' : 'skill-fail']"
                    >
                      <div class="skill-card-header" @click.stop="toggleSkillExpand(idx, sIdx)">
                        <div class="flex items-center gap-8px flex-1 min-w-0">
                          <el-icon v-if="skill.success" :size="16" class="text-[var(--el-color-success)]"><CircleCheckFilled /></el-icon>
                          <el-icon v-else :size="16" class="text-[var(--el-color-danger)]"><CircleCloseFilled /></el-icon>
                          <span class="text-13px font-600 color-[var(--el-text-color-primary)]">{{ skill.name }}</span>
                        </div>
                        <div class="flex items-center gap-8px">
                          <el-tag :type="skill.success ? 'success' : 'danger'" size="small" effect="plain">
                            {{ skill.success ? '成功' : '失败' }}
                          </el-tag>
                          <el-icon class="expand-icon" :class="{ 'is-expanded': isSkillExpanded(idx, sIdx) }"><ArrowDown /></el-icon>
                        </div>
                      </div>
                      <Transition name="expand">
                        <div v-if="isSkillExpanded(idx, sIdx)" class="skill-card-body">
                          <div v-if="skill.callPath" class="skill-meta">
                            <span class="skill-meta-label">调用路径</span>
                            <code class="skill-meta-value">{{ skill.callPath }}</code>
                          </div>
                          <div v-if="skill.callParams" class="skill-meta">
                            <span class="skill-meta-label">调用参数</span>
                            <pre class="skill-meta-value skill-meta-code">{{ formatJsonOrText(skill.callParams) }}</pre>
                          </div>
                          <div v-if="skill.input" class="detail-section">
                            <div class="detail-label">输入</div>
                            <pre class="detail-code">{{ formatJsonOrText(skill.input) }}</pre>
                          </div>
                          <div v-if="skill.output" class="detail-section">
                            <div class="detail-label">返回结果</div>
                            <pre class="detail-code">{{ formatJsonOrText(skill.output) }}</pre>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>
                  <!-- 无法解析时回退到原始输出 -->
                  <div v-else-if="step.output" class="detail-section">
                    <div class="detail-label">输出</div>
                    <pre class="detail-code">{{ formatJsonOrText(step.output) }}</pre>
                  </div>
                </template>

                <!-- 非技能步骤 - 普通展示 -->
                <template v-else>
                  <div v-if="step.input" class="detail-section">
                    <div class="detail-label">输入</div>
                    <pre class="detail-code">{{ formatJsonOrText(step.input) }}</pre>
                  </div>
                  <div v-if="step.output" class="detail-section">
                    <div class="detail-label">输出</div>
                    <pre class="detail-code">{{ formatJsonOrText(step.output) }}</pre>
                  </div>
                  <div v-if="step.metadata && Object.keys(step.metadata).length > 0" class="detail-section">
                    <div class="detail-label">元数据</div>
                    <div class="metadata-grid">
                      <div v-for="(val, key) in step.metadata" :key="key" class="metadata-item">
                        <span class="metadata-key">{{ key }}</span>
                        <span class="metadata-value tabular-nums">{{ formatMetadataValue(val) }}</span>
                      </div>
                    </div>
                  </div>
                </template>
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
const expandedSkills = ref(new Map<string, Set<number>>())

function toggleExpand(idx: number) {
  const s = new Set(expandedSteps.value)
  if (s.has(idx)) s.delete(idx)
  else s.add(idx)
  expandedSteps.value = s
}

function toggleSkillExpand(stepIdx: number, skillIdx: number) {
  const key = `${stepIdx}`
  const map = new Map(expandedSkills.value)
  if (!map.has(key)) map.set(key, new Set())
  const set = map.get(key)!
  if (set.has(skillIdx)) set.delete(skillIdx)
  else set.add(skillIdx)
  expandedSkills.value = map
}

function isSkillExpanded(stepIdx: number, skillIdx: number): boolean {
  return expandedSkills.value.get(`${stepIdx}`)?.has(skillIdx) || false
}

interface SkillResult {
  name: string
  callPath: string | null
  callParams: string | null
  input: string | null
  output: string
  success: boolean
}

function parseSkillResults(output: string | undefined | null): SkillResult[] {
  if (!output) return []
  const results: SkillResult[] = []
  // 匹配 【技能名】 后面的内容
  const regex = /【(.+?)】[ \t]*\r?\n/g
  const matches: Array<{ name: string; start: number }> = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(output)) !== null) {
    matches.push({ name: match[1], start: match.index + match[0].length })
  }
  if (matches.length === 0) return []
  for (let i = 0; i < matches.length; i++) {
    const endPos = i < matches.length - 1
      ? output.lastIndexOf('【', matches[i + 1].start)
      : output.length
    const content = output.slice(matches[i].start, endPos > matches[i].start ? endPos : undefined).trim()
    let skillName = matches[i].name
    let success = true
    let parsedOutput = content
    let callPath: string | null = null
    let callParams: string | null = null
    // 检查是否有内嵌的【】标记（如【分页查询股票行情数据】前缀）
    const innerMatch = content.match(/^【(.+?)】\s*\n/)
    if (innerMatch) {
      skillName = innerMatch[1]
    }
    // 提取调用路径：调用路径: POST /path...
    const callPathMatch = content.match(/^调用路径:\s*(.+)$/m)
    if (callPathMatch) {
      callPath = callPathMatch[1].trim()
    }
    // 提取调用参数：调用参数: {...}
    const callParamsMatch = content.match(/^调用参数:\s*(.+)$/m)
    if (callParamsMatch) {
      callParams = callParamsMatch[1].trim()
    }
    // 从内容中移除调用路径、调用参数和分隔符行，只保留返回结果
    let resultContent = content
      .replace(/^调用路径:\s*.+$/m, '')
      .replace(/^调用参数:\s*.+$/m, '')
      .replace(/^---\s*返回结果\s*---$/m, '')
      .trim()
    // 尝试解析 JSON（返回结果部分）
    try {
      const jsonStart = resultContent.indexOf('{')
      const jsonStartArr = resultContent.indexOf('[')
      const actualStart = jsonStart >= 0 && (jsonStartArr < 0 || jsonStart < jsonStartArr)
        ? jsonStart
        : jsonStartArr
      if (actualStart >= 0) {
        const jsonContent = resultContent.slice(actualStart).trim()
        const parsed = JSON.parse(jsonContent)
        if (parsed.error || parsed.success === false) success = false
        else if (parsed.list && Array.isArray(parsed.list)) {
          success = true
        }
        parsedOutput = JSON.stringify(parsed, null, 2)
      } else {
        parsedOutput = resultContent
        if (resultContent.includes('"error"') || resultContent.includes('"success":false')) success = false
      }
    } catch {
      parsedOutput = resultContent
      if (resultContent.includes('"error"') || resultContent.includes('"success":false')) success = false
    }
    results.push({ name: skillName, callPath, callParams, input: null, output: parsedOutput, success })
  }
  return results
}

function formatDuration(ms: number): string {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

/** 获取技能总数：优先从 metadata 读取，否则从解析结果推算 */
function getSkillCount(step: AgentTraceStep): number {
  if (step.metadata?.skillCount) return step.metadata.skillCount
  return parseSkillResults(step.output as string).length
}

/** 获取执行成功数：优先从 metadata 读取，否则从解析结果推算 */
function getExecutedCount(step: AgentTraceStep): number {
  if (step.metadata?.executedCount) return step.metadata.executedCount
  return parseSkillResults(step.output as string).filter(s => s.success).length
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

/* 技能调用特殊样式 */
.skill-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}
.skill-summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.skill-summary-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.skill-summary-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-card {
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}
.skill-card:hover {
  border-color: var(--el-border-color-light);
}
.skill-success {
  border-left: 3px solid var(--el-color-success);
}
.skill-fail {
  border-left: 3px solid var(--el-color-danger);
}

.skill-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.skill-card-header:hover {
  background: var(--el-fill-color-lighter);
}

.skill-card-body {
  padding: 0 12px 10px;
  overflow: hidden;
}

.skill-meta {
  margin-bottom: 8px;
}
.skill-meta-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.skill-meta-value {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 4px;
  padding: 6px 10px;
  margin: 0;
  word-break: break-all;
  white-space: pre-wrap;
}
.skill-meta-code {
  max-height: 120px;
  overflow-y: auto;
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
