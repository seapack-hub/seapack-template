<template>
  <div class="import-export-editor">
    <!-- 工具栏区域：文件操作按钮 + 富文本工具栏并排 -->
    <div class="toolbar-area">
      <Toolbar
        id="toolbar-container"
        :editor="editorRef"
        :default-config="toolbarConfig"
        :mode="mode"
      />
      <div class="file-actions">
        <el-button-group>
          <el-button size="small" @click="fileInput?.click()">
            <el-icon><Upload /></el-icon>
            <span class="btn-label">导入</span>
          </el-button>
          <el-dropdown size="small" trigger="click" @command="handleExport">
            <el-button size="small">
              <el-icon><Download /></el-icon>
              <span class="btn-label">导出</span>
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="md">.md Markdown</el-dropdown-item>
                <el-dropdown-item command="html">.html 网页</el-dropdown-item>
                <el-dropdown-item command="pdf">.pdf 文档</el-dropdown-item>
                <el-dropdown-item command="doc">.doc Word 文档</el-dropdown-item>
                <el-dropdown-item command="txt">.txt 纯文本</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-button-group>
      </div>
    </div>
    <!-- 编辑器主体 -->
    <Editor
      id="editor-container"
      v-model="modelValue"
      :default-config="editorConfig"
      :mode="mode"
      @on-change="handleChange"
      @on-created="handleCreated"
    />
    <!-- 隐藏的文件导入 input -->
    <input
      ref="fileInput"
      type="file"
      accept=".md,.html,.htm,.txt"
      style="display: none"
      @change="onFileSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { Upload, Download, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// @ts-ignore
import MarkdownIt from 'markdown-it'
import TurndownService from 'turndown'
import { exportHtmlToPdf } from '@/utils/export/htmlToPdf'
import { exportHtmlToDoc } from '@/utils/export/htmlToDoc'

// 文件上传 API（与原有 WangEditor 组件保持一致）
import FileAPI from '@/api/file'

// markdown-it 实例：导入 .md 文件时渲染为 HTML
const md = new MarkdownIt({ html: true })

// turndown 实例：导出 HTML 为 .md 文件
const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })

const props = defineProps({
  modelValue: { type: String, default: '' },
  excludeKeys: { type: Array<string>, default: () => [] },
  placeholder: { type: String, default: '请输入内容...' },
  filename: { type: String, default: 'article' },
})

const emit = defineEmits(['update:modelValue'])

const modelValue = useVModel(props, 'modelValue', emit)

const editorRef = shallowRef<any>()
const fileInput = ref<HTMLInputElement>()
const mode = ref('default')

const toolbarConfig = ref({
  excludeKeys: props.excludeKeys,
})

const editorConfig = ref({
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      async customUpload(file: File, insertFn: any) {
        FileAPI.upload(file).then((data) => {
          insertFn(data.url)
        })
      },
    },
  },
})

function handleCreated(editor: any) {
  editorRef.value = editor
}

function handleChange(editor: any) {
  modelValue.value = editor.getHtml()
}

// ---- 导入逻辑 ----

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (!content) {
      ElMessage.warning('文件内容为空')
      return
    }
    let html = ''
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'md') {
      html = md.render(content)
    } else if (ext === 'html' || ext === 'htm') {
      html = content
    } else {
      // .txt：换行转 <br>
      html = content.replace(/\r?\n/g, '<br>')
    }
    editorRef.value?.setHtml(html)
    ElMessage.success(`已导入 ${file.name}`)
  }
  reader.onerror = () => ElMessage.error('文件读取失败')
  reader.readAsText(file)
  // 重置 input，允许重复选择同一文件
  input.value = ''
}

// ---- 导出逻辑 ----

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleExport(format: 'md' | 'html' | 'txt' | 'pdf' | 'doc') {
  const html = editorRef.value?.getHtml() || ''
  if (!html || html === '<p></p>' || html === '<p><br></p>') {
    ElMessage.warning('编辑器内容为空，无法导出')
    return
  }

  const safeName = props.filename || 'article'
  const timestamp = Date.now()

  if (format === 'pdf') {
    exportHtmlToPdf(html, `${safeName}-${timestamp}.pdf`)
      .then(() => ElMessage.success(`已导出 ${safeName}-${timestamp}.pdf`))
      .catch(() => ElMessage.error('PDF 导出失败'))
    return
  }

  if (format === 'doc') {
    exportHtmlToDoc(html, `${safeName}-${timestamp}.doc`, { title: safeName })
    ElMessage.success(`已导出 ${safeName}-${timestamp}.doc`)
    return
  }
  
  let content = ''
  let mime = 'text/plain;charset=utf-8'
  let ext = ''

  if (format === 'html') {
    content = `<!DOCTYPE html>\n<html lang="zh-CN">\n<head><meta charset="UTF-8"><title>${safeName}</title></head>\n<body>\n${html}\n</body>\n</html>`
    ext = 'html'
  } else if (format === 'md') {
    content = turndownService.turndown(html)
    ext = 'md'
  } else {
    // txt
    content = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    ext = 'txt'
  }

  const blob = new Blob([content], { type: mime })
  downloadBlob(blob, `${safeName}-${timestamp}.${ext}`)
  ElMessage.success(`已导出 ${safeName}-${timestamp}.${ext}`)
}

/** 在光标位置插入 HTML 内容，供外部 AI 写作等功能调用 */
function insertContent(html: string) {
  if (editorRef.value) {
    editorRef.value.restoreSelection()
    editorRef.value.dangerouslyInsertHtml(html)
  }
}

/** 获取编辑器当前选中文本 */
function getSelectedText(): string {
  if (editorRef.value) {
    const sel = editorRef.value.selection
    if (sel) return sel.toString() 
  }
  return ''
}

/** 获取当前内容转换后的 Markdown */
function getContentMd(): string {
  const editor = editorRef.value
  if (!editor) return ''
  const html = editor.getHtml()
  if (!html) return ''
  return turndownService.turndown(html)
}

defineExpose({ 
  insertContent, 
  getSelectedText, 
  getContentMd,
  editorRef 
})

onBeforeUnmount(() => {
  editorRef.value?.destroy()
})
</script>

<!-- wangEditor 全局样式 -->
<style src="@wangeditor/editor/dist/css/style.css"></style>

<style scoped lang="scss">
.import-export-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.toolbar-area {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: #f7f8fa;
}

.file-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 3px 10px;
  border-right: 1px solid var(--el-border-color-lighter);
  margin-right: 8px;

  :deep(.el-button-group) {
    .el-button--small {
      height: 28px;
      padding: 4px 8px;
      font-size: 12px;

      .el-icon {
        font-size: 13px;
      }
    }
  }

  .btn-label {
    margin: 0 2px;
  }
}

#toolbar-container {
  flex: 1;
  border: none !important;
  padding: 0 !important;

  :deep(.w-e-toolbar) {
    border: none !important;
    background: transparent !important;
    flex-wrap: wrap;
    padding: 2px 0;
    min-height: 36px;
  }
}

#editor-container {
  flex: 1;

  :deep(.w-e-text-container) {
    border: none !important;
  }
}
</style>
