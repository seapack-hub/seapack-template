<template>
  <el-dialog v-model="visible" title="变量管理" width="700px">
    <div class="variable-editor">
      <div class="mb-10px flex justify-between items-center">
        <span class="text-14px font-medium">工作流变量</span>
        <el-button type="primary" size="small" @click="addVariable">
          <el-icon><Plus /></el-icon>添加变量
        </el-button>
      </div>

      <el-table :data="variables" border max-height="400">
        <el-table-column label="变量名" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.name" size="small" placeholder="变量名" />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-select v-model="row.type" size="small">
              <el-option label="字符串" value="string" />
              <el-option label="数字" value="number" />
              <el-option label="布尔" value="boolean" />
              <el-option label="JSON" value="json" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="作用域" width="100">
          <template #default="{ row }">
            <el-select v-model="row.scope" size="small">
              <el-option label="输入" value="input" />
              <el-option label="输出" value="output" />
              <el-option label="全局" value="global" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="默认值" min-width="120">
          <template #default="{ row }">
            <el-input v-model="row.defaultValue" size="small" placeholder="默认值" />
          </template>
        </el-table-column>
        <el-table-column label="必填" width="70" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.required" />
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.description" size="small" placeholder="描述" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" fixed="right">
          <template #default="{ $index }">
            <el-button type="danger" link @click="removeVariable($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { WorkflowVariable } from '@/api/workflow/types'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  variables: {
    type: Array as () => WorkflowVariable[],
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'update:variables'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const localVariables = ref<WorkflowVariable[]>([])

watch(
  () => props.variables,
  (val) => {
    localVariables.value = JSON.parse(JSON.stringify(val || []))
  },
  { immediate: true, deep: true },
)

const addVariable = () => {
  localVariables.value.push({
    name: '',
    type: 'string',
    scope: 'input',
    defaultValue: '',
    description: '',
    required: false,
  })
}

const removeVariable = (index: number) => {
  localVariables.value.splice(index, 1)
}

const handleSave = () => {
  emit('update:variables', [...localVariables.value])
  visible.value = false
}
</script>
