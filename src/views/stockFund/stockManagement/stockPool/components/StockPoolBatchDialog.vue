<template>
  <!-- 股票池批量导入弹框 -->
  <el-dialog v-model="visible" title="批量导入股票" width="520px">
    <div class="mb-8px text-13px text-gray-400">每行一个股票代码，支持 SH / SZ 前缀，如：</div>
    <div class="mb-12px text-13px text-gray-400 bg-[#f5f7fa] p-8px rounded-4px font-mono">600519<br />000858<br />SH600036<br />SZ000001</div>
    <el-input v-model="batchText" type="textarea" :rows="8" placeholder="请粘贴股票代码，每行一个..." />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit">导入</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
const visible = defineModel<boolean>('visible', { required: true })
const emit = defineEmits<{ confirm: [codes: string[]] }>()

const batchText = ref('')
const loading = ref(false)

/* 按行分割文本，过滤空行后 emit codes 给父组件处理 */
async function onSubmit() {
  const codes = batchText.value.split('\n').map(s => s.trim()).filter(Boolean)
  if (!codes.length) { ElMessage.warning('请输入股票代码'); return }
  loading.value = true
  try {
    emit('confirm', codes)
    batchText.value = ''
  } finally { loading.value = false }
}
</script>
