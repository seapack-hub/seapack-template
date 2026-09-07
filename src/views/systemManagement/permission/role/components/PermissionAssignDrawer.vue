<template>
  <el-drawer v-model="visible" :title="`分配权限 - ${roleName}`" size="600px" @closed="onClosed">
    <div class="h-full flex flex-col">
      <!-- 顶部操作栏 -->
      <div class="flex-none flex items-center justify-between pb-12px mb-12px border-b border-[var(--el-border-color-lighter)]">
        <span class="text-14px color-[var(--el-text-color-secondary)]">
          {{ isEditing ? '编辑模式 — 勾选/取消权限后点击保存' : '只读模式 — 点击编辑按钮进行修改' }}
        </span>
        <el-button
          type="primary"
          :icon="Edit"
          :disabled="isEditing"
          @click="isEditing = true"
        >
          编辑
        </el-button>
      </div>

      <!-- 权限树 -->
      <div class="flex-1 overflow-auto">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="{ label: 'name', children: 'children', disabled: () => !isEditing }"
          node-key="id"
          show-checkbox
          check-strictly
          default-expand-all
          highlight-current
        />
      </div>

      <!-- 底部按钮 -->
      <div class="flex-none pt-12px border-t flex justify-end gap-10px">
        <el-button v-if="isEditing" @click="onCancelEdit">取消</el-button>
        <el-button v-if="isEditing" type="primary" :loading="submitting" @click="onSubmit">保存</el-button>
        <el-button v-if="!isEditing" @click="visible = false">关闭</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { PermissionAPI, type PermissionTree } from '@/api/system/permission/permission'
import { RoleAPI } from '@/api/system/permission/role'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ roleId: number; roleName: string }>()
const emit = defineEmits<{ refresh: [] }>()

const treeRef = ref<any>(null)
const treeData = ref<PermissionTree[]>([])
const submitting = ref(false)
const isEditing = ref(false)
const checkedIdsSnapshot = ref<number[]>([])

watch(visible, async (val) => {
  if (!val) return
  isEditing.value = false
  try {
    const [treeRes, idsRes] = await Promise.all([
      PermissionAPI.getTree(),
      RoleAPI.getPermissionIds(props.roleId),
    ])
    treeData.value = Array.isArray(treeRes) ? treeRes : []
    checkedIdsSnapshot.value = (idsRes as number[]) || []
    nextTick(() => {
      treeRef.value?.setCheckedKeys(checkedIdsSnapshot.value)
    })
  } catch {
    treeData.value = []
  }
})

function onClosed() {
  treeData.value = []
  checkedIdsSnapshot.value = []
}

function onCancelEdit() {
  // 恢复到进入编辑前的快照
  nextTick(() => {
    treeRef.value?.setCheckedKeys(checkedIdsSnapshot.value)
  })
  isEditing.value = false
}

async function onSubmit() {
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  submitting.value = true
  try {
    await RoleAPI.assignPermissions(props.roleId, checkedKeys)
    checkedIdsSnapshot.value = [...checkedKeys]
    ElMessage.success('权限分配成功')
    isEditing.value = false
    emit('refresh')
  } finally { submitting.value = false }
}
</script>
