<!--
  知识库新增/编辑弹框
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑知识库' : '新增知识库'"
    width="800px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="知识库名称" prop="name">
            <el-input v-model="form.name" placeholder="如 产品文档库" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="知识库编码" prop="code">
            <el-input v-model="form.code" placeholder="如 product_docs" :disabled="isEdit" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="知识库用途说明" />
      </el-form-item>
      <el-form-item label="图标">
        <IconPicker v-model="form.icon" clearable />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="向量模型" prop="embeddingModel">
            <el-select v-model="form.embeddingModel" style="width: 100%">
              <el-option v-for="opt in EMBEDDING_MODEL_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">分片策略</el-divider>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="分片大小">
            <el-input-number v-model="form.chunkSize" :min="100" :max="4096" :step="64" style="width: 100%" />
            <div class="form-tip">字符数</div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="重叠字符">
            <el-input-number v-model="form.chunkOverlap" :min="0" :max="500" :step="10" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="分隔符">
            <el-select v-model="form.separator" style="width: 100%">
              <el-option v-for="opt in SEPARATOR_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="排序号">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 200px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { KnowledgeBase } from '@/api/ai/knowledgeBase'
import { EMBEDDING_MODEL_OPTIONS, SEPARATOR_OPTIONS } from '../utils/moduleOptions'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<KnowledgeBase>('form', { required: true })

const emit = defineEmits<{ confirm: [formData: KnowledgeBase, isEdit: boolean] }>()

const formRules = {
  name: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入知识库编码', trigger: 'blur' }],
  embeddingModel: [{ required: true, message: '请选择向量模型', trigger: 'change' }],
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
    emit('confirm', form.value, isEdit.value)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.2;
  margin-top: 4px;
}
</style>
