<template>
  <el-dialog v-model="visible" title="输入参数管理" width="800px" @closed="onClosed">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between mb-10">
      <span class="text-13px text-[var(--el-text-color-secondary)]">
        为技能定义输入参数，参数名对应提示词模板中的 <code>{<!-- -->{variable}}</code> 插值变量
      </span>
      <el-button type="primary" size="small" icon="plus" @click="openParamForm()">新增参数</el-button>
    </div>
    <!-- 参数列表 -->
    <el-table :data="params" border stripe max-height="400" size="small">
      <el-table-column type="index" label="序号" width="50" align="center" />
      <el-table-column prop="paramName" label="参数名" min-width="120" />
      <el-table-column prop="label" label="标签" min-width="100" />
      <el-table-column prop="paramType" label="类型" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="typeTagType(row.paramType)" size="small">{{ row.paramType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="required" label="必填" width="60" align="center">
        <template #default="{ row }">
          <el-tag :type="row.required === 1 ? 'danger' : 'info'" size="small">{{ row.required === 1 ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="defaultValue" label="默认值" min-width="120" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="60" align="center" />
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template #default="{ row }">
          <el-button text size="small" icon="edit" @click="openParamForm(row)">编辑</el-button>
          <el-button text size="small" icon="delete" type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 空状态 -->
    <el-empty v-if="!params.length" :description="loading ? '加载中...' : '暂无参数，请点击上方按钮新增'" />

    <!-- 参数新增/编辑对话框（内嵌） -->
    <el-dialog
      v-model="paramFormVisible"
      :title="paramFormIsEdit ? '编辑参数' : '新增参数'"
      width="500px"
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
                <el-option label="字符串" value="string" />
                <el-option label="数字" value="number" />
                <el-option label="布尔" value="boolean" />
                <el-option label="下拉选择" value="select" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="必填" prop="required">
              <el-switch v-model="paramForm.required" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="默认值" prop="defaultValue">
          <el-input v-model="paramForm.defaultValue" placeholder="可选" />
        </el-form-item>
        <el-form-item label="提示文字" prop="placeholder">
          <el-input v-model="paramForm.placeholder" placeholder="输入框占位提示" />
        </el-form-item>
        <el-form-item v-if="paramForm.paramType === 'select'" label="选项列表" prop="options">
          <el-input
            v-model="optionsText"
            type="textarea"
            :rows="3"
            placeholder="每行一个选项，格式: label=value，如: 深度分析=deep"
          />
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

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ skillId: number }>()

const params = ref<SkillParam[]>([])
const loading = ref(false)

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

const optionsText = computed({
  get: () => (paramForm.value.options || []).map(o => `${o.label}=${o.value}`).join('\n'),
  set: (val: string) => {
    paramForm.value.options = val.split('\n').filter(Boolean).map(line => {
      const [label = '', value = ''] = line.split('=')
      return { label: label.trim(), value: value.trim() }
    })
  },
})

function typeTagType(type: string) {
  return ({ string: '', number: 'warning', boolean: 'success', select: 'info' } as Record<string, string>)[type] || ''
}

function openParamForm(row?: SkillParam) {
  if (row) {
    paramFormIsEdit.value = true
    paramEditingId.value = row.id
    paramForm.value = { ...row, options: row.options ? [...row.options] : [] }
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
