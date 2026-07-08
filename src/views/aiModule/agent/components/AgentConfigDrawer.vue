<template>
  <el-drawer
    v-model="visible"
    :title="`Agent 配置 — ${agentName}`"
    size="700px"
    @opened="onOpened"
  >
    <el-tabs v-model="activeTab" class="px-16px">
      <el-tab-pane name="prompt">
        <template #label>
          <span class="inline-flex items-center gap-4px text-13px">
            <el-icon><EditPen /></el-icon> 系统提示词
          </span>
        </template>
        <AgentConfigPromptTab
          ref="promptTabRef"
          :agent-id="agentId"
          :system-prompt="agentDetail.systemPrompt ?? ''"
          :all-templates="allTemplates"
          @update:system-prompt="agentDetail.systemPrompt = $event"
        />
      </el-tab-pane>

      <el-tab-pane name="skill">
        <template #label>
          <span class="inline-flex items-center gap-4px text-13px">
            <el-icon><Connection /></el-icon> 技能关联
          </span>
        </template>
        <AgentConfigSkillTab
          ref="skillTabRef"
          :agent-id="agentId"
          :all-skills="allSkills"
        />
      </el-tab-pane>

      <el-tab-pane name="knowledge">
        <template #label>
          <span class="inline-flex items-center gap-4px text-13px">
            <el-icon><Collection /></el-icon> 知识库关联
          </span>
        </template>
        <AgentConfigKnowledgeTab
          ref="knowledgeTabRef"
          :agent-id="agentId"
          :all-knowledge="allKnowledge"
        />
      </el-tab-pane>

      <el-tab-pane name="memory">
        <template #label>
          <span class="inline-flex items-center gap-4px text-13px">
            <el-icon><ChatDotRound /></el-icon> 对话记忆
          </span>
        </template>
        <AgentConfigMemoryTab
          :agent-id="agentId"
          :memory-enabled="agentDetail.memoryEnabled ?? 0"
          :memory-window="agentDetail.memoryWindow ?? 10"
          @update:memory-enabled="agentDetail.memoryEnabled = $event"
          @update:memory-window="agentDetail.memoryWindow = $event"
        />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EditPen, Connection, Collection, ChatDotRound } from '@element-plus/icons-vue'
import { AgentAPI, type Agent } from '@/api/ai/agent'
import { PromptTemplateAPI, type PromptTemplate } from '@/api/ai/promptTemplate'
import { SkillAPI, type Skill } from '@/api/ai/skill'
import AgentConfigPromptTab from './AgentConfigPromptTab.vue'
import AgentConfigSkillTab from './AgentConfigSkillTab.vue'
import AgentConfigKnowledgeTab from './AgentConfigKnowledgeTab.vue'
import AgentConfigMemoryTab from './AgentConfigMemoryTab.vue'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  agentId: number
  agentName: string
}>()

const activeTab = ref('prompt')
const agentDetail = ref<Agent>({ name: '', code: '', systemPrompt: '' })

const allTemplates = ref<PromptTemplate[]>([])
const allSkills = ref<Skill[]>([])
const allKnowledge = ref<any[]>([])

const promptTabRef = ref<InstanceType<typeof AgentConfigPromptTab>>()
const skillTabRef = ref<InstanceType<typeof AgentConfigSkillTab>>()
const knowledgeTabRef = ref<InstanceType<typeof AgentConfigKnowledgeTab>>()

async function onOpened() {
  agentDetail.value = await AgentAPI.getById(props.agentId) || { name: '', code: '', systemPrompt: '' }
  await Promise.all([
    loadAllTemplates(),
    loadAllSkills(),
    promptTabRef.value?.loadPrompts?.(),
    skillTabRef.value?.loadSkills?.(),
    knowledgeTabRef.value?.loadKnowledge?.(),
  ])
}

async function loadAllTemplates() {
  allTemplates.value = await PromptTemplateAPI.list() || []
}
async function loadAllSkills() {
  allSkills.value = await SkillAPI.list() || []
}
</script>
