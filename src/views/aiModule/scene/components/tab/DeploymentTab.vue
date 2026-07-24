<!--
  场景配置 — 部署位置 Tab
-->
<template>
  <div class="config-tab-content">
    <div class="config-tab-header">
      <span class="config-tab-title">场景在前端模块中的部署位置</span>
      <el-button type="primary" size="small" icon="plus" @click="openAdd">添加部署</el-button>
    </div>
    <template v-if="list.length">
      <SpTable :data="list" :columns="columns" :show-index="true" size="small">
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
              <el-switch :model-value="row.status" :active-value="1" :inactive-value="0" size="small" @change="(val) => toggleStatus(row as SceneDeployment, val as any)" />
            </template>
          </el-table-column>
        </template>
      </SpTable>
    </template>
    <div v-else class="config-tab-empty">
      <el-empty description="暂未配置部署位置" :image-size="80" />
      <el-button type="primary" link @click="openAdd">立即添加</el-button>
    </div>

    <!-- 弹窗 -->
    <DeploymentFormDialog
      v-model:visible="dialogVisible"
      v-model:is-edit="isEdit"
      v-model:form="form"
      @confirm="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { SceneAPI, type SceneDeployment } from '@/api/ai/scene'
import { createSceneDeploymentColumns } from '../../utils/tableColumns'
import DeploymentFormDialog from '../DeploymentFormDialog.vue'

const props = defineProps<{
  sceneId: number
}>()

const list = ref<SceneDeployment[]>([])

// ===== 操作 =====
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Partial<SceneDeployment>>({ moduleKey: '', positionKey: '', config: {}, isDefault: 0, status: 1, sortOrder: 0 })

const columns = createSceneDeploymentColumns({
  onEdit(row) {
    isEdit.value = true
    form.value = { ...row, config: { ...(row.config || {}) } }
    dialogVisible.value = true
  },
  onDelete(row) {
    remove(row)
  },
})

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

async function load() {
  const res = (await SceneAPI.getDeployments(props.sceneId)) || []
  list.value = res.map(d => ({ ...d, config: parseConfig(d.config) }))
}

function openAdd() {
  isEdit.value = false
  form.value = { moduleKey: '', positionKey: '', config: {}, isDefault: 0, status: 1, sortOrder: 0 }
  dialogVisible.value = true
}

async function onSubmit(data: Partial<SceneDeployment>) {
  const payload = { ...data, config: stringifyConfig(data.config) }
  if (isEdit.value && data.id) {
    await SceneAPI.updateDeployment(props.sceneId, data.id, payload as any)
  } else {
    await SceneAPI.addDeployment(props.sceneId, payload as any)
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  await load()
}

async function remove(row: SceneDeployment) {
  await ElMessageBox.confirm('确认删除该部署？', '提示', { type: 'warning' })
  await SceneAPI.deleteDeployment(props.sceneId, row.id!)
  ElMessage.success('删除成功')
  await load()
}

async function toggleStatus(row: SceneDeployment, val: number) {
  await SceneAPI.toggleDeploymentStatus(props.sceneId, row.id!, val)
  row.status = val
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
