<template>
  <el-menu
      :default-active="activeMenu"
      class="el-menu"
      :active-text-color="activeTextColor"
      :unique-opened="true"
  >
    <side-bar-item
        v-for="(item,index) in menuList"
        :key="index"
        :item="item"
        :base-path="basePath"
    ></side-bar-item>
  </el-menu>
</template>

<script setup lang="ts">
import {computed} from "vue";
import { useRoute } from "vue-router";
import SideBarItem from "@/layout/components/sideBar/SideBarItem.vue";
// 获取CSS 全局变量
import {getCssVariableValue} from "@/utils/index.ts";
import {useAppStore} from "@/store/modules/app.ts";
const appStore = useAppStore();
const route = useRoute();
const activeMenu = computed(()=>{
  const {
    meta:{activeMenu},
    path
  } = route;
  //构建正则表达式，去除模块前缀
  const reg = new RegExp("\/[a-zA-Z0-9]*\/",)
  return activeMenu? activeMenu:path.replace(reg,"");
})

const activeTextColor = computed(()=>{
  return getCssVariableValue("--sidebar-menu-active-text-color")
})

const tipLineWidth = computed(() => {
  return  appStore.opened?"2px":"0px";
})
defineProps({
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
  color:var(--sidebar-menu-text-color);
  &.is-active,
  &:hover{
    background-color:var(--sidebar-menu-hover-bg-color);
    color:var(--sidebar-menu-active-text-color)
  }
}

%tip-line {
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: v-bind(tipLineWidth);
    height: 100%;
    background-color: var(--sidebar-menu-tip-line-bg-color);
  }
}

//同时具备 el-menu-item 和 is-active 两个类名才生效
:deep(.el-menu-item.is-active) {
  @extend %tip-line;
}

</style>