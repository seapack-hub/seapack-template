<!--
  编排表单弹窗 — 新建/编辑编排
-->
<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑编排' : '新建编排'" width="600px" append-to-body>
    <el-form :model="form" label-width="100px">
      <el-form-item label="编排名称">
        <el-input v-model="form.name" placeholder="如：写作+翻译流程" maxlength="128" />
      </el-form-item>
      <el-form-item label="编码">
        <el-input v-model="form.code" placeholder="如：write_translate" maxlength="64" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="执行策略">
        <el-select v-model="form.strategy" class="w-full">
          <el-option v-for="s in STRATEGY_OPTIONS" :key="s.value" :label="s.label" :value="s.value">
            <div class="flex flex-col">
              <span>{{ s.label }}</span>
              <span class="text-11px c-[var(--el-text-color-secondary)]">{{ s.description }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <!-- Supervisor 模式：选择总控 Agent -->
      <el-form-item v-if="form.strategy === 'supervisor'" label="Supervisor Agent">
        <el-select v-model="form.supervisorAgentId" class="w-full" placeholder="选择总控 Agent" clearable>
          <el-option v-for="a in agentList" :key="a.id" :label="a.name" :value="a.id" />
        </el-select>
        <div class="text-11px c-[var(--el-text-color-secondary)] mt-4px">
          总控 Agent 负责理解用户意图并动态调度其他 Agent
        </div>
      </el-form-item>
      <!-- 最大协作轮次 -->
      <el-form-item v-if="form.strategy === 'supervisor' || form.strategy === 'crew'" label="最大轮次">
        <el-input-number v-model="form.maxRounds" :min="1" :max="20" class="w-full" />
        <div class="text-11px c-[var(--el-text-color-secondary)] mt-4px">
          Agent 间协作的最大轮次，防止死循环（默认 5）
        </div>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" maxlength="512" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序号">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Orchestration } from '@/api/ai/orchestration'
import { STRATEGY_OPTIONS } from '@/api/ai/types/orchestration'
import { AgentAPI } from '@/api/ai/agent'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { required: true })
const form = defineModel<Partial<Orchestration>>('form', { required: true })

const emit = defineEmits<{
  (e: 'submit'): void
}>()

const agentList = ref<{ id: number; name: string }[]>([])

// 加载 Agent 列表（Supervisor 模式下选择总控 Agent）
watch(visible, async (val) => {
  if (val && form.value.strategy === 'supervisor') {
    try {
      const res = await AgentAPI.list()
      agentList.value = Array.isArray(res) ? res : (res as any)?.data?.records || []
    } catch {
      agentList.value = []
    }
  }
})

// 策略切换时重置相关字段
watch(() => form.value.strategy, (val) => {
  if (val !== 'supervisor') {
    form.value.supervisorAgentId = undefined
  }
})

function onSubmit() {
  emit('submit')
}
</script>
