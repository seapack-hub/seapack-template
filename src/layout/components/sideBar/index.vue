<template>
  <div class="side-bar">
    <!--顶部图标-->
    <Logo></Logo>
    <!--左侧菜单-->
    <left-menu :base-path="basePath" :menu-list="menuList"></left-menu>
  </div>
</template>

<script setup lang="ts">
import LeftMenu from "@/layout/components/sideBar/LeftMenu.vue";
import { storeToRefs } from 'pinia';
import {computed} from 'vue';
//引入路由
import {usePermissionStore} from "@/store/modules/permission.ts";

const permissionStore = usePermissionStore();
const {dynamicRoutes} = storeToRefs(permissionStore);

//获取菜单列表
const menuList = computed(()=>{
  const list = dynamicRoutes.value.find(item=>item.name === "systemManagement")||{children:[]};
  return list.children;
});

//获取基础路径
const basePath = computed(()=>permissionStore.basePath)
</script>

<style scoped lang="scss">
.side-bar{
  height: 100%;
}
</style>