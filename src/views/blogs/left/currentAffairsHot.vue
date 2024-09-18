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
    <!--主体-->
    <div class="current-affairs-hot-main">
      <div class="article-item" v-for="(item, index) in hotList" :key="index">
        <div class="item-index">{{ index + 1 }}</div>
        <div class="item-label">{{ item.label }}</div>
      </div>
    </div>
    <!--底部-->
    <div class="current-affairs-hot-footer">
      <div class="footer-title">
        查看更多
      </div>
      <div class="footer-icon">
        <SPIcon name="more-two" size="20px" color="#bfbfbf"></SPIcon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hotList = ref([])
hotList.value = [
  { label: '短信接口被爆破了，一晚上都不停收到信息', url: '' },
  { label: '一个简单的案例，带你看懂GC日的舞动', url: '' },
  { label: '鸿蒙版 React Native 正式开放，可在...', url: '' },
  { label: '新项目oneCoupon牛卷来啦！', url: '' },
  { label: '告别繁琐的 try-catch:javaScript', url: '' },
]
</script>

<style lang="scss" scoped>
.current-affairs-hot {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 10px;
  &-top {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid gainsboro;
    .hot-point {
      display: flex;
      align-items: center;
      &-text {
        margin-left: 5px;
      }
    }
    .swap-it-out {
      display: flex;
      align-items: center;
      &-text {
        margin-left: 5px;
        font-size: 18px;
        color: #8a8a8a;
      }
    }
  }
  &-main {
    padding: 10px;
    border-bottom: 1px solid gainsboro;
    .article-item{
      margin-top: 15px;
      display: flex;
      align-items: center;
      .item-label{
        margin-left: 10px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
    }
  }
  &-footer{
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    .footer-title{
      font-size: 20px;
      color:#bfbfbf
    }
  }
}
</style>
