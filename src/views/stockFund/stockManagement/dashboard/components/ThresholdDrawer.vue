<template>
  <el-dialog v-model="visible" :title="`阈值配置 - ${stockName} (${stockCode})`" width="550px" @open="loadThresholds" @closed="onClosed">
    <div class="dialog-body">
      <div class="section">
        <div class="section-title">
          通知方式
          <el-button v-if="!isEditing" v-permission="'stockFund:stock:dashboardView:setThresholds'" type="primary" link icon="edit" size="small" style="margin-left:auto" @click="isEditing = true">编辑</el-button>
          <el-button v-else type="warning" link icon="refresh-left" size="small" style="margin-left:auto" @click="cancelEdit">取消编辑</el-button>
        </div>
        <el-checkbox-group v-model="notifyChannels" :disabled="!isEditing">
          <el-checkbox label="SMS" value="SMS">手机短信 ({{ userPhone }})</el-checkbox>
          <el-checkbox label="EMAIL" value="EMAIL">邮件 ({{ userEmail }})</el-checkbox>
        </el-checkbox-group>
      </div>

      <el-divider />

      <div class="section">
        <div class="section-title">
          阈值设置
          <el-button v-if="isEditing" type="primary" link icon="plus" size="small" style="margin-left:8px" @click="addRow">新增一行</el-button>
        </div>
        <div class="threshold-rows">
          <div v-for="(row, i) in thresholdRows" :key="i" class="threshold-row" :class="{ 'is-detail': !isEditing }">
            <span class="row-index">{{ i + 1 }}</span>
            <el-select v-model="row.type" style="width:120px" size="small" :disabled="!isEditing">
              <el-option label="向上突破" value="CROSS_UP" />
              <el-option label="向下跌破" value="CROSS_DOWN" />
            </el-select>
            <el-input-number v-model="row.rate" :min="0.1" :max="99.9" :step="0.5" :precision="1" style="width:110px" size="small" :disabled="!isEditing" />
            <span class="rate-suffix">%</span>
            <el-button v-if="isEditing" :icon="Delete" circle size="small" type="danger" plain :disabled="thresholdRows.length <= 1" @click="removeRow(i)" />
          </div>
        </div>
      </div>

      <div class="hint">为避免频繁打扰，同一阈值触发后 24 小时内不会重复发送通知。</div>
    </div>
    <template #footer>
      <el-button @click="visible = false">{{ isEditing ? '取消' : '关闭' }}</el-button>
      <el-button v-if="isEditing" type="primary" :loading="saving" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { UserStockMonitorAPI } from '@/api/stockFund/stock/userStockMonitor.ts'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  monitorId: number
  stockCode: string
  stockName: string
}>()

const emit = defineEmits<{ refresh: [] }>()

const isEditing = ref(false)
const savedNotifyChannels = ref<string[]>([])
const savedThresholdRows = ref<ThresholdRow[]>([])
const notifyChannels = ref<string[]>(['SMS'])
const userPhone = computed(() => userStore.userInfo.phone || '-')
const userEmail = computed(() => userStore.userInfo.email || '-')

interface ThresholdRow { type: 'CROSS_UP' | 'CROSS_DOWN'; rate: number }
const thresholdRows = ref<ThresholdRow[]>([])
const saving = ref(false)

/** 弹框打开时加载已有阈值回显，默认进入详情状态 */
async function loadThresholds() {
  isEditing.value = false
  try {
    const list = await UserStockMonitorAPI.thresholdList(+props.monitorId)
    
    if (list?.length) {
      thresholdRows.value = list.map(t => ({
        type: t.triggerType,
        rate: t.thresholdRate > 1 ? +t.thresholdRate.toFixed(1) : +(t.thresholdRate * 100).toFixed(1),
      }))
    } else {
      thresholdRows.value = [{ type: 'CROSS_UP', rate: 5 }]
    }
  } catch {
    thresholdRows.value = [{ type: 'CROSS_UP', rate: 5 }]
  }
  savedNotifyChannels.value = [...notifyChannels.value]
  savedThresholdRows.value = JSON.parse(JSON.stringify(thresholdRows.value))
}

/** 取消编辑：恢复到进入编辑前的状态 */
function cancelEdit() {
  notifyChannels.value = [...savedNotifyChannels.value]
  thresholdRows.value = JSON.parse(JSON.stringify(savedThresholdRows.value))
  isEditing.value = false
}

function addRow() {
  thresholdRows.value.push({ type: 'CROSS_UP', rate: 5 })
}

function removeRow(i: number) {
  thresholdRows.value.splice(i, 1)
}

/** 保存：全量替换已有阈值，保存后回到详情状态 */
async function onSave() {
  saving.value = true
  try {
    await UserStockMonitorAPI.saveThreshold(+props.monitorId, thresholdRows.value.map(r => ({
      type: r.type,
      rate: r.rate / 100,
    })))
    ElMessage.success(`已保存 ${thresholdRows.value.length} 条阈值`)
    savedNotifyChannels.value = [...notifyChannels.value]
    savedThresholdRows.value = JSON.parse(JSON.stringify(thresholdRows.value))
    isEditing.value = false
    emit('refresh')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function onClosed() {
  thresholdRows.value = []
  isEditing.value = false
}
</script>

<style lang="scss" scoped>
.dialog-body { padding: 0 8px; }
.section { margin-bottom: 8px; }
.section-title { font-size: 15px; font-weight: 600; color: #303133; margin-bottom: 12px; display: flex; align-items: center; }
.threshold-rows { display: flex; flex-direction: column; gap: 10px; }
.threshold-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s;
  &:hover { border-color: #c0c4cc; background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
  &.is-detail { background: #fff; border-color: #e8eaed; cursor: default; &:hover { box-shadow: none; } }
}
.row-index {
  width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: #fff; background: #409eff; border-radius: 50%;
}
.rate-suffix { font-size: 14px; color: #606266; font-weight: 500; margin-right: auto; }
.hint { margin-top: 16px; font-size: 12px; color: #909399; line-height: 1.6; padding: 8px 12px; background: #fef6ec; border-radius: 6px; border-left: 3px solid #e6a23c; }
</style>
