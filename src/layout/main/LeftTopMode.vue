<template>
  <el-container style="width: 100vw;height:100vh">
    <el-header>
      <div class="header-container">
        <div class="logo">
          <Logo/>
        </div>
        <div class="navigation-right">
          <NavigationBar/>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside>
        <left-menu
            class="menu-item"
            :base-path="basePath"
            :menu-list="menuList"
            :collapse="isCollapse"
        ></left-menu>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import {NavigationBar, SideBar} from "@/layout/components";
import Logo from "@/layout/components/logo/index.vue"
import NavRight from "@/layout/components/navigationBar/NavRight.vue";
import {useAppStore} from "@/store/modules/app.ts";
import {usePermissionStore} from "@/store/modules/permission.ts";
import {computed} from "vue";
import LeftMenu from "@/layout/components/sideBar/LeftMenu.vue";
import {type RouteRecordRaw} from "vue-router"
import {storeToRefs} from "pinia";
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const {dynamicRoutes} = storeToRefs(permissionStore);
const isCollapse = computed(()=>!appStore.opened);
//获取基础路径
const basePath = computed(()=>permissionStore.basePath)

//获取菜单列表
const menuList = computed(()=>{
  const list = dynamicRoutes.value.find((item:RouteRecordRaw)=>item.name === "systemManagement");
  return list?.children;
});

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
    width: v-bind(sidebarWidth);
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
}
</style>