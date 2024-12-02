<template>
  <!--设置全屏-->
  <el-container style="width: 100vw;height: 100vh">
    <el-aside width="collapse">
      <!--顶部图标-->
      <Logo :collapse="isCollapse"></Logo>
      <LeftMenu :base-path="basePath" :menu-list="menuList" :collapse="isCollapse"></LeftMenu>
    </el-aside>
    <el-container>
      <el-header>
        <NavigationBar/>
      </el-header>
      <el-container>
        <router-view></router-view>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {computed} from 'vue';
import {NavigationBar, SideBar,Logo} from "@/layout/components";
import LeftMenu from "@/layout/components/sideBar/LeftMenu.vue";
//引入路由
import {usePermissionStore} from "@/store/modules/permission.ts";
import {useAppStore} from "@/store/modules/app.ts";


const permissionStore = usePermissionStore();
const {dynamicRoutes} = storeToRefs(permissionStore);

const appStore = useAppStore();
const isCollapse = computed(()=>!appStore.opened);
//获取菜单列表
const menuList = computed(()=>{
  const list = dynamicRoutes.value.find(item=>item.name === "worldData");
  return list?.children;
});

//获取基础路径
const basePath = computed(()=>permissionStore.basePath)

const sidebarWidth = computed(()=>{
  return appStore.opened?"var(--sidebar-width)":"var(--sidebar-hide-width)"
})
</script>

<style scoped lang="scss">
.header-container{
  display: flex;
  justify-content: space-between;
  .logo{
    height: 100%;
    width: var(--sidebar-width);
  }
  .navigation-right{
    flex:1;
  }
}

.el-aside{
  width: v-bind(sidebarWidth);
  //设置平滑过渡效果，监听宽度变化，平滑5秒
  transition-property: width;
  transition-duration: 0.5s;
  background-color: var(--sidebar-menu-bg-color);
}
</style>