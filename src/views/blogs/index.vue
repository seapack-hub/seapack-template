<template>
  <div class="blogs-main">
    <!--博客主页 -->
    <div class="blogs-main-left">
      <Left/>
    </div>
    <div class="blogs-main-middle">
      <Middle/>
    </div>
    <div class="blogs-main-right">
      <Right/>
    </div>
  </div>
</template>

<script setup>
import Left from "./left/index.vue"
import Right from "./right/index.vue"
import Middle from "./middle/index.vue"
</script>

<style lang="scss" scoped>
.blogs-main{
  width: 100%;
  height: 100%;
  display: flex;
  //height: calc(100vh - 100px);
  flex-shrink: 0;
  height: 0;

  &-left{
    padding: 10px 0 10px 60px;
    width: 350px;
    height: calc(100vh - 120px);
  }
  &-right{
    padding: 10px 60px 10px 0;
    width: 350px;
    height: calc(100vh - 120px);
  }
  &-middle{
    flex:1;
    padding: 10px;
    height: calc(100vh - 120px);
  }
}
</style>
