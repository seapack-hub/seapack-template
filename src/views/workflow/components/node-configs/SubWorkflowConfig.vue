<template>
  <div class="config-section">
    <div class="section-title">子工作流配置</div>
    <el-form-item label="工作流">
      <el-select v-model="config.workflowId" placeholder="选择工作流" filterable @change="handleChange">
        <el-option v-for="wf in workflowList" :key="wf.id" :label="wf.name" :value="wf.id" />
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const config = ref({
  workflowId: undefined as number | undefined,
})

const workflowList = ref([
  { id: 1, name: '股票诊断流程' },
  { id: 2, name: '基金分析流程' },
])

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      config.value = { ...config.value, ...val }
    }
  },
  { immediate: true, deep: true },
)

const handleChange = () => {
  emit('update:modelValue', config.value)
  emit('change', config.value)
}
</script>

<style lang="scss" scoped>
.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 6px;
  margin-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
}
</style>
