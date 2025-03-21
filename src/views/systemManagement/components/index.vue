<template>
  <div class="generic-com">
    <router-view />
  </div>
</template>

<script setup>
import {onMounted,ref} from "vue"
</script>

<style lang="scss" scoped>
.generic-com{
  width:100%;
  height:100%;
}
</style>