<template>
  <div
    class="detail-layout grid"
    w="100%"
    :style="{ '--column': columnVal }"
    grid="cols-[repeat(var(--column),1fr)]"
    :p="column && columnVal === 2 ? 'l-[var(--padding-l)] r-[var(--padding-r)]' : 'x-[var(--padding-l)]'"
    :gap-x="column && columnVal === 2 && !smallGap ? '80px' : '20px'"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps({
  //配置条件
  column: {
    type: Number,
    default: null,
    validator: (value: number) => [1, 2, 3, 4].includes(value)
  },
  //内边距
  padding: {
    type: Number,
    default: 0
  },
  //是否最小距离
  smallGap: {
    type: Boolean,
    default: false
  }
})
//获取宽度
const { width } = useWindowSize();

//列数
const columnVal = computed(() => {
  if (props.column) return props.column
  else {
    return width.value >= 1440 ? 3 : 2
  }
})
</script>
