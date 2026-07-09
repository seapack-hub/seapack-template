<template>
  <div class="config-section">
    <div class="section-title">条件分支配置</div>
    <el-form-item label="条件表达式">
      <el-input v-model="config.expression" type="textarea" :rows="2" placeholder="例: {{score}} > 80" @change="handleChange" />
    </el-form-item>
    <el-form-item label="分支">
      <div class="branch-list">
        <div v-for="(branch, index) in config.branches" :key="index" class="branch-item flex items-center gap-8px mb-8px">
          <el-input v-model="branch.label" size="small" placeholder="分支名称" class="w-100px" @change="handleChange" />
          <el-input v-model="branch.expression" size="small" placeholder="条件表达式" @change="handleChange" />
          <el-button type="danger" :icon="Delete" circle size="small" @click="removeBranch(index)" />
        </div>
        <el-button size="small" @click="addBranch">添加分支</el-button>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const config = ref({
  expression: '',
  branches: [] as Array<{ label: string; expression: string }>,
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

const addBranch = () => {
  config.value.branches.push({ label: '', expression: '' })
  handleChange()
}

const removeBranch = (index: number) => {
  config.value.branches.splice(index, 1)
  handleChange()
}

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
