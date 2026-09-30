<template>
  <el-select v-bind="$attrs" ref="SpSelectRef" v-model="value" :data="displayData" :loading="loading">
    <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope"></slot>
    </template>
    <el-option
      v-for="item in displayData as any[]"
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
import { useDictionaryStore } from '@/store/modules/dictionary'

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
    type: null as any,
    default: null
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
  },
  //字典类型（传入后自动从字典 Store 加载数据）
  dictType: {
    type: String,
    default: ''
  },
  //值类型：当字典值为字符串但需要转换为其他类型时使用（如 '1' -> 1）
  valueType: {
    type: String as () => 'string' | 'number' | 'boolean',
    default: 'string'
  }
})

const dictStore = useDictionaryStore()
const dictLoading = ref(false)
const dictData = ref<any[]>([])

// 值类型转换函数
const convertValueType = (val: any): any => {
  if (!props.dictType || props.valueType === 'string') return val
  if (val === '' || val === null || val === undefined) return val
  if (props.valueType === 'number') {
    const num = Number(val)
    return isNaN(num) ? val : num
  }
  if (props.valueType === 'boolean') {
    return val === 'true' || val === 1
  }
  return val
}

// 获取展示数据（优先使用 dictType，否则走原有逻辑）
const displayData = computed(() => {
  if (props.dictType && dictData.value.length > 0) {
    // 如果需要类型转换，转换字典数据的 value
    if (props.valueType !== 'string') {
      return dictData.value.map(item => ({
        ...item,
        [props.valueKey]: convertValueType(item[props.valueKey])
      }))
    }
    return dictData.value
  }
  return originalData.value
})

// 原有逻辑：通过 options 或 getDataMethod 获取数据
const { data: originalData, loading: originalLoading, getData: originalGetData } = useComponentGetData(props)

// dictType 模式下的 loading
const loading = computed(() => {
  if (props.dictType) return dictLoading.value
  return originalLoading.value
})

// 监听 dictType 变化，自动加载字典数据
watch(
  () => props.dictType,
  async (newType) => {
    if (newType) {
      dictLoading.value = true
      try {
        dictData.value = await dictStore.getDictionaryList(newType)
      } catch {
        dictData.value = []
      } finally {
        dictLoading.value = false
      }
    }
  },
  { immediate: true }
)

//获取组件
const SpSelectRef = ref<InstanceType<typeof ElSelect>>()

//双向绑定值
const value = defineModel<any>()

// 暴露数据和方法（dictType 模式下 getData 为空操作）
const getData = props.dictType ? async () => {} : originalGetData

//暴露数据、方法
defineExpose({ SpSelectRef, getData, data: displayData })
</script>

<style lang="scss" scoped></style>
