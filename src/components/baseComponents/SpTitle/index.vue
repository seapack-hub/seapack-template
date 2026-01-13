<template>
<div class="mb-20px w-100% flex items-center justify-between">
  <slot>
    <div class="m-r-16px flex flex-1 items-center gap-x-5px">
      <div text="[var(--el-text-color-primary)] size-20px" fw-600 line-height-20px>{{ title }}</div>

      <slot name="tag"></slot>
      <div text="[var(--el-text-color-secondary)] size-[var(--subTitle-size,12px)]" class="m-t-2px fw-400">{{ subTitle }}</div>
    </div>
  </slot>
  <div pos-absolute right-24px>
    <slot name="right"> </slot>
  </div>
</div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: ''
  },
  subTitle: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped></style>