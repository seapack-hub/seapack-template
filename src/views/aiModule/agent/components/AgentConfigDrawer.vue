<!--
  Agent 配置抽屉
  分 Tab 管理：提示词模板、技能、知识库、对话记忆
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`Agent 配置 — ${agentName}`"
    size="700px"
    @opened="onOpened"
  >
    <el-tabs v-model="activeTab" class="px-16px">
      <!-- 系统提示词 Tab -->
      <el-tab-pane name="prompt">
        <template #label><span class="inline-flex items-center gap-4px text-13px"><el-icon><EditPen /></el-icon> 系统提示词</span></template>
        <div class="min-h-300px">
          <el-input
            v-model="agentDetail.systemPrompt"
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
            <el-button type="primary" size="small" icon="plus" @click="openAddPrompt">添加模板</el-button>
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
        </div>
      </el-tab-pane>

      <!-- 技能 Tab -->
      <el-tab-pane name="skill">
        <template #label><span class="inline-flex items-center gap-4px text-13px"><el-icon><Connection /></el-icon> 技能关联</span></template>
        <div class="min-h-300px">
          <div class="flex items-center justify-between mb-8px">
            <span class="text-14px font-600">关联技能</span>
            <el-button type="primary" size="small" icon="plus" @click="openAddSkill">添加技能</el-button>
          </div>
          <SpTable :data="skills" :columns="skillColumns" :show-index="true" size="small">
            <template #isPrimary>
              <el-table-column label="类型" prop="isPrimary" width="80" align="center" slot-name="isPrimary">
                <template #default="{ row }">
                  <el-tag :type="row.isPrimary === 1 ? 'danger' : 'info'" size="small">{{ row.isPrimary === 1 ? '主技能' : '辅助' }}</el-tag>
                </template>
              </el-table-column>
            </template>
            <template #enabled>
              <el-table-column label="状态" prop="enabled" width="70" align="center" slot-name="enabled">
                <template #default="{ row }">
                  <el-switch :model-value="row.enabled" :active-value="1" :inactive-value="0" size="small" @change="(val: number) => toggleSkillEnabled(row, val)" />
                </template>
              </el-table-column>
            </template>
            <template #operate>
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="editSkill(row)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="removeSkill(row)">删除</el-button>
                </template>
              </el-table-column>
            </template>
          </SpTable>
        </div>
      </el-tab-pane>

      <!-- 知识库 Tab -->
      <el-tab-pane name="knowledge">
        <template #label><span class="inline-flex items-center gap-4px text-13px"><el-icon><Collection /></el-icon> 知识库关联</span></template>
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
              <el-table-column label="操作" width="120" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="editKnowledge(row)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="removeKnowledge(row)">删除</el-button>
                </template>
              </el-table-column>
            </template>
          </SpTable>
        </div>
      </el-tab-pane>

      <!-- 对话记忆 Tab -->
      <el-tab-pane name="memory">
        <template #label><span class="inline-flex items-center gap-4px text-13px"><el-icon><ChatDotRound /></el-icon> 对话记忆</span></template>
        <div class="min-h-300px">
          <el-form label-width="120px">
            <el-form-item label="开启记忆">
              <el-switch v-model="agentDetail.memoryEnabled" :active-value="1" :inactive-value="0" active-text="开启" inactive-text="关闭" />
            </el-form-item>
            <el-form-item v-if="agentDetail.memoryEnabled === 1" label="记忆窗口">
              <el-input-number v-model="agentDetail.memoryWindow" :min="5" :max="50" :step="5" />
              <span class="ml-8px text-12px text-[var(--el-text-color-secondary)]">最近 N 轮对话</span>
            </el-form-item>
          </el-form>
          <div class="mt-12px flex justify-end">
            <el-button type="primary" :loading="savingMemory" @click="saveMemory">保存记忆设置</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>

  <!-- 关联模板子弹窗 -->
  <el-dialog v-model="promptDialogVisible" :title="promptFormIsEdit ? '编辑关联模板' : '添加关联模板'" width="420px" append-to-body>
    <el-form :model="promptForm" label-width="80px">
      <el-form-item label="模板">
        <el-select v-model="promptForm.templateId" placeholder="选择模板" style="width: 100%" :disabled="promptFormIsEdit">
          <el-option v-for="t in allTemplates" :key="t.id" :label="t.name" :value="t.id" />
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
    </el-form>
    <template #footer>
      <el-button @click="promptDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onPromptSubmit">确认</el-button>
    </template>
  </el-dialog>

  <!-- 关联技能子弹窗 -->
  <el-dialog v-model="skillDialogVisible" :title="skillFormIsEdit ? '编辑关联技能' : '添加关联技能'" width="420px" append-to-body>
    <el-form :model="skillForm" label-width="80px">
      <el-form-item label="技能">
        <el-select v-model="skillForm.skillId" placeholder="选择技能" style="width: 100%" :disabled="skillFormIsEdit">
          <el-option v-for="s in allSkills" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-radio-group v-model="skillForm.isPrimary">
          <el-radio :value="1">主技能</el-radio>
          <el-radio :value="0">辅助技能</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序号">
        <el-input-number v-model="skillForm.sortOrder" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="skillDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onSkillSubmit">确认</el-button>
    </template>
  </el-dialog>

  <!-- 关联知识库子弹窗 -->
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
    </el-form>
    <template #footer>
      <el-button @click="knowledgeDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onKnowledgeSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Connection, Collection, ChatDotRound } from '@element-plus/icons-vue'
import { AgentAPI, type Agent, type AgentPrompt, type AgentSkill, type AgentKnowledge } from '@/api/ai/agent'
import { PromptTemplateAPI, type PromptTemplate } from '@/api/ai/promptTemplate'
import { SkillAPI, type Skill } from '@/api/ai/skill'
import { AGENT_PROMPT_COLUMNS, AGENT_SKILL_COLUMNS, AGENT_KNOWLEDGE_COLUMNS } from '../utils/tableColumns'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  agentId: number
  agentName: string
}>()

const activeTab = ref('prompt')
const agentDetail = ref<Agent>({ name: '', code: '', systemPrompt: '' })

// ===== 关联数据 =====
const prompts = ref<AgentPrompt[]>([])
const skills = ref<AgentSkill[]>([])
const knowledgeList = ref<AgentKnowledge[]>([])

// ===== 全量选择数据 =====
const allTemplates = ref<PromptTemplate[]>([])
const allSkills = ref<Skill[]>([])
const allKnowledge = ref<any[]>([])

// ===== 表格列配置（使用 slot 模板） =====
const promptColumns = [...AGENT_PROMPT_COLUMNS]
const skillColumns = [...AGENT_SKILL_COLUMNS]
const knowledgeColumns = [...AGENT_KNOWLEDGE_COLUMNS]

// ===== 加载数据 =====
async function onOpened() {
  agentDetail.value = await AgentAPI.getById(props.agentId) || { name: '', code: '', systemPrompt: '' }
  await Promise.all([loadPrompts(), loadSkills(), loadKnowledge(), loadAllTemplates(), loadAllSkills()])
}

async function loadPrompts() {
  prompts.value = await AgentAPI.getPrompts(props.agentId) || []
}
async function loadSkills() {
  skills.value = await AgentAPI.getSkills(props.agentId) || []
}
async function loadKnowledge() {
  knowledgeList.value = await AgentAPI.getKnowledgeList(props.agentId) || []
}
async function loadAllTemplates() {
  allTemplates.value = await PromptTemplateAPI.list() || []
}
async function loadAllSkills() {
  allSkills.value = await SkillAPI.list() || []
}

// ===== 保存系统提示词 =====
const savingPrompt = ref(false)
async function saveSystemPrompt() {
  savingPrompt.value = true
  try {
    await AgentAPI.update(props.agentId, { systemPrompt: agentDetail.value.systemPrompt })
    ElMessage.success('保存成功')
  } finally { savingPrompt.value = false }
}

// ===== 保存记忆设置 =====
const savingMemory = ref(false)
async function saveMemory() {
  savingMemory.value = true
  try {
    await AgentAPI.update(props.agentId, {
      memoryEnabled: agentDetail.value.memoryEnabled,
      memoryWindow: agentDetail.value.memoryWindow,
    })
    ElMessage.success('保存成功')
  } finally { savingMemory.value = false }
}

// ===== 关联模板管理 =====
const promptDialogVisible = ref(false)
const promptFormIsEdit = ref(false)
const promptFormIdx = ref(-1)
const promptForm = ref<Partial<AgentPrompt>>({ templateId: undefined, isPrimary: 0, sortOrder: 0 })

function openAddPrompt() {
  promptFormIsEdit.value = false
  promptFormIdx.value = -1
  promptForm.value = { templateId: undefined, isPrimary: 0, sortOrder: 0 }
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

// ===== 关联技能管理 =====
const skillDialogVisible = ref(false)
const skillFormIsEdit = ref(false)
const skillForm = ref<Partial<AgentSkill>>({ skillId: undefined, isPrimary: 0, sortOrder: 0 })

function openAddSkill() {
  skillFormIsEdit.value = false
  skillForm.value = { skillId: undefined, isPrimary: 0, sortOrder: 0 }
  skillDialogVisible.value = true
}

function editSkill(row: AgentSkill) {
  skillFormIsEdit.value = true
  skillForm.value = { ...row }
  skillDialogVisible.value = true
}

async function onSkillSubmit() {
  if (!skillForm.value.skillId) { ElMessage.warning('请选择技能'); return }
  if (skillFormIsEdit.value && skillForm.value.id) {
    await AgentAPI.updateSkill(props.agentId, skillForm.value.id, skillForm.value)
  } else {
    await AgentAPI.addSkill(props.agentId, skillForm.value)
  }
  ElMessage.success('操作成功')
  skillDialogVisible.value = false
  await loadSkills()
}

async function removeSkill(row: AgentSkill) {
  await ElMessageBox.confirm('确认删除该关联技能？', '提示', { type: 'warning' })
  await AgentAPI.deleteSkill(props.agentId, row.id!)
  ElMessage.success('删除成功')
  await loadSkills()
}

async function toggleSkillEnabled(row: AgentSkill, val: number) {
  await AgentAPI.updateSkill(props.agentId, row.id!, { enabled: val })
  row.enabled = val
}

// ===== 关联知识库管理 =====
const knowledgeDialogVisible = ref(false)
const knowledgeFormIsEdit = ref(false)
const knowledgeForm = ref<Partial<AgentKnowledge>>({ knowledgeId: undefined, retrievalCount: 5, sortOrder: 0 })

function openAddKnowledge() {
  knowledgeFormIsEdit.value = false
  knowledgeForm.value = { knowledgeId: undefined, retrievalCount: 5, sortOrder: 0 }
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
</script>
