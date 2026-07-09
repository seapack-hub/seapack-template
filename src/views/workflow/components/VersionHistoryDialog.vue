<template>
  <el-dialog v-model="visible" title="版本历史" width="600px">
    <div class="version-list">
      <el-table v-loading="loading" :data="versionList" max-height="400">
        <el-table-column label="版本" width="80">
          <template #default="{ row }">
            <el-tag size="small">v{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="变更说明" prop="changeLog" min-width="150">
          <template #default="{ row }">
            {{ row.changeLog || '无说明' }}
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="createdByName" width="100" />
        <el-table-column label="创建时间" prop="createdAt" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleRestore(row)">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WorkflowVersionAPI } from '@/api/workflow'
import type { WorkflowVersion } from '@/api/workflow/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  workflowId: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'restore'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const loading = ref(false)
const versionList = ref<WorkflowVersion[]>([])

watch(
  () => visible.value,
  (val) => {
    if (val && props.workflowId) {
      loadVersions()
    }
  },
)

const loadVersions = async () => {
  loading.value = true
  try {
    versionList.value = await WorkflowVersionAPI.list(props.workflowId)
  } finally {
    loading.value = false
  }
}

const handleRestore = async (row: WorkflowVersion) => {
  try {
    await ElMessageBox.confirm(`确定恢复到版本 v${row.version} 吗？`, '提示', { type: 'warning' })
    const data = await WorkflowVersionAPI.getById(props.workflowId, row.version)
    emit('restore', data)
    visible.value = false
    ElMessage.success('版本已恢复')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('恢复失败')
    }
  }
}
</script>
