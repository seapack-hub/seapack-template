<template>
  <div>
    <div v-if="list && list?.length">
      <template v-for="(item, index) in list" :key="index">
        <el-tag v-if="item.showStyle" :type="item.showStyle" v-bind="$attrs" :class="index > 0 ? `m-l-[8px] ${customClass}` : customClass">
          {{ item?.[props.labelKey] ?? modelValue ?? '--' }}</el-tag
        >
        <el-tag
          v-else-if="item.showColor"
          :color="item.showColor"
          v-bind="$attrs"
          :class="index > 0 ? `m-l-[8px] ${customClass}` : customClass"
          style="--el-color-primary: #fff"
        >
          {{ item?.[props.labelKey] ?? modelValue ?? '--' }}</el-tag
        >
        <span v-else :class="customClass">{{ index > 0 ? '，' : '' }}{{ item?.[props.labelKey] ?? '--' }}</span>
      </template>
    </div>
    <span v-else :class="customClass">{{ '--' }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { useDictionaryStore } from '@/store/modules/dictionary'
const dictionaryStore = useDictionaryStore()
const props = defineProps({
  type: {
    type: String,
    default: 'default'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  customClass: {
    type: String,
    default: ''
  },
  showAllLabel: {
    type: Boolean,
    default: false
  }
})
const modelValue = defineModel({
  type: null,
  default: ''
})
const list = ref<any[]>([])
watch(
  modelValue,
  async (newVal) => {
    try {
      list.value = await dictionaryStore.getDictionaryItem(props.type, newVal, props?.showAllLabel)
    } catch {
      list.value = []
    }
  },
  {
    immediate: true
  }
)
</script>

<style scoped></style>
