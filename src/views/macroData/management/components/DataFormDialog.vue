<template>
  <el-dialog :model-value="visible" :title="mode === 'add' ? '新增指标数据' : '编辑指标数据'" width="480px" destroy-on-close @update:model-value="$emit('update:visible', $event)">
    <el-form :model="localForm" label-width="120px">
      <el-form-item label="日期">
        <el-date-picker
          v-model="localForm.statDate"
          type="date"
          value-format="YYYY-MM-DD"
          style="width: 100%"
          :disabled="mode === 'edit'"
        />
      </el-form-item>
      <el-form-item v-if="mode === 'add'" label="频率">
        <el-select :model-value="frequency" disabled style="width: 100%">
          <el-option v-for="opt in FREQUENCY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="指标编码">
        <el-select v-model="localForm.indicatorCode" filterable style="width: 100%" :disabled="mode === 'edit'">
          <el-option v-for="m in filteredMeta" :key="m.indicatorCode" :label="`${m.indicatorName}（${m.indicatorCode}）`" :value="m.indicatorCode" />
        </el-select>
      </el-form-item>
      <el-form-item label="指标值">
        <el-input-number v-model="localForm.metricValue" :precision="4" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item v-if="frequency !== 'weekly'" label="第二数值">
        <el-input-number v-model="localForm.metricValue2" :precision="4" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="环比变化">
        <el-input-number v-model="localForm.momChange" :precision="4" :step="1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="来源">
        <el-input v-model="localForm.source" placeholder="请输入数据来源" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="saveLoading" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { FREQUENCY_OPTIONS } from '../utils'
import type { MacroIndicatorMeta } from '@/api/macroData/types'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  form: any
  frequency: string
  filteredMeta: MacroIndicatorMeta[]
  saveLoading: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [data: any]
}>()

/** 本地表单副本，避免直接修改 prop */
const localForm = reactive<any>({})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      Object.assign(localForm, { ...props.form })
    }
  },
  { immediate: true },
)

function onSave() {
  emit('save', { ...localForm })
}
</script>
