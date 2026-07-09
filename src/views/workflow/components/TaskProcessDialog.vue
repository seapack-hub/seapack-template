<!--
  人工任务处理弹框
-->
<template>
  <el-dialog v-model="visible" title="处理任务" width="600px">
    <div v-if="currentTask" class="mb-16px">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="任务标题">{{ currentTask.title }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">{{ taskTypeLabel }}</el-descriptions-item>
        <el-descriptions-item label="工作流" :span="2">{{ currentTask.workflowName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentTask.description || '无' }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <el-form :model="processForm" label-width="80px">
      <el-form-item label="审核意见">
        <el-radio-group v-model="processForm.action">
          <el-radio value="approve">通过</el-radio>
          <el-radio value="reject">驳回</el-radio>
          <el-radio value="return">退回</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="processForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { HumanTaskAPI } from '@/api/workflow/humanTask'
import type { HumanTask } from '@/api/workflow/types'

const visible = defineModel<boolean>('visible', { required: true })
const currentTask = defineModel<HumanTask | null>('currentTask', { required: true })

const emit = defineEmits<{ success: [] }>()

const taskTypeLabel = computed(() => currentTask.value?.taskType || '')

const processForm = reactive({
  action: 'approve' as string,
  comment: '',
})

const submitting = ref(false)

async function onSubmit() {
  if (!currentTask.value) return
  submitting.value = true
  try {
    await HumanTaskAPI.handle(currentTask.value.id!, {
      action: processForm.action,
      comment: processForm.comment,
    })
    ElMessage.success('处理成功')
    visible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}
</script>
