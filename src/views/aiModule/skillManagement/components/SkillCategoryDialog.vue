<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑分类' : '新增分类'"
    width="480px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" placeholder="如 内容生成" />
      </el-form-item>
      <el-form-item label="分类编码" prop="code">
        <el-input v-model="form.code" placeholder="如 content_gen" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="form.icon" placeholder="SVG 文件名（不含 .svg）" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="分类描述" />
      </el-form-item>
      <el-form-item label="排序号" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="0" :max="9999" style="width: 100%" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { SkillCategory } from '@/api/ai/skillCategory';

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<SkillCategory>('form', { default: () => ({ name: '', code: '', icon: '', description: '', sortOrder: 0, status: 1 }) })

const emit = defineEmits<{ confirm: [formData: SkillCategory, isEdit: boolean] }>()

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
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
  try { emit('confirm', form.value, isEdit.value) }
  finally { submitting.value = false }
}
</script>
