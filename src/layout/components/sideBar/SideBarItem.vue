<template>
  <!--无子路由-->
  <template v-if="!item.children">
    <el-menu-item>
      <el-icon><Edit /></el-icon>
      <template #title>{{item?.meta.description ||'未知'}}</template>
    </el-menu-item>
  </template>
  <template v-else>
    <el-sub-menu :index="item.path">
      <template #title>
        <el-icon><Edit /></el-icon>
        <span>{{item?.meta.description ||'未知'}}</span>
      </template>
      <side-bar-item v-for="item in item.children" :item="item"></side-bar-item>
    </el-sub-menu>
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