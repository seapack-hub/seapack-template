<!--
  步骤管理 Drawer — 管理编排下的步骤列表 + 步骤表单弹窗
-->
<template>
  <el-drawer v-model="visible" :title="`步骤管理 — ${orchName}`" size="850px" append-to-body>
    <div class="flex items-center justify-between mb-12px">
      <span class="text-13px c-[var(--el-text-color-secondary)]">共 {{ list.length }} 个步骤</span>
      <el-button type="primary" size="small" icon="plus" @click="openAdd">添加步骤</el-button>
    </div>

    <template v-if="list.length">
      <SpTable :data="list" :columns="columns" :show-index="false" size="small">
        <template #inputMapping>
          <el-table-column label="输入映射" prop="inputMapping" min-width="160" show-overflow-tooltip slot-name="inputMapping">
            <template #default="{ row }">
              <span
                :class="row.inputMapping ? 'c-[var(--el-text-color-primary)]' : 'c-[var(--el-text-color-placeholder)]'"
                class="font-mono text-12px"
              >
                {{ row.inputMapping || '用户原始输入' }}
              </span>
            </template>
          </el-table-column>
        </template>
        <template #status>
          <el-table-column label="状态" prop="status" width="70" align="center" slot-name="status">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="light">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
        </template>
      </SpTable>
    </template>

    <div v-else class="flex flex-col items-center justify-center py-40px gap-8px">
      <el-empty description="暂未添加步骤" :image-size="80" />
      <el-button type="primary" link @click="openAdd">立即添加</el-button>
    </div>

    <!-- 步骤表单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑步骤' : '添加步骤'" width="520px" append-to-body>
      <el-form :model="form" label-width="90px">
        <el-form-item label="步骤序号">
          <el-input-number v-model="form.stepIndex" :min="1" :max="20" class="w-full" />
        </el-form-item>
        <el-form-item label="步骤名称">
          <el-input v-model="form.stepName" placeholder="如：AI写作" maxlength="128" />
        </el-form-item>
        <el-form-item label="执行Agent">
          <el-select v-model="form.agentId" placeholder="选择Agent" class="w-full" :disabled="isEdit">
            <el-option v-for="a in linkedAgents" :key="a.agentId" :label="a.agentName" :value="a.agentId || ''" />
          </el-select>
        </el-form-item>
        <el-form-item label="输入映射">
          <el-input v-model="form.inputMapping" placeholder="如 ${step_1.output}，为空使用用户输入" maxlength="512" />
          <div class="text-12px c-[var(--el-text-color-secondary)] mt-4px">引用上一步输出：${step_N.output}，为空则使用用户原始输入</div>
        </el-form-item>
        <el-form-item label="失败重试">
          <el-input-number v-model="form.retryCount" :min="0" :max="3" class="w-full" />
        </el-form-item>
        <el-form-item label="超时(ms)">
          <el-input-number v-model="form.timeoutMs" :min="0" :step="10000" placeholder="不限" class="w-full" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { OrchestrationAPI, type OrchestrationStep } from '@/api/ai/orchestration'
import type { SceneAgent } from '@/api/ai/scene'
import { createOrchestrationStepColumns } from '../../utils/tableColumns'

const props = defineProps<{
  linkedAgents: SceneAgent[]
}>()

const visible = defineModel<boolean>('visible', { required: true })
const orchId = defineModel<number>('orchId', { required: true })
const orchName = defineModel<string>('orchName', { default: '' })

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const list = ref<OrchestrationStep[]>([])

const columns = createOrchestrationStepColumns({
  onEdit(row) {
    isEdit.value = true
    form.value = { ...row }
    dialogVisible.value = true
  },
  onDelete(row) {
    remove(row)
  },
})

// ===== 步骤表单 =====
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Partial<OrchestrationStep>>({
  stepIndex: 1,
  stepName: '',
  agentId: undefined,
  inputMapping: '',
  retryCount: 0,
  timeoutMs: null,
  status: 1,
})

async function load() {
  list.value = await OrchestrationAPI.getSteps(orchId.value) || []
}

function openAdd() {
  isEdit.value = false
  form.value = {
    orchestrationId: orchId.value,
    stepIndex: list.value.length + 1,
    stepName: '',
    agentId: undefined,
    inputMapping: '',
    retryCount: 0,
    timeoutMs: null,
    status: 1,
  }
  dialogVisible.value = true
}

async function onSubmit() {
  if (!form.value.stepName) { ElMessage.warning('请输入步骤名称'); return }
  if (!form.value.agentId) { ElMessage.warning('请选择执行Agent'); return }
  if (isEdit.value && form.value.id) {
    await OrchestrationAPI.updateStep(orchId.value, form.value.id, form.value)
  } else {
    await OrchestrationAPI.addStep(orchId.value, form.value)
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  await load()
  emit('refresh')
}

async function remove(row: OrchestrationStep) {
  await ElMessageBox.confirm(`确认删除步骤「${row.stepName}」？`, '提示', { type: 'warning' })
  await OrchestrationAPI.deleteStep(orchId.value, row.id!)
  ElMessage.success('删除成功')
  await load()
  emit('refresh')
}

watch(() => visible.value, (val) => {
  if (val && orchId.value) load()
})

defineExpose({ load })
</script>
