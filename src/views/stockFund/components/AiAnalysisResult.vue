<template>
  <div class="ai-analysis-result">
    <!-- 空状态 -->
    <div v-if="!content && !loading" class="empty-state">
      <el-empty :image-size="120" description="输入股票代码，获取 AI 个股诊断报告" />
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading && !content" class="loading-state">
      <el-skeleton animated :rows="10" />
      <div class="loading-text">{{ loadingText }}</div>
    </div>

    <!-- 结果内容 -->
    <el-scrollbar v-else class="result-scrollbar">
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

      <div v-if="loading && content" class="streaming-indicator">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>继续生成中...</span>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { DocumentCopy, Download, RefreshRight, Loading, TrendCharts } from '@element-plus/icons-vue';
// @ts-ignore
import MarkdownIt from 'markdown-it';

interface Props {
  content?: string;
  loading?: boolean;
  title?: string;
  loadingText?: string;
  onRefresh?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  loading: false,
  title: 'AI 个股诊断报告',
  loadingText: 'AI 正在分析行情、分红、K线等数据，请稍候...',
});

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

const renderedContent = computed(() => {
  return md.render(props.content || '');
});

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

.empty-state,
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.result-scrollbar {
  flex: 1;
  padding: 20px;
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
