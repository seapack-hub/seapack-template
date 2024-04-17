<template>
  <div class="nav-right">
    <!--导航栏设置-->
    <div class="setting-navigation">
      <!--消息通知-->
      <SPIcon name="message-notify" size="20px"></SPIcon>
      <!--全屏设置-->
      <div class="setting-item" @click="toggle">
        <SPIcon :name="isFullscreen?'fullscreen-shrink':'fullscreen-expand'" size="20px"></SPIcon>
      </div>
      <!--语言设置-->
      <changeLanguage></changeLanguage>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useFullscreen} from '@vueuse/core';

/**
 * VueUse全屏
 */
const {isFullscreen,toggle} = useFullscreen()
</script>

<style scoped lang="scss">
.nav-right{
  display: flex;
  flex-direction: row;
  align-items: center;
  .setting-navigation{
    display: flex;
    gap: 10px;
  }
}
</style>