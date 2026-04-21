<template>
  <div class="h-full flex flex-col border-[#e8e8e8] border-solid border-1 gap-10 p-x-10 p-y-20 box-border">
    <div class="h-[50px] flex items-center justify-center gap-10">
      <el-icon ><Folder /></el-icon>
      <span class="font-bold text-gray-800">我的知识库</span>
    </div>
    <!-- 文件上传卡片 -->
    <div class="h-[220px] mb-6 border-dashed border-2 border-blue-100 bg-blue-50/30">    
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
        :disabled="uploading"
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
      <div class="mt-4 flex items-center p-r-10">
        <el-text size="small" class="mr-2 w-[130px] text-right">知识库空间：</el-text>
        <el-input
          v-model="currentNamespace"
          placeholder="请输入知识库空间"
          size="small"
          @keyup.enter="handleSend"
        />
      </div>
    </div>

    <!-- 知识库列表 -->
    <el-scrollbar class="flex-1 min-h-0">
      <div class="p-1"> <!-- 包裹层防止 tag 贴边 -->
        <div v-if="namespaceList.length === 0" class="text-gray-400 italic text-center mt-4">
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
import {Folder, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElScrollbar, UploadInstance, UploadProps } from 'element-plus'
import { useChatStore } from '@/store/modules/chat'
import { ragApi } from '@/api/ai/rag'
import emitter from '@/utils/bus';

const uploadRef = ref<UploadInstance>()
const store = useChatStore()

const currentNamespace = ref('') // 默认命名空间
const namespaceList = ref<string[]>([]) // Mock数据
const uploading = ref(false) // 新增：上传状态

// --- 文件上传逻辑 ---
// 文件改变时的钩子
const onFileChange: UploadProps['onChange'] = async (file) => {
  // 1. 校验命名空间
  if (!currentNamespace.value.trim()) {
    ElMessage.warning('请先输入或选择“知识库空间”')
    uploadRef.value?.clearFiles() // 清空文件选择
    return
  }

  // 2. 校验文件对象是否存在
  if (!file.raw) {
    ElMessage.error('文件读取失败，请重新选择')
    return
  }

  uploading.value = true // 开始上传

  const formData = new FormData()
  formData.append('file', file.raw!)
  formData.append('namespace', currentNamespace.value)
  try {
    // 这里假设你有一个专门的 upload API
    await ragApi.ingestFile(formData);
    ElMessage.success(`《${file.name}》上传成功！`)
    store.addMessage({
      role: 'assistant',
      content: `✅ **文件入库成功**\n\n文件名：${file.name}\n空间：${currentNamespace.value}\n\n您可以开始提问了。`
    })
    uploadRef.value?.clearFiles() // 清空选择
    //加载知识库列表
    fetchNamespaces()
  } catch (err: any) {
    ElMessage.error(`上传失败: ${err.message}`)
  }finally {
    uploading.value = false // 无论成功失败，结束上传状态
  }
}

// 处理文件超出限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessageBox.alert('只允许同时上传一个文件，请先删除再上传新文件。', '警告', { type: 'warning' })
}

const handleSend = async () => {
  //发送到主页面
}

// 1. 获取知识库列表
const fetchNamespaces = async () => {
  namespaceList.value = await ragApi.getNamespaces();
};

// 2. 切换命名空间
const selectNamespace = (ns: string) => {
  currentNamespace.value = ns
  ElMessage.info(`切换到空间: ${ns}`)
}
// 监听命名空间变化
watch(() => currentNamespace.value, (newVal) => {
  emitter.emit('update-namespace', newVal)
})

// 初始化时获取知识库列表
onMounted(() => {
  fetchNamespaces()
})
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