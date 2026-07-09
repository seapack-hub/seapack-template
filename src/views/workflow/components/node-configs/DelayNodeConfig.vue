<template>
  <div class="config-section">
    <div class="section-title">延时配置</div>
    <el-form-item label="延时类型">
      <el-select v-model="config.delayType" @change="handleChange">
        <el-option label="固定延时" value="fixed" />
        <el-option label="动态延时" value="dynamic" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="config.delayType === 'fixed'" label="延时值">
      <el-input-number v-model="config.delayValue" :min="1" controls-position="right" @change="handleChange" />
      <span class="ml-8px text-12px text-gray-400">秒</span>
    </el-form-item>
    <el-form-item v-else label="表达式">
      <el-input v-model="config.delayExpression" placeholder="动态延时表达式" @change="handleChange" />
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
  delayType: 'fixed',
  delayValue: 60,
  delayExpression: '',
})

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
