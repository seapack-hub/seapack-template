<template>
  <div class="min-h-300px">
    <div class="flex items-center justify-between mb-8px">
      <span class="text-14px font-600">关联知识库</span>
      <el-button type="primary" size="small" @click="openAddKnowledge">添加知识库</el-button>
    </div>
    <SpTable :data="knowledgeList" :columns="knowledgeColumns" :show-index="true" size="small">
      <template #enabled>
        <el-table-column label="状态" prop="enabled" width="70" align="center" slot-name="enabled">
          <template #default="{ row }">
            <el-switch :model-value="row.enabled" :active-value="1" :inactive-value="0" size="small" @change="(val: number) => toggleKnowledgeEnabled(row, val)" />
          </template>
        </el-table-column>
      </template>
      <template #operate>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="editKnowledge(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeKnowledge(row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <el-dialog v-model="knowledgeDialogVisible" :title="knowledgeFormIsEdit ? '编辑关联知识库' : '添加关联知识库'" width="420px" append-to-body>
      <el-form :model="knowledgeForm" label-width="100px">
        <el-form-item label="知识库">
          <el-select v-model="knowledgeForm.knowledgeId" placeholder="选择知识库" style="width: 100%" :disabled="knowledgeFormIsEdit">
            <el-option v-for="k in allKnowledge" :key="k.id" :label="k.name" :value="k.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="检索片段数">
          <el-input-number v-model="knowledgeForm.retrievalCount" :min="1" :max="20" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="knowledgeForm.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="knowledgeForm.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="knowledgeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onKnowledgeSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AgentAPI, type AgentKnowledge } from '@/api/ai/agent'
import { AGENT_KNOWLEDGE_COLUMNS } from '../utils/tableColumns'

const props = defineProps<{
  agentId: number
  allKnowledge: any[]
}>()

const knowledgeList = ref<AgentKnowledge[]>([])
const knowledgeColumns = [...AGENT_KNOWLEDGE_COLUMNS]

// ===== 关联知识库管理 =====
const knowledgeDialogVisible = ref(false)
const knowledgeFormIsEdit = ref(false)
const knowledgeForm = ref<Partial<AgentKnowledge>>({ knowledgeId: undefined, retrievalCount: 5, sortOrder: 0, enabled: 1 })

function openAddKnowledge() {
  knowledgeFormIsEdit.value = false
  knowledgeForm.value = { knowledgeId: undefined, retrievalCount: 5, sortOrder: 0, enabled: 1 }
  knowledgeDialogVisible.value = true
}

function editKnowledge(row: AgentKnowledge) {
  knowledgeFormIsEdit.value = true
  knowledgeForm.value = { ...row }
  knowledgeDialogVisible.value = true
}

async function onKnowledgeSubmit() {
  if (!knowledgeForm.value.knowledgeId) { ElMessage.warning('请选择知识库'); return }
  if (knowledgeFormIsEdit.value && knowledgeForm.value.id) {
    await AgentAPI.updateKnowledge(props.agentId, knowledgeForm.value.id, knowledgeForm.value)
  } else {
    await AgentAPI.addKnowledge(props.agentId, knowledgeForm.value)
  }
  ElMessage.success('操作成功')
  knowledgeDialogVisible.value = false
  await loadKnowledge()
}

async function removeKnowledge(row: AgentKnowledge) {
  await ElMessageBox.confirm('确认删除该关联知识库？', '提示', { type: 'warning' })
  await AgentAPI.deleteKnowledge(props.agentId, row.id!)
  ElMessage.success('删除成功')
  await loadKnowledge()
}

async function toggleKnowledgeEnabled(row: AgentKnowledge, val: number) {
  await AgentAPI.updateKnowledge(props.agentId, row.id!, { enabled: val })
  row.enabled = val
}

async function loadKnowledge() {
  knowledgeList.value = await AgentAPI.getKnowledgeList(props.agentId) || []
}

defineExpose({ loadKnowledge })
</script>
