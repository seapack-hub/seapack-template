// <reference types="vite/client" />
import type * as ep from 'element-plus'
// 推荐使用
declare module '*.vue' {
  // 引入vue模块中ts的方法
  import type { DefineComponent } from 'vue';
  // 定义vue组件以及类型注解
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

export type formItemName =
  | 'ElAutocomplete'
  | 'ElCalendar'
  | 'ElCheckbox'
  | 'ElCheckboxButton'
  | 'ElCheckboxGroup'
  | 'ElDatePicker'
  | 'ElInput'
  | 'ElInputNumber'
  | 'ElRadio'
  | 'ElRadioButton'
  | 'ElRadioGroup'
  | 'ElRate'
  | 'ElSelect'
  | 'ElSelectV2'
  | 'ElSlider'
  | 'ElSwitch'
  | 'ElTimePicker'
  | 'ElTimeSelect'
  | 'ElTransfer'
  | 'ElUpload'
  | 'TySelect'
  | string;

export type formItemPropsKey =
| ep.AutocompleteProps
| ep.CascaderProps
| ep.CheckboxProps
| ep.ColorPickerProps
| ep.DatePickerProps
| ep.InputProps
| ep.InputNumberProps
| ep.RadioProps
| ep.RadioGroupProps
| ep.RateProps
| ep.SliderProps
| ep.SwitchProps
| ep.TimePickerDefaultProps

export interface formItemProps {
  name: formItemName
  prop: string
  props: formItemPropsKey | any
}