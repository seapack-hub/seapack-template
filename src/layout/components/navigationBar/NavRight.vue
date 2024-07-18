<template>
  <div class="nav-right">
    <!--导航栏设置-->
    <div class="setting-navigation">
      <!--返回主屏幕-->
      <SPIcon class="setting-item" name="to-home" size="20px" @click="toHome"></SPIcon>
      <!--消息通知-->
      <SPIcon class="setting-item" name="message-notify" size="20px"></SPIcon>
      <!--全屏设置-->
      <div @click="toggle">
        <SPIcon :name="isFullscreen?'fullscreen-shrink':'fullscreen-expand'" size="20px"></SPIcon>
      </div>
      <!--语言设置-->
      <changeLanguage></changeLanguage>

      <!--用户-->
      <loginUser></loginUser>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useFullscreen} from '@vueuse/core';
import {useRouter} from "vue-router";

const router = useRouter();
/**
 * VueUse全屏
 */
const {isFullscreen,toggle} = useFullscreen()

/**
 * 返回主界面
 */
function toHome(){
  router.push({path:"/menuTab"})
}
</script>

<style scoped lang="scss">
.nav-right{
  display: flex;
  flex-direction: row;
  align-items: center;
  .setting-navigation{
    display: flex;
    gap: 10px;
    align-items: center;
    .setting-item{
      margin-bottom: 5px;
    }
  }
}
</style>