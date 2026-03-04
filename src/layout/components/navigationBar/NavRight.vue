<template>
  <div class="nav-right">
    <!--导航栏设置-->
    <div class="setting-navigation">
      <!--返回主屏幕-->
      <el-tooltip class="item" content="主屏幕" effect="light" placement="top">
        <SPIcon class="setting-item" name="to-home" size="20px" @click="jumpToLink('/menuTab')"></SPIcon>
      </el-tooltip>
      <el-tooltip class="item" content="3D系统" effect="light" placement="top">
        <SPIcon class="setting-item" name="3D-layers" size="20px" @click="jumpToLink('/worldData')"></SPIcon>
      </el-tooltip>
      <el-tooltip class="item" content="GIS系统" effect="light" placement="top">
        <SPIcon class="setting-item" name="gis" size="20px" @click="jumpToLink('/universalTemplate')"></SPIcon>
      </el-tooltip>
      <el-tooltip class="item" content="博客" effect="light" placement="top">
        <SPIcon class="setting-item" name="blogs" size="20px" @click="jumpToLink('/blogsManagement')"></SPIcon>
      </el-tooltip>
      <!--消息通知-->
      <el-tooltip class="item" content="消息通知" effect="light" placement="top">
        <SPIcon class="setting-item" name="message-notify" size="20px"></SPIcon>
      </el-tooltip>
      <!--全屏设置-->
      <el-tooltip class="item" content="全屏设置" effect="light" placement="top">
        <SPIcon :name="isFullscreen ? 'fullscreen-shrink' : 'fullscreen-expand'" size="20px" @click="toggle"></SPIcon>
      </el-tooltip>
      <!--语言设置-->
      <changeLanguage></changeLanguage>

      <!--用户-->
      <loginUser></loginUser>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { useRouter } from 'vue-router';

const router = useRouter();
/**
 * VueUse全屏
 */
const { isFullscreen, toggle } = useFullscreen();
/**
 * 路由跳转
 * @param path
 */
function jumpToLink(path: string) {
  if (path) {
    router.push({
      path: path
    });
  }
}
</script>

<style scoped lang="scss">
.nav-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  .setting-navigation {
    display: flex;
    gap: 10px;
    align-items: center;
    .setting-item {
      margin-bottom: 5px;
    }
  }
}
</style>
