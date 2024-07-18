<template>
  <!--无子路由-->
  <template v-if="!item.children">
    <Link :to="item.path">
      <el-menu-item :index="item.path">
        <template #title>
          <SPIcon :name="item.meta.icon" size="20px"></SPIcon>
          <transition name="fade">
            <span class="menu-text" v-if="appStore.opened">{{item?.meta.description ||'未知'}}</span>
          </transition>
        </template>
      </el-menu-item>
    </Link>
  </template>
  <template v-else>
    <el-sub-menu :index="item.path">
      <template #title>
        <SPIcon :name="item.meta.icon" size="20px"></SPIcon>
        <transition name="fade">
          <span class="menu-text" v-if="appStore.opened">{{item?.meta.description ||'未知'}}</span>
        </transition>
      </template>
      <side-bar-item v-for="(item,index) in item.children" :item="item" :base-path="basePath"></side-bar-item>
    </el-sub-menu>
  </template>

</template>

<script setup lang="ts">
import {ref} from "vue";
import Link from "./Link.vue";
import {useAppStore} from "@/store/modules/app.ts";

const appStore = useAppStore();

defineProps({
  item:{
    type:Object,
    required:true,
  },
  basePath:{
    type:String,
    required:true
  }
});
</script>

<style scoped lang="scss">
/*设置动画*/
.fade-enter{
  transform: translateX(-100%);
}
.fade-enter-active{
  transition: 0.5s;
}
.fade-enter-to {
  transform: translateX(0)
}
.menu-text{
  margin-left:10px;
}
</style>