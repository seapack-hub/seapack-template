/**
 * components —— 动态表单组件工具
 *
 * 集中管理 Element Plus 表单组件的注册、查找、格式化，
 * 支持根据组件名称字符串动态渲染对应的组件实例，
 * 以及统一的表单项配置格式化（占位符、校验规则等）。
 */

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
  ElUpload,
} from 'element-plus';

import { type Component, defineAsyncComponent, markRaw } from 'vue';
import componentDefaultProps from '@/config/componentDefaultProps';
import { formItemName } from '@/vite-env';

/**
 * 组件名称到组件实例的映射表
 *
 * markRaw 标记组件为非响应式，避免 Vue 对组件定义进行响应式代理
 * （组件定义是静态对象，无需响应式追踪，标记后可提升性能）。
 */
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
  ElButton,
});

/**
 * 占位符映射
 * input 类型用"请输入"，select 类型用"请选择"
 */
interface PlaceholderMap {
  [key: string]: string;
  input: string;
  select: string;
}

const placeholderList: PlaceholderMap = {
  input: '请输入',
  select: '请选择',
};

/** 通用的样式类型列表，按 Element Plus 的 type 属性排列 */
export const styleTypes = ['default', 'primary', 'success', 'info', 'warning', 'danger'];

/**
 * 根据组件名称字符串获取对应的 Vue 组件
 *
 * 查找顺序：
 *   1. 优先从 componentsTypes（Element Plus 组件映射）中查找
 *   2. 若未找到且传入了 customComponent，则返回 customComponent
 *   3. 若仍未找到，从 @/components 目录下动态导入与名称匹配的自定义组件
 *   4. 兜底返回 ElInput
 *
 * @param name            组件名称，如 'ElInput'、'TyNumberInterval'
 * @param customComponent 可选的自定义组件实例，优先级高于动态导入
 * @returns 匹配到的组件实例
 */
export const getComponentName = (name: string, customComponent: Component | null = null) => {
  if (componentsTypes[name]) return componentsTypes[name];
  else {
    if (customComponent) return customComponent;
    // 扫描 @/components 下所有 .vue 文件，动态导入与 name 匹配的组件
    const modules = import.meta.glob('../components/**/**.vue');
    let component;
    for (const key in modules) {
      // 根据路径中是否包含 "/${name}/" 来匹配，如 TyNumberInterval 匹配到 components/form/TyNumberInterval/index.vue
      if (key.includes(`/${name}/`)) {
        component = defineAsyncComponent(modules[key] as any);
      }
    }
    return component || ElInput;
  }
};

/**
 * 判断组件类型属于输入框（input）还是选择框（select）
 *
 * 用于自动生成 placeholder 文本。
 *
 * @param componentName 组件名称，如 'ElAutocomplete'
 * @returns 'input' | 'select'，未匹配时默认返回 'select'
 */
export function getComponentType(componentName: string): 'input' | 'select' | string {
  interface ComponentMap {
    [key: string]: string[];
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
      'ElColorPicker',
    ],
  };

  // 在映射表中查找，找到第一个匹配的 key 即为类型
  return Object.keys(componentType).find((key) => componentType[key]?.includes(componentName)) ?? 'select';
}

/**
 * 格式化搜索栏的列配置（与 formatFormColumns 逻辑相同）
 */
export const formatSearchColumns = (columns: any[]) => {
  return columns?.map((item) => formatFormItem(item)) ?? [];
};

/**
 * 格式化表单的列配置数组，逐项调用 formatFormItem
 */
export const formatFormColumns = (columns: any[]) => {
  return columns?.map((item) => formatFormItem(item)) ?? [];
};

/**
 * 格式化单个表单项配置
 *
 * 处理事项：
 *   - 自动补充 label 后的冒号（:）
 *   - 根据组件名称查找对应的组件实例
 *   - 判断 input/select 类型并生成 placeholder
 *   - 合并默认 props 和自定义 props
 *   - 生成表单校验规则
 *
 * @param item 原始列配置项
 * @returns 格式化后的完整配置项
 */
export const formatFormItem = (item: any) => {
  const { inputType = getComponentType(item.name), name, label, customComponent } = item;

  const placeholder = `${placeholderList[inputType]}${label}`;
  return {
    ...item,
    // 如果 label 末尾没有冒号，自动补上一个
    label: item.label ? (item.label?.includes(':') ? item.label : `${item.label}:`) : item.label,
    // 获取对应的 Vue 组件实例
    componentsName: getComponentName(name, customComponent),
    inputType,
    // 合并：自定义 placeholder + 全局默认 props + 当前项 props
    props: { placeholder, ...componentDefaultProps, ...item.props },
    // 生成表单校验规则
    rules: getRulesHandler({ ...item, inputType }),
  };
};

/**
 * 根据列配置生成 Element Plus 表单校验规则数组
 *
 * 支持 five 种规则类型：
 *   - required：必填校验，提示信息为"请输入/请选择" + label
 *   - min/max/len：长度限制校验
 *   - pattern/type：正则或数据类型校验
 *   - validator：自定义校验函数
 *
 * @param column 列配置，包含 rules、label、name、inputType
 * @returns 格式化后的校验规则数组
 */
export const getRulesHandler = (column: { rules: object; label: string; name: formItemName; inputType: string }) => {
  const { rules, label, inputType } = column;

  if (rules) {
    const inputTypeStr = `${inputType}`;
    // 收集所有规则
    const rulesArr: object[] = [];

    // 遍历 rules 对象的每个键值对
    Object.entries(rules).forEach(([key, value]) => {
      switch (key) {
        // ---- required：必填校验 ----
        case 'required':
          if (value) {
            rulesArr.push(
              // value 为对象时直接扩展（可自定义 message、trigger 等）
              typeof value === 'object'
                ? { ...value, trigger: ['blur', 'change'] }
                : // value 为布尔值时自动生成提示文本
                  {
                    required: true,
                    message: `${placeholderList[inputTypeStr]}${label}`,
                    trigger: ['blur', 'change'],
                  }
            );
          }
          break;

        // ---- min / max / len：长度校验 ----
        case 'min':
        case 'max':
        case 'len':
          if (value) {
            rulesArr.push(
              typeof value === 'object'
                ? { ...value, trigger: ['blur', 'change'] }
                : {
                    [key]: value,
                    message: `${label}${value}`,
                    trigger: ['blur', 'change'],
                  }
            );
          }
          break;

        // ---- pattern / type：正则或类型校验 ----
        case 'pattern':
        case 'type':
          if (value) {
            rulesArr.push(
              typeof value === 'object'
                ? { ...value, trigger: ['blur', 'change'] }
                : {
                    [key]: value,
                    message: `${label}`,
                    trigger: ['blur', 'change'],
                  }
            );
          }
          break;

        // ---- validator：自定义校验函数 ----
        case 'validator':
          if (value) {
            rulesArr.push({
              validator: value,
              trigger: ['blur', 'change'],
            });
          }
          break;

        default:
          break;
      }
    });

    return rulesArr;
  }
  return [];
};

/**
 * 判断一个表单项是否为日期范围组件
 *
 * 日期范围组件需要特殊处理，如展示两个输入框、范围选择器 UI 等。
 *
 * @param item 组件配置对象，包含 name、type、props
 * @returns true=是日期范围组件
 */
export const isDateRangeComponent = (item: { name: string; type: string; props?: any }) => {
  return (
    (['ElDatePicker', 'ElTimePicker'].includes(item?.name) &&
      (item?.type?.endsWith('range') || item?.props?.type?.endsWith('range'))) ||
    ['TyNumberInterval'].includes(item?.name)
  );
};
