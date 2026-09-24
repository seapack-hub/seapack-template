<!--
  步骤管理 Drawer — 管理编排下的步骤列表 + 步骤表单弹窗
-->
<template>
  <el-drawer v-model="visible" :title="`步骤管理 — ${orchName}`" size="900px" append-to-body>
    <div class="flex items-center justify-between mb-12px">
      <span class="text-13px c-[var(--el-text-color-secondary)]">共 {{ list.length }} 个步骤</span>
      <el-button type="primary" size="small" icon="plus" @click="openAdd">添加步骤</el-button>
    </div>

    <template v-if="list.length">
      <SpTable :data="list" :columns="columns" :show-index="false" size="small">
        <template #nodeType>
          <el-table-column label="节点类型" prop="nodeType" width="100" align="center" slot-name="nodeType">
            <template #default="{ row }">
              <el-tag :type="nodeTypeTagType(row.nodeType)" size="small" effect="light">
                {{ nodeTypeLabel(row.nodeType) }}
              </el-tag>
            </template>
          </el-table-column>
        </template>
        <template #inputMapping>
          <el-table-column label="输入映射" prop="inputMapping" min-width="140" show-overflow-tooltip slot-name="inputMapping">
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
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑步骤' : '添加步骤'" width="580px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-form-item label="步骤序号">
          <el-input-number v-model="form.stepIndex" :min="1" :max="20" class="w-full" />
        </el-form-item>
        <el-form-item label="步骤名称">
          <el-input v-model="form.stepName" placeholder="如：AI写作" maxlength="128" />
        </el-form-item>
        <el-form-item label="节点类型">
          <el-select v-model="form.nodeType" class="w-full" @change="onNodeTypeChange">
            <el-option v-for="t in NODE_TYPE_OPTIONS" :key="t.value" :label="t.label" :value="t.value">
              <div class="flex flex-col">
                <span>{{ t.label }}</span>
                <span class="text-11px c-[var(--el-text-color-secondary)]">{{ t.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- Agent 节点：选择 Agent -->
        <el-form-item v-if="form.nodeType === 'agent' || !form.nodeType" label="执行Agent">
          <el-select v-model="form.agentId" placeholder="选择Agent" class="w-full" :disabled="isEdit">
            <el-option v-for="a in linkedAgents" :key="a.agentId" :label="a.agentName" :value="a.agentId || ''" />
          </el-select>
        </el-form-item>
        <!-- Agent 节点：输入模式 -->
        <el-form-item v-if="form.nodeType === 'agent' || !form.nodeType" label="输入来源">
          <el-select v-model="form.inputMode" class="w-full" clearable>
            <el-option v-for="m in INPUT_MODE_OPTIONS" :key="m.value" :label="m.label" :value="m.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.nodeType === 'agent' || !form.nodeType" label="输入映射">
          <el-input v-model="form.inputMapping" placeholder="如 ${step_1.output} 或 state:plan" maxlength="512" />
          <div class="text-12px c-[var(--el-text-color-secondary)] mt-4px">
            引用步骤输出：${step_N.output}，引用共享状态：state:key，为空使用用户输入
          </div>
        </el-form-item>
        <!-- Agent 节点：输出去向 -->
        <el-form-item v-if="form.nodeType === 'agent' || !form.nodeType" label="输出去向">
          <el-select v-model="form.outputTarget" class="w-full" clearable>
            <el-option v-for="t in OUTPUT_TARGET_OPTIONS" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <!-- Condition 节点：条件表达式 + 分支跳转 -->
        <template v-if="form.nodeType === 'condition'">
          <el-form-item label="条件表达式">
            <el-input v-model="form.condition" placeholder="如 ${step_1.status} == success" maxlength="512" />
            <div class="text-12px c-[var(--el-text-color-secondary)] mt-4px">
              支持 ${step_N.status} 和 ${step_N.output} 占位符
            </div>
          </el-form-item>
          <el-form-item label="条件为真">
            <el-input-number v-model="form.branchTrueStep" :min="1" :max="20" placeholder="跳转步骤" class="w-full" />
          </el-form-item>
          <el-form-item label="条件为假">
            <el-input-number v-model="form.branchFalseStep" :min="1" :max="20" placeholder="跳转步骤" class="w-full" />
          </el-form-item>
        </template>
        <!-- 节点描述 -->
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="描述节点用途，供动态规划时 LLM 理解" maxlength="512" />
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
import { NODE_TYPE_OPTIONS, INPUT_MODE_OPTIONS, OUTPUT_TARGET_OPTIONS, type NodeType } from '@/api/ai/types/orchestration'
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

function nodeTypeLabel(type?: NodeType) {
  return NODE_TYPE_OPTIONS.find(t => t.value === type)?.label || 'Agent 执行'
}

function nodeTypeTagType(type?: NodeType): 'success' | 'warning' | 'info' | 'danger' | undefined {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    agent: 'info', condition: 'warning', aggregate: 'success', handoff: 'info',
  }
  return map[type || 'agent']
}

// ===== 步骤表单 =====
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Partial<OrchestrationStep>>({
  stepIndex: 1,
  stepName: '',
  nodeType: 'agent',
  agentId: undefined,
  inputMode: 'user_input',
  inputMapping: '',
  outputTarget: 'next_step',
  retryCount: 0,
  timeoutMs: null,
  status: 1,
})

function onNodeTypeChange(val: NodeType) {
  if (val === 'condition') {
    form.value.agentId = undefined
  }
}

async function load() {
  list.value = await OrchestrationAPI.getSteps(orchId.value) || []
}

function openAdd() {
  isEdit.value = false
  form.value = {
    orchestrationId: orchId.value,
    stepIndex: list.value.length + 1,
    stepName: '',
    nodeType: 'agent',
    agentId: undefined,
    inputMode: 'user_input',
    inputMapping: '',
    outputTarget: 'next_step',
    retryCount: 0,
    timeoutMs: null,
    status: 1,
  }
  dialogVisible.value = true
}

async function onSubmit() {
  if (!form.value.stepName) { ElMessage.warning('请输入步骤名称'); return }
  if ((form.value.nodeType === 'agent' || !form.value.nodeType) && !form.value.agentId) {
    ElMessage.warning('请选择执行Agent'); return
  }
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
