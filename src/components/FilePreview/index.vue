<template>
  <div class="file-preview" :style="{ height: height || '100%' }">
    <div class="fp-toolbar">
      <div class="fp-toolbar-left">
        <span class="fp-filename">{{ displayName }}</span>
        <el-tag size="small" type="info">{{ extLabel }}</el-tag>
      </div>
      <div class="fp-toolbar-right">
        <el-button size="small" title="下载" @click="handleDownload">
          <el-icon><Download /></el-icon>
          <span class="btn-text">下载</span>
        </el-button>
      </div>
    </div>
    <div class="fp-body">
      <div ref="containerRef" class="fp-renderer" :class="{ 'fp-renderer--hidden': loading || error }"></div>
      <div v-if="loading" class="fp-status">
        <el-icon class="fp-loading-icon" :size="32"><Loading /></el-icon>
        <p>正在加载预览...</p>
      </div>
      <div v-else-if="error" class="fp-status">
        <el-empty :description="errorMessage" />
        <el-button size="small" @click="handleDownload">下载文件</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Download, Loading } from '@element-plus/icons-vue'

const props = defineProps({
  file: { type: [File, Blob], required: true },
  filename: { type: String, default: '' },
  type: { type: String, default: '' },
  height: { type: String, default: '100%' },
})

const emit = defineEmits<{
  close: []
  download: [filename: string]
  error: [message: string]
}>()

const containerRef = ref<HTMLElement>()
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
let cleanup: (() => void) | null = null

const ext = computed(() => {
  if (props.type) return props.type.toLowerCase()
  const name = props.filename || (props.file as File).name || ''
  return name.split('.').pop()?.toLowerCase() || ''
})

const displayName = computed(() => {
  return props.filename || (props.file as File).name || '未知文件'
})

const extLabel = computed(() => {
  const map: Record<string, string> = {
    pdf: 'PDF',
    docx: 'DOCX',
    xls: 'XLS', xlsx: 'XLSX',
    ppt: 'PPT', pptx: 'PPTX',
    txt: 'TXT', log: 'LOG',
    md: 'Markdown',
    html: 'HTML', htm: 'HTML',
    csv: 'CSV',
    json: 'JSON', xml: 'XML', yml: 'YAML', yaml: 'YAML', ini: 'INI',
    jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', gif: 'GIF', svg: 'SVG', webp: 'WEBP',
  }
  return map[ext.value] || ext.value.toUpperCase()
})

const imageExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'])

async function startRender() {
  const container = containerRef.value
  if (!container) return

  loading.value = true
  error.value = false
  errorMessage.value = ''
  // 清理上一次渲染
  cleanup?.()
  cleanup = null

  try {
    const fext = ext.value
    const fileData = props.file

    if (fext === 'pdf') {
      const buffer = await fileData.arrayBuffer()
      const { renderPdf } = await import('./renderers/pdf')
      cleanup = await renderPdf(container, buffer)
    } else if (fext === 'docx') {
      const buffer = await fileData.arrayBuffer()
      const { renderDocx } = await import('./renderers/docx')
      cleanup = await renderDocx(container, buffer)
    } else if (fext === 'xls' || fext === 'xlsx') {
      const buffer = await fileData.arrayBuffer()
      const { renderSpreadsheet } = await import('./renderers/spreadsheet')
      cleanup = await renderSpreadsheet(container, buffer)
    } else if (fext === 'csv') {
      const text = await fileData.text()
      const { renderSpreadsheet } = await import('./renderers/spreadsheet')
      const encoder = new TextEncoder()
      cleanup = await renderSpreadsheet(container, encoder.encode(text).buffer as ArrayBuffer)
    } else if (fext === 'md') {
      const text = await fileData.text()
      const { renderMarkdown } = await import('./renderers/markdown')
      cleanup = await renderMarkdown(container, text)
    } else if (fext === 'html' || fext === 'htm') {
      const text = await fileData.text()
      const { renderHtml } = await import('./renderers/html')
      cleanup = await renderHtml(container, text)
    } else if (imageExts.has(fext)) {
      const buffer = await fileData.arrayBuffer()
      const { renderImage } = await import('./renderers/image')
      cleanup = await renderImage(container, buffer, fileData.type)
    } else {
      // 默认按文本渲染
      const text = await fileData.text()
      const { renderText } = await import('./renderers/text')
      cleanup = await renderText(container, text)
    }
  } catch (e: any) {
    error.value = true
    errorMessage.value = e?.message || '文件预览失败'
    emit('error', errorMessage.value)
  } finally {
    loading.value = false
  }
}

function handleDownload() {
  const name = props.filename || (props.file as File).name || 'download'
  emit('download', name)

  const url = URL.createObjectURL(props.file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(startRender)
watch(() => props.file, startRender, { flush: 'post' })

onBeforeUnmount(() => {
  cleanup?.()
})
</script>

<style scoped lang="scss">
.file-preview {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-sizing: border-box;
}

.fp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #f7f8fa;
  flex-shrink: 0;
  user-select: none;

  &-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
}

.fp-filename {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.btn-text {
  margin-left: 4px;
}

.fp-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
}

.fp-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  gap: 16px;
  color: var(--el-text-color-secondary);

  .fp-loading-icon {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fp-renderer {
  height: 100%;

  &--hidden {
    display: none;
  }

  :deep(.text-preview) {
    margin: 0;
    padding: 20px;
    font-size: 13px;
    line-height: 1.6;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    background: #fafafa;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }

  :deep(.html-preview) {
    width: 100%;
    height: 100%;
    border: none;
  }

  :deep(.image-preview) {
    display: block;
    max-width: 100%;
    max-height: 100%;
    margin: 0 auto;
    object-fit: contain;
  }

  :deep(.pdf-viewport) {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: #e8e8e8;
    min-height: 100%;
  }

  :deep(.pdf-nav) {
    flex-shrink: 0;
    padding: 8px 16px;
    background: #f7f8fa;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    justify-content: center;
  }

  :deep(.pdf-nav-inner) {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :deep(.pdf-nav-btn) {
    width: 32px;
    height: 32px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 16px;

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }
    &:hover:not(:disabled) {
      background: var(--el-color-primary-light-9);
    }
  }

  :deep(.pdf-page-info) {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    min-width: 60px;
    text-align: center;
  }

  :deep(.pdf-sep) {
    width: 1px;
    height: 20px;
    background: var(--el-border-color-lighter);
    margin: 0 4px;
  }

  :deep(.pdf-scale-range) {
    width: 80px;
    cursor: pointer;
  }

  :deep(.pdf-scale-label) {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    min-width: 36px;
  }

  :deep(.pdf-page-canvas) {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    margin-bottom: 16px;
  }

  :deep(.ss-tabs) {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: #f7f8fa;
    overflow-x: auto;
    flex-shrink: 0;
  }

  :deep(.ss-tab) {
    padding: 6px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    border-bottom: 2px solid transparent;

    &.active {
      color: var(--el-color-primary);
      border-bottom-color: var(--el-color-primary);
      font-weight: 500;
    }
    &:hover:not(.active) {
      background: var(--el-color-primary-light-9);
    }
  }

  :deep(.ss-content) {
    padding: 12px;
    overflow: auto;
    flex: 1;

    table {
      font-size: 13px;
      border-collapse: collapse;

      td, th {
        border: 1px solid var(--el-border-color-light);
        padding: 4px 8px;
        white-space: nowrap;
      }
      th {
        background: #f7f8fa;
        font-weight: 600;
      }
    }
  }

  :deep(.docx-preview) {
    padding: 20px;
    font-size: 12pt;
    line-height: 1.6;
  }

  :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
    margin-top: 1.2em;
    margin-bottom: 0.6em;
  }
  :deep(p) {
    margin: 0.6em 0;
  }
  :deep(img) {
    max-width: 100%;
  }
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    td, th {
      border: 1px solid var(--el-border-color-light);
      padding: 6px;
    }
  }
}
</style>
