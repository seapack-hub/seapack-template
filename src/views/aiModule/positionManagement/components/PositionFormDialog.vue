<!--
  位置新增/编辑弹窗
  参考 PromptFormDialog 的交互模式
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑位置' : '新增位置'"
    width="560px"
    append-to-body
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="前端模块" prop="moduleKey">
            <el-select v-model="form.moduleKey" placeholder="选择模块" :disabled="isEdit" style="width: 100%">
              <el-option v-for="m in moduleOptions" :key="m.key" :label="m.label" :value="m.key" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="位置编码" prop="positionKey">
            <el-input v-model="form.positionKey" placeholder="如 editor-toolbar" :disabled="isEdit" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="位置名称" prop="label">
        <el-input v-model="form.label" placeholder="如 文章编辑器工具栏" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="位置的用途说明" />
      </el-form-item>
      <el-form-item label="组件名">
        <el-input v-model="form.component" placeholder="如 ArticleEdit（可选）" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序号">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { AiPosition } from '@/api/ai/position'
import { MODULE_DEFS } from '@/config/modules'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Partial<AiPosition>>('form', {
  default: () => ({
    moduleKey: '',
    positionKey: '',
    label: '',
    description: '',
    component: '',
    status: 1,
    sortOrder: 0,
  }),
})

const emit = defineEmits<{ confirm: [formData: Partial<AiPosition>, isEdit: boolean] }>()

/** 模块下拉选项：从 MODULE_DEFS 读取 */
const moduleOptions = MODULE_DEFS.map(m => ({ key: m.key, label: m.title }))

const formRules = {
  moduleKey: [{ required: true, message: '请选择前端模块', trigger: 'change' }],
  positionKey: [{ required: true, message: '请输入位置编码', trigger: 'blur' }],
  label: [{ required: true, message: '请输入位置名称', trigger: 'blur' }],
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
    emit('confirm', { ...form.value }, isEdit.value)
  } finally {
    submitting.value = false
  }
}
</script>
