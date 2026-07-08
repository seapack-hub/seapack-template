<template>
  <div class="min-h-300px">
    <el-input
      v-model="localSystemPrompt"
      type="textarea"
      :rows="12"
      placeholder="定义助手的角色和行为规则，支持 {{变量名}} 语法"
    />
    <div class="mt-12px flex justify-end">
      <el-button type="primary" :loading="savingPrompt" @click="saveSystemPrompt">保存提示词</el-button>
    </div>

    <el-divider />
    <div class="flex items-center justify-between mb-8px">
      <span class="text-14px font-600">关联提示词模板</span>
      <el-button type="primary" size="small" @click="openAddPrompt">添加模板</el-button>
    </div>
    <SpTable :data="prompts" :columns="promptColumns" :show-index="true" size="small">
      <template #isPrimary>
        <el-table-column label="类型" prop="isPrimary" width="80" align="center" slot-name="isPrimary">
          <template #default="{ row }">
            <el-tag :type="row.isPrimary === 1 ? 'danger' : 'info'" size="small">{{ row.isPrimary === 1 ? '主模板' : '辅助' }}</el-tag>
          </template>
        </el-table-column>
      </template>
      <template #enabled>
        <el-table-column label="状态" prop="enabled" width="70" align="center" slot-name="enabled">
          <template #default="{ row }">
            <el-switch :model-value="row.enabled" :active-value="1" :inactive-value="0" size="small" @change="(val: number) => togglePromptEnabled(row, val)" />
          </template>
        </el-table-column>
      </template>
      <template #operate>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" size="small" @click="editPrompt(row, $index)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removePrompt(row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <el-dialog v-model="promptDialogVisible" :title="promptFormIsEdit ? '编辑关联模板' : '添加关联模板'" width="420px" append-to-body>
      <el-form :model="promptForm" label-width="80px">
        <el-form-item label="模板">
          <el-select v-model="promptForm.templateId" placeholder="选择模板" style="width: 100%" :disabled="promptFormIsEdit">
            <el-option v-for="t in allTemplates" :key="t.id" :label="t.name" :value="t.id as any" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="promptForm.isPrimary">
            <el-radio :value="1">主模板</el-radio>
            <el-radio :value="0">辅助模板</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="promptForm.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="promptForm.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="promptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onPromptSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AgentAPI, type AgentPrompt } from '@/api/ai/agent'
import type { PromptTemplate } from '@/api/ai/promptTemplate'
import { AGENT_PROMPT_COLUMNS } from '../utils/tableColumns'

const props = defineProps<{
  agentId: number
  systemPrompt: string
  allTemplates: PromptTemplate[]
}>()

const emit = defineEmits<{
  'update:systemPrompt': [v: string]
}>()

const localSystemPrompt = ref(props.systemPrompt)
watch(() => props.systemPrompt, (v) => { localSystemPrompt.value = v })
watch(localSystemPrompt, (v) => { emit('update:systemPrompt', v) })

const prompts = ref<AgentPrompt[]>([])
const promptColumns = [...AGENT_PROMPT_COLUMNS]

const savingPrompt = ref(false)
async function saveSystemPrompt() {
  savingPrompt.value = true
  try {
    await AgentAPI.update(props.agentId, { systemPrompt: localSystemPrompt.value })
    ElMessage.success('保存成功')
  } finally { savingPrompt.value = false }
}

// ===== 关联模板管理 =====
const promptDialogVisible = ref(false)
const promptFormIsEdit = ref(false)
const promptFormIdx = ref(-1)
const promptForm = ref<Partial<AgentPrompt>>({ templateId: undefined, isPrimary: 0, sortOrder: 0, enabled: 1 })

function openAddPrompt() {
  promptFormIsEdit.value = false
  promptFormIdx.value = -1
  promptForm.value = { templateId: undefined, isPrimary: 0, sortOrder: 0, enabled: 1 }
  promptDialogVisible.value = true
}

function editPrompt(row: AgentPrompt, idx: number) {
  promptFormIsEdit.value = true
  promptFormIdx.value = idx
  promptForm.value = { ...row }
  promptDialogVisible.value = true
}

async function onPromptSubmit() {
  if (!promptForm.value.templateId) { ElMessage.warning('请选择模板'); return }
  if (promptFormIsEdit.value && promptForm.value.id) {
    await AgentAPI.updatePrompt(props.agentId, promptForm.value.id, promptForm.value)
  } else {
    await AgentAPI.addPrompt(props.agentId, promptForm.value)
  }
  ElMessage.success('操作成功')
  promptDialogVisible.value = false
  await loadPrompts()
}

async function removePrompt(row: AgentPrompt) {
  await ElMessageBox.confirm('确认删除该关联模板？', '提示', { type: 'warning' })
  await AgentAPI.deletePrompt(props.agentId, row.id!)
  ElMessage.success('删除成功')
  await loadPrompts()
}

async function togglePromptEnabled(row: AgentPrompt, val: number) {
  await AgentAPI.updatePrompt(props.agentId, row.id!, { enabled: val })
  row.enabled = val
}

async function loadPrompts() {
  prompts.value = await AgentAPI.getPrompts(props.agentId) || []
}

defineExpose({ loadPrompts })
</script>
