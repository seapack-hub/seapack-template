<template>
  <div class="config-section">
    <div class="section-title">审批配置</div>
    <el-form-item label="审批人类型">
      <el-select v-model="config.assigneeType" @change="handleChange">
        <el-option label="指定用户" value="user" />
        <el-option label="指定角色" value="role" />
        <el-option label="指定部门" value="department" />
        <el-option label="动态表达式" value="expression" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="config.assigneeType !== 'expression'" label="审批人">
      <el-select v-model="config.assigneeIds" multiple filterable placeholder="选择审批人" @change="handleChange">
        <el-option label="管理员" :value="1" />
        <el-option label="审核员" :value="2" />
      </el-select>
    </el-form-item>
    <el-form-item v-else label="表达式">
      <el-input v-model="config.assigneeExpression" placeholder="动态审批人表达式" @change="handleChange" />
    </el-form-item>
    <el-form-item label="超时(分钟)">
      <el-input-number v-model="config.timeoutMinutes" :min="0" :max="1440" controls-position="right" @change="handleChange" />
    </el-form-item>
    <el-form-item label="超时动作">
      <el-select v-model="config.timeoutAction" @change="handleChange">
        <el-option label="自动通过" value="auto_approve" />
        <el-option label="自动驳回" value="auto_reject" />
        <el-option label="自动升级" value="escalate" />
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
  assigneeType: 'user',
  assigneeIds: [] as number[],
  assigneeExpression: '',
  timeoutMinutes: 60,
  timeoutAction: 'escalate',
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
