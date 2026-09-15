<template>
  <div class="ai-analysis-result">
    <!-- 空状态 -->
    <div v-if="!content && !loading" class="empty-state">
      <el-empty :image-size="120" description="选择场景并输入股票代码，获取 AI 个股诊断报告" />
    </div>

    <!-- 内容区（含步骤进度） -->
    <template v-else>
      <el-scrollbar class="result-scrollbar">
        <!-- 步骤进度 -->
        <StepProgressTimeline v-if="steps.length > 0" :steps="steps" class="step-section" />

        <!-- Markdown 内容 -->
        <template v-if="content">
          <div class="result-header">
            <div class="result-title">
              <el-icon :size="20" color="#409eff"><TrendCharts /></el-icon>
              <span>{{ title }}</span>
            </div>
            <div class="result-actions">
              <el-button text :icon="DocumentCopy" @click="copyContent">复制</el-button>
              <el-button text :icon="Download" @click="exportMarkdown">导出</el-button>
              <el-button v-if="onRefresh" text :icon="RefreshRight" @click="onRefresh">重新分析</el-button>
            </div>
          </div>

          <div class="markdown-body" v-html="renderedContent" />

          <!-- 流式生成中指示器 -->
          <div v-if="loading" class="streaming-indicator">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>AI 正在生成分析报告...</span>
          </div>
        </template>

        <!-- 仅有步骤、尚无内容时的等待提示 -->
        <div v-else-if="loading && !content" class="loading-wait">
          <el-icon class="is-loading" :size="24"><Loading /></el-icon>
          <span>{{ loadingText }}</span>
        </div>
      </el-scrollbar>

      <!-- 底部状态栏 -->
      <div v-if="totalDurationMs || tokenUsage" class="result-footer">
        <span v-if="totalDurationMs" class="footer-item">
          <el-icon><Timer /></el-icon>
          {{ formatDuration(totalDurationMs) }}
        </span>
        <span v-if="tokenUsage" class="footer-item">
          <el-icon><Coin /></el-icon>
          Tokens: {{ tokenUsage.prompt }} + {{ tokenUsage.completion }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { DocumentCopy, Download, RefreshRight, Loading, TrendCharts, Timer, Coin } from '@element-plus/icons-vue';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import type { StepProgress } from './useStockAnalysis';
import StepProgressTimeline from './StepProgressTimeline.vue';

interface Props {
  content?: string;
  loading?: boolean;
  title?: string;
  loadingText?: string;
  steps?: StepProgress[];
  totalDurationMs?: number;
  tokenUsage?: { prompt: number; completion: number } | null;
  onRefresh?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  loading: false,
  title: 'AI 个股诊断报告',
  loadingText: '正在准备分析...',
  steps: () => [],
  totalDurationMs: 0,
  tokenUsage: null,
});

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const renderedContent = computed(() => {
  return md.render(props.content || '');
});

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function copyContent() {
  navigator.clipboard.writeText(props.content).then(() => {
    ElMessage.success('报告已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
}

function exportMarkdown() {
  const blob = new Blob([props.content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AI个股诊断报告_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  ElMessage.success('报告已导出');
}
</script>

<style scoped lang="scss">
.ai-analysis-result {
  height: 100%;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.result-scrollbar {
  flex: 1;
  padding: 20px;
}

.step-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.loading-wait {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.result-actions {
  display: flex;
  gap: 8px;
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  color: var(--el-color-primary);
  font-size: 13px;
}

.result-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: #fafafa;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-primary);

  h1, h2, h3, h4 {
    margin-top: 20px;
    margin-bottom: 12px;
    font-weight: 600;
  }

  h1 { font-size: 20px; border-bottom: 1px solid var(--el-border-color-lighter); padding-bottom: 8px; }
  h2 { font-size: 18px; color: var(--el-color-primary); }
  h3 { font-size: 16px; }

  p { margin: 10px 0; }

  ul, ol { padding-left: 24px; margin: 10px 0; }

  li { margin: 6px 0; }

  code {
    background-color: #f1f2f4;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }

  pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    border: 1px solid var(--el-border-color-lighter);
    margin: 12px 0;

    code {
      background: none;
      padding: 0;
    }
  }

  blockquote {
    border-left: 4px solid var(--el-color-primary);
    padding-left: 12px;
    margin: 12px 0;
    color: var(--el-text-color-secondary);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;

    th, td {
      border: 1px solid var(--el-border-color-lighter);
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
  }
}
</style>
