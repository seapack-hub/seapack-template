<template>
  <div class="announcement">
    <!-- -->
    <div class="announcement-top">
      <div class="top-icon">
        <SPIcon name="gonggao" size="20px" color="aqua"></SPIcon>
      </div>
      <div class="top-title"> 公告 </div>
    </div>
    <div class="announcement-main">
      <span>只想做一条摆烂的咸鱼！</span>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.announcement{
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;

  &-top{
    display: flex;
    justify-items: center;
    padding: 0 0 10px 0;
    border-bottom: 1px solid gainsboro;
    .top-title{
      height: 20px;
      margin-left: 5px;
      font-size: 16px;
      line-height: 20px;
    }
  }
  &-main{
    margin-top: 10px;
    font-weight: 600;
  }
}
</style>