<template>
  <div class="latest-articles">
    <!-- 头部-->
    <div class="latest-articles-top">
      <div class="top-icon">
        <SPIcon name="zuixin" size="20px" color="aqua"></SPIcon>
      </div>
      <div class="top-title">最新文章</div>
    </div>
    <!--主体-->
    <div class="latest-articles-main">
      <div
        class="item"
        v-for="(item, index) in articlesList"
        :key="index"
        @mouseover="mouseChangeEvent(true,index)"
        @mouseleave="mouseChangeEvent(false,-1)"
      >
        <div class="item-title">{{ item.title }}</div>
        <div class="item-icon">
          <SPIcon name="lianjie" size="20px" :color="setIconColor(index)"></SPIcon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const articlesList = ref([])
const hover = ref(false)
const index = ref(-1);
articlesList.value = [
  { title: 'JavaScript事件循环机制', id: '001' },
  { title: 'Vue2数据响应式原理', id: '002' },
  { title: '闭包', id: '003' },
  { title: '执行上下文', id: '004' },
  { title: '内存溢出', id: '002' },
]
/** 
 * 鼠标移动事件
 **/
const mouseChangeEvent = (bool,number)=>{
  hover.value = bool;
  index.value = number;
}
/**设置图标颜色*/
const setIconColor = (num) => {
  return num === index.value && hover.value ? 'aqua' : '#707070'
}
</script>

<style lang="scss" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(225deg);
  }
}
.latest-articles {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;

  &-top {
    display: flex;
    justify-items: center;
    padding: 0 0 10px 0;
    border-bottom: 1px solid gainsboro;
    .top-title {
      margin-left: 5px;
      font-weight: 600;
    }
  }

  &-main {
    .item {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &-icon {
        height: 20px;
      }
      &-title {
        line-height: 2;
        background: -webkit-linear-gradient(left, aqua, aqua, aqua) no-repeat
          right bottom;
        background-size: 0% 2px;
        transition: background-size 200ms linear;
      }
      &:hover {
        .item-title {
          color: aqua;
          background-position-x: left;
          background-size: 100% 2px;
        }
        .item-icon {
          animation: rotate 0.5s;
          animation-iteration-count: 1; /*动画只执行一次*/
          animation-fill-mode: forwards; /*让动画停留在最后一帧 */
        }
      }
    }
  }
}
</style>
