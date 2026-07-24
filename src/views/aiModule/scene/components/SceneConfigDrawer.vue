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
        <span class="drawer-overview__value">{{ tabStats.agents }}</span>
        <span class="drawer-overview__label">关联助手</span>
      </div>
      <div class="drawer-overview__item">
        <span class="drawer-overview__value">{{ tabStats.knowledge }}</span>
        <span class="drawer-overview__label">关联知识库</span>
      </div>
      <div class="drawer-overview__item">
        <span class="drawer-overview__value">{{ tabStats.deployments }}</span>
        <span class="drawer-overview__label">部署位置</span>
      </div>
      <div class="drawer-overview__item">
        <span class="drawer-overview__value">{{ tabStats.agentConfigs }}</span>
        <span class="drawer-overview__label">运行配置</span>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="config-tabs" stretch>
      <!-- Tab 1: 关联 Agent -->
      <el-tab-pane name="agent">
        <template #label><span class="config-tab-label"><el-icon><User /></el-icon> 关联助手</span></template>
        <AgentTab ref="agentTabRef" :scene-id="sceneId" @update="tabStats.agents = $event" />
      </el-tab-pane>

      <!-- Tab 2: 关联知识库 -->
      <el-tab-pane name="knowledge">
        <template #label><span class="config-tab-label"><el-icon><Collection /></el-icon> 知识库</span></template>
        <KnowledgeTab ref="knowledgeTabRef" :scene-id="sceneId" @update="tabStats.knowledge = $event" />
      </el-tab-pane>

      <!-- Tab 3: 部署位置 -->
      <el-tab-pane name="deployment">
        <template #label><span class="config-tab-label"><el-icon><Position /></el-icon> 部署位置</span></template>
        <DeploymentTab ref="deploymentTabRef" :scene-id="sceneId" @update="tabStats.deployments = $event" />
      </el-tab-pane>

      <!-- Tab 4: 运行配置 -->
      <el-tab-pane name="agentConfig">
        <template #label><span class="config-tab-label"><el-icon><Setting /></el-icon> 运行配置</span></template>
        <AgentConfigTab ref="agentConfigTabRef" :scene-id="sceneId" :linked-agents="linkedAgents" @update="tabStats.agentConfigs = $event" />
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
import { User, Collection, Position, Setting } from '@element-plus/icons-vue'
import { SceneAPI, type SceneAgent } from '@/api/ai/scene'
import AgentTab from './tab/AgentTab.vue'
import KnowledgeTab from './tab/KnowledgeTab.vue'
import DeploymentTab from './tab/DeploymentTab.vue'
import AgentConfigTab from './tab/AgentConfigTab.vue'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  sceneId: number
  sceneName: string
}>()

const activeTab = ref('agent')

const tabStats = reactive({
  agents: 0,
  knowledge: 0,
  deployments: 0,
  agentConfigs: 0,
})

const linkedAgents = ref<SceneAgent[]>([])

// Tab refs
const agentTabRef = ref<InstanceType<typeof AgentTab>>()
const knowledgeTabRef = ref<InstanceType<typeof KnowledgeTab>>()
const deploymentTabRef = ref<InstanceType<typeof DeploymentTab>>()
const agentConfigTabRef = ref<InstanceType<typeof AgentConfigTab>>()

async function onOpened() {
  // 加载关联 Agent 列表供运行配置 Tab 使用
  linkedAgents.value = await SceneAPI.getAgents(props.sceneId) || []
  tabStats.agents = linkedAgents.value.length

  // 刷新各 Tab 数据
  agentTabRef.value?.load()
  knowledgeTabRef.value?.load()
  deploymentTabRef.value?.load()
  agentConfigTabRef.value?.load()
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
</style>
