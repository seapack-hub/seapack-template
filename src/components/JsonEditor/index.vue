<!--
  JsonEditor — JSON 编辑公共组件

  基于 json-editor-vue（vanilla-jsoneditor 的 Vue 封装），
  提供树形/文本双模式 JSON 编辑能力。

  用法：
    <JsonEditor v-model="myJsonObject" />

  数据流：
    父组件传入/绑定 JSON 对象 → 内部转为 { text, json } 内容格式
    → 用户编辑 → onChange 回调 → 解析 json/text 回写父组件 modelValue
-->
<template>
  <div class="json-editor-wrapper" :style="{ height: height }">
    <JsonEditorVue
      class="json-editor"
      :content="contentData"
      :mode="currentMode as any"
      :show-btns="true"
      :main-menu-bar="true"
      :navigation-bar="true"
      :status-bar="true"
      :read-only="readOnly"
      :on-change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import JsonEditorVue from 'json-editor-vue'

const props = defineProps<{
  /** JSON 对象（v-model 绑定） */
  modelValue: any
  /** 编辑模式：tree / text / code / preview */
  mode?: 'tree' | 'text' | 'code' | 'preview'
  /** 容器高度，默认 300px */
  height?: string
  /** 是否只读 */
  readOnly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const currentMode = ref(props.mode || 'code')

/** 将 modelValue 转换为 vanilla-jsoneditor 所需的 { text, json } 格式 */
const contentData = computed(() => {
  const raw = props.modelValue
  if (raw === undefined || raw === null) {
    return { text: '', json: undefined }
  }
  return {
    text: typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2),
    json: typeof raw === 'string' ? undefined : raw,
  }
})

/** 编辑器 onChange 回调 */
function handleChange(content: any) {
  if (!content) return
  try {
    // 优先取 json 字段（树模式编辑），否则解析 text 字段（文本模式编辑）
    if (content.json !== undefined) {
      emit('update:modelValue', content.json)
    } else if (content.text) {
      const parsed = JSON.parse(content.text)
      emit('update:modelValue', parsed)
    }
  } catch {
    // 用户输入非完整 JSON 时不 emit，保持父组件数据不变
  }
}
</script>

<style scoped lang="scss">
.json-editor-wrapper {
  width: 100%;
  border: 1px solid var(--el-border-color-light); 
  border-radius: 6px;
  overflow: hidden;
  .json-editor{
    height: 100%;
  }
}

.json-editor-wrapper :deep(.jse-theme-dark) {
  --jse-background-color: #1e1e1e;
}
</style>
