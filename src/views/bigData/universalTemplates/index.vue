<template>
  <div class="universal-templates">
    <!--顶部-->
    <Head></Head>
    <!--主体-->
    <div class="main-box">
      <div class="main-box-left">
        <Left />
      </div>
      <div class="main-box-center">
      </div>
      <div class="main-box-right">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Head from "./components/head.vue";
import Left from "./components/Left.vue";
</script>

<style lang="scss">
@import './css/comon.scss';  /* 引入外部局部CSS文件 */
</style>

<style lang="scss" scoped>
.universal-templates{
  width:100vw;
  height:100vh;
  background:#000d4a url(./images/bg.jpg) center top; 
  background-size:100% 100%;
  color:#666;
  font-size: 10px;

  .main-box{
    width:100%;
    height: calc(100% - 105px);
    display:flex;
    justify-content: space-between;
    align-items: center;
    gap:10px;
    padding:15px 20px;
    &-left{
      height:100%;
      width:calc(30% - 10px);
    }
    &-center{
      height:100%;
      width:calc(40% - 10px);
    }
    &-right{
      height:100%;
      width:calc(30% - 10px);
    }
  }
}
</style>