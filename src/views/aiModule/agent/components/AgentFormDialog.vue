<!--
  Agent 基础信息弹框
  新增 / 详情（只读）/ 编辑 三种状态
  isEdit=true → 已有记录（详情或编辑），isEdit=false → 新增
-->
<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="700px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="助手名称" prop="name">
            <el-input v-model="form.name" placeholder="如 股票分析师" :disabled="isReadonly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="助手编码" prop="code">
            <el-input v-model="form.code" placeholder="如 stock_analyst" :disabled="isEdit || isReadonly" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="助手头像">
            <IconPicker v-model="form.avatar" clearable :disabled="isReadonly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模型">
            <el-select v-model="form.modelCode" style="width: 100%" :disabled="isReadonly">
              <el-option v-for="opt in MODEL_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="助手的简短描述，展示给用户" :disabled="isReadonly" />
      </el-form-item>
      <el-form-item label="系统提示词" prop="systemPrompt">
        <el-input v-model="form.systemPrompt" type="textarea" :rows="6" placeholder="定义助手的角色、行为规则和约束" :disabled="isReadonly" />
      </el-form-item>
      <el-form-item label="开场白">
        <el-input v-model="form.greeting" type="textarea" :rows="2" placeholder="首次对话时自动发送的消息" :disabled="isReadonly" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="温度">
            <el-input-number v-model="form.temperature" :min="0" :max="2" :step="0.1" :precision="2" style="width: 100%" :disabled="isReadonly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Max Tokens">
            <el-input-number v-model="form.maxTokens" :min="256" :max="8192" :step="256" style="width: 100%" :disabled="isReadonly" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="输出格式">
            <el-select v-model="form.outputFormat" style="width: 100%" :disabled="isReadonly">
              <el-option v-for="opt in OUTPUT_FORMAT_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号">
            <el-input v-model="form.version" placeholder="v1.0.0" :disabled="isReadonly" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序号">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" :disabled="isReadonly" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" :disabled="isReadonly" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <template v-if="isReadonly">
        <el-button @click="visible = false">关闭</el-button>
        <el-button v-permission="'aiModule:aiConfig:agentManage:edit'" type="primary" @click="enterEditMode">编辑</el-button>
      </template>
      <template v-else>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { Agent } from '@/api/ai/agent'
import { MODEL_OPTIONS, OUTPUT_FORMAT_OPTIONS } from '../utils/moduleOptions'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Agent>('form', { required: true })

const emit = defineEmits<{ confirm: [formData: Agent, isEdit: boolean] }>()

// ===== 双态模式 =====
const isEditing = ref(false)
const isReadonly = computed(() => isEdit.value && !isEditing.value)

const dialogTitle = computed(() => {
  if (!isEdit.value) return '新增 Agent'
  return isEditing.value ? '编辑 Agent' : 'Agent 详情'
})

function enterEditMode() {
  isEditing.value = true
}

function onClosed() {
  isEditing.value = false
  isEdit.value = false
  formRef.value?.resetFields()
}

const formRules = {
  name: [{ required: true, message: '请输入助手名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入助手编码', trigger: 'blur' }],
  systemPrompt: [{ required: true, message: '请输入系统提示词', trigger: 'blur' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

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
