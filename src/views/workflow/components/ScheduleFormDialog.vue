<!--
  调度表单弹框
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑调度' : '新建调度'"
    width="600px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="调度名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入调度名称" />
      </el-form-item>
      <el-form-item label="关联工作流" prop="workflowId">
        <el-select v-model="form.workflowId" placeholder="选择工作流" filterable style="width: 100%">
          <el-option v-for="wf in workflowList" :key="wf.id" :label="wf.name" :value="wf.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="调度类型" prop="scheduleType">
        <el-select v-model="form.scheduleType" style="width: 100%">
          <el-option v-for="opt in SCHEDULE_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.scheduleType === 'cron'" label="Cron表达式" prop="cronExpression">
        <el-input v-model="form.cronExpression" placeholder="例: 0 0/30 * * * ?" />
      </el-form-item>
      <el-form-item v-if="form.scheduleType === 'interval'" label="间隔(秒)" prop="intervalSeconds">
        <el-input-number v-model="form.intervalSeconds" :min="60" :max="86400" controls-position="right" />
      </el-form-item>
      <el-form-item v-if="form.scheduleType === 'once'" label="执行时间" prop="scheduledTime">
        <el-date-picker v-model="form.scheduledTime" type="datetime" placeholder="选择执行时间" style="width: 100%" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="调度描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { WorkflowSchedule } from '@/api/workflow/types'
import { SCHEDULE_TYPE_OPTIONS } from '../utils/moduleOptions'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Partial<WorkflowSchedule>>('form', { required: true })

const props = defineProps<{
  workflowList: Array<{ id: number; name: string }>
}>()

const emit = defineEmits<{ confirm: [] }>()

const formRules = {
  name: [{ required: true, message: '请输入调度名称', trigger: 'blur' }],
  workflowId: [{ required: true, message: '请选择工作流', trigger: 'change' }],
  scheduleType: [{ required: true, message: '请选择调度类型', trigger: 'change' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

function onClosed() {
  isEdit.value = false
  formRef.value?.resetFields()
}

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    emit('confirm')
  } finally {
    submitting.value = false
  }
}
</script>
