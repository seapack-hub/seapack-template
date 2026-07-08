<!--
  场景配置抽屉
  关联 Agent / 知识库
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`场景配置 — ${sceneName}`"
    size="700px"
    @opened="onOpened"
  >
    <el-tabs v-model="activeTab" class="px-16px">
      <!-- 关联 Agent Tab -->
      <el-tab-pane name="agent">
        <template #label><span class="inline-flex items-center gap-4px text-13px"><el-icon><User /></el-icon> 关联助手</span></template>
        <div class="min-h-300px">
          <div class="flex items-center justify-between mb-8px">
            <span class="text-14px font-600">关联助手</span>
            <el-button type="primary" size="small" icon="plus" @click="openAddAgent">添加助手</el-button>
          </div>
          <SpTable :data="agents" :columns="agentColumns" :show-index="true" size="small">
            <template #isDefault>
              <el-table-column label="类型" prop="isDefault" width="90" align="center" slot-name="isDefault">
                <template #default="{ row }">
                  <el-tag :type="row.isDefault === 1 ? 'danger' : 'info'" size="small">{{ row.isDefault === 1 ? '默认助手' : '普通' }}</el-tag>
                </template>
              </el-table-column>
            </template>
            <template #operate>
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="editAgent(row)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="removeAgent(row)">删除</el-button>
                </template>
              </el-table-column>
            </template>
          </SpTable>
        </div>
      </el-tab-pane>

      <!-- 关联知识库 Tab -->
      <el-tab-pane name="knowledge">
        <template #label><span class="inline-flex items-center gap-4px text-13px"><el-icon><Collection /></el-icon> 关联知识库</span></template>
        <div class="min-h-300px">
          <div class="flex items-center justify-between mb-8px">
            <span class="text-14px font-600">关联知识库</span>
            <el-button type="primary" size="small" icon="plus" @click="openAddKnowledge">添加知识库</el-button>
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
              <el-table-column label="操作" width="80" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" size="small" @click="removeKnowledge(row)">删除</el-button>
                </template>
              </el-table-column>
            </template>
          </SpTable>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>

  <!-- 关联 Agent 子弹窗 -->
  <el-dialog v-model="agentDialogVisible" :title="agentFormIsEdit ? '编辑关联助手' : '添加关联助手'" width="420px" append-to-body>
    <el-form :model="agentForm" label-width="80px">
      <el-form-item label="助手">
        <el-select v-model="agentForm.agentId" placeholder="选择助手" style="width: 100%" :disabled="agentFormIsEdit">
          <el-option v-for="a in allAgents" :key="a.id" :label="a.name" :value="a.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-radio-group v-model="agentForm.isDefault">
          <el-radio :value="1">默认助手</el-radio>
          <el-radio :value="0">普通助手</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序号">
        <el-input-number v-model="agentForm.sortOrder" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="agentDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onAgentSubmit">确认</el-button>
    </template>
  </el-dialog>

  <!-- 关联知识库子弹窗 -->
  <el-dialog v-model="knowledgeDialogVisible" title="添加关联知识库" width="420px" append-to-body>
    <el-form :model="knowledgeForm" label-width="80px">
      <el-form-item label="知识库">
        <el-select v-model="knowledgeForm.knowledgeId" placeholder="选择知识库" style="width: 100%">
          <el-option v-for="k in allKnowledge" :key="k.id" :label="k.name" :value="k.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="knowledgeDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onKnowledgeSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Collection } from '@element-plus/icons-vue'
import { SceneAPI, type SceneAgent, type SceneKnowledge } from '@/api/ai/scene'
import { AgentAPI, type Agent } from '@/api/ai/agent'
import { SCENE_AGENT_COLUMNS, SCENE_KNOWLEDGE_COLUMNS } from '../utils/tableColumns'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  sceneId: number
  sceneName: string
}>()

const activeTab = ref('agent')

// ===== 关联数据 =====
const agents = ref<SceneAgent[]>([])
const knowledgeList = ref<SceneKnowledge[]>([])

// ===== 全量选择数据 =====
const allAgents = ref<Agent[]>([])
const allKnowledge = ref<any[]>([])

// ===== 表格列配置 =====
const agentColumns = [...SCENE_AGENT_COLUMNS]
const knowledgeColumns = [...SCENE_KNOWLEDGE_COLUMNS]

// ===== 加载数据 =====
async function onOpened() {
  await Promise.all([loadAgents(), loadKnowledge(), loadAllAgents()])
}

async function loadAgents() {
  agents.value = await SceneAPI.getAgents(props.sceneId) || []
}
async function loadKnowledge() {
  knowledgeList.value = await SceneAPI.getKnowledgeList(props.sceneId) || []
}
async function loadAllAgents() {
  allAgents.value = await AgentAPI.list() || []
}

// ===== 关联 Agent 管理 =====
const agentDialogVisible = ref(false)
const agentFormIsEdit = ref(false)
const agentForm = ref<Partial<SceneAgent>>({ agentId: undefined, isDefault: 0, sortOrder: 0 })

function openAddAgent() {
  agentFormIsEdit.value = false
  agentForm.value = { agentId: undefined, isDefault: 0, sortOrder: 0 }
  agentDialogVisible.value = true
}

function editAgent(row: SceneAgent) {
  agentFormIsEdit.value = true
  agentForm.value = { ...row }
  agentDialogVisible.value = true
}

async function onAgentSubmit() {
  if (!agentForm.value.agentId) { ElMessage.warning('请选择助手'); return }
  if (agentFormIsEdit.value && agentForm.value.id) {
    await SceneAPI.updateAgent(props.sceneId, agentForm.value.id, agentForm.value)
  } else {
    await SceneAPI.addAgent(props.sceneId, agentForm.value)
  }
  ElMessage.success('操作成功')
  agentDialogVisible.value = false
  await loadAgents()
}

async function removeAgent(row: SceneAgent) {
  await ElMessageBox.confirm('确认删除该关联助手？', '提示', { type: 'warning' })
  await SceneAPI.deleteAgent(props.sceneId, row.id!)
  ElMessage.success('删除成功')
  await loadAgents()
}

// ===== 关联知识库管理 =====
const knowledgeDialogVisible = ref(false)
const knowledgeForm = ref<Partial<SceneKnowledge>>({ knowledgeId: undefined })

function openAddKnowledge() {
  knowledgeForm.value = { knowledgeId: undefined }
  knowledgeDialogVisible.value = true
}

async function onKnowledgeSubmit() {
  if (!knowledgeForm.value.knowledgeId) { ElMessage.warning('请选择知识库'); return }
  await SceneAPI.addKnowledge(props.sceneId, knowledgeForm.value)
  ElMessage.success('操作成功')
  knowledgeDialogVisible.value = false
  await loadKnowledge()
}

async function removeKnowledge(row: SceneKnowledge) {
  await ElMessageBox.confirm('确认删除该关联知识库？', '提示', { type: 'warning' })
  await SceneAPI.deleteKnowledge(props.sceneId, row.id!)
  ElMessage.success('删除成功')
  await loadKnowledge()
}

async function toggleKnowledgeEnabled(row: SceneKnowledge, val: number) {
  await SceneAPI.updateKnowledge(props.sceneId, row.id!, { enabled: val })
  row.enabled = val
}
</script>
