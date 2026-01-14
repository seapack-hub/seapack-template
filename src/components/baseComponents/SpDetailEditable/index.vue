<template>
<!--使用Flex布局实现水平排列，根据是否有前后缀内容动态设置间距-->
<div
  class="w-full flex items-center overflow-hidden"
  :class="{ 'gap-x-5px': hasSlotContent}"
>
  <!--支持两种前缀配置方式（$attrs.prepend和prefix），通过fixRender组件动态渲-->
  <template v-if="($attrs as any)?.prepend?.value">
    <fixRender v-bind="($attrs as any).prepend" />
  </template>
  <template v-if="prefix?.value">
    <fixRender v-bind="prefix" />
  </template>

  <!--当没有前后缀内容时，内容区域会占据剩余所有空间-->
  <div :class="{ 'flex-1 flex': !hasSlotContent}">
    <!--状态切换：editable为true时渲染编辑态插槽，为false时渲染展示态模板-->
    <slot v-if="editable" v-bind="$attrs"></slot>
    <template v-else>
      <!-- 字典回显：当配置了dictType时，使用专门的字典标签组件展示数据 -->
      <div v-if="props.dictType && modelValue" class="detail-value" :class="isDetailShowTooltip ? '' : 'w-[100%]'">
        <SpDictionaryLabel v-model="modelValue" :type="props.dictType"></SpDictionaryLabel>
      </div>

      <!-- 复选框非编辑态回显 -->
      <SpCheckbox
        v-else-if="props.name === 'SpCheckbox'"
        v-model="modelValue"
        class="detail-value detail-component"
        :class="isDetailShowTooltip ? '' : 'w-[100%]'"
        v-bind="props"
        :disabled="true"
      ></SpCheckbox>

      <!-- 单选框非编辑态回显 -->
      <div v-else-if="props.name === 'SpRadio'" class="detail-value" :class="isDetailShowTooltip ? '' : 'w-[100%]'">
        <SpRadio v-model="modelValue" v-bind="props" :disabled="true" class="detail-component"></SpRadio>
      </div>

      <!-- 时间范围非编辑态显示 -->
      <div v-else-if="props.name === 'ElDatePicker' && $attrs.type === 'daterange'" class="" :class="isDetailShowTooltip ? '' : 'w-[100%]'">
        <span v-if="modelValue && modelValue?.length === 2">{{ `${modelValue[0]} ${$attrs?.rangeSeparator} ${modelValue[1]}` }}</span>
        <span v-else>--</span>
      </div>

      <!-- 默认回显文本 -->
      <el-skeleton v-else class="w-100%" :loading="loading" animated :throttle="500">
        <template #template>
          <el-skeleton-item variant="text" class="w-100% !m-0 !p-0" />
        </template>
        <template #default>
          <div class="detail-value w-100% break-all text-left" :class="{ valueClass, '!w-[unset]': isDetailShowTooltip }">
            {{ ![undefined, null, ''].includes(showValue) ? showValue : '--' }}
          </div>
        </template>
      </el-skeleton>
    </template>

    <div v-if="isDetailShowTooltip && props?.column?.tooltipOption" class="flex items-center justify-start">
      <el-tooltip v-bind="props?.column?.tooltipOption">
        <SpIcon name="tips" text="[var(--el-text-color-secondary)]" class="ml-[8px]"></SpIcon>
      </el-tooltip>
    </div>
  </div>

  <template v-if="($attrs as any)?.suffix?.value">
    <fixRender v-bind="($attrs as any).suffix" />
  </template>
  <template v-if="($attrs as any)?.append?.value">
    <fixRender v-bind="($attrs as any).append" />
  </template>
</div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import fixRender from "./components/fixRender.vue";
import useComponentGetData from '@/hooks/useComponentGetData'
const props = defineProps({
  // 组件类型标识
  name: {
    type: String,
    default: ''
  },
  // 编辑状态控制
  editable: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array<any>,
    default: () => []
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  activeText: {
    type: String,
    default: '关闭'
  },
  inactiveText: {
    type: String,
    default: '开启'
  },
  activeValue: {
    type: null,
    default: true
  },
  inactiveValue: {
    type: null,
    default: false
  },
  getDataMethod: {
    type: [Object as any, Function as any],
    default: null
  },
  methodParams: {
    type: null as any
  },
  immediate: {
    type: Boolean,
    default: true
  },
  showValueFormat: {
    type: Function as any,
    default: null
  },
  props: {
    type: Object as any,
    default: () => ({})
  },
  // 字典类型
  dictType: {
    type: String,
    default: ''
  },
  valueClass: {
    type: String,
    default: ''
  },
  separator: {
    type: String,
    default: ','
  },
  column: {
    type: Object,
    default: () => {}
  },
  isDetailShowTooltip: {
    type: Boolean,
    default: false
  },
  //前缀参数
  prefix: {
    type: Object,
    default: () => ({})
  }
});

// 判断是否有前后缀动态内容
const attrs = useAttrs()
const hasSlotContent = computed(() => {
  const attrsAny = attrs as any;
  return attrsAny?.prepend?.value || 
         props?.prefix?.value || 
         attrsAny?.suffix?.value || 
         attrsAny?.append?.value
});

//绑定值
const modelValue = defineModel<any>();

const { data, loading }: any = useComponentGetData(props);

//根据组件类型和当前值动态计算展示文本，支持多种数据格式
const showValue = computed(() => {
  const showValueFormat = props.showValueFormat
  const componentsKey = ['SpSelect', 'SpRadio', 'SpCheckbox']
  const options = props.getDataMethod ? (data.value as any) : props.options
  if (componentsKey.includes(props.name) && !props.editable && options) {
    return showValueFormat
      ? showValueFormat({ options, modelValue })
      : options
          ?.filter((item: any) =>
            Array.isArray(modelValue.value) ? modelValue.value?.includes(item[props.valueKey]) : modelValue.value === item[props.valueKey]
          )
          ?.map((v: any) => v[props.labelKey])
          ?.join(props?.separator) || (Array.isArray(modelValue.value) ? modelValue.value?.join(props?.separator) : modelValue.value)
  }

  if (['ElSwitch'].includes(props.name) && !props.editable) {
    const switchMap = {
      [props.activeValue]: props.activeText,
      [props.inactiveValue]: props.inactiveText
    }
    return showValueFormat ? showValueFormat(modelValue) : switchMap[modelValue.value]
  }

  /**
   * checkStrictly: 是否严格的遵守父子节点不互相关联，默认是 false
   * multiple：是否是多选级联
   * separator： 多选情况下回显值的分割符，默认'/'
   * emitPath: 是否返回选中节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
   */
  if (['SpCascader'].includes(props.name)) {
    //  父子节点不互相关联的组件回显逻辑
    const componentProps = props?.props
    if (modelValue?.value && componentProps && componentProps?.checkStrictly) {
      const resVal = componentProps?.emitPath ? modelValue?.value[modelValue.value?.length - 1] : modelValue?.value
      if (componentProps?.multiple) {
        const separator = componentProps?.separator || '/'
        const nodeLabels = resVal.map((item: any) => searchNodeLabel(options, item)) || []
        return showValueFormat ? showValueFormat({ options, values: resVal, data: nodeLabels }) : nodeLabels?.join(separator)
      } else {
        return showValueFormat ? showValueFormat({ options, resVal }) : searchNodeLabel(options, resVal)
      }
    } else if (modelValue?.value && componentProps && !componentProps?.checkStrictly) {
      // 处理单选分级回显
      if (!componentProps?.multiple) {
        const separator = componentProps?.separator || '/'
        const nodeLabels = modelValue?.value?.map((item: any) => searchNodeLabel(options, item)) || []
        return showValueFormat ? showValueFormat({ options, values: modelValue?.value, data: nodeLabels }) : nodeLabels?.join(separator)
      }
    }
  }
  if (showValueFormat && !props.editable) {
    return showValueFormat(modelValue)
  }
  return modelValue.value
})
function searchNodeLabel(options: any, value: string) {
  const componentProps = props?.props
  const labelKey = componentProps?.label || 'name'
  const valueKey = componentProps?.value || 'id'
  const childrenKey = componentProps?.children || 'children'
  for (var key in options) {
    if (options[key][valueKey] == value) {
      return options[key][labelKey]
    }
    if (options[key][childrenKey] && Object.keys(options[key][childrenKey]).length > 0) {
      var temp = searchNodeLabel(options[key][childrenKey], value) as any
      if (temp) return temp
    }
  }
}
</script>

<style lang="scss" scoped></style>