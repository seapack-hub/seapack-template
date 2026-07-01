<template>
  <div class="flex-1 flex flex-col min-w-0 border border-solid border-[var(--el-border-color-lighter)] rounded-8 bg-white">
    <!-- 标题栏 -->
    <div class="flex items-center gap-[6px] px-16 py-[10px] border-b border-[var(--el-border-color-extra-light)] bg-[var(--el-fill-color-lighter)]">
      <el-icon color="var(--el-color-primary)" :size="16"><EditPen /></el-icon>
      <span class="text-[14px] font-600">输入参数</span>
      <span
        v-if="skillName"
        class="ml-auto text-[12px] text-[var(--el-text-color-secondary)] truncate max-w-[140px]"
      >{{ skillName }}</span>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-y-auto px-16 py-12 max-h-[420px]">
      <!-- 有参数 -->
      <el-form
        v-if="params.length"
        :model="model"
        label-position="top"
        size="default"
        class="param-form"
      >
        <el-form-item
          v-for="p in params"
          :key="p.paramName"
          :label="p.label"
          :required="p.required === 1"
        >
          <el-input
            v-if="p.paramType === 'string'"
            :model-value="model[p.paramName]"
            :placeholder="p.placeholder || `请输入${p.label}`"
            clearable
            @update:model-value="model[p.paramName] = $event"
          />
          <el-input-number
            v-else-if="p.paramType === 'number'"
            :model-value="model[p.paramName]"
            :placeholder="p.placeholder"
            style="width: 100%"
            @update:model-value="model[p.paramName] = $event"
          />
          <el-switch
            v-else-if="p.paramType === 'boolean'"
            :model-value="model[p.paramName]"
            @update:model-value="model[p.paramName] = $event"
          />
          <el-select
            v-else-if="p.paramType === 'select' && p.options"
            :model-value="model[p.paramName]"
            :placeholder="p.placeholder || '请选择'"
            style="width: 100%"
            @update:model-value="model[p.paramName] = $event"
          >
            <el-option
              v-for="opt in p.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <div class="flex gap-[10px] pt-[10px] border-t border-[var(--el-border-color-extra-light)]">
          <el-button type="primary" :loading="executing" @click="emit('execute')">
            <el-icon><CaretRight /></el-icon>执行
          </el-button>
          <el-button :disabled="executing" @click="emit('reset')">重置</el-button>
        </div>
      </el-form>

      <!-- 无参数 -->
      <div v-else class="flex flex-col items-center justify-center py-[20px] gap-[12px]">
        <el-empty description="该技能无需输入参数" :image-size="60" />
        <el-button type="primary" :loading="executing" @click="emit('execute')">
          <el-icon><CaretRight /></el-icon>执行
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditPen, CaretRight } from '@element-plus/icons-vue'
import type { SkillParam } from '@/api/ai/skill'

defineProps<{
  params: SkillParam[]
  executing: boolean
  skillName?: string
}>()

const model = defineModel<Record<string, any>>('formData', { required: true })
const emit = defineEmits<{
  execute: []
  reset: []
}>()
</script>

<style scoped>
.param-form :deep(.el-form-item) {
  margin-bottom: 16px;
}
.param-form :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
  padding-bottom: 4px;
}
</style>
