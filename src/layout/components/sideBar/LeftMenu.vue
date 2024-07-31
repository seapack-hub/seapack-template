<template>
    <el-menu
        :default-active="activeMenu"
        class="el-menu"
        :active-text-color="activeTextColor"
        :text-color="textColor"
        :background-color="backgroundColor"
        :unique-opened="true"
        :collapse-transition="false"
        :collapse="collapse"
        :mode="isTop?'horizontal':'vertical'"
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
import { type RouteRecordRaw,useRoute } from "vue-router";
import SideBarItem from "@/layout/components/sideBar/SideBarItem.vue";
import {useLayoutMode} from "@/hooks/useLayoutMode.ts"
// 获取CSS 全局变量
import {getCssVariableValue} from "@/utils/index.ts";
const route = useRoute();
const {isTop,isLeftTop,isLeft} = useLayoutMode();

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
  return isLeft.value?getCssVariableValue("--sidebar-menu-active-text-color"):undefined
})
const textColor = computed(()=>{
  return isLeft.value?getCssVariableValue("--sidebar-menu-text-color"):undefined
})
const backgroundColor = computed(()=>{
  return isLeft.value?getCssVariableValue("--sidebar-menu-bg-color"):undefined
})
const hoverMenuActiveTextColor = computed(()=>{
  return !isTop.value?getCssVariableValue("--sidebar-menu-hover-bg-color"):"transparent"
})
const tipLineWidth = computed(() => {
  return  isLeft.value?"2px":"0px";
})
defineProps({
  menuList:{
    required:true,
    default:()=>[],
    type:Array<RouteRecordRaw>
  },
  basePath:{
    type:String,
    required:true,
  },
  collapse:{
    type:Boolean,
    required:true
  }
})
</script>

<style scoped lang="scss">
.el-menu{
  border: none;
  width: 100% !important;
  min-height: calc(100% - 65px);
  //background-color: var(--sidebar-menu-bg-color);
  background-color: v-bind(backgroundColor);
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title),
:deep(.el-sub-menu .el-menu-item),
:deep(.el-menu--horizontal .el-menu-item){
  height:var(--sidebar-menu-item-height);
  line-height: var(--sidebar-menu-item-height);
  //color:var(--sidebar-menu-text-color);
  color:v-bind(textColor);
  &.is-active,
  &:hover{
    //background-color:var(--sidebar-menu-hover-bg-color);
    background-color:v-bind(hoverMenuActiveTextColor);
    //color:var(--sidebar-menu-active-text-color)
    color:v-bind(activeTextColor);
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
.el-menu--collapse {
  :deep(.el-sub-menu.is-active) {
    .el-sub-menu__title {
      @extend %tip-line;
    }
  }
}

</style>