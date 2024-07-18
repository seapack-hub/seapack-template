<template>
  <div class="menuTab-nav-bar-wrapper">
    <div class="menuTab-nav-bar-left">
      <!--推进按钮-->
      <Hamburger
          :is-active="appStore.opened"
          @toggle-click="toggleClick"
      ></Hamburger>
    </div>
    <NavRight/>
  </div>
</template>
<script setup lang="ts">
import NavRight from "@/layout/components/navigationBar/NavRight.vue";
import Hamburger from "@/layout/components/navigationBar/Hamburger.vue";
import {useAppStore} from "@/store/modules/app.ts";

const appStore = useAppStore();
const toggleClick = ()=>{
  appStore.toggleSidebar(!appStore.opened)
}

</script>
<style scoped lang="scss">
.menuTab-nav-bar-wrapper{
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 50px;

  .menuTab-nav-bar-left{
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }
}

</style>