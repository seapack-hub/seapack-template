<template>
  <div class="blogs-main">
    <!--博客主页 -->
    <div class="blogs-main-left">
      <Left/>
    </div>
    <div class="blogs-main-middle">博客主页2</div>
    <div class="blogs-main-right">博客主页3</div>
  </div>
</template>

<script setup>
import Left from "./left/index.vue"
</script>

<style lang="scss" scoped>
.blogs-main{
  width: 100%;
  height: 100%;
  //background-image: url("@/assets/images/gameKing.jpg");
  //background-size: 100% 100%;
  display: flex;

  &-left,&-right{
    padding: 20px 20px 10px 30px;
    width: 350px;
  }
  &-middle{
    flex:1;
    padding: 20px 15px;
  }
}
</style>
