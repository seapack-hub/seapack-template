<!--
  模块绑定管理弹窗
  将技能绑定到指定功能模块的某个位置
  内嵌绑定新增/编辑子弹窗，支持 9 个模块选项
-->
<template>
  <el-dialog v-model="visible" :title="`模块绑定 - ${skillName}`" width="1000px" @closed="onClosed">
    <div class="flex items-center justify-between mb-10">
      <span class="text-13px text-[var(--el-text-color-secondary)]">
        将技能绑定到功能模块的指定位置，使该模块内可使用此技能
      </span>
      <el-button type="primary" size="small" icon="plus" @click="openBindingForm()">新增绑定</el-button>
    </div>
    <!-- 绑定列表（使用 SpTable 封装组件） -->
    <SpTable
      :loading="loading"
      :data="bindings"
      :columns="columns"
      show-index
      height="400"
      size="small"
    >
      <!-- 展示配置列：JSON 概要显示 -->
      <template #bindingConfig>
        <el-table-column label="展示配置" prop="config" min-width="140" slot-name="bindingConfig">
          <template #default="{ row }">
            <span class="text-12px text-[var(--el-text-color-secondary)]">
              {{ formatConfig(row.config) }}
            </span>
          </template>
        </el-table-column>
      </template>
      <!-- 状态列：启用/禁用标签 -->
      <template #bindingStatus>
        <el-table-column label="状态" prop="status" width="70" align="center" slot-name="bindingStatus">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <!-- 绑定新增/编辑弹窗 -->
    <el-dialog
      v-model="bindingFormVisible"
      :title="bindingFormIsEdit ? '编辑绑定' : '新增绑定'"
      width="480px"
      append-to-body
      @closed="bindingFormRef?.resetFields()"
    >
      <el-form ref="bindingFormRef" :model="bindingForm" :rules="bindingFormRules" label-width="100px">
        <el-form-item label="模块标识" prop="moduleKey">
          <el-select v-model="bindingForm.moduleKey" placeholder="选择模块" style="width: 100%">
            <el-option v-for="mod in MODULE_OPTIONS" :key="mod.value" :label="mod.label" :value="mod.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置标识" prop="position">
          <el-input v-model="bindingForm.position" placeholder="如 toolbar / sidebar / menu" />
        </el-form-item>
        <el-form-item label="展示配置" prop="config">
          <el-input
            v-model="configText"
            type="textarea"
            :rows="6"
            placeholder="JSON 格式，如 {buttonText: 'AI写作'}"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="bindingForm.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindingFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="bindingSubmitting" @click="onBindingSubmit">确认</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { SkillAPI, type SkillBinding } from '@/api/ai/skill';
import { MODULE_OPTIONS, BINDING_LIST_COLUMNS } from '../utils';

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ skillId: number; skillName: string }>()

const bindings = ref<SkillBinding[]>([])
const loading = ref(false)

/** SpTable 列配置：模块标识、位置、状态（slotName）、操作 */
const columns = [
  ...BINDING_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: 120, fixed: 'right', align: 'center',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openBindingForm(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', click: ({ row }: any) => onDelete(row) },
    ],
  },
]

watch(visible, async (val) => {
  if (val && props.skillId) await fetchBindings()
})

async function fetchBindings() {
  loading.value = true
  try { bindings.value = await SkillAPI.getBindings(props.skillId) || [] }
  finally { loading.value = false }
}

function onClosed() { bindings.value = [] }

// ===== 绑定新增/编辑 =====
const bindingFormVisible = ref(false)
const bindingFormIsEdit = ref(false)
const bindingForm = ref<SkillBinding>({ moduleKey: '', position: '', config: {}, status: 1 })
const bindingEditingId = ref<number | undefined>()
const bindingSubmitting = ref(false)

/** config 对象 ↔ JSON 字符串双向转换（用于 textarea 编辑） */
const configText = computed({
  get: () => {
    const c = bindingForm.value.config
    return c && Object.keys(c).length ? JSON.stringify(c, null, 2) : ''
  },
  set: (val: string) => {
    if (!val.trim()) { bindingForm.value.config = {}; return }
    try {
      const parsed = JSON.parse(val)
      if (parsed && typeof parsed === 'object') bindingForm.value.config = parsed
    } catch { bindingForm.value.config = {} }
  },
})

/** config 概要展示（取首字段或 JSON 缩略） */
function formatConfig(config?: Record<string, any>): string {
  if (!config || !Object.keys(config).length) return '-'
  const firstVal = Object.values(config)[0]
  return firstVal !== undefined ? `${Object.keys(config)[0]}: ${firstVal}` : JSON.stringify(config)
}

function openBindingForm(row?: SkillBinding) {
  if (row) {
    bindingFormIsEdit.value = true
    bindingEditingId.value = row.id
    bindingForm.value = { ...row, config: row.config ? { ...row.config } : {} }
  } else {
    bindingFormIsEdit.value = false
    bindingEditingId.value = undefined
    bindingForm.value = { moduleKey: '', position: '', config: {}, status: 1 }
  }
  bindingFormVisible.value = true
}

const bindingFormRef = ref<any>(null)
const bindingFormRules = {
  moduleKey: [{ required: true, message: '请选择模块', trigger: 'change' }],
}

async function onBindingSubmit() {
  await bindingFormRef.value?.validate()
  bindingSubmitting.value = true
  try {
    if (bindingFormIsEdit.value && bindingEditingId.value) {
      await SkillAPI.updateBinding(props.skillId, bindingEditingId.value, bindingForm.value)
      ElMessage.success('更新成功')
    } else {
      await SkillAPI.addBinding(props.skillId, bindingForm.value)
      ElMessage.success('新增成功')
    }
    bindingFormVisible.value = false
    await fetchBindings()
  } finally { bindingSubmitting.value = false }
}

async function onDelete(row: SkillBinding) {
  await ElMessageBox.confirm(`确认解除与模块【${row.moduleKey}】的绑定？`, '警告', { type: 'warning' })
  await SkillAPI.deleteBinding(props.skillId, row.id!)
  ElMessage.success('删除成功')
  await fetchBindings()
}
</script>
