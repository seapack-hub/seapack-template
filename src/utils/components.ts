import {
  ElAlert,
  ElAutocomplete,
  ElButton,
  ElCalendar,
  ElCheckbox,
  ElCheckboxButton,
  ElCheckboxGroup,
  ElColorPicker,
  ElDatePicker,
  ElDivider,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSelectV2,
  ElSlider,
  ElSwitch,
  ElText,
  ElTimePicker,
  ElTimeSelect,
  ElTransfer,
  ElTreeSelect,
  ElUpload
} from 'element-plus';

import { type Component, defineAsyncComponent, markRaw } from 'vue';
import componentDefaultProps from '@/config/componentDefaultProps';

import { formItemName } from '@/vite-env';

// 定义动态组件
const componentsTypes: Record<string, Component> = markRaw({
  ElAutocomplete,
  ElCalendar,
  ElCheckbox,
  ElCheckboxButton,
  ElCheckboxGroup,
  ElDatePicker,
  ElInput,
  ElInputNumber,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSelectV2,
  ElSlider,
  ElSwitch,
  ElTimePicker,
  ElTimeSelect,
  ElTransfer,
  ElUpload,
  ElTreeSelect,
  ElColorPicker,
  ElText,
  ElDivider,
  ElAlert,
  ElForm,
  ElFormItem,
  ElButton
});

export const styleTypes = ['default', 'primary', 'success', 'info', 'warning', 'danger'];

export const getComponentName = (name: string, customComponent: Component | null = null) => {
  if (componentsTypes[name]) return componentsTypes[name]
  else {
    if (customComponent) return customComponent;
    //动态导入自定义组件
    const modules = import.meta.glob('../components/**/**.vue')
    let component
    // modules对象的属性名如果包含name，则返回对应的组件，没有则返回ElInput
    for (const key in modules) {
      if (key.includes(`/${name}/`)) {
        component = defineAsyncComponent(modules[key] as any)
      }
    }
    return component || ElInput
  }
};

/**
 * 判断输入类型是输入框还是选择框
 * @param {string} componentName 'ElAutocomplete'
 * @returns {string} input/select
 *
 */
export function getComponentType(componentName: string): 'input' | 'select' | string {
  interface ComponentMap {
    [key: string]: string[]
  }
  const componentType: ComponentMap = {
    input: ['ElAutocomplete', 'ElInput', 'ElInputNumber', 'TyNumberInterval'],
    select: [
      'ElCalendar',
      'ElCheckbox',
      'ElCheckboxButton',
      'ElCheckboxGroup',
      'ElDatePicker',
      'ElRadio',
      'ElRadioButton',
      'ElRadioGroup',
      'ElRate',
      'ElSelect',
      'ElSelectV2',
      'ElSlider',
      'ElSwitch',
      'ElTimePicker',
      'ElTimeSelect',
      'ElTransfer',
      'ElUpload',
      'ElTreeSelect',
      'ElColorPicker'
    ]
  }

  return Object.keys(componentType).find((key) => componentType[key]?.includes(componentName)) ?? 'select'
}

export const formatSearchColumns = (columns: any[]) => {
  return (
    columns?.map((item) => {
      return formatFormItem(item)
    }) ?? []
  )
}

//表单配置格式化
export const formatFormColumns = (columns: any[]) => {
  return (
    columns?.map((item) => {
      return formatFormItem(item)
    }) ?? []
  )
}
export const formatFormItem = (item: any) => {
  const { inputType = getComponentType(item.name), name, label, customComponent } = item

  const placeholder = `${inputType}${label}`
  return {
    ...item,
    label: item.label ? (item.label?.includes(':') ? item.label : `${item.label}:`) : item.label,
    componentsName: getComponentName(name, customComponent),
    inputType,
    props: { placeholder, ...componentDefaultProps, ...item.props },
    rules: getRulesHandler({ ...item, inputType })
  }
}
export const getRulesHandler = (column: { rules: object; label: string; name: formItemName; inputType: string }) => {
  const { rules, label, inputType } = column
  // 如果 rules 存在
  if (rules) {
    // 组件类型字符串
    const inputTypeStr = `${inputType}`
    // 初始化规则数组
    const rulesArr: object[] = []

    // 遍历 rules
    Object.entries(rules).forEach(([key, value]) => {
      switch (key) {
        // 如果是 required 键
        case 'required':
          // 如果 value 存在
          if (value) {
            // 如果 value 是对象，则将其转换为对象并设置 trigger
            rulesArr.push(
              typeof value === 'object'
                ? { ...value, trigger: ['blur', 'change'] }
                : // 否则设置规则
                  {
                    required: true,
                    message: `${inputTypeStr}${label}`,
                    trigger: ['blur', 'change']
                  }
            )
          }
          break
        // 如果是 min、max、len 键
        case 'min':
        case 'max':
        case 'len':
          // 如果 value 存在
          if (value) {
            // 如果 value 是对象，则将其转换为对象并设置 trigger
            rulesArr.push(
              typeof value === 'object'
                ? { ...value, trigger: ['blur', 'change'] }
                : // 否则设置规则
                  {
                    [key]: value,
                    message: `${label}${value}`,
                    trigger: ['blur', 'change']
                  }
            )
          }
          break
        // 如果是 pattern、type 键
        case 'pattern':
        case 'type':
          // 如果 value 存在
          if (value) {
            // 如果 value 是对象，则将其转换为对象并设置 trigger
            rulesArr.push(
              typeof value === 'object'
                ? { ...value, trigger: ['blur', 'change'] }
                : {
                    [key]: value,
                    message: `${label}`,
                    trigger: ['blur', 'change']
                  }
            )
          }
          break
        // 如果是 validator 键
        case 'validator':
          // 如果 value 存在
          if (value) {
            // 设置验证器规则
            rulesArr.push({
              validator: value,
              trigger: ['blur', 'change']
            })
          }
          break
        // 默认情况
        default:
          break
      }
    })
    // 返回规则数组
    return rulesArr
  }
  return []
}

/**
 * @function 判断一个组件是否为日期范围组件。
 *
 * 本函数用于确定传入的组件是否属于日期选择器类型，并且是范围选择器。这在处理不同类型的组件时非常有用，
 * 特别是在需要对日期范围组件进行特殊处理的场景中。
 *
 * @param item 一个包含组件名称和类型的对象。
 * @returns 如果组件是日期范围组件，则返回true；否则返回false。
 */
export const isDateRangeComponent = (item: { name: string; type: string; props?: any }) => {
  return (
    (['ElDatePicker', 'ElTimePicker'].includes(item?.name) && (item?.type?.endsWith('range') || item?.props?.type?.endsWith('range'))) ||
    ['TyNumberInterval'].includes(item?.name)
  )
}

