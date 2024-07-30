<template>
  <div class="layout-logo-container" :class="{ collapse: props.collapse}">
    <transition name="layout-logo-fade">
      <div class="logo-title layout-logo-text" v-if="!props.collapse">SeaPack</div>
      <div class="logo-title layout-logo" v-else>SP</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "@/store/modules/app.ts";
const appStore = useAppStore();
interface Props {
  collapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapse: true
})
</script>

<style scoped lang="scss">
.layout-logo-container{
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
.collapse {
  .layout-logo {
    //width: 32px;
    //height: 60px;
    //vertical-align: middle;
    display: inline-block;
  }
  .layout-logo-text {
    display: none;
  }
}
</style>