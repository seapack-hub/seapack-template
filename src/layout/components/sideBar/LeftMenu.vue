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
console.log('--itemList--',props.menuList);
</script>

<style scoped lang="scss">
.el-menu{
  width: 100%;
}
</style>