<script setup lang="ts">
defineProps<{ msg: string }>();
</script>

<template>
  <h1>{{ msg }}</h1>
  组件测试
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
