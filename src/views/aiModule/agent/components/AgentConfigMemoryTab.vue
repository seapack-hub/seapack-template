<template>
  <div class="min-h-300px">
    <el-form label-width="100px">
      <el-row>
        <el-col :span="10">
          <el-form-item label="开启记忆">
            <el-switch v-model="localMemoryEnabled" :active-value="1" :inactive-value="0" active-text="开启" inactive-text="关闭" />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item v-if="localMemoryEnabled === 1" label="记忆窗口">
            <el-input-number v-model="localMemoryWindow" :min="5" :max="50" :step="5" />
            <span class="ml-8px text-12px text-[var(--el-text-color-secondary)]">最近 N 轮对话</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="mt-12px flex justify-end">
      <el-button type="primary" :loading="savingMemory" @click="saveMemory">保存记忆设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { AgentAPI } from '@/api/ai/agent'

const props = defineProps<{
  agentId: number
  memoryEnabled: number
  memoryWindow: number
}>()

const emit = defineEmits<{
  'update:memoryEnabled': [v: number]
  'update:memoryWindow': [v: number]
}>()

const localMemoryEnabled = ref(props.memoryEnabled)
const localMemoryWindow = ref(props.memoryWindow)

watch(() => props.memoryEnabled, (v) => { localMemoryEnabled.value = v })
watch(() => props.memoryWindow, (v) => { localMemoryWindow.value = v })
watch(localMemoryEnabled, (v) => { emit('update:memoryEnabled', v) })
watch(localMemoryWindow, (v) => { emit('update:memoryWindow', v) })

const savingMemory = ref(false)
async function saveMemory() {
  savingMemory.value = true
  try {
    await AgentAPI.update(props.agentId, {
      memoryEnabled: localMemoryEnabled.value,
      memoryWindow: localMemoryWindow.value,
    })
    ElMessage.success('保存成功')
  } finally { savingMemory.value = false }
}
</script>
