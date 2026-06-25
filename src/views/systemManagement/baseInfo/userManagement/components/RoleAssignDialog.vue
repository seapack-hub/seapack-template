<template>
  <el-dialog v-model="visible" :title="`分配角色 - ${userName}`" width="460px">
    <el-checkbox-group v-model="checkedRoleIds">
      <div class="flex flex-col gap-12px">
        <div v-for="role in roleList" :key="role.id" class="flex items-center gap-8px px-12px py-8px rounded-4px hover:bg-[#f5f7fa]">
          <el-checkbox :label="role.id" :value="role.id">{{ role.roleName }}</el-checkbox>
          <el-tag size="small" type="info">{{ role.roleCode }}</el-tag>
        </div>
      </div>
    </el-checkbox-group>
    <div v-if="!roleList.length" class="text-center text-gray-400 py-20px">暂无可用角色</div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { RoleAPI, type Role } from '@/api/system/role'
import { UserAPI } from '@/api/system/user'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ userId: number; userName: string }>()
const emit = defineEmits<{ refresh: [] }>()

const roleList = ref<Role[]>([])
const checkedRoleIds = ref<number[]>([])
const submitting = ref(false)

watch(visible, async (val) => {
  if (!val) return
  try {
    const [allRoles, userRoleIds] = await Promise.all([
      RoleAPI.page({ pageNum: 1, pageSize: 999 }),
      UserAPI.getRoleIds(props.userId),
    ])
    roleList.value = allRoles.list || []
    checkedRoleIds.value = (userRoleIds as number[]) || []
  } catch {
    roleList.value = []
    checkedRoleIds.value = []
  }
})

async function onSubmit() {
  submitting.value = true
  try {
    await UserAPI.assignRoles(props.userId, checkedRoleIds.value)
    ElMessage.success('角色分配成功')
    visible.value = false
    emit('refresh')
  } finally { submitting.value = false }
}
</script>
