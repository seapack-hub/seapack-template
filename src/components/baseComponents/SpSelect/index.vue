<template>
  <el-select v-bind="$attrs" ref="SpSelectRef" v-model="value" :data :loading>
    <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope"></slot>
    </template>
    <el-option
      v-for="item in data as any[]"
      :key="item[valueKey]"
      :label="item[labelKey]"
      :value="item[valueKey]"
      v-bind="formatItem ? formatItem(item) : item"
    >
      <slot name="option" :item></slot>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ElSelect } from 'element-plus'
import useComponentGetData from '@/hooks/useComponentGetData'
const props = defineProps({
  modelValue: {
    type: null,
    required: true
  },
  //初始选项
  options: {
    type: Array<any>,
    default: () => []
  },
  //对应值
  valueKey: {
    type: String,
    default: 'value'
  },
  //对应键
  labelKey: {
    type: String,
    default: 'label'
  },
  //调用接口
  getDataMethod: {
    type: Function,
    default: null
  },
  //接口参数
  methodParams: {
    type: null as any
  },
  //立即调用
  immediate: {
    type: Boolean,
    default: true
  },
  //格式数据函数
  formatItem: {
    type: Function as any,
    default: null
  }
});
// 获取展示数据
const { data, loading,getData } = useComponentGetData(props);

//获取组件
const SpSelectRef = ref<InstanceType<typeof ElSelect>>();

//双向绑定值
const value = defineModel<any>();

//暴露数据、方法
defineExpose({ SpSelectRef, getData, data })
</script>

<style lang="scss" scoped></style>