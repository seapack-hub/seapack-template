<!--
  部署位置新增/编辑弹窗
  选择模块 + 位置 + 填写部署配置
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑部署' : '添加部署'"
    width="480px"
    append-to-body
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="前端模块" prop="moduleKey">
        <el-select v-model="form.moduleKey" placeholder="选择模块" style="width: 100%" :disabled="isEdit" @change="onModuleChange">
          <el-option v-for="m in moduleOptions" :key="m.key" :label="m.label" :value="m.key" />
        </el-select>
      </el-form-item>
      <el-form-item label="位置" prop="positionKey">
        <el-select v-model="form.positionKey" placeholder="请先选择模块" style="width: 100%" :disabled="isEdit || !form.moduleKey">
          <el-option v-for="p in filteredPositions" :key="p.positionKey" :label="p.label" :value="p.positionKey" />
        </el-select>
      </el-form-item>

      <!-- 部署配置分组 -->
      <div class="form-section">
        <div class="form-section__title">部署配置</div>
        <el-form-item label="按钮文案">
          <el-input v-model="buttonText" placeholder="如 AI 写作" clearable />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="buttonIcon" placeholder="如 Edit" clearable />
        </el-form-item>
        <el-form-item label="提示文案">
          <el-input v-model="buttonTooltip" placeholder="悬停提示" clearable />
        </el-form-item>
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="设为默认">
            <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
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
import type { SceneDeployment } from '@/api/ai/scene'
import { AI_POSITIONS, getPositionsByModule } from '@/config/aiPositions'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Partial<SceneDeployment>>('form', { required: true })

const emit = defineEmits<{ confirm: [data: Partial<SceneDeployment>] }>()

const formRef = ref<any>(null)
const submitting = ref(false)

const rules = {
  moduleKey: [{ required: true, message: '请选择模块', trigger: 'change' }],
  positionKey: [{ required: true, message: '请选择位置', trigger: 'change' }],
}

const moduleOptions = computed(() => {
  const seen = new Map<string, string>()
  for (const p of AI_POSITIONS) {
    if (!seen.has(p.moduleKey)) seen.set(p.moduleKey, p.label.split('-')[0] || p.moduleKey)
  }
  return Array.from(seen.entries()).map(([key, label]) => ({ key, label }))
})

const filteredPositions = computed(() => {
  if (!form.value.moduleKey) return []
  return getPositionsByModule(form.value.moduleKey)
})

const buttonText = computed({
  get: () => form.value.config?.button_text || '',
  set: (v: string) => { form.value.config = { ...(form.value.config || {}), button_text: v } },
})
const buttonIcon = computed({
  get: () => form.value.config?.icon || '',
  set: (v: string) => { form.value.config = { ...(form.value.config || {}), icon: v } },
})
const buttonTooltip = computed({
  get: () => form.value.config?.tooltip || '',
  set: (v: string) => { form.value.config = { ...(form.value.config || {}), tooltip: v } },
})

function onModuleChange() {
  form.value.positionKey = ''
}

function resetForm() {
  isEdit.value = false
  formRef.value?.resetFields()
}

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    emit('confirm', { ...form.value })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin: 8px 0;
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;

  &__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin-bottom: 12px;
  }
}
</style>
