<template>
  <div class="knowledge-base">
    <!-- 标题 -->
    <div class="kb-header">
      <el-icon><Folder /></el-icon>
      <span class="kb-title">我的知识库</span>
    </div>

    <!-- 文件上传区 -->
    <div class="kb-upload">
      <el-upload
        ref="uploadRef"
        class="upload-wrapper"
        drag
        :auto-upload="false"
        :on-change="onFileChange"
        :limit="1"
        :on-exceed="handleExceed"
        accept=".txt,.pdf,.doc,.docx"
        :disabled="uploading"
      >
        <el-icon class="el-icon--upload" :size="32"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到这里，或 <em>点击选择</em>
        </div>
        <template #tip>
          <div class="upload-tip">支持 TXT / PDF / DOC / DOCX</div>
        </template>
      </el-upload>

      <div class="namespace-row">
        <el-input
          v-model="currentNamespace"
          placeholder="输入知识库空间名称"
          size="default"
          clearable
        >
          <template #prepend>空间</template>
        </el-input>
      </div>
    </div>

    <!-- 知识库空间列表 -->
    <div class="kb-namespace-section">
      <div class="section-header">
        <span class="section-title">已有空间</span>
        <el-tag size="small" type="info" effect="plain">{{ namespaceList.length }}</el-tag>
      </div>
      <el-scrollbar class="namespace-scroll" max-height="280px">
        <div v-if="namespaceList.length === 0" class="empty-tip">
          <el-icon :size="20" color="#c0c4cc"><FolderDelete /></el-icon>
          <span>暂无空间数据</span>
        </div>
        <div
          v-for="ns in namespaceList"
          :key="ns"
          class="namespace-item"
          :class="{ active: ns === currentNamespace }"
          @click="selectNamespace(ns)"
        >
          <el-icon :size="16" :color="ns === currentNamespace ? '#409eff' : '#909399'">
            <FolderOpened />
          </el-icon>
          <span class="namespace-name">{{ ns }}</span>
          <el-tag v-if="ns === currentNamespace" size="small" type="primary" effect="dark">当前</el-tag>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Folder, UploadFilled, FolderDelete, FolderOpened } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, UploadInstance, UploadProps } from 'element-plus'
import { useChatStore } from '@/store/modules/chat'
import { ragApi } from '@/api/ai/rag'
import emitter from '@/utils/bus'

const uploadRef = ref<UploadInstance>()
const store = useChatStore()

const currentNamespace = ref('')
const namespaceList = ref<string[]>([])
const uploading = ref(false)

const onFileChange: UploadProps['onChange'] = async (file) => {
  if (!currentNamespace.value.trim()) {
    ElMessage.warning('请先输入知识库空间名称')
    uploadRef.value?.clearFiles()
    return
  }
  if (!file.raw) {
    ElMessage.error('文件读取失败，请重新选择')
    return
  }

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file.raw!)
  formData.append('namespace', currentNamespace.value)
  try {
    await ragApi.ingestFile(formData)
    ElMessage.success(`《${file.name}》上传成功！`)
    store.addMessage({
      role: 'assistant',
      content: `文件 **${file.name}** 已入库（空间：${currentNamespace.value}）。您可以开始提问了。`
    })
    uploadRef.value?.clearFiles()
    fetchNamespaces()
  } catch (err: any) {
    ElMessage.error(`上传失败: ${err.message}`)
  } finally {
    uploading.value = false
  }
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessageBox.alert('只允许同时上传一个文件，请先删除再上传新文件。', '提示', { type: 'warning' })
}

const fetchNamespaces = async () => {
  namespaceList.value = await ragApi.getNamespaces()
}

const selectNamespace = (ns: string) => {
  currentNamespace.value = ns
  ElMessage.info(`已切换到空间: ${ns}`)
}

watch(() => currentNamespace.value, (newVal) => {
  emitter.emit('update-namespace', newVal)
})

onMounted(() => {
  fetchNamespaces()
})
</script>

<style scoped lang="scss">
.knowledge-base {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
  overflow: hidden;
}

.kb-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.kb-upload {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: #f8faff;
  border: 1px solid #e6f0ff;
  border-radius: 10px;
}

.upload-wrapper {
  width: 100%;

  :deep(.el-upload-dragger) {
    background: transparent;
    border: 1px dashed #c0d8ff;
    border-radius: 8px;
    padding: 18px 0;
    width: 100%;

    &:hover {
      border-color: #409eff;
    }

    .el-icon--upload {
      margin-bottom: 6px;
    }
  }
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  text-align: center;
  margin-top: 2px;
}

.namespace-row {
  width: 100%;

  :deep(.el-input-group__prepend) {
    background: #ecf5ff;
    color: #409eff;
    border-color: #c6e2ff;
    font-size: 12px;
    width: 50px;
    text-align: center;
  }
}

.kb-namespace-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.namespace-scroll {
  flex: 1;

  .empty-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 32px 0;
    color: #c0c4cc;
    font-size: 13px;
  }
}

.namespace-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
  margin-bottom: 2px;

  &:hover {
    background-color: #f0f5ff;
  }

  &.active {
    background-color: #ecf5ff;
  }
}

.namespace-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
