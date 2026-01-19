<template>
  <el-form 
    ref="SpDetailFormRef"
    v-loading="Boolean(loading)"
    :model="formData"
    class="detail-form"
    :class="`form-column-${column}`"
    v-bind="{
      labelWidth:'140px',
      'scroll-to-error': true,
      'scroll-into-view-options': true,
      ...$attrs
    }"
  >
    <el-collapse v-if="collapseOption?.list?.length" v-model="activeNames" v-bind="collapseOption" v-on="collapseOption?.event ?? {}">
      <el-collapse-item v-for="item in collapseOption.list" :key="item.name" v-bind="item">
        <DetailItem v-model="formData" v-bind="$attrs" :formColumns="item.formColumns" :column :columnVal :editable>
          <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
            <slot :name="name" v-bind="scope"></slot>
          </template>
        </DetailItem>
      </el-collapse-item>
    </el-collapse>
    <DetailItem v-else v-model="formData" v-bind="$attrs" :formColumns :column :columnVal :editable>
      <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope"></slot>
      </template>
    </DetailItem>
  </el-form>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { formItemName, formItemPropsKey } from '@/vite-env';
import type { FormInstance } from 'element-plus';
import DetailItem from './components/DetailItem.vue';

//form表单组件引用
const SpDetailFormRef = ref<FormInstance>();
const props = defineProps<{
  //组件信息
  formColumns?: {
    //验证规则
    rules?: object
    //插槽名称
    slotName?: string
    //el-组件名称
    name?: formItemName
    //标题
    label?: string
    prop?: string
    props?: formItemPropsKey
    inputType?: string
    placeholder?: string
    [key: string]: any
  }[],
  //支持折叠面板
  collapseOption?: any
  //是否编辑
  editable?: boolean
  //每行的列数
  column?: number
  //是否加载
  loading?:number
}>();
interface computedObject {
  [key: string]: any
}
const { width } = useWindowSize()
const activeNames = computed(() => props?.collapseOption?.activeNames || '');

//表单绑定数据
const formData = defineModel<computedObject | any>();

// 验证必填项
const validate = () => {
  return SpDetailFormRef.value?.validate()
}

// 取消必填项
const clearValidate = () => {
  return SpDetailFormRef.value?.clearValidate()
}
const columnVal = computed(() => {
  if (props.column) return props.column
  else {
    return width.value >= 1440 ? 3 : 2
  }
});

//暴露的数据或方法
defineExpose({
  validate,
  clearValidate,
  SpDetailFormRef,
  formData
})

</script>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
  align-items: start;
  position: relative;
}
:deep(.el-form-item__label) {
  text-align: right;
}
//:deep(.el-form-item--default) {
//margin-bottom: 24px;
//}
:deep(.el-form-item__error) {
  position: absolute;
}
</style>