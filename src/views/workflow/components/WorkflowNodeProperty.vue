<template>
  <div class="workflow-node-property">
    <el-form label-width="70px" label-position="left">
      <!-- 基础属性 -->
      <div class="config-section">
        <div class="section-title mb-8px text-12px text-gray-400">基础属性</div>
        <el-form-item label="名称">
          <el-input v-model="nodeData.name" placeholder="节点名称" @change="handleChange" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="nodeData.description" type="textarea" :rows="2" placeholder="节点描述" @change="handleChange" />
        </el-form-item>
      </div>

      <!-- 根据节点类型显示不同配置 -->
      <template v-if="nodeType === 'skill'">
        <SkillNodeConfig v-model="nodeData.config" @change="handleChange" />
      </template>
      <template v-else-if="nodeType === 'http_request'">
        <HttpNodeConfig v-model="nodeData.config" @change="handleChange" />
      </template>
      <template v-else-if="nodeType === 'condition'">
        <ConditionNodeConfig v-model="nodeData.config" @change="handleChange" />
      </template>
      <template v-else-if="nodeType === 'approval'">
        <ApprovalNodeConfig v-model="nodeData.config" @change="handleChange" />
      </template>
      <template v-else-if="nodeType === 'delay'">
        <DelayNodeConfig v-model="nodeData.config" @change="handleChange" />
      </template>
      <template v-else-if="nodeType === 'sub_workflow'">
        <SubWorkflowConfig v-model="nodeData.config" @change="handleChange" />
      </template>

      <!-- 变量映射 -->
      <div class="config-section mt-16px">
        <div class="section-title mb-8px text-12px text-gray-400">变量映射</div>
        <el-form-item label="输入变量">
          <el-select v-model="nodeData.inputVars" multiple filterable allow-create placeholder="选择或输入变量名" style="width: 100%">
            <el-option v-for="v in availableVars" :key="v.name" :label="v.name" :value="v.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="输出变量">
          <el-input v-model="nodeData.outputVar" placeholder="输出变量名" @change="handleChange" />
        </el-form-item>
      </div>

      <!-- 超时设置 -->
      <div class="config-section mt-16px">
        <div class="section-title mb-8px text-12px text-gray-400">执行设置</div>
        <el-form-item label="超时(秒)">
          <el-input-number v-model="nodeData.timeoutSeconds" :min="0" :max="3600" controls-position="right" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Node } from '@antv/x6'
import SkillNodeConfig from './node-configs/SkillNodeConfig.vue'
import HttpNodeConfig from './node-configs/HttpNodeConfig.vue'
import ConditionNodeConfig from './node-configs/ConditionNodeConfig.vue'
import ApprovalNodeConfig from './node-configs/ApprovalNodeConfig.vue'
import DelayNodeConfig from './node-configs/DelayNodeConfig.vue'
import SubWorkflowConfig from './node-configs/SubWorkflowConfig.vue'

const props = defineProps({
  node: {
    type: Object as () => Node | null,
    default: null,
  },
})

const emit = defineEmits(['change'])

const nodeData = ref({
  name: '',
  description: '',
  nodeType: '',
  config: {} as any,
  inputVars: [] as string[],
  outputVar: '',
  timeoutSeconds: 300,
})

const nodeType = computed(() => nodeData.value.nodeType)

// 模拟可用变量（实际应从工作流上下文获取）
const availableVars = ref([
  { name: 'input.stockCode', type: 'string' },
  { name: 'input.stockName', type: 'string' },
  { name: 'previous.output', type: 'json' },
])

// 监听节点变化
watch(
  () => props.node,
  (node) => {
    if (node) {
      const data = node.getData() || {}
      nodeData.value = {
        name: data.name || '',
        description: data.description || '',
        nodeType: data.nodeType || '',
        config: data.config || {},
        inputVars: data.inputVars || [],
        outputVar: data.outputVars?.[0] || '',
        timeoutSeconds: data.timeoutSeconds || 300,
      }
    }
  },
  { immediate: true, deep: true },
)

// 数据变更
const handleChange = () => {
  if (!props.node) return
  const data = {
    ...nodeData.value,
    outputVars: nodeData.value.outputVar ? [nodeData.value.outputVar] : [],
  }
  props.node.setData(data, { overwrite: true })
  emit('change', data)
}
</script>

<style lang="scss" scoped>
.workflow-node-property {
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
