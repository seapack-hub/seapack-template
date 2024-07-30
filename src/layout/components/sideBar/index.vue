<template>
  <div class="side-bar">
    <!--顶部图标-->
    <Logo :collapse="isCollapse"></Logo>
    <!--左侧菜单-->
    <left-menu :base-path="basePath" :menu-list="menuList" :collapse="isCollapse"></left-menu>
  </div>
</template>

<script setup lang="ts">
import LeftMenu from "@/layout/components/sideBar/LeftMenu.vue";
import Logo from "@/layout/components/logo/index.vue"
import {type RouteRecordRaw} from "vue-router"
import { storeToRefs } from 'pinia';
import {computed} from 'vue';
//引入路由
import {usePermissionStore} from "@/store/modules/permission.ts";
import {useAppStore} from "@/store/modules/app.ts";
const appStore = useAppStore();

const permissionStore = usePermissionStore();
const {dynamicRoutes} = storeToRefs(permissionStore);

//获取菜单列表
const menuList = computed(()=>{
  const list = dynamicRoutes.value.find((item:RouteRecordRaw)=>item.name === "systemManagement");
  return list.children;
});
const isCollapse = computed(()=>!appStore.opened);
//获取基础路径
const basePath = computed(()=>permissionStore.basePath)
</script>

<style scoped lang="scss">
.side-bar{
  height: 100%;
  background-color: var(--sidebar-menu-bg-color);
  width: 100%;
  .logo-title{
    color:var(--sidebar-menu-text-color);
    width: 100%;
    text-align: center;
    margin:0 auto;
    height: 60px;
    font-size: 30px;
    line-height: 60px;
  }
}
</style>