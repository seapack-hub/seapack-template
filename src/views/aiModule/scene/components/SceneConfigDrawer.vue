<!--
  场景配置抽屉
  关联 Agent / 知识库 / 部署位置 / 运行配置
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`场景配置 — ${sceneName}`"
    size="750px"
    @opened="onOpened"
  >
    <!-- 顶部概览卡片 -->
    <div class="drawer-overview">
      <div class="drawer-overview__item">
        <span class="drawer-overview__value">{{ agents.length }}</span>
        <span class="drawer-overview__label">关联助手</span>
      </div>
      <div class="drawer-overview__item">
        <span class="drawer-overview__value">{{ knowledgeList.length }}</span>
        <span class="drawer-overview__label">关联知识库</span>
      </div>
      <div class="drawer-overview__item">
        <span class="drawer-overview__value">{{ deployments.length }}</span>
        <span class="drawer-overview__label">部署位置</span>
      </div>
      <div class="drawer-overview__item">
        <span class="drawer-overview__value">{{ agentConfigs.length }}</span>
        <span class="drawer-overview__label">运行配置</span>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="config-tabs" stretch>
      <!-- Tab 1: 关联 Agent -->
      <el-tab-pane name="agent">
        <template #label><span class="config-tab-label"><el-icon><User /></el-icon> 关联助手</span></template>
        <div class="config-tab-content">
          <div class="config-tab-header">
            <span class="config-tab-title">场景关联的 AI 助手</span>
            <el-button type="primary" size="small" icon="plus" @click="openAddAgent">添加助手</el-button>
          </div>
          <template v-if="agents.length">
            <SpTable :data="agents" :columns="agentColumns" :show-index="true" size="small">
              <template #isDefault>
                <el-table-column label="类型" prop="isDefault" width="90" align="center" slot-name="isDefault">
                  <template #default="{ row }">
                    <el-tag :type="row.isDefault === 1 ? 'danger' : 'info'" size="small" effect="light">
                      {{ row.isDefault === 1 ? '默认' : '普通' }}
                    </el-tag>
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
          </template>
          <div v-else class="config-tab-empty">
            <el-empty description="暂未关联助手" :image-size="80" />
            <el-button type="primary" link @click="openAddAgent">立即添加</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 关联知识库 -->
      <el-tab-pane name="knowledge">
        <template #label><span class="config-tab-label"><el-icon><Collection /></el-icon> 知识库</span></template>
        <div class="config-tab-content">
          <div class="config-tab-header">
            <span class="config-tab-title">场景关联的知识库</span>
            <el-button type="primary" size="small" icon="plus" @click="openAddKnowledge">添加知识库</el-button>
          </div>
          <template v-if="knowledgeList.length">
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
          </template>
          <div v-else class="config-tab-empty">
            <el-empty description="暂未关联知识库" :image-size="80" />
            <el-button type="primary" link @click="openAddKnowledge">立即添加</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 3: 部署位置 -->
      <el-tab-pane name="deployment">
        <template #label><span class="config-tab-label"><el-icon><Position /></el-icon> 部署位置</span></template>
        <div class="config-tab-content">
          <div class="config-tab-header">
            <span class="config-tab-title">场景在前端模块中的部署位置</span>
            <el-button type="primary" size="small" icon="plus" @click="openAddDeployment">添加部署</el-button>
          </div>
          <template v-if="deployments.length">
            <SpTable :data="deployments" :columns="deploymentColumns" :show-index="true" size="small">
              <template #isDefault>
                <el-table-column label="默认" prop="isDefault" width="70" align="center" slot-name="isDefault">
                  <template #default="{ row }">
                    <el-tag v-if="row.isDefault === 1" type="danger" size="small" effect="light">默认</el-tag>
                    <span v-else class="text-gray-400">-</span>
                  </template>
                </el-table-column>
              </template>
              <template #status>
                <el-table-column label="状态" prop="status" width="70" align="center" slot-name="status">
                  <template #default="{ row }">
                    <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" size="small" @change="(val: number) => toggleDeploymentStatus(row, val)" />
                  </template>
                </el-table-column>
              </template>
              <template #operate>
                <el-table-column label="操作" width="120" align="center" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="editDeployment(row)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="removeDeployment(row)">删除</el-button>
                  </template>
                </el-table-column>
              </template>
            </SpTable>
          </template>
          <div v-else class="config-tab-empty">
            <el-empty description="暂未配置部署位置" :image-size="80" />
            <el-button type="primary" link @click="openAddDeployment">立即添加</el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 4: 运行配置 -->
      <el-tab-pane name="agentConfig">
        <template #label><span class="config-tab-label"><el-icon><Setting /></el-icon> 运行配置</span></template>
        <div class="config-tab-content">
          <div class="config-tab-header">
            <span class="config-tab-title">场景级 Agent 运行参数覆盖</span>
            <el-button type="primary" size="small" icon="plus" @click="openAddAgentConfig">添加配置</el-button>
          </div>
          <template v-if="agentConfigs.length">
            <SpTable :data="agentConfigs" :columns="agentConfigColumns" :show-index="true" size="small">
              <template #model>
                <el-table-column label="模型" prop="model" width="110">
                  <template #default="{ row }">
                    <span :class="row.model ? 'text-gray-900' : 'text-gray-400'">
                      {{ row.model || 'Agent 默认' }}
                    </span>
                  </template>
                </el-table-column>
              </template>
              <template #temperature>
                <el-table-column label="温度" prop="temperature" width="70" align="center">
                  <template #default="{ row }">
                    <span :class="row.temperature != null ? 'text-gray-900' : 'text-gray-400'">
                      {{ row.temperature ?? '-' }}
                    </span>
                  </template>
                </el-table-column>
              </template>
              <template #operate>
                <el-table-column label="操作" width="120" align="center" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="editAgentConfig(row)">编辑</el-button>
                    <el-button link type="danger" size="small" @click="removeAgentConfig(row)">删除</el-button>
                  </template>
                </el-table-column>
              </template>
            </SpTable>
          </template>
          <div v-else class="config-tab-empty">
            <el-empty description="暂未配置运行参数" :image-size="80" />
            <el-button type="primary" link @click="openAddAgentConfig">立即添加</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>

  <!-- 关联 Agent 子弹窗 -->
  <el-dialog v-model="agentDialogVisible" :title="agentFormIsEdit ? '编辑关联agent' : '添加关联agent'" width="420px" append-to-body>
    <el-form :model="agentForm" label-width="80px">
      <el-form-item label="agent">
        <el-select v-model="agentForm.agentId" placeholder="选择agent" style="width: 100%" :disabled="agentFormIsEdit">
          <el-option v-for="a in allAgents" :key="a.id" :label="a.name" :value="a.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-radio-group v-model="agentForm.isDefault">
          <el-radio :value="1">默认agent</el-radio>
          <el-radio :value="0">普通agent</el-radio>
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

  <!-- 部署位置弹窗 -->
  <DeploymentFormDialog
    v-model:visible="deploymentDialogVisible"
    v-model:is-edit="deploymentFormIsEdit"
    v-model:form="deploymentForm"
    @confirm="onDeploymentSubmit"
  />

  <!-- 运行配置弹窗 -->
  <AgentConfigFormDialog
    v-model:visible="agentConfigDialogVisible"
    v-model:is-edit="agentConfigFormIsEdit"
    v-model:form="agentConfigForm"
    :linked-agents="agents"
    @confirm="onAgentConfigSubmit"
  />
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Collection, Position, Setting } from '@element-plus/icons-vue'
import { SceneAPI, type SceneAgent, type SceneAgentConfig, type SceneDeployment, type SceneKnowledge } from '@/api/ai/scene'
import { AgentAPI, type Agent } from '@/api/ai/agent'
import { SCENE_AGENT_COLUMNS, SCENE_KNOWLEDGE_COLUMNS, SCENE_DEPLOYMENT_COLUMNS, SCENE_AGENT_CONFIG_COLUMNS } from '../utils/tableColumns'
import DeploymentFormDialog from './DeploymentFormDialog.vue'
import AgentConfigFormDialog from './AgentConfigFormDialog.vue'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  sceneId: number
  sceneName: string
}>()

const activeTab = ref('agent')

const agents = ref<SceneAgent[]>([])
const knowledgeList = ref<SceneKnowledge[]>([])
const deployments = ref<SceneDeployment[]>([])
const agentConfigs = ref<SceneAgentConfig[]>([])

const allAgents = ref<Agent[]>([])
const allKnowledge = ref<any[]>([])

const agentColumns = [...SCENE_AGENT_COLUMNS]
const knowledgeColumns = [...SCENE_KNOWLEDGE_COLUMNS]
const deploymentColumns = [...SCENE_DEPLOYMENT_COLUMNS]
const agentConfigColumns = [...SCENE_AGENT_CONFIG_COLUMNS]

async function onOpened() {
  await Promise.all([loadAgents(), loadKnowledge(), loadDeployments(), loadAgentConfigs(), loadAllAgents()])
}

async function loadAgents() {
  agents.value = await SceneAPI.getAgents(props.sceneId) || []
}
async function loadKnowledge() {
  knowledgeList.value = await SceneAPI.getKnowledgeList(props.sceneId) || []
}
async function loadAgentConfigs() {
  agentConfigs.value = await SceneAPI.getAgentConfigs(props.sceneId) || []
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
  if (!agentForm.value.agentId) { ElMessage.warning('请选择agent'); return }
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
  await ElMessageBox.confirm('确认删除该关联agent？', '提示', { type: 'warning' })
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

// ===== 部署位置管理 =====
const deploymentDialogVisible = ref(false)
const deploymentFormIsEdit = ref(false)
const deploymentForm = ref<Partial<SceneDeployment>>({ moduleKey: '', positionKey: '', config: {}, isDefault: 0, sortOrder: 0 })

/** 将后端返回的 config 字符串解析为对象 */
function parseConfig(raw: any): Record<string, any> {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try { return JSON.parse(raw) } catch { return {} }
}

/** 将前端 config 对象序列化为 JSON 字符串供后端存储 */
function stringifyConfig(config: any): string {
  if (!config) return '{}'
  if (typeof config === 'string') return config
  return JSON.stringify(config)
}

async function loadDeployments() {
  const list = (await SceneAPI.getDeployments(props.sceneId)) || []
  deployments.value = list.map(d => ({ ...d, config: parseConfig(d.config) }))
}

function editDeployment(row: SceneDeployment) {
  deploymentFormIsEdit.value = true
  deploymentForm.value = { ...row, config: { ...(row.config || {}) } }
  deploymentDialogVisible.value = true
}

async function onDeploymentSubmit(data: Partial<SceneDeployment>) {
  const payload = { ...data, config: stringifyConfig(data.config) }
  if (deploymentFormIsEdit.value && data.id) {
    await SceneAPI.updateDeployment(props.sceneId, data.id, payload)
  } else {
    await SceneAPI.addDeployment(props.sceneId, payload)
  }
  ElMessage.success('操作成功')
  deploymentDialogVisible.value = false
  await loadDeployments()
}

async function removeDeployment(row: SceneDeployment) {
  await ElMessageBox.confirm('确认删除该部署？', '提示', { type: 'warning' })
  await SceneAPI.deleteDeployment(props.sceneId, row.id!)
  ElMessage.success('删除成功')
  await loadDeployments()
}

async function toggleDeploymentStatus(row: SceneDeployment, val: number) {
  await SceneAPI.toggleDeploymentStatus(props.sceneId, row.id!, val)
  row.status = val
}

// ===== 运行配置管理 =====
const agentConfigDialogVisible = ref(false)
const agentConfigFormIsEdit = ref(false)
const agentConfigForm = ref<Partial<SceneAgentConfig>>({ agentId: undefined, outputFormat: 'markdown', contextLimit: 8000 })

function openAddAgentConfig() {
  agentConfigFormIsEdit.value = false
  agentConfigForm.value = { agentId: undefined, model: null, temperature: null, maxTokens: null, systemPrompt: null, outputFormat: 'markdown', contextLimit: 8000 }
  agentConfigDialogVisible.value = true
}

function editAgentConfig(row: SceneAgentConfig) {
  agentConfigFormIsEdit.value = true
  agentConfigForm.value = { ...row }
  agentConfigDialogVisible.value = true
}

async function onAgentConfigSubmit(data: Partial<SceneAgentConfig>) {
  if (agentConfigFormIsEdit.value && data.id) {
    await SceneAPI.updateAgentConfig(props.sceneId, data.id, data)
  } else {
    await SceneAPI.addAgentConfig(props.sceneId, data)
  }
  ElMessage.success('操作成功')
  agentConfigDialogVisible.value = false
  await loadAgentConfigs()
}

async function removeAgentConfig(row: SceneAgentConfig) {
  await ElMessageBox.confirm('确认删除该运行配置？', '提示', { type: 'warning' })
  await SceneAPI.deleteAgentConfig(props.sceneId, row.id!)
  ElMessage.success('删除成功')
  await loadAgentConfigs()
}
</script>

<style lang="scss" scoped>
.drawer-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 0 16px 16px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  &__value {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-color-primary);
  }

  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.config-tabs {
  padding: 0 16px;
}

.config-tab-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.config-tab-content {
  min-height: 300px;
  padding-top: 4px;
}

.config-tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.config-tab-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.config-tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 8px;
}
</style>
