<template>
  <div class="menuTab-nav-bar-right">
    <el-button
      type="primary"
      @click="jumpToLink('/systemManagement')"
    >
      系统管理
    </el-button>
    <el-button
      type="primary"
      @click="jumpToLink('/worldData')"
    >
      地图管理
    </el-button>
    <el-button
      type="primary"
      @click="jumpToLink('/blogsManagement')"
    >
      个人博客
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
function jumpToLink(path: string) {
  if (path) {
    // changeSystemType(path)
    router.push({
      path: path
    });
  }
}
</script>

<style scoped lang="scss"></style>
