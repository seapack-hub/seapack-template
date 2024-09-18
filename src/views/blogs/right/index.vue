<template>
  <div class="blogs-right">
    <!--公告 -->
    <Announcement/>
    <!--最新文章-->
    
  </div>
</template>

<script setup>
import Announcement from './components/announcement.vue';
</script>

<style lang="scss" scoped>
.blogs-right{
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  font-family: cursive;
}
</style>