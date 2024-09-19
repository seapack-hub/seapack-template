<template>
  <div class="blogs-main">
    <!--博客主页 -->
    <div class="blogs-main-left">
      <Left/>
    </div>
    <div class="blogs-main-middle"></div>
    <div class="blogs-main-right">
      <Right/>
    </div>
  </div>
</template>

<script setup>
import Left from "./left/index.vue"
import Right from "./right/index.vue"
</script>

<style lang="scss" scoped>
.blogs-main{
  width: 100%;
  height: 100%;
  //background-image: url("@/assets/images/gameKing.jpg");
  //background-size: 100% 100%;
  display: flex;

  &-left,&-right{
    padding: 10px;
    width: 350px;
  }
  &-middle{
    flex:1;
    padding: 10px;
  }
}
</style>
