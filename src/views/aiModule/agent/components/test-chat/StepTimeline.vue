<!--
  步骤时间线组件 (StepTimeline.vue)
  =================================
  功能：以纵向时间线形式展示 Agent 执行过程中的步骤进度
  布局：左侧圆点+连接线，右侧步骤名称+耗时
  状态：running（执行中-蓝色旋转）/ success（成功-绿色）/ fail（失败-红色）/ skip（跳过-绿色）
  用途：嵌入在最后一条 assistant 消息气泡内，实时反映后端执行进度
-->
<template>
  <div class="step-timeline">
    <!-- 遍历每个步骤，渲染时间线节点 -->
    <div v-for="(step, si) in steps" :key="si" class="step-item">
      <!-- 左侧列：圆点 + 连接线 -->
      <div class="step-dot-col">
        <!-- 状态圆点：根据 step.status 显示不同图标和颜色 -->
        <div class="step-dot" :class="step.status">
          <!-- 执行中：旋转加载图标 -->
          <el-icon v-if="step.status === 'running'" class="is-loading" :size="12"><Loading /></el-icon>
          <!-- 成功：勾选图标 -->
          <el-icon v-else-if="step.status === 'success'" :size="12"><CircleCheckFilled /></el-icon>
          <!-- 失败：关闭图标 -->
          <el-icon v-else-if="step.status === 'fail'" :size="12"><CircleCloseFilled /></el-icon>
          <!-- 跳过：减号图标（与 success 同色） -->
          <el-icon v-else :size="12"><RemoveFilled /></el-icon>
        </div>
        <!-- 连接线：最后一个节点不显示 -->
        <div v-if="si < steps.length - 1" class="step-line" />
      </div>

      <!-- 右侧列：步骤信息 -->
      <div class="step-info">
        <!-- 步骤名称：执行中时高亮为蓝色 -->
        <span class="step-name" :class="{ 'is-running': step.status === 'running' }">{{ step.stepName }}</span>
        <!-- 执行中状态文本 -->
        <span v-if="step.status === 'running'" class="step-status">执行中</span>
        <!-- 耗时（仅完成的步骤显示） -->
        <span v-else-if="step.durationMs != null" class="step-time">{{ step.durationMs }}ms</span>
      </div>
    </div>

    <!-- 底部分割线：当有消息内容时显示，分隔步骤和正文 -->
    <div v-if="showDivider" class="step-divider" />
  </div>
</template>

<script setup lang="ts">
/**
 * StepTimeline - 步骤时间线组件
 *
 * 展示 Agent 执行过程中的步骤进度，典型步骤包括：
 * 1. 提示词组装 (prompt_assembly)
 * 2. 知识库检索 (knowledge_retrieval)
 * 3. 技能调用 (skill_execution)
 * 4. LLM 调用 (llm_call)
 *
 * 数据来源：后端通过 SSE 事件逐步推送 step_start / step_done
 */
import { Loading, CircleCheckFilled, CircleCloseFilled, RemoveFilled } from '@element-plus/icons-vue'

/**
 * 步骤进度数据结构
 * 导出供 ChatPanel.vue 和 MessageBubble.vue 使用
 */
export interface StepProgress {
  /** 步骤名称（如"提示词组装"、"技能调用"） */
  stepName: string
  /** 步骤状态：running=执行中, success=成功, fail=失败, skip=跳过 */
  status: 'running' | 'success' | 'fail' | 'skip'
  /** 执行耗时（毫秒），执行完成后由 step_done 事件设置 */
  durationMs?: number
}

/** 组件属性 */
defineProps<{
  /** 步骤进度列表 */
  steps: StepProgress[]
  /** 是否显示底部分割线（用于分隔步骤和消息正文） */
  showDivider?: boolean
}>()
</script>

<style scoped>
/* 时间线容器 */
.step-timeline {
  padding: 4px 0 2px;
}

/* 单个步骤行 */
.step-item {
  display: flex;
  gap: 8px;
}

/* 左侧列：圆点 + 连接线，固定宽度 18px */
.step-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18px;
  flex-shrink: 0;
}

/* 状态圆点：18px 圆形，居中显示图标 */
.step-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
/* 执行中：蓝色背景 */
.step-dot.running {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}
/* 成功：绿色背景 */
.step-dot.success {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}
/* 失败：红色背景 */
.step-dot.fail {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}
/* 跳过：绿色背景（与成功同色） */
.step-dot.skip {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}

/* 连接线：2px 宽，填充剩余高度 */
.step-line {
  width: 2px;
  flex: 1;
  min-height: 6px;
  background: var(--el-border-color-lighter);
}

/* 步骤信息行 */
.step-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 4px;
  min-height: 24px;
}

/* 步骤名称 */
.step-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
/* 执行中时高亮为蓝色 */
.step-name.is-running {
  color: var(--el-color-primary);
}

/* 执行中状态文本 */
.step-status {
  font-size: 11px;
  color: var(--el-color-primary);
  font-weight: 500;
}

/* 耗时显示：使用等宽数字防止跳动 */
.step-time {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}

/* 底部分割线：左侧留空对齐步骤内容 */
.step-divider {
  height: 1px;
  background: var(--el-border-color-extra-light);
  margin: 4px 0 4px 26px;
}
</style>
