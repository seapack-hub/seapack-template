<!--
  文档管理抽屉
  上传文档 + 文档列表 + 状态管理
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`文档管理 — ${knowledgeName}`"
    size="800px"
    @opened="onOpened"
  >
    <!-- 上传区域 -->
    <div class="upload-area">
      <el-upload
        ref="uploadRef"
        class="upload-wrapper"
        drag
        :auto-upload="false"
        :on-change="onFileChange"
        :limit="1"
        :on-exceed="handleExceed"
        accept=".txt,.pdf,.doc,.docx,.md"
        :disabled="uploading"
      >
        <el-icon class="el-icon--upload" :size="32"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到这里，或 <em>点击选择</em>
        </div>
        <template #tip>
          <div class="upload-tip">支持 TXT / PDF / DOC / DOCX / MD，单次上传一个文件</div>
        </template>
      </el-upload>
    </div>

    <!-- 文档列表 -->
    <div class="flex items-center justify-between mb-12px mt-16px">
      <span class="text-14px font-600">文档列表</span>
      <el-button text type="primary" size="small" @click="fetchDocuments">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
    </div>

    <SpTable
      v-loading="loadingDocs"
      :data="documents"
      :columns="docColumns"
      :show-index="true"
      size="small"
      class="flex-1"
    >
      <template #parseStatus>
        <el-table-column label="解析状态" prop="parseStatus" width="100" align="center" slot-name="parseStatus">
          <template #default="{ row }">
            <el-tag :type="(PARSE_STATUS_MAP[row.parseStatus]?.type as any) || 'info'" size="small">
              {{ PARSE_STATUS_MAP[row.parseStatus]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
      </template>
      <template #vectorStatus>
        <el-table-column label="向量化" prop="vectorStatus" width="100" align="center" slot-name="vectorStatus">
          <template #default="{ row }">
            <el-tag :type="(VECTOR_STATUS_MAP[row.vectorStatus]?.type as any) || 'info'" size="small">
              {{ VECTOR_STATUS_MAP[row.vectorStatus]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
      </template>
      <template #operate>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :disabled="row.parseStatus === 1 || row.vectorStatus === 1" @click="handleReprocess(row)">
              重新处理
            </el-button>
            <el-button link type="danger" size="small" @click="handleDeleteDoc(row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <div class="h-[40px] mt-10px">
      <Pagination
        v-model:total="docTotal"
        v-model:page="docQuery.pageNum"
        v-model:limit="docQuery.pageSize"
        @pagination="fetchDocuments"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { UploadFilled, Refresh } from '@element-plus/icons-vue'
import { ElMessageBox, type UploadInstance, type UploadProps } from 'element-plus'
import { KnowledgeBaseAPI, type KnowledgeDocument } from '@/api/ai/knowledgeBase'
import { DOCUMENT_LIST_COLUMNS } from '../utils/tableColumns'
import { PARSE_STATUS_MAP, VECTOR_STATUS_MAP } from '../utils/moduleOptions'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  knowledgeId: number
  knowledgeName: string
}>()

const uploadRef = ref<UploadInstance>()
const uploading = ref(false)
const loadingDocs = ref(false)
const documents = ref<KnowledgeDocument[]>([])
const docTotal = ref(0)
const docQuery = reactive({ pageNum: 1, pageSize: 10 })

const docColumns = [...DOCUMENT_LIST_COLUMNS]

function onOpened() {
  docQuery.pageNum = 1
  fetchDocuments()
}

async function fetchDocuments() {
  loadingDocs.value = true
  try {
    const res = await KnowledgeBaseAPI.getDocuments(props.knowledgeId, docQuery)
    documents.value = res.list || []
    docTotal.value = res.total || 0
  } finally {
    loadingDocs.value = false
  }
}

const onFileChange: UploadProps['onChange'] = async (file) => {
  if (!file.raw) {
    ElMessage.error('文件读取失败，请重新选择')
    return
  }
  uploading.value = true
  try {
    await KnowledgeBaseAPI.uploadDocument(props.knowledgeId, file.raw)
    ElMessage.success(`《${file.name}》上传成功，后台正在解析和向量化`)
    uploadRef.value?.clearFiles()
    await fetchDocuments()
  } catch (err: any) {
    ElMessage.error(`上传失败: ${err.message}`)
  } finally {
    uploading.value = false
  }
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessageBox.alert('只允许同时上传一个文件，请先删除再上传新文件。', '提示', { type: 'warning' })
}

async function handleReprocess(row: KnowledgeDocument) {
  await ElMessageBox.confirm(`确认重新处理文档【${row.fileName}】？`, '提示', { type: 'warning' })
  await KnowledgeBaseAPI.reprocessDocument(props.knowledgeId, row.id!)
  ElMessage.success('已提交重新处理任务')
  await fetchDocuments()
}

async function handleDeleteDoc(row: KnowledgeDocument) {
  await ElMessageBox.confirm(`确认删除文档【${row.fileName}】？关联的分片也将被删除。`, '提示', { type: 'warning' })
  await KnowledgeBaseAPI.deleteDocument(props.knowledgeId, row.id!)
  ElMessage.success('删除成功')
  await fetchDocuments()
}
</script>

<style scoped>
.upload-area {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}
.upload-wrapper :deep(.el-upload-dragger) {
  background: transparent;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 20px 0;
}
.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
  margin-top: 4px;
}
</style>
