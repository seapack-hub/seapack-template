<!--
  场景配置 — 编排管理 Tab
  管理场景下的编排（orchestration）列表，每个编排包含多个步骤（step）。
  支持四种执行策略：sequential / parallel / llm_tool / auto
-->
<template>
  <div class="min-h-300px pt-4px">
    <div class="flex items-center justify-between mb-12px">
      <span class="text-13px c-[var(--el-text-color-secondary)]">多Agent编排流程</span>
      <el-button type="primary" size="small" icon="plus" @click="openAdd">新建编排</el-button>
    </div>

    <template v-if="list.length">
      <SpTable :data="list" :columns="columns" :show-index="true" size="small">
        <template #strategy>
          <el-table-column label="执行策略" prop="strategy" width="100" align="center" slot-name="strategy">
            <template #default="{ row }">
              <el-tag :type="strategyTagType(row.strategy) as any" size="small" effect="light">
                {{ strategyLabel(row.strategy) }}
              </el-tag>
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
      <el-empty description="暂未配置编排流程" :image-size="80" />
      <el-button type="primary" link @click="openAdd">立即创建</el-button>
    </div>

    <!-- 编排表单弹窗 -->
    <OrchestrationFormDialog
      v-model:visible="dialogVisible"
      v-model:is-edit="isEdit"
      v-model:form="form"
      @submit="onSubmit"
    />

    <!-- 步骤管理 Drawer -->
    <StepDrawer
      v-model:visible="stepDrawerVisible"
      v-model:orch-id="currentOrchId"
      v-model:orch-name="currentOrchName"
      :linked-agents="linkedAgents"
      @refresh="load"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { OrchestrationAPI, type Orchestration } from '@/api/ai/orchestration'
import { STRATEGY_OPTIONS, type OrchestrationStrategy } from '@/api/ai/types/orchestration'
import type { SceneAgent } from '@/api/ai/scene'
import { createOrchestrationColumns } from '../../utils/tableColumns'
import OrchestrationFormDialog from './OrchestrationFormDialog.vue'
import StepDrawer from './StepDrawer.vue'

const props = defineProps<{
  sceneId: number
  linkedAgents: SceneAgent[]
}>()

const emit = defineEmits<{
  (e: 'update', count: number): void
}>()

// ===== 编排列表 =====
const list = ref<Orchestration[]>([])

const columns = createOrchestrationColumns({
  onEdit(row) {
    isEdit.value = true
    form.value = { ...row }
    dialogVisible.value = true
  },
  onDelete(row) {
    remove(row)
  },
  onCopy(row) {
    copy(row)
  },
  onToggleStatus(row) {
    toggleStatus(row)
  },
  onSteps(row) {
    currentOrchId.value = row.id!
    currentOrchName.value = row.name || ''
    stepDrawerVisible.value = true
  },
})

// ===== 表单 =====
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Partial<Orchestration>>({
  sceneId: props.sceneId,
  name: '',
  code: '',
  strategy: 'sequential' as OrchestrationStrategy,
  description: '',
  sortOrder: 0,
})

// ===== 步骤 Drawer =====
const stepDrawerVisible = ref(false)
const currentOrchId = ref(0)
const currentOrchName = ref('')

// ===== 策略标签 =====
function strategyLabel(strategy: OrchestrationStrategy): string {
  return STRATEGY_OPTIONS.find(s => s.value === strategy)?.label || strategy
}

function strategyTagType(strategy: OrchestrationStrategy): string {
  const map: Record<string, string> = {
    sequential: 'primary',
    parallel: 'success',
    llm_tool: 'warning',
    auto: 'info',
  }
  return map[strategy] || 'info'
}

// ===== CRUD =====
async function load() {
  list.value = await OrchestrationAPI.list({ sceneId: props.sceneId }) || []
  emit('update', list.value.length)
}

function openAdd() {
  isEdit.value = false
  form.value = {
    sceneId: props.sceneId,
    name: '',
    code: '',
    strategy: 'sequential',
    description: '',
    status: 1,
    sortOrder: 0,
  }
  dialogVisible.value = true
}

async function onSubmit() {
  if (!form.value.name) { ElMessage.warning('请输入编排名称'); return }
  if (!form.value.code) { ElMessage.warning('请输入编码'); return }
  if (isEdit.value && form.value.id) {
    await OrchestrationAPI.update(form.value.id, form.value)
  } else {
    await OrchestrationAPI.insert({ ...form.value, sceneId: props.sceneId })
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  await load()
}

async function remove(row: Orchestration) {
  await ElMessageBox.confirm(`确认删除编排「${row.name}」？将同时删除其所有步骤。`, '提示', { type: 'warning' })
  await OrchestrationAPI.delete(row.id!)
  ElMessage.success('删除成功')
  await load()
}

async function copy(row: Orchestration) {
  await ElMessageBox.confirm(`确认复制编排「${row.name}」？`, '提示', { type: 'info' })
  await OrchestrationAPI.copy(row.id!)
  ElMessage.success('复制成功')
  await load()
}

async function toggleStatus(row: Orchestration) {
  const newStatus = row.status === 1 ? 0 : 1
  await OrchestrationAPI.updateStatus(row.id!, newStatus)
  ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
  await load()
}

onMounted(() => {
  load()
})

defineExpose({ load })
</script>
