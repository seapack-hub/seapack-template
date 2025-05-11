<template>
  <div class="blogs-right">
    <!--公告 -->
    <Announcement />
    <!--目录-->
    <DirectoryPlate />
    <!--最新文章-->
    <LatestArticles />
  </div>
</template>

<script setup>
import Announcement from './components/announcement.vue';
import LatestArticles from './components/latestArticles.vue';
import DirectoryPlate from './components/directoryPlate.vue';
</script>

<style lang="scss" scoped>
.blogs-right {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  font-family: cursive;
}
</style>
