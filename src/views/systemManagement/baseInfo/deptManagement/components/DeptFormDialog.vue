<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑部门' : '新增部门'" width="480px" @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px" label-suffix="：">
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="form.deptName" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="上级部门" prop="parentDeptId">
        <el-tree-select
          v-model="form.parentDeptId"
          :data="filteredTree"
          :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
          placeholder="顶级部门（不选）"
          check-strictly
          filterable
          clearable
          style="width: 100%"
          @change="onParentChange"
        />
      </el-form-item>
      <el-form-item label="部门层级" prop="deptLevel">
        <el-input :model-value="deptLevelLabel" disabled />
      </el-form-item>
      <el-form-item label="排序号" prop="seq">
        <el-input-number v-model="form.seq" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { DeptAPI } from '@/api/system/dept'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { required: true })
const form = defineModel<any>('form', { required: true })
const emit = defineEmits<{ confirm: [formData: any, isEdit: boolean] }>()

const deptTree = ref<any[]>([])
const deptLevelLabel = ref('')

/** 只保留前两级部门的树（三级部门不能作为上级） */
function trimToLevel2(nodes: any[]): any[] {
  return nodes
    .filter(n => n.deptLevel !== '3')
    .map(n => ({ ...n, children: n.children?.length ? trimToLevel2(n.children) : undefined }))
}
const filteredTree = computed(() => trimToLevel2(deptTree.value))

/** 根据父部门 ID 自动计算部门层级 */
function calcDeptLevel(parentId?: number | null) {
  if (parentId == null) {
    form.value.deptLevel = '1'
    deptLevelLabel.value = '一级'
    return
  }
  const found = findNode(deptTree.value, parentId)
  if (found) {
    const parentLevel = Number(found.deptLevel || 1)
    const level = Math.min(parentLevel + 1, 3)
    form.value.deptLevel = String(level)
    deptLevelLabel.value = ({ '1': '一级', '2': '二级', '3': '三级' } as Record<string, string>)[form.value.deptLevel] || ''
  }
}

function findNode(nodes: any[], id: number): any {
  for (const n of nodes) {
    if (n.deptId === id) return n
    if (n.children?.length) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

function onParentChange(val: number | null) {
  calcDeptLevel(val)
}

watch(visible, async (val) => {
  if (!val) return
  try {
    const res = await DeptAPI.getDeptTree()
    deptTree.value = Array.isArray(res) ? res : []
    // 编辑时已有 deptLevel；新增时根据初始 parentDeptId 计算
    if (!isEdit.value) calcDeptLevel(form.value.parentDeptId)
    else deptLevelLabel.value = ({ '1': '一级', '2': '二级', '3': '三级' } as Record<string, string>)[form.value.deptLevel] || ''
  } catch {
    deptTree.value = []
  }
})

const formRules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

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