<template>
  <div class="workflow-edge-property">
    <el-form label-width="70px" label-position="left">
      <div class="config-section">
        <div class="section-title mb-8px text-12px text-gray-400">线条属性</div>
        <el-form-item label="类型">
          <el-select v-model="edgeData.edgeType" @change="handleChange">
            <el-option label="默认" value="default" />
            <el-option label="条件" value="conditional" />
            <el-option label="异常" value="exception" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="edgeData.label" placeholder="线条标签" @change="handleChange" />
        </el-form-item>
      </div>

      <template v-if="edgeData.edgeType === 'conditional'">
        <div class="config-section mt-16px">
          <div class="section-title mb-8px text-12px text-gray-400">条件配置</div>
          <el-form-item label="条件表达式">
            <el-input
              v-model="edgeData.conditionExpression"
              type="textarea"
              :rows="3"
              placeholder="例: {{score}} > 80"
              @change="handleChange"
            />
          </el-form-item>
          <el-form-item label="优先级">
            <el-input-number v-model="edgeData.priority" :min="0" :max="100" controls-position="right" @change="handleChange" />
          </el-form-item>
        </div>
      </template>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Edge } from '@antv/x6'

const props = defineProps({
  edge: {
    type: Object as () => Edge | null,
    default: null,
  },
})

const emit = defineEmits(['change'])

const edgeData = ref({
  edgeType: 'default',
  label: '',
  conditionExpression: '',
  priority: 0,
})

// 监听边变化
watch(
  () => props.edge,
  (edge) => {
    if (edge) {
      const data = edge.getData() || {}
      edgeData.value = {
        edgeType: data.edgeType || 'default',
        label: data.label || edge.getLabels()?.[0]?.attrs?.text?.text || '',
        conditionExpression: data.conditionExpression || '',
        priority: data.priority || 0,
      }
    }
  },
  { immediate: true, deep: true },
)

// 数据变更
const handleChange = () => {
  if (!props.edge) return
  props.edge.setData(edgeData.value, { overwrite: true })
  emit('change', edgeData.value)
}
</script>

<style lang="scss" scoped>
.workflow-edge-property {
  padding-top: 4px;
}

.config-section {
  padding: 8px 0;

  &:first-child {
    padding-top: 0;
  }
}

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
