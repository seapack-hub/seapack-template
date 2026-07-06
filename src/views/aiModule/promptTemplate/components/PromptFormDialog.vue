<!--
  提示词模板新增/编辑弹框
  包含基本信息、模板正文、变量管理、模型参数、版本状态
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑模板' : '新增模板'"
    width="1050px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="form.name" placeholder="如 股票技术分析模板" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板编码" prop="code">
            <el-input v-model="form.code" placeholder="如 stock_tech_analysis" :disabled="isEdit" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="分类" prop="category">
            <el-select v-model="form.category" placeholder="选择分类" style="width: 100%">
              <el-option
                v-for="opt in TEMPLATE_CATEGORY_OPTIONS.filter(o => o.value)"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="输出格式" prop="outputFormat">
            <el-select v-model="form.outputFormat" style="width: 100%">
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
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="模板用途说明" />
      </el-form-item>

      <!-- 模板正文 -->
      <el-form-item label="模板正文" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="8"
          placeholder="输入提示词模板，使用 {{变量名}} 标记可替换内容"
        />
        <div class="mt-4 text-12px text-[var(--el-text-color-secondary)]">
          使用 <code class="bg-[var(--el-fill-color-light)] px-1 rounded">{{ '变量名' }}</code> 语法定义变量，变量将在下方"变量管理"中自动识别
        </div>
      </el-form-item>

      <!-- 变量管理 -->
      <el-form-item label="变量管理">
        <div class="w-full">
          <div class="flex items-center justify-between mb-8px">
            <span class="text-13px text-[var(--el-text-color-secondary)]">
              已识别 <strong>{{ detectedVars.length }}</strong> 个变量
            </span>
            <el-button type="primary" size="small" icon="plus" @click="openVarForm()">新增变量</el-button>
          </div>
          <SpTable
            :data="form.variables || []"
            :columns="varColumns"
            :show-index="true"
            size="small"
            max-height="240"
          >
            <template #varType>
              <el-table-column label="类型" prop="varType" width="90" align="center" slot-name="varType">
                <template #default="{ row }">
                  <el-tag :type="varTypeTag(row.varType) as any" size="small">{{ varTypeLabel(row.varType) }}</el-tag>
                </template>
              </el-table-column>
            </template>
            <template #required>
              <el-table-column label="必填" prop="required" width="60" align="center" slot-name="required">
                <template #default="{ row }">
                  <el-tag :type="row.required === 1 ? 'danger' : 'info'" size="small">{{ row.required === 1 ? '是' : '否' }}</el-tag>
                </template>
              </el-table-column>
            </template>
            <template #operate>
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row, $index }">
                  <el-button link type="primary" size="small" @click="openVarForm(row as any, $index)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="removeVar($index)">删除</el-button>
                </template>
              </el-table-column>
            </template>
          </SpTable>
        </div>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="版本号">
            <el-input v-model="form.version" placeholder="v1.0.0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 变量新增/编辑子弹窗 -->
    <el-dialog
      v-model="varFormVisible"
      :title="varFormIsEdit ? '编辑变量' : '新增变量'"
      width="500px"
      append-to-body
      @closed="varFormRef?.resetFields()"
    >
      <el-form ref="varFormRef" :model="varForm" :rules="varFormRules" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="变量名" prop="varName">
              <el-input v-model="varForm.varName" placeholder="如 stockCode" :disabled="varFormIsEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签" prop="label">
              <el-input v-model="varForm.label" placeholder="如 股票代码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="类型" prop="varType">
              <el-select v-model="varForm.varType" style="width: 100%">
                <el-option v-for="opt in VAR_TYPE_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="必填" prop="required">
              <el-switch v-model="varForm.required" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="varForm.defaultValue" placeholder="可选" />
        </el-form-item>
        <el-form-item label="提示文字" prop="placeholder">
          <el-input v-model="varForm.placeholder" placeholder="输入框占位提示" />
        </el-form-item>
        <el-form-item v-if="varForm.varType === 'select'" label="选项列表">
          <div class="w-full">
            <div v-for="(opt, i) in varForm.options" :key="i" class="flex gap-8px mb-8px items-center">
              <el-input v-model="opt.label" placeholder="显示文本" style="width: 45%" />
              <span class="text-[var(--el-text-color-secondary)]">→</span>
              <el-input v-model="opt.value" placeholder="值" style="width: 40%" />
              <el-button link type="danger" size="small" @click="varForm.options!.splice(i, 1)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button size="small" @click="varForm.options = varForm.options || []; varForm.options.push({ label: '', value: '' })">
              + 添加选项
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="varForm.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="varFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="varSubmitting" @click="onVarSubmit">确认</el-button>
      </template>
    </el-dialog>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting || ($attrs.loading as boolean)" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import type { PromptTemplate, TemplateVariable } from '@/api/ai/promptTemplate'
import { TEMPLATE_CATEGORY_OPTIONS, OUTPUT_FORMAT_OPTIONS, VAR_TYPE_OPTIONS } from '../utils/moduleOptions'
import { VARIABLE_LIST_COLUMNS } from '../utils/tableColumns'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<PromptTemplate>('form', {
  default: () => ({
    name: '', 
    code: '', 
    category: 'general', 
    content: '', 
    variables: [], 
    description: '', 
    outputFormat: 'markdown', 
    version: 'v1.0.0', 
    status: 1,
  }),
})

const emit = defineEmits<{ confirm: [formData: PromptTemplate, isEdit: boolean] }>()

defineProps<{ loading?: boolean }>()

const formRules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入模板编码', trigger: 'blur' }],
  content: [{ required: true, message: '请输入模板正文', trigger: 'blur' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

/** 从模板正文自动检测变量名 */
const detectedVars = computed(() => {
  const content = form.value.content || ''
  const matches = content.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))]
})

// ===== 变量管理 =====
const varColumns = [
  ...VARIABLE_LIST_COLUMNS,
  {
    columnType: 'operate' as const, label: '操作', width: 120, align: 'center' as const, fixed: 'right' as const,
    buttons: [
      { type: 'primary' as const, label: '编辑', size: 'small' as const, renderType: 'link' as const, click: ({ row, $index }: any) => openVarForm(row, $index) },
      { type: 'danger' as const, label: '删除', size: 'small' as const, renderType: 'link' as const, click: ({ $index }: any) => removeVar($index) },
    ],
  },
]

const varFormVisible = ref(false)
const varFormIsEdit = ref(false)
const varFormRef = ref<any>(null)
const varFormIdx = ref(-1)
const varSubmitting = ref(false)
const varForm = ref<TemplateVariable>({
  varName: '', label: '', varType: 'string', required: 1,
  defaultValue: '', placeholder: '', options: [], sortOrder: 0,
})

const varFormRules = {
  varName: [{ required: true, message: '请输入变量名', trigger: 'blur' }],
  label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  varType: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

function varTypeTag(type: string) {
  return ({ string: '', number: 'warning', boolean: 'success', select: 'info', date: 'info' } as Record<string, string>)[type] || ''
}

function varTypeLabel(type: string) {
  return VAR_TYPE_OPTIONS.find(o => o.value === type)?.label || type
}

function openVarForm(row?: TemplateVariable, idx?: number) {
  if (row && idx !== undefined) {
    varFormIsEdit.value = true
    varFormIdx.value = idx
    let opts = row.options
    if (typeof opts === 'string') {
      try { opts = JSON.parse(opts) } catch { opts = [] }
    }
    varForm.value = { ...row, options: Array.isArray(opts) ? opts.map(o => ({ ...o })) : [] }
  } else {
    varFormIsEdit.value = false
    varFormIdx.value = -1
    varForm.value = {
      varName: '', label: '', varType: 'string', required: 1,
      defaultValue: '', placeholder: '', options: [],
      sortOrder: (form.value.variables || []).length,
    }
  }
  varFormVisible.value = true
}

function removeVar(idx: number) {
  const vars = [...(form.value.variables || [])]
  vars.splice(idx, 1)
  form.value.variables = vars
}

async function onVarSubmit() {
  await varFormRef.value?.validate()
  varSubmitting.value = true
  try {
    const vars = [...(form.value.variables || [])]
    const data = { ...varForm.value }
    if (varFormIsEdit.value && varFormIdx.value >= 0) {
      vars[varFormIdx.value] = data
    } else {
      vars.push(data)
    }
    form.value.variables = vars
    varFormVisible.value = false
    ElMessage.success(varFormIsEdit.value ? '更新成功' : '新增成功')
  } finally { 
    varSubmitting.value = false 
  }
}

function onClosed() {
  isEdit.value = false
  formRef.value?.resetFields()
}

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try { 
    emit('confirm', form.value, isEdit.value) 
  }finally { 
    submitting.value = false 
  }
}
</script>
