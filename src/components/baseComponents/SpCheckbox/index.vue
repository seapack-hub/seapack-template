<template>
  <el-checkbox-group v-model="checkList" v-bind="$attrs" v-loading="loading">
    <el-checkbox
      v-for="item in data as any[]"
      :key="item[valueKey]"
      :value="item[valueKey]"
      :label="item[labelKey]"
      v-bind="formatItem ? formatItem(item) : item"
    ></el-checkbox>
  </el-checkbox-group>
</template>

<script setup lang="ts">
import useComponentGetData from '@/hooks/useComponentGetData.ts'
const checkList = defineModel<any[]>()
const props = defineProps({
  labelKey: {
    type: String,
    default: 'label'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  options: {
    type: Array<any>,
    default: () => []
  },
  //获取数据接口
  getDataMethod: {
    type: Function as any,
    default: null
  },
  //接口参数
  methodParams: {
    type: null as any
  },
  //是否立即加载
  immediate: {
    type: Boolean,
    default: true
  },
  formatItem: {
    type: Function as any,
    default: null
  }
})
const { data, loading } = useComponentGetData(props)
</script>

<style scoped></style>
