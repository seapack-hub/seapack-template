<template>
  <el-drawer v-model="visible" :title="`分配权限 - ${roleName}`" size="420px" @closed="onClosed">
    <div class="h-full flex flex-col">
      <div class="flex-1 overflow-auto">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          show-checkbox
          check-strictly
          default-expand-all
          highlight-current
        />
      </div>
      <div class="pt-12px border-t flex justify-end gap-10px">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">保存</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { PermissionAPI, type PermissionTree } from '@/api/system/permission/permission'
import { RoleAPI } from '@/api/system/permission/role'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ roleId: number; roleName: string }>()
const emit = defineEmits<{ refresh: [] }>()

const treeRef = ref<any>(null)
const treeData = ref<PermissionTree[]>([])
const submitting = ref(false)

watch(visible, async (val) => {
  if (!val) return
  try {
    const [treeRes, idsRes] = await Promise.all([
      PermissionAPI.getTree(),
      RoleAPI.getPermissionIds(props.roleId),
    ])
    treeData.value = Array.isArray(treeRes) ? treeRes : []
    nextTick(() => {
      treeRef.value?.setCheckedKeys(idsRes as number[] || [])
    })
  } catch {
    treeData.value = []
  }
})

function onClosed() {
  treeData.value = []
}

async function onSubmit() {
  const checkedIds = treeRef.value?.getCheckedKeys() || []
  submitting.value = true
  try {
    await RoleAPI.assignPermissions(props.roleId, checkedIds)
    ElMessage.success('权限分配成功')
    visible.value = false
    emit('refresh')
  } finally { submitting.value = false }
}
</script>
