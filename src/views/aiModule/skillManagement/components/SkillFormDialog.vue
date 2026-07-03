<!--
  技能新增/编辑弹窗
  包含名称、编码、所属分类、输出格式、描述、提示词模板、
  Temperature 滑块、Max Tokens、版本号、排序号、状态
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑技能' : '新增技能'"
    width="1050px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="技能名称" prop="name">
            <el-input v-model="form.name" placeholder="如 文章AI写作助手">
              <template #suffix>
                <el-tooltip content="AI 生成名称" placement="top">
                  <el-button link type="primary" size="small" :icon="MagicStick" @click="openAiDialog('name')" />
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="技能编码" prop="code">
            <el-input v-model="form.code" placeholder="如 blog-writing" :disabled="isEdit" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属分类" prop="categoryId">
            <el-select v-model="form.categoryId" placeholder="选择分类" clearable style="width: 100%">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id as any" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="输出格式" prop="outputFormat">
            <el-select v-model="form.outputFormat" placeholder="markdown" style="width: 100%">
              <el-option
                v-for="opt in OUTPUT_FORMAT_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="技能功能描述">
          <template #suffix>
            <el-tooltip content="AI 生成描述" placement="top">
              <el-button link type="primary" size="small" :icon="MagicStick" @click="openAiDialog('description')" />
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="提示词模板" prop="promptTemplate">
        <el-input
          v-model="form.promptTemplate"
          type="textarea"
          :rows="6"
          placeholder="系统提示词，支持 {{variable}} 插值语法"
        >
          <template #suffix>
            <el-tooltip content="AI 辅助编写提示词" placement="top">
              <template v-for="b in aiBindings" :key="b.skillId">
                <el-button
                  v-if="(b.config?.displayType || 'button') === 'button'"
                  :type="b.config?.type || 'primary'"
                  @click="openAiDialog('prompt')"
                >
                  <el-icon style="vertical-align: -2px; margin-right: 4px">
                    <component :is="b.config?.icon || 'MagicStick'" />
                  </el-icon>
                  {{ b.config?.buttonText || b.skillName }}
                </el-button>
              </template>
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="Temperature" prop="temperature">
            <el-slider
              v-model="form.temperature"
              :min="0"
              :max="2"
              :step="0.01"
              show-input
              input-size="small"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Max Tokens" prop="maxTokens">
            <el-input-number v-model="form.maxTokens" :min="64" :max="8192" :step="256" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" placeholder="v1.0.0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序号" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- AI 技能执行通用弹框：辅助编写提示词模板 -->
    <AiSkillExecutor
      v-model:visible="aiDialogVisible"
      module-key="aiModule"
      position="skill-editor"
      :skill-id="activeSkillId"
      :context="aiContext"
      @done="handleAiResult"
    />

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { Skill, AiExecutionResult } from '@/api/ai/skill';
import type { SkillCategory } from '@/api/ai/skillCategory';
import { useAiBindings } from '@/hooks/useAiBindings'
import { MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { OUTPUT_FORMAT_OPTIONS } from '../utils/moduleOptions'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Skill>('form', {
  default: () => ({
    name: '', code: '', categoryId: undefined, description: '', promptTemplate: '',
    temperature: 0.7, maxTokens: 2048, outputFormat: 'markdown', version: 'v1.0.0',
    sortOrder: 0, status: 1,
  }),
})

/** 分类列表（从父级传入） */
defineProps<{ categories: SkillCategory[] }>()

const emit = defineEmits<{ confirm: [formData: Skill, isEdit: boolean] }>()

const formRules = {
  name: [{ required: true, message: '请输入技能名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入技能编码', trigger: 'blur' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

/** AI 辅助 */
const { bindings: aiBindings } = useAiBindings('aiModule', 'skill-editor')
const aiDialogVisible = ref(false)
const activeSkillId = ref<number | undefined>()
const aiTarget = ref<'name' | 'description' | 'prompt'>('prompt')
const aiContext = ref({ skillName: '', skillDescription: '', promptTemplate: '' })

function openAiDialog(target: 'name' | 'description' | 'prompt') {
  aiTarget.value = target
  activeSkillId.value = undefined
  aiContext.value = {
    skillName: form.value.name || '',
    skillDescription: form.value.description || '',
    promptTemplate: form.value.promptTemplate || '',
  }
  aiDialogVisible.value = true
}

function handleAiResult(result: AiExecutionResult) {
  if (!result.success) {
    ElMessage.error('AI 辅助生成失败，请重试')
    return
  }
  const content = result.content.replace(/^["'「」【】\s]+|["'「」【】\s]+$/g, '')
  if (aiTarget.value === 'name') {
    form.value.name = content.slice(0, 100)
  } else if (aiTarget.value === 'description') {
    form.value.description = content.slice(0, 500)
  } else {
    form.value.promptTemplate = (form.value.promptTemplate || '') + (form.value.promptTemplate ? '\n\n' : '') + content
  }
  ElMessage.success(`${result.skillName} 内容已填充`)
}

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
