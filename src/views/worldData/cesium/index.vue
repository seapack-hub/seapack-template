<template>
  <div class="cesium-main">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted,markRaw } from "vue";
</script>

<style scoped lang="scss">
.cesium-main{
  width: 100%;
  height: 100%;
}
</style>