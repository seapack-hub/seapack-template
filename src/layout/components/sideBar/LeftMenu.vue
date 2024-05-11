<template>
  <el-menu class="el-menu">
    <side-bar-item item="{}"></side-bar-item>
  </el-menu>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SideBarItem from "@/layout/components/sideBar/SideBarItem.vue";
//引入路由
import {usePermissionStore} from "@/store/modules/permission.ts";

const permissionStore = usePermissionStore();
console.log('--||--',permissionStore);
const {routes} = storeToRefs(permissionStore);
console.log('--routes--',routes);

</script>

<style scoped lang="scss">
.el-menu{
  width: 100%;
}
</style>