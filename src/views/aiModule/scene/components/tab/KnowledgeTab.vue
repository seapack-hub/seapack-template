<!--
  场景配置 — 关联知识库 Tab
-->
<template>
  <div class="config-tab-content">
    <div class="config-tab-header">
      <span class="config-tab-title">场景关联的知识库</span>
      <el-button type="primary" size="small" icon="plus" @click="openAdd">添加知识库</el-button>
    </div>
    <template v-if="list.length">
      <SpTable :data="list" :columns="columns" :show-index="true" size="small">
        <template #enabled>
          <el-table-column label="状态" prop="enabled" width="70" align="center" slot-name="enabled">
            <template #default="{ row }">
              <el-switch :model-value="row.enabled" :active-value="1" :inactive-value="0" size="small" @change="(val: number) => toggleEnabled(row, val)" />
            </template>
          </el-table-column>
        </template>
      </SpTable>
    </template>
    <div v-else class="config-tab-empty">
      <el-empty description="暂未关联知识库" :image-size="80" />
      <el-button type="primary" link @click="openAdd">立即添加</el-button>
    </div>

    <!-- 子弹窗 -->
    <el-dialog v-model="dialogVisible" title="添加关联知识库" width="420px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="知识库">
          <el-select v-model="form.knowledgeId" placeholder="选择知识库" style="width: 100%">
            <el-option v-for="k in allKnowledge" :key="k.id" :label="k.name" :value="k.id" />
          </el-select>
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
import { SceneAPI, type SceneKnowledge } from '@/api/ai/scene'
import { createSceneKnowledgeColumns } from '../../utils/tableColumns'

const props = defineProps<{
  sceneId: number
}>()

const list = ref<SceneKnowledge[]>([])
const allKnowledge = ref<any[]>([])

const columns = createSceneKnowledgeColumns({
  onDelete(row) {
    remove(row)
  },
})

async function load() {
  list.value = await SceneAPI.getKnowledgeList(props.sceneId) || []
}

// ===== 管理 =====
const dialogVisible = ref(false)
const form = ref<Partial<SceneKnowledge>>({ knowledgeId: undefined })

function openAdd() {
  form.value = { knowledgeId: undefined }
  dialogVisible.value = true
}

async function onSubmit() {
  if (!form.value.knowledgeId) { ElMessage.warning('请选择知识库'); return }
  await SceneAPI.addKnowledge(props.sceneId, form.value)
  ElMessage.success('操作成功')
  dialogVisible.value = false
  await load()
}

async function remove(row: SceneKnowledge) {
  await ElMessageBox.confirm('确认删除该关联知识库？', '提示', { type: 'warning' })
  await SceneAPI.deleteKnowledge(props.sceneId, row.id!)
  ElMessage.success('删除成功')
  await load()
}

async function toggleEnabled(row: SceneKnowledge, val: number) {
  await SceneAPI.updateKnowledge(props.sceneId, row.id!, { enabled: val })
  row.enabled = val
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
