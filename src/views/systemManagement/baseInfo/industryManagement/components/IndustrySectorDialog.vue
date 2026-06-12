<template>
  <!-- 行业分类新增/编辑弹框（defineModel 双向绑定父组件状态） -->
  <el-dialog v-model="visible" :title="isEdit ? '编辑行业' : '新增行业'" width="500px" @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" placeholder="如 tech" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="行业名称" prop="label">
        <el-input v-model="form.label" placeholder="如 科技" />
      </el-form-item>
      <!-- 父级下拉（打开弹框时从后端拉取一级行业作为父级候选，选后自动锁定层级为二级） -->
      <el-form-item label="父级行业" prop="parentId">
        <el-select v-model="form.parentId" placeholder="不选则作为一级行业" clearable filterable style="width: 100%">
          <el-option v-for="item in parentOptions" :key="item.id" :label="`${item.code} ${item.label}`" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="层级">
        <el-input :model-value="nodeLevelLabel" disabled>
          <template #prefix><el-icon><List /></el-icon></template>
        </el-input>
      </el-form-item>
      <el-form-item label="排序号" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { IndustrySectorAPI, type IndustrySector } from '@/api/system/common/industrySector.ts'

// ===== 双向绑定（父组件通过 v-model 控制） =====
const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<any>('form', { default: () => ({ code: '', label: '', parentId: null, nodeLevel: 1, sortOrder: 0 }) })

const emit = defineEmits<{ confirm: [formData: any, isEdit: boolean] }>()

// ===== 表单校验规则 =====
const formRules = {
  code: [{ required: true, message: '请输入行业编码' }],
  label: [{ required: true, message: '请输入行业名称' }],
}

const parentOptions = ref<IndustrySector[]>([])

/** 弹框打开时加载一级行业作为父级候选 */
watch(visible, async (val) => {
  if (!val) return
  try {
    const res = await IndustrySectorAPI.getList({ pageSize: 999, nodeLevel: 1 })
    parentOptions.value = res.list || []
  } catch {
    parentOptions.value = [
      { id: 1, code: '01', label: '科技', parentId: null, nodeLevel: 1, sortOrder: 1, createdAt: '' },
      { id: 2, code: '02', label: '金融', parentId: null, nodeLevel: 1, sortOrder: 2, createdAt: '' },
      { id: 3, code: '03', label: '医药', parentId: null, nodeLevel: 1, sortOrder: 3, createdAt: '' },
      { id: 4, code: '04', label: '消费', parentId: null, nodeLevel: 1, sortOrder: 4, createdAt: '' },
      { id: 5, code: '05', label: '制造', parentId: null, nodeLevel: 1, sortOrder: 5, createdAt: '' },
    ]
  }
})

/** 选了父级 → 自动设为二级行业；清除 → 自动恢复为一级行业 */
watch(() => form.value.parentId, (val) => {
  form.value.nodeLevel = val ? 2 : 1
})

/** 层级只读展示 */
const nodeLevelLabel = computed(() => form.value.nodeLevel === 1 ? '一级行业' : '二级行业')

const formRef = ref<any>(null)
const submitting = ref(false)

/** 弹框关闭时重置表单到初始状态 */
function onClosed() {
  form.value = { code: '', label: '', parentId: null, nodeLevel: 1, sortOrder: 0 }
  isEdit.value = false
  formRef.value?.resetFields()
}

/** 提交表单：校验通过后 emit confirm 交由父组件处理新增/更新 */
async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try { emit('confirm', form.value, isEdit.value) }
  finally { submitting.value = false }
}
</script>
