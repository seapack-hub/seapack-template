<template>
  <div class="app-container h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col overflow-hidden" shadow="never">
      <!-- 顶部信息 -->
      <div class="flex items-center justify-between mb-16px">
        <div class="flex items-center gap-10px">
          <el-button text @click="router.back()"><el-icon><ArrowLeft /></el-icon></el-button>
          <span class="text-16px font-medium">{{ instanceDetail.workflowName || '实例详情' }}</span>
          <el-tag :type="statusTagType(instanceDetail.status)" size="small">{{ statusLabel(instanceDetail.status) }}</el-tag>
        </div>
        <div class="flex items-center gap-8px">
          <el-button v-if="instanceDetail.status === 1" type="warning" @click="handlePause">暂停</el-button>
          <el-button v-if="instanceDetail.status === 4" type="success" @click="handleResume">恢复</el-button>
          <el-button v-if="instanceDetail.status === 0 || instanceDetail.status === 1" type="danger" @click="handleCancel">取消</el-button>
        </div>
      </div>

      <!-- 基本信息 -->
      <el-descriptions :column="4" border size="small" class="mb-16px">
        <el-descriptions-item label="工作流">{{ instanceDetail.workflowName }}</el-descriptions-item>
        <el-descriptions-item label="版本">v{{ instanceDetail.workflowVersion || 1 }}</el-descriptions-item>
        <el-descriptions-item label="触发方式">{{ triggerLabel(instanceDetail.triggerType) }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ formatDuration(instanceDetail.durationMs) }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ instanceDetail.startedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ instanceDetail.finishedAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="进度">{{ instanceDetail.completedCount || 0 }}/{{ instanceDetail.totalNodes || 0 }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ instanceDetail.createdByName || '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 错误信息 -->
      <el-alert v-if="instanceDetail.errorMessage" :title="instanceDetail.errorMessage" type="error" show-icon class="mb-16px" />

      <!-- 节点执行时间线 -->
      <div class="flex-1 overflow-y-auto">
        <div class="text-14px font-medium mb-12px">执行时间线</div>
        <el-timeline v-if="nodeLogs.length > 0">
          <el-timeline-item
            v-for="log in nodeLogs"
            :key="log.id"
            :type="nodeStatusType(log.status)"
            :timestamp="log.startedAt"
            placement="top"
          >
            <el-card shadow="never" class="timeline-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-8px">
                  <span class="font-medium">{{ log.nodeName || log.nodeId }}</span>
                  <el-tag size="small" :type="nodeStatusType(log.status)">{{ nodeStatusLabel(log.status) }}</el-tag>
                  <el-tag v-if="log.executorType" size="small" type="info">{{ log.executorType }}</el-tag>
                </div>
                <span class="text-12px text-gray-400">{{ formatDuration(log.durationMs) }}</span>
              </div>
              <div v-if="log.errorMessage" class="mt-8px text-12px text-red-500">{{ log.errorMessage }}</div>
              <div v-if="log.outputData" class="mt-8px">
                <el-collapse>
                  <el-collapse-item title="输出数据">
                    <pre class="text-12px bg-gray-50 p-8px rounded">{{ JSON.stringify(log.outputData, null, 2) }}</pre>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无执行日志" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { WorkflowInstanceAPI } from '@/api/workflow/instance'
import type { WorkflowInstance, WorkflowNodeLog } from '@/api/workflow/types'

const route = useRoute()
const router = useRouter()
const instanceId = Number(route.params.id)

const instanceDetail = ref<WorkflowInstance>({} as WorkflowInstance)
const nodeLogs = ref<WorkflowNodeLog[]>([])

const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待执行', type: 'info' },
  1: { label: '运行中', type: 'warning' },
  2: { label: '已完成', type: 'success' },
  3: { label: '失败', type: 'danger' },
  4: { label: '暂停', type: 'warning' },
  5: { label: '已取消', type: 'info' },
}

const nodeStatusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待执行', type: 'info' },
  1: { label: '执行中', type: 'warning' },
  2: { label: '已完成', type: 'success' },
  3: { label: '失败', type: 'danger' },
  4: { label: '跳过', type: 'info' },
  5: { label: '等待人工', type: 'warning' },
  6: { label: '超时', type: 'danger' },
  7: { label: '已取消', type: 'info' },
}

const triggerMap: Record<string, string> = { manual: '手动', api: 'API', schedule: '定时', event: '事件' }

const statusLabel = (s?: number) => statusMap[s ?? 0]?.label || '未知'
const statusTagType = (s?: number) => statusMap[s ?? 0]?.type || 'info'
const nodeStatusLabel = (s?: number) => nodeStatusMap[s ?? 0]?.label || '未知'
const nodeStatusType = (s?: number) => nodeStatusMap[s ?? 0]?.type || 'info'
const triggerLabel = (t?: string) => triggerMap[t || 'manual'] || t

const formatDuration = (ms?: number) => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}min`
}

const loadData = async () => {
  const [detail, logs] = await Promise.all([
    WorkflowInstanceAPI.getById(instanceId),
    WorkflowInstanceAPI.getNodeLogs(instanceId),
  ])
  instanceDetail.value = detail
  nodeLogs.value = logs || []
}

const handlePause = async () => {
  await ElMessageBox.confirm('确定暂停该实例吗？', '提示', { type: 'warning' })
  await WorkflowInstanceAPI.pause(instanceId)
  ElMessage.success('已暂停')
  loadData()
}

const handleResume = async () => {
  await WorkflowInstanceAPI.resume(instanceId)
  ElMessage.success('已恢复')
  loadData()
}

const handleCancel = async () => {
  await ElMessageBox.confirm('确定取消该实例吗？', '提示', { type: 'warning' })
  await WorkflowInstanceAPI.cancel(instanceId)
  ElMessage.success('已取消')
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.timeline-card {
  :deep(.el-card__body) {
    padding: 10px;
  }
}
</style>
