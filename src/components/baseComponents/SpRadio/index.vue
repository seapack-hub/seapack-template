<template>
  <el-radio-group v-model="radio" v-bind="$attrs" v-loading="loading">
    <template v-if="type === 'radio'">
      <el-radio v-for="item in data as any[]" :key="item[valueKey]" :value="item[valueKey]" v-bind="formatItem ? formatItem(item) : item">{{
        item[labelKey]
      }}</el-radio>
    </template>
    <template v-else-if="type === 'button'">
      <el-radio-button v-for="item in data as any[]" :key="item[valueKey]" :value="item[valueKey]" v-bind="formatItem ? formatItem(item) : item">{{
        item[labelKey]
      }}</el-radio-button>
    </template>
  </el-radio-group>
</template>

<script setup lang="ts">
import useComponentGetData from '@/hooks/useComponentGetData'
const radio = defineModel<any>()
const props = defineProps({
  labelKey: {
    type: String,
    default: 'label'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  // 配置项
  options: {
    type: Array<any>,
    default: () => []
  },
  // 调用接口
  getDataMethod: {
    type: Function as any,
    default: null
  },
  // 接口参数
  methodParams: {
    type: null as any
  },
  // 是否立即调用
  immediate: {
    type: Boolean,
    default: true
  },
  formatItem: {
    type: Function as any,
    default: null
  },
  //按钮类型，
  type: {
    type: String,
    default: 'radio'
  }
})
const { data, loading } = useComponentGetData(props)
</script>

<style scoped></style>
