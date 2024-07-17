<template>
  <el-menu class="el-menu">
    <side-bar-item
        v-for="(item,index) in menuList"
        :key="index"
        :item="item"
        :base-path="basePath"
    ></side-bar-item>
  </el-menu>
</template>

<script setup lang="ts">
import SideBarItem from "@/layout/components/sideBar/SideBarItem.vue";

const props = defineProps({
  menuList:{
    required:true,
    default:()=>[],
    type:Array<any>
  },
  basePath:{
    type:String,
    required:true,
  },
})
</script>

<style scoped lang="scss">
.el-menu{
  border: none;
  width: 100% !important;
  min-height: calc(100% - 65px);
  background-color: var(--sidebar-menu-bg-color);
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title),
:deep(.el-sub-menu .el-menu-item),
:deep(.el-menu--horizontal .el-menu-item){
  height:var(--sidebar-menu-item-height);
  line-height: var(--sidebar-menu-item-height);
  &.is-active,
  &.hover{
    background-color:var(--sidebar-menu-hover-bg-color);
  }
}
</style>