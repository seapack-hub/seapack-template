<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑技能' : '新增技能'"
    width="900px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="技能名称" prop="name">
            <el-input v-model="form.name" placeholder="如 文章AI写作助手" />
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
            <el-select
              v-model="form.categoryId"
              placeholder="选择分类"
              clearable
              :disabled="categoryDisabled"
              style="width: 100%"
            >
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id as any" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="技能类型" prop="skillType">
            <el-select v-model="form.skillType" placeholder="选择类型" style="width: 100%">
              <el-option
                v-for="opt in SKILL_TYPE_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="技能图标" prop="icon">
            <IconPicker v-model="form.icon" placeholder="选择图标" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" placeholder="v1.0.0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="技能功能描述" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="API 端点" prop="endpoint">
            <el-input v-model="form.endpoint" placeholder="https://api.example.com/execute" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="超时时间(ms)" prop="timeoutMs">
            <el-input-number v-model="form.timeoutMs" :min="1000" :max="300000" :step="1000" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="输入 Schema" prop="inputSchema">
        <JsonEditor v-model="inputSchemaJson" height="300px" mode="code" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="排序号" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
        <el-col v-if="isEdit" :span="8">
          <el-form-item label="使用次数">
            <el-input-number :model-value="form.useCount || 0" disabled style="width: 100%" />
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
import type { Skill } from '@/api/ai/skill';
import type { SkillCategory } from '@/api/ai/skillCategory';
import { SKILL_TYPE_OPTIONS } from '../utils/moduleOptions'
import JsonEditor from '@/components/JsonEditor/index.vue'

const props = defineProps<{
  categories: SkillCategory[]
  /** 左侧分类树当前选中的分类ID，undefined 表示"全部分类" */
  activeCategoryId?: number
}>()

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Skill>('form', {
  default: () => ({
    name: '',
    code: '',
    categoryId: undefined,
    icon: '',
    description: '',
    skillType: 'tool',
    endpoint: '',
    timeoutMs: 30000,
    inputSchema: '',
    version: 'v1.0.0',
    sortOrder: 0,
    status: 1,
  }),
})

/** 所属分类是否禁用：左侧选中了具体分类时禁用，选"全部分类"时可选 */
const categoryDisabled = computed(() => props.activeCategoryId !== undefined)

const emit = defineEmits<{ confirm: [formData: Skill, isEdit: boolean] }>()

const formRules = {
  name: [{ required: true, message: '请输入技能名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入技能编码', trigger: 'blur' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

/** inputSchema 字符串 ↔ JSON 对象双向转换 */
const inputSchemaJson = computed({
  get() {
    const raw = form.value.inputSchema
    if (!raw) return undefined
    try { return JSON.parse(raw) } catch { return undefined }
  },
  set(val: any) {
    form.value.inputSchema = val ? JSON.stringify(val) : ''
  },
})

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
