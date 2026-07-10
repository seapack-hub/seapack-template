<!--
  工作流定义表单弹框
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑工作流' : '新建工作流'"
    width="500px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入工作流名称" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入工作流编码" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="分类">
        <el-tree-select
          v-model="form.categoryId"
          :data="categoryOptions"
          :props="{ label: 'name', children: 'children' }" value-key="id"
          check-strictly
          clearable
          placeholder="请选择分类"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { WorkflowDefinition, WorkflowCategory } from '@/api/workflow/types'
import { WorkflowCategoryAPI } from '@/api/workflow'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Partial<WorkflowDefinition>>('form', { required: true })

const emit = defineEmits<{ confirm: [] }>()

const formRules = {
  name: [{ required: true, message: '请输入工作流名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入工作流编码', trigger: 'blur' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)
const categoryOptions = ref<WorkflowCategory[]>([])

watch(visible, (val) => {
  if (val) loadCategories()
})

function loadCategories() {
  WorkflowCategoryAPI.tree().then(res => categoryOptions.value = res || []).catch(() => {})
}

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
