<template>
  <div class="w-100% flex flex-col items-center justify-center color-#D8DEE6 !cursor-default">
    <Icon 
      name="empty-data"
      :size="120"
    />
    <p
      v-if="showText"
      :class="textClass"
    >
      {{ props.text }}
    </p>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  showText: {
    type: Boolean,
    default: true
  },
  text: {
    type: String,
    default: '暂无数据'
  },
  textClass: {
    type: String,
    default: 'mt-8px color-#99A3AF line-height-12px font-size-12px'
  }
})
</script>

<style lang="scss" scoped></style>