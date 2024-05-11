<template>
  <!--无子路由-->
  <template v-if="isChild">
    <el-menu-item>
      <el-icon><Edit /></el-icon>
      <template #title>Navigator Two</template>
    </el-menu-item>
  </template>

</template>

<script setup lang="ts">
import {ref} from "vue"
const isChild = ref(true);

const props = defineProps({
  item:{
    type:Object,
    required:true,
  }
});


</script>

<style scoped lang="scss">

</style>