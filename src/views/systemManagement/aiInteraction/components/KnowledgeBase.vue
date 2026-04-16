<template>
  <div class="h-full flex flex-col border-[#e8e8e8] border-solid border-1 gap-10 p-x-10 p-y-20 box-border">
    <div class="h-[50px] flex items-center justify-center gap-10">
      <el-icon ><Folder /></el-icon>
      <span class="font-bold text-gray-800">我的知识库</span>
    </div>
    <!-- 文件上传卡片 -->
    <div class="h-[200px] mb-6 border-dashed border-2 border-blue-100 bg-blue-50/30">    
      <!-- Element Plus 上传组件 -->
      <el-upload
        ref="uploadRef"
        class="upload-wrapper"
        drag
        :auto-upload="false"
        :on-change="onFileChange"
        :limit="1"
        :on-exceed="handleExceed"
        accept=".txt,.pdf,.doc,.docx"
      >
        <el-icon class="el-icon--upload text-blue-500"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到这里，或 <em>点击选择</em>
        </div>
        <template #tip>
          <div class="el-upload__tip text-center">
            支持格式：TXT, PDF, DOC, DOCX
          </div>
        </template>
      </el-upload>

      <!-- 命名空间选择 -->
      <div class="mt-4 flex items-center">
        <el-text size="small" class="mr-2 w-[130px] text-right">知识库空间：</el-text>
        <el-input
          v-model="currentNamespace"
          placeholder="请输入命名空间"
          size="small"
          @keyup.enter="handleSend"
        />
      </div>
    </div>

    <!-- 知识库列表 -->
    <el-scrollbar class="flex-1 min-h-0">
      <div class="p-1"> <!-- 包裹层防止 tag 贴边 -->
        <div v-if="namespaceList.length === 0" class="text-xs text-gray-400 italic text-center mt-4">
          暂无数据
        </div>
        <el-tag
          v-for="ns in namespaceList"
          :key="ns"
          class="m-1 cursor-pointer hover:scale-105 transition-transform"
          :type="ns === currentNamespace ? 'primary' : 'info'"
          :effect="ns === currentNamespace ? 'dark' : 'plain'"
          @click="selectNamespace(ns)"
          >
          {{ ns }}
        </el-tag>
        </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import {Folder, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElScrollbar, UploadInstance, UploadProps } from 'element-plus'
import { useChatStore } from '@/store/modules/chat'

const uploadRef = ref<UploadInstance>()
const store = useChatStore()

const currentNamespace = ref('') // 默认命名空间
const namespaceList = ref<string[]>(['命名空间一', '命名空间二']) // Mock数据

// --- 文件上传逻辑 ---
// 文件改变时的钩子
const onFileChange: UploadProps['onChange'] = async (file) => {
  const formData = new FormData()
  formData.append('file', file.raw!)
  formData.append('namespace', currentNamespace.value)

  try {
    // 这里假设你有一个专门的 upload API
    const response = await axios.post('/api/rag/ingest-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000
    })

    if (response.data.code === 200) {
      ElMessage.success(`《${file.name}》上传成功！`)
      store.addMessage({
        role: 'assistant',
        content: `✅ **文件入库成功**\n\n文件名：${file.name}\n空间：${currentNamespace.value}\n\n您可以开始提问了。`
      })
      uploadRef.value?.clearFiles() // 清空选择
    }
  } catch (err: any) {
    ElMessage.error(`上传失败: ${err.message}`)
  }
}

// 处理文件超出限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessageBox.alert('只允许同时上传一个文件，请先删除再上传新文件。', '警告', { type: 'warning' })
}

const handleSend = async () => {
  //发送到主页面
}

const selectNamespace = (ns: string) => {
  currentNamespace.value = ns
  ElMessage.info(`切换到空间: ${ns}`)
}
</script>

<style lang="scss" scoped>
/* 修复 Element Plus 上传组件在 Card 中的一些边距问题 */
:deep(.el-upload-dragger) {
  background-color: transparent;
  border: none;
  box-shadow: none;
  width: 100%;
  padding: 10px 0;
}
</style>