<!--
  参数管理弹窗
  为技能定义输入参数（对应提示词模板中的 {{variable}} 插值变量）
  内嵌参数新增/编辑子弹窗，支持 string/number/boolean/select/json 五种类型
-->
<template>
  <el-dialog v-model="visible" title="参数管理" width="1000px" @closed="onClosed">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between mb-10">
      <span class="text-13px text-[var(--el-text-color-secondary)]">
        为技能定义输入参数，参数名对应提示词模板中的 <code>{<!-- -->{variable}}</code> 插值变量
      </span>
      <el-button type="primary" size="small" icon="plus" @click="openParamForm()">新增参数</el-button>
    </div>
    <!-- 参数列表 -->
    <SpTable
      :loading="loading"
      :data="params"
      :columns="columns"
      show-index
      height="400"
      size="small"
    >
      <!-- 类型列 -->
      <template #paramType>
        <el-table-column label="类型" prop="paramType" width="90" align="center" slot-name="paramType">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.paramType) as any" size="small">{{ typeLabelMap[row.paramType] || row.paramType }}</el-tag>
          </template>
        </el-table-column>
      </template>

      <template #isRequired>
        <el-table-column label="必填" prop="required" width="60" align="center" slot-name="isRequired">
          <template #default="{ row }">
            <el-tag :type="row.required === 1 ? 'danger' : 'info'" size="small">{{ row.required === 1 ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <!-- 参数新增/编辑对话框（内嵌） -->
    <el-dialog
      v-model="paramFormVisible"
      :title="paramFormIsEdit ? '编辑参数' : '新增参数'"
      width="700px"
      append-to-body
      @closed="paramFormRef?.resetFields()"
    >
      <el-form ref="paramFormRef" :model="paramForm" :rules="paramFormRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="参数名" prop="paramName">
              <el-input v-model="paramForm.paramName" placeholder="如 topic" :disabled="paramFormIsEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签" prop="label">
              <el-input v-model="paramForm.label" placeholder="如 文章主题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="类型" prop="paramType">
              <el-select v-model="paramForm.paramType" style="width: 100%">
                <el-option
                  v-for="opt in PARAM_TYPE_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="必填" prop="required">
              <el-switch v-model="paramForm.required" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 默认值：根据类型动态切换控件 -->
        <el-form-item label="默认值" prop="defaultValue">
          <!-- string -->
          <el-input
            v-if="paramForm.paramType === 'string'"
            v-model="paramForm.defaultValue"
            placeholder="可选"
          />
          <!-- number -->
          <el-input-number
            v-else-if="paramForm.paramType === 'number'"
            v-model="numberDefault"
            :precision="0"
            controls-position="right"
            style="width: 100%"
          />
          <!-- boolean -->
          <el-select
            v-else-if="paramForm.paramType === 'boolean'"
            v-model="paramForm.defaultValue"
            placeholder="选择默认值"
            style="width: 100%"
          >
            <el-option label="true" value="true" />
            <el-option label="false" value="false" />
          </el-select>
          <!-- select：从已定义的选项中选择 -->
          <el-select
            v-else-if="paramForm.paramType === 'select'"
            v-model="paramForm.defaultValue"
            placeholder="选择默认选项"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="opt in selectOptions"
              :key="opt.value"
              :label="opt.label || opt.value"
              :value="opt.value"
            />
          </el-select>
          <!-- json -->
          <JsonEditor v-else v-model="paramForm.defaultValue" height="240px" mode="code" />
        </el-form-item>
        <el-form-item v-if="paramForm.paramType !== 'json'" label="提示文字" prop="placeholder">
          <el-input v-model="paramForm.placeholder" placeholder="输入框占位提示" />
        </el-form-item>
        <!-- select 类型：选项列表编辑 -->
        <el-form-item v-if="paramForm.paramType === 'select'" label="选项列表" prop="options">
          <div class="w-100%">
            <div v-for="(opt, idx) in selectOptions" :key="idx" class="flex items-center gap-8px mb-5px">
              <el-input v-model="opt.label" placeholder="显示文本" style="width: 40%" />
              <el-input v-model="opt.value" placeholder="选项值" style="width: 40%" />
              <el-button type="info" icon="delete" circle @click="removeSelectOption(idx)" />
            </div>
            <el-button type="primary" link icon="plus" @click="addSelectOption">添加选项</el-button>
          </div>
        </el-form-item>
        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number v-model="paramForm.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paramFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="paramSubmitting" @click="onParamSubmit">确认</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { SkillAPI, type SkillParam } from '@/api/ai/skill';
import { PARAM_LIST_COLUMNS } from '../utils';
import { PARAM_TYPE_OPTIONS } from '../utils/moduleOptions'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ skillId: number }>()

const params = ref<SkillParam[]>([])
const loading = ref(false)

/** 类型标签颜色映射 */
function typeTagType(type: string) {
  return ({
    string: '',
    number: 'warning',
    boolean: 'success',
    select: 'primary',
    json: 'info',
  } as Record<string, string>)[type] || ''
}

/** 类型中文映射 */
const typeLabelMap: Record<string, string> = {
  string: '字符串',
  number: '数字',
  boolean: '布尔',
  select: '选择',
  json: 'Json',
}

/** SpTable 列配置 */
const columns = [
  ...PARAM_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: 120, fixed: 'right', align: 'center',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openParamForm(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', click: ({ row }: any) => onDelete(row) },
    ],
  },
]

/** 监听弹窗打开，加载参数数据 */
watch(visible, async (val) => {
  if (val && props.skillId) await fetchParams()
})

async function fetchParams() {
  loading.value = true
  try { params.value = await SkillAPI.getParams(props.skillId) || [] }
  finally { loading.value = false }
}

function onClosed() {
  params.value = []
}

// ===== 参数新增/编辑 =====
const paramFormVisible = ref(false)
const paramFormIsEdit = ref(false)
const paramForm = ref<SkillParam>({ paramName: '', label: '', paramType: 'string', required: 1, defaultValue: '', placeholder: '', sortOrder: 0, options: [] })
const paramEditingId = ref<number | undefined>()
const paramSubmitting = ref(false)

/** select 类型的选项列表（双向同步到 paramForm.options） */
const selectOptions = computed({
  get() {
    const opts = paramForm.value.options
    if (!Array.isArray(opts)) return []
    return opts as { label: string; value: string }[]
  },
  set(val: { label: string; value: string }[]) {
    paramForm.value.options = val
  },
})

/** number 类型默认值：string ↔ number 双向同步 */
const numberDefault = computed({
  get() {
    const v = paramForm.value.defaultValue
    if (v === '' || v === undefined || v === null) return undefined
    const n = Number(v)
    return isNaN(n) ? undefined : n
  },
  set(val: number | undefined) {
    paramForm.value.defaultValue = val !== undefined && val !== null ? String(val) : ''
  },
})

function addSelectOption() {
  selectOptions.value = [...selectOptions.value, { label: '', value: '' }]
}

function removeSelectOption(idx: number) {
  const copy = [...selectOptions.value]
  copy.splice(idx, 1)
  selectOptions.value = copy
}

function openParamForm(row?: SkillParam) {
  if (row) {
    paramFormIsEdit.value = true
    paramEditingId.value = row.id
    // select 类型：确保 options 是数组
    const opts = row.options
    paramForm.value = {
      ...row,
      options: Array.isArray(opts) ? [...opts] : [],
    }
  } else {
    paramFormIsEdit.value = false
    paramEditingId.value = undefined
    paramForm.value = { paramName: '', label: '', paramType: 'string', required: 1, defaultValue: '', placeholder: '', sortOrder: params.value.length, options: [] }
  }
  paramFormVisible.value = true
}

const paramFormRef = ref<any>(null)
const paramFormRules = {
  paramName: [{ required: true, message: '请输入参数名', trigger: 'blur' }],
  label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
}

async function onParamSubmit() {
  await paramFormRef.value?.validate()
  // select 类型提交前校验选项
  if (paramForm.value.paramType === 'select') {
    const opts = selectOptions.value
    if (!opts.length) {
      ElMessage.warning('请至少添加一个选项')
      return
    }
    const hasEmpty = opts.some(o => !o.label || !o.value)
    if (hasEmpty) {
      ElMessage.warning('选项的显示文本和选项值不能为空')
      return
    }
  }
  paramSubmitting.value = true
  try {
    if (paramFormIsEdit.value && paramEditingId.value) {
      await SkillAPI.updateParam(props.skillId, paramEditingId.value, paramForm.value)
      ElMessage.success('更新成功')
    } else {
      await SkillAPI.addParam(props.skillId, paramForm.value)
      ElMessage.success('新增成功')
    }
    paramFormVisible.value = false
    await fetchParams()
  } finally { paramSubmitting.value = false }
}

async function onDelete(row: SkillParam) {
  await ElMessageBox.confirm(`确认删除参数【${row.paramName}】？`, '警告', { type: 'warning' })
  await SkillAPI.deleteParam(props.skillId, row.id!)
  ElMessage.success('删除成功')
  await fetchParams()
}
</script>
