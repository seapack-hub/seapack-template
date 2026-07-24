<!--
  场景配置 — 运行配置 Tab
-->
<template>
  <div class="config-tab-content">
    <div class="config-tab-header">
      <span class="config-tab-title">场景级 Agent 运行参数覆盖</span>
      <el-button type="primary" size="small" icon="plus" @click="openAdd">添加配置</el-button>
    </div>
    <template v-if="list.length">
      <SpTable :data="list" :columns="columns" :show-index="true" size="small">
        <template #model>
          <el-table-column label="模型" prop="model" width="110" slot-name="model">
            <template #default="{ row }">
              <span :class="row.model ? 'text-gray-900' : 'text-gray-400'">
                {{ row.model || 'Agent 默认' }}
              </span>
            </template>
          </el-table-column>
        </template>
        <template #temperature>
          <el-table-column label="温度" prop="temperature" width="70" align="center" slot-name="temperature">
            <template #default="{ row }">
              <span :class="row.temperature != null ? 'text-gray-900' : 'text-gray-400'">
                {{ row.temperature ?? '-' }}
              </span>
            </template>
          </el-table-column>
        </template>
      </SpTable>
    </template>
    <div v-else class="config-tab-empty">
      <el-empty description="暂未配置运行参数" :image-size="80" />
      <el-button type="primary" link @click="openAdd">立即添加</el-button>
    </div>

    <!-- 弹窗 -->
    <AgentConfigFormDialog
      v-model:visible="dialogVisible"
      v-model:is-edit="isEdit"
      v-model:form="form"
      :linked-agents="linkedAgents"
      @confirm="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { SceneAPI, type SceneAgent, type SceneAgentConfig } from '@/api/ai/scene'
import { createSceneAgentConfigColumns } from '../../utils/tableColumns'
import AgentConfigFormDialog from '../AgentConfigFormDialog.vue'

const props = defineProps<{
  sceneId: number
  linkedAgents: SceneAgent[]
}>()

const list = ref<SceneAgentConfig[]>([])

// ===== 操作 =====
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Partial<SceneAgentConfig>>({ agentId: undefined, outputFormat: 'markdown', contextLimit: 8000 })

const columns = createSceneAgentConfigColumns({
  onEdit(row) {
    isEdit.value = true
    form.value = { ...row }
    dialogVisible.value = true
  },
  onDelete(row) {
    remove(row)
  },
})

async function load() {
  list.value = await SceneAPI.getAgentConfigs(props.sceneId) || []
}

function openAdd() {
  isEdit.value = false
  form.value = { agentId: undefined, model: null, temperature: null, maxTokens: null, systemPrompt: null, outputFormat: 'markdown', contextLimit: 8000 }
  dialogVisible.value = true
}

async function onSubmit(data: Partial<SceneAgentConfig>) {
  if (isEdit.value && data.id) {
    await SceneAPI.updateAgentConfig(props.sceneId, data.id, data)
  } else {
    await SceneAPI.addAgentConfig(props.sceneId, data)
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  await load()
}

async function remove(row: SceneAgentConfig) {
  await ElMessageBox.confirm('确认删除该运行配置？', '提示', { type: 'warning' })
  await SceneAPI.deleteAgentConfig(props.sceneId, row.id!)
  ElMessage.success('删除成功')
  await load()
}

onMounted(() => {
  load()
})

defineExpose({ load })
</script>

<style lang="scss" scoped>
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
