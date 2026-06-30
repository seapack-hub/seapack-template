<template>
  <div class="app-container">
    <PageHeader title="文件预览" description="选择或拖拽文件以预览其内容，支持多种常见格式" />

    <div class="preview-body">
      <!-- 文件选择区 -->
      <div
        class="upload-zone"
        :class="{ 'upload-zone--active': dragOver, 'upload-zone--filled': !!selectedFile }"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
        @click="fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.docx,.xls,.xlsx,.csv,.txt,.log,.json,.xml,.md,.html,.htm,.jpg,.jpeg,.png,.gif,.svg,.webp"
          style="display: none"
          @change="onFileChange"
        />

        <div v-if="!selectedFile" class="upload-placeholder">
          <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
          <p class="upload-title">拖拽文件到此处，或 <em>点击选择文件</em></p>
          <p class="upload-hint">
            支持 PDF / DOCX / XLSX / CSV / MD / HTML / TXT / 图片 等格式
          </p>
        </div>

        <div v-else class="upload-result">
          <el-icon class="file-icon" :size="28"><Document /></el-icon>
          <div class="file-info">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatSize(selectedFile.size) }}</span>
          </div>
          <el-tag size="small" type="info">{{ getExt(selectedFile.name) }}</el-tag>
          <el-button size="small" class="clear-btn" @click.stop="clearFile">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 格式快捷入口 -->
      <div class="format-bar">
        <span class="format-label">快速选择示例：</span>
        <el-button
          v-for="fmt in quickFormats"
          :key="fmt.ext"
          size="small"
          :type="getExt(selectedFile?.name || '') === fmt.ext ? 'primary' : 'default'"
          @click="createSample(fmt.ext)"
        >
          <el-icon><component :is="fmt.icon" /></el-icon>
          {{ fmt.label }}
        </el-button>
      </div>

      <!-- 预览区域 -->
      <div v-if="selectedFile" class="preview-section">
        <div class="preview-header">
          <el-icon><View /></el-icon>
          <span>文件预览</span>
        </div>
        <FilePreview
          :key="previewKey"
          :file="selectedFile"
          class="preview-container"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  UploadFilled, Document, Close,
  Files, Picture, DocumentCopy, DataAnalysis,
} from '@element-plus/icons-vue'
import FilePreview from '@/components/FilePreview/index.vue'

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const dragOver = ref(false)
const previewKey = ref(0)

const quickFormats = [
  { ext: 'pdf', label: 'PDF', icon: DocumentCopy },
  { ext: 'docx', label: 'DOCX', icon: Files },
  { ext: 'xlsx', label: 'XLSX', icon: DataAnalysis },
  { ext: 'md', label: 'MD', icon: Document },
  { ext: 'txt', label: 'TXT', icon: Document },
  { ext: 'png', label: '图片', icon: Picture },
  { ext: 'html', label: 'HTML', icon: DocumentCopy },
]

function getExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || ''
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function setFile(file: File) {
  selectedFile.value = file
  previewKey.value++
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) setFile(file)
  input.value = ''
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function clearFile() {
  selectedFile.value = null
}

async function createSample(ext: string) {
  const samples: Record<string, { name: string; content: string | Blob }> = {
    pdf: { name: 'sample.pdf', content: await fetchPdfSample() },
    docx: { name: 'sample.docx', content: await fetchDocxSample() },
    xlsx: { name: 'sample.xlsx', content: await fetchXlsxSample() },
    md: { name: 'sample.md', content: '# Markdown 示例\n\n这是一段 **加粗** 文本和 `代码`。\n\n- 列表项一\n- 列表项二\n' },
    txt: { name: 'sample.txt', content: '这是纯文本示例文件。\n第二行内容。\n第三行内容。' },
    png: { name: 'sample.png', content: await fetchPngSample() },
    html: { name: 'sample.html', content: '<!DOCTYPE html><html><body style="padding:40px;font-family:sans-serif"><h1>Hello World</h1><p>这是一个 HTML 预览示例。</p></body></html>' },
  }

  const sample = samples[ext]
  if (!sample) return

  const file = new File(
    [sample.content],
    sample.name,
    { type: getMimeType(ext) },
  )
  setFile(file)
}

function getMimeType(ext: string) {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    md: 'text/markdown',
    txt: 'text/plain',
    png: 'image/png',
    html: 'text/html',
  }
  return map[ext] || 'application/octet-stream'
}

function fetchPdfSample() {
  // 返回一个最小有效 PDF（空白页）
  const base64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNjUgMDAwMDAgbiAKMDAwMDAwMDEyNCAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDQgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjE4NgolJUVPRA=='
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: 'application/pdf' })
}

function fetchDocxSample() {
  // DOCX 文件头（有效的 ZIP 最小结构）
  // 使用一个已知的最小有效 docx 的 base64
  const base64 = 'UEsDBBQAAAAIAAAAAADpAAAAAAAAJAAAABMAW0NvbnRlbnRfVHlwZXNdLnhtbIBRAQrDMAi8+wqhd5O0P6CULvSBvsDW2AhGjYj7+7qN9tJjQbg7OJi1jZPlqPktGkABmNRtBxz/9aMHDsMbeX5jH5I3sM5+kuAT3pUMwWzQBYLB3Y8+d+2KFGd7fysPeK11hLNSXwc9FFdn6y/BAwAA//8DAFBLAQIUABQAAAAIAAAAAADpAAAAAAAAJgAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAF9yZWxzLy5yZWxzUEsFBgAAAAABAAEATAAAAH4AAAAtAAAA'
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

function fetchXlsxSample() {
  const base64 = 'UEsDBBQAAAAIAAAAAADpAAAAAAAAJAAAABMAW0NvbnRlbnRfVHlwZXNdLnhtbIBRAQrDMAi8+wqhd5O0P6CULvSBvsDW2AhGjYj7+7qN9tJjQbg7OJi1jZPlqPktGkABmNRtBxz/9aMHDsMbeX5jH5I3sM5+kuAT3pUMwWzQBYLB3Y8+d+2KFGd7fysPeK11hLNSXwc9FFdn6y/BAwAA//8DAFBLAQIUABQAAAAIAAAAAADpAAAAAAAAJgAAAAAAAAAAACQAAAAAAAAAAAAAAAAAAF9yZWxzLy5yZWxzUEsFBgAAAAABAAEATAAAAH4AAAAtAAAA'
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

function fetchPngSample() {
  // 1x1 像素透明 PNG
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: 'image/png' })
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  background: #f5f7fa;
}

.preview-body {
  margin-top: 16px;
  max-width: 1100px;
}

.upload-zone {
  border: 2px dashed var(--el-border-color);
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fff;

  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &--active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
  }

  &--filled {
    padding: 14px 20px;
    cursor: default;
    border-style: solid;
    border-color: var(--el-border-color-light);

    &:hover {
      background: #fff;
    }
  }
}

.upload-placeholder {
  .upload-icon {
    color: var(--el-color-primary);
    margin-bottom: 12px;
  }

  .upload-title {
    font-size: 16px;
    color: var(--el-text-color-primary);
    margin: 0 0 8px;

    em {
      color: var(--el-color-primary);
      font-style: normal;
      font-weight: 500;
    }
  }

  .upload-hint {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}

.upload-result {
  display: flex;
  align-items: center;
  gap: 12px;

  .file-icon {
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    flex: 1;

    .file-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 400px;
    }

    .file-size {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .clear-btn {
    flex-shrink: 0;
  }
}

.format-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);

  .format-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    margin-right: 4px;
  }
}

.preview-section {
  margin-top: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #fafafa;
}

.preview-container {
  height: 70vh;
  min-height: 400px;
}
</style>
