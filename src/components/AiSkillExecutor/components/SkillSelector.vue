<script setup lang="ts">
import type { SkillBindingInfo } from '@/api/ai/skill'

defineProps<{
  bindings: SkillBindingInfo[]
}>()

const model = defineModel<SkillBindingInfo | null>({ required: true })
</script>

<template>
  <div class="flex items-center gap-[12px] p-[10px_14px] mb-16 rounded-8 bg-[var(--el-color-primary-light-9)]">
    <span class="text-[13px] text-[var(--el-text-color-secondary)] flex-shrink-0">选择技能</span>
    <el-radio-group :model-value="model as any" size="default" class="flex-wrap" @update:model-value="model = $event as any">
      <el-radio-button
        v-for="b in bindings"
        :key="b.skillId"
        :value="b as any"
      >
        {{ b.skillName }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<style scoped>
:deep(.el-radio-button__inner) {
  font-size: 13px;
  padding: 5px 14px;
}
</style>
