<template>
  <el-dialog v-model="visible" :title="`模块绑定 - ${skillName}`" width="800px" @closed="onClosed">
    <div class="flex items-center justify-between mb-10">
      <span class="text-13px text-[var(--el-text-color-secondary)]">
        将技能绑定到功能模块的指定位置，使该模块内可使用此技能
      </span>
      <el-button type="primary" size="small" icon="plus" @click="openBindingForm()">新增绑定</el-button>
    </div>
    <el-table :data="bindings" border stripe max-height="400" size="small">
      <el-table-column type="index" label="序号" width="50" align="center" />
      <el-table-column prop="moduleKey" label="模块标识" min-width="130" />
      <el-table-column prop="position" label="位置" min-width="100" />
      <el-table-column prop="status" label="状态" width="70" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-button text size="small" icon="edit" @click="openBindingForm(row)">编辑</el-button>
          <el-button text size="small" icon="delete" type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!bindings.length" :description="loading ? '加载中...' : '暂无绑定' " />

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

/** 模块选项列表 */
const MODULE_OPTIONS = [
  { label: '系统管理', value: 'systemManagement' },
  { label: '个人博客', value: 'blogsManagement' },
  { label: '股票基金', value: 'stockFund' },
  { label: 'AI交互', value: 'aiModule' },
  { label: '开发工具', value: 'devTools' },
  { label: '二维地图', value: 'gis2d' },
  { label: '三维GIS', value: 'gis3d' },
  { label: '智慧运营', value: 'bigScreen' },
  { label: '通用大屏', value: 'universalTemplate' },
]

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ skillId: number; skillName: string }>()

const bindings = ref<SkillBinding[]>([])
const loading = ref(false)

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
const bindingForm = ref<SkillBinding>({ moduleKey: '', position: '', status: 1 })
const bindingEditingId = ref<number | undefined>()
const bindingSubmitting = ref(false)

function openBindingForm(row?: SkillBinding) {
  if (row) {
    bindingFormIsEdit.value = true
    bindingEditingId.value = row.id
    bindingForm.value = { ...row }
  } else {
    bindingFormIsEdit.value = false
    bindingEditingId.value = undefined
    bindingForm.value = { moduleKey: '', position: '', status: 1 }
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
