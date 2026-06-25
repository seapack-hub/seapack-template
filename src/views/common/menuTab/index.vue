<template>
  <div class="mean-tab-wrapper">
    <!-- <el-button type="primary" v-for="item in menuList" @click="handToPage(item)">{{$t(item.name)}}</el-button> -->
    <Blogs />
  </div>
</template>

<script setup lang="ts">
import Blogs from '@/views/blogs/index.vue';
</script>

<style scoped lang="scss">
.mean-tab-wrapper {
  width: 100%;
  height: 100%;
  //display: flex;
  //justify-content: center;
  //align-items: center;
}
</style>
