<template>
  <div class="current-affairs-hot">
    <!-- 头部-->
     <div class="current-affairs-hot-top">
      <div class="hot-point">
        <SPIcon name="hot-point" size="24px" color="aqua"></SPIcon>
        <div class="hot-point-text">时事热点</div>
      </div>
      <div class="swap-it-out">
        <SPIcon name="shuaxin" size="20px" color="#8a8a8a"></SPIcon>
        <div class="swap-it-out-text">换一换</div>
      </div>
     </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.current-affairs-hot{
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px;
  font-family: cursive;
  &-top{
    display: flex;
    justify-content: space-between;
    padding: 10px;
    .hot-point{
      display: flex;
      align-items: center;
      &-text{
        margin-left: 5px;
      }
    }
    .swap-it-out{
      display: flex;
      align-items: center;
      &-text{
        margin-left: 5px;
        font-size: 18px;
        color:#8a8a8a;
      }
    }
  }
}
</style>