<!--
  场景配置 — 关联 Agent Tab
-->
<template>
  <div class="config-tab-content">
    <div class="config-tab-header">
      <span class="config-tab-title">场景关联的 AI 助手</span>
      <el-button type="primary" size="small" icon="plus" @click="openAdd">添加助手</el-button>
    </div>
    <template v-if="list.length">
      <SpTable :data="list" :columns="columns" :show-index="true" size="small">
        <template #isDefault>
          <el-table-column label="类型" prop="isDefault" width="90" align="center" slot-name="isDefault">
            <template #default="{ row }">
              <el-tag :type="row.isDefault === 1 ? 'danger' : 'info'" size="small" effect="light">
                {{ row.isDefault === 1 ? '默认' : '普通' }}
              </el-tag>
            </template>
          </el-table-column>
        </template>
      </SpTable>
    </template>
    <div v-else class="config-tab-empty">
      <el-empty description="暂未关联助手" :image-size="80" />
      <el-button type="primary" link @click="openAdd">立即添加</el-button>
    </div>

    <!-- 子弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑关联agent' : '添加关联agent'" width="420px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="agent">
          <el-select v-model="form.agentId" placeholder="选择agent" style="width: 100%" :disabled="isEdit">
            <el-option v-for="a in allAgents" :key="a.id" :label="a.name" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.isDefault">
            <el-radio :value="1">默认agent</el-radio>
            <el-radio :value="0">普通agent</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { SceneAPI, type SceneAgent } from '@/api/ai/scene'
import { AgentAPI, type Agent } from '@/api/ai/agent'
import { createSceneAgentColumns } from '../../utils/tableColumns'

const props = defineProps<{
  sceneId: number
}>()

const list = ref<SceneAgent[]>([])
const allAgents = ref<Agent[]>([])

// ===== 操作 =====
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Partial<SceneAgent>>({ agentId: undefined, isDefault: 0, sortOrder: 0 })

const columns = createSceneAgentColumns({
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
  list.value = await SceneAPI.getAgents(props.sceneId) || []
}

async function loadAllAgents() {
  allAgents.value = await AgentAPI.list() || []
}

function openAdd() {
  isEdit.value = false
  form.value = { agentId: undefined, isDefault: 0, sortOrder: 0 }
  dialogVisible.value = true
}

async function onSubmit() {
  if (!form.value.agentId) { ElMessage.warning('请选择agent'); return }
  if (isEdit.value && form.value.id) {
    await SceneAPI.updateAgent(props.sceneId, form.value.id, form.value)
  } else {
    await SceneAPI.addAgent(props.sceneId, form.value)
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  await load()
}

async function remove(row: SceneAgent) {
  await ElMessageBox.confirm('确认删除该关联agent？', '提示', { type: 'warning' })
  await SceneAPI.deleteAgent(props.sceneId, row.id!)
  ElMessage.success('删除成功')
  await load()
}

onMounted(() => {
  load()
  loadAllAgents()
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
