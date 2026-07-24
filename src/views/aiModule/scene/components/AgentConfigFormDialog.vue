<!--
  场景级 Agent 运行配置弹窗
  为 Agent 配置场景级模型/温度/Token/提示词等
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑运行配置' : '添加运行配置'"
    width="560px"
    append-to-body
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="助手" prop="agentId">
        <el-select v-model="form.agentId" placeholder="选择助手" style="width: 100%" :disabled="isEdit">
          <el-option v-for="a in availableAgents" :key="a.agentId" :label="a.agentName" :value="a.agentId" />
        </el-select>
      </el-form-item>

      <!-- 模型配置分组 -->
      <div class="form-section">
        <div class="form-section__title">模型参数</div>
        <el-form-item label="模型">
          <el-input v-model="form.model" placeholder="留空使用 Agent 默认模型" clearable />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="温度">
              <div class="temp-slider">
                <el-slider v-model="temperatureNum" :min="0" :max="2" :step="0.1" :marks="temperatureMarks" show-input input-size="small" />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大Token">
              <el-input-number v-model="form.maxTokens" :min="256" :max="32000" :step="256" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="输出格式">
              <el-select v-model="form.outputFormat" style="width: 100%">
                <el-option label="Markdown" value="markdown" />
                <el-option label="JSON" value="json" />
                <el-option label="纯文本" value="text" />
                <el-option label="HTML" value="html" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上下文上限">
              <el-input-number v-model="form.contextLimit" :min="1000" :max="100000" :step="1000" style="width: 100%" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 系统提示词 -->
      <el-collapse v-model="promptCollapse" class="prompt-collapse">
        <el-collapse-item title="追加系统提示词" name="prompt">
          <el-form-item label-width="0" class="!mb-0">
            <el-input v-model="form.systemPrompt" type="textarea" :rows="4" placeholder="附加到 Agent 原有 System Prompt 之后，用于限定场景上下文" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { SceneAgent, SceneAgentConfig } from '@/api/ai/scene'

const props = defineProps<{
  /** 当前场景已关联的 Agent 列表 */
  linkedAgents: SceneAgent[]
}>()

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Partial<SceneAgentConfig>>('form', { required: true })

const emit = defineEmits<{ confirm: [data: Partial<SceneAgentConfig>] }>()

const formRef = ref<any>(null)
const submitting = ref(false)
const promptCollapse = ref<string[]>([])

const rules = {
  agentId: [{ required: true, message: '请选择助手', trigger: 'change' }],
}

const availableAgents = computed(() => {
  return props.linkedAgents.map(a => ({
    agentId: a.agentId,
    agentName: a.agentName || `Agent #${a.agentId}`,
  }))
})

const temperatureNum = computed({
  get: () => form.value.temperature ?? 0.7,
  set: (v: number) => { form.value.temperature = v },
})

const temperatureMarks: Record<number, string> = {
  0: '精确',
  0.7: '平衡',
  1.5: '创意',
}

function resetForm() {
  isEdit.value = false
  promptCollapse.value = []
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

.temp-slider {
  width: 100%;
  padding: 0 4px;
}

.prompt-collapse {
  margin-top: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;

  :deep(.el-collapse-item__header) {
    font-size: 13px;
    font-weight: 500;
    padding: 0 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;

    &.is-active {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
  }

  :deep(.el-collapse-item__content) {
    padding: 12px;
  }
}
</style>
