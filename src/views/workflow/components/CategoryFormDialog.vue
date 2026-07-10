<!--
  工作流分类表单弹框
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑分类' : '新建分类'"
    width="400px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="上级分类">
        <el-tree-select
          v-model="form.parentId"
          :data="categoryOptions"
          :props="{ label: 'name', children: 'children' }" value-key="id"
          check-strictly
          clearable
          placeholder="无（作为顶级分类）"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" controls-position="right" />
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
import type { WorkflowCategory } from '@/api/workflow/types'

const props = defineProps<{
  /** 分类选项（用于上级分类选择） */
  categoryOptions?: WorkflowCategory[]
}>()

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Partial<WorkflowCategory>>('form', { required: true })

const emit = defineEmits<{ confirm: [] }>()

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
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
