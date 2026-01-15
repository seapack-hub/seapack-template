<template>
  <SPIcon v-if="type === 'icon'" :name="value"></SPIcon>
  <span v-else class="font-size-14px">
    {{ value }}
  </span>
</template>

<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'text'
  },
  value: {
    type: String,
    default: ''
  }
})
</script>

<style scoped></style>